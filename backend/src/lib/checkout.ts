import { db } from './db';
import { bad, HttpError } from './http';
import { priceCart, nextOrderNumber, tl } from './commerce';
import { payments } from '../providers/payment';
import { holdEscrow } from './ledger';
import { notify } from '../providers/notify';
import { emit } from './webhooks';
import { consume, meterSoft } from './billing';
export async function placeOrder(storeId: string, b: any, buyer?: { id: string; email: string }, opts: { draft?: boolean; skipPayment?: boolean } = {}) {
  const store = await db.store.findUniqueOrThrow({ where: { id: storeId } });
  const email = (buyer?.email || b.email || '').toLowerCase(); if (!email) throw bad('Email required');
  if (!opts.draft) await consume(storeId, 'orders', 1);
  const q = await priceCart(storeId, { ...b, email });
  const customer = await db.customer.upsert({ where: { storeId_email: { storeId, email } }, update: {}, create: { storeId, email, name: b.shipTo?.name, userId: buyer?.id, addresses: b.shipTo ? [b.shipTo] : [] } });
  let chargeId: string | undefined;
  if (!opts.draft && !opts.skipPayment && q.total > 0) {
    const ch = await payments().charge({ amount: q.total, currency: q.currency, source: b.payment?.source || 'tok_visa', metadata: { storeId } });
    if (ch.status !== 'succeeded') throw new HttpError(402, 'Payment failed: ' + (ch.error || 'declined'));
    chargeId = ch.id;
  }
  const order = await db.$transaction(async t => {
    if (!opts.draft) for (const l of q.lines) { const u = await t.variant.updateMany({ where: { id: l.variantId, inventory: { gte: l.qty } }, data: { inventory: { decrement: l.qty } } }); if (!u.count) throw bad('Out of stock: ' + l.title); }
    if (!opts.draft && q.discountId) await t.discount.update({ where: { id: q.discountId }, data: { used: { increment: 1 } } });
    if (!opts.draft && q.giftCard) await t.giftCard.update({ where: { code: b.giftCode }, data: { balance: { decrement: Math.round(q.giftCard) } } });
    return t.order.create({ data: { storeId, number: await nextOrderNumber(storeId), customerId: customer.id, email, currency: q.currency, subtotal: q.subtotal, discount: q.discount, shipping: q.shipping, tax: q.tax, giftCard: q.giftCard, total: q.total, shipTo: b.shipTo, draft: !!opts.draft, financial: opts.draft ? 'pending' : q.total > 0 && !opts.skipPayment ? 'held' : 'paid', timeline: tl(null, opts.draft ? 'Draft order created' : `Order placed${chargeId ? ', payment ' + chargeId + ' captured into Sellora Pay escrow' : ''}`), lines: { create: q.lines.map(({ tags, ...l }) => l) } }, include: { lines: true } });
  });
  let escrow: any = null;
  if (chargeId) escrow = await holdEscrow(order, buyer?.id || 'guest:' + email, store.feeBps);
  if (b.cartId) await db.cart.updateMany({ where: { id: b.cartId }, data: { status: 'completed' } });
  if (!opts.draft) { await notify('email', email, 'order_confirmation', { number: order.number, total: order.total, currency: order.currency }); await meterSoft(storeId, 'email', 1, 'order_confirmation'); await emit(storeId, 'orders/create', order); }
  return { order, escrow, chargeId };
}
