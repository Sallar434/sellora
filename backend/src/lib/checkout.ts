import { db } from './db';
import { bad, HttpError } from './http';
import { priceCart, nextOrderNumber, tl } from './commerce';
import { payments } from '../providers/payment';
import { holdEscrow, creditDirect } from './ledger';
import { config } from './config';
import { notify } from '../providers/notify';
import { emit } from './webhooks';
import { consume, meterSoft } from './billing';
export async function placeOrder(storeId: string, b: any, buyer?: { id: string; email: string }, opts: { draft?: boolean; skipPayment?: boolean } = {}) {
  const store = await db.store.findUniqueOrThrow({ where: { id: storeId } });
  const email = (buyer?.email || b.email || '').toLowerCase(); if (!email) throw bad('Email required');
  if (!opts.draft) await consume(storeId, 'orders', 1);
  const q = await priceCart(storeId, { ...b, email });
  const customer = await db.customer.upsert({ where: { storeId_email: { storeId, email } }, update: {}, create: { storeId, email, name: b.shipTo?.name, userId: buyer?.id, addresses: b.shipTo ? [b.shipTo] : [] } });
  // VendOm Pay Protection: the store decides (direct | protected | choice); with "choice" the buyer picks, and protected orders need a buyer account
  const mode = ((store.settings as any)?.payments?.mode as string) || 'choice';
  const paying = !opts.draft && !opts.skipPayment && q.total > 0;
  const protect = paying && (mode === 'protected' || (mode === 'choice' && (b.protection ?? !!buyer)));
  if (protect && !buyer) throw new HttpError(401, 'Create a free buyer account or sign in to pay with VendOm Pay Protection');
  let chargeId: string | undefined;
  if (paying) {
    const ch = await payments().charge({ amount: q.total, currency: q.currency, source: b.payment?.source || 'tok_visa', metadata: { storeId } });
    if (ch.status !== 'succeeded') throw new HttpError(402, 'Payment failed: ' + (ch.error || 'declined'));
    chargeId = ch.id;
  }
  const order = await db.$transaction(async t => {
    if (!opts.draft) for (const l of q.lines) { const u = await t.variant.updateMany({ where: { id: l.variantId, inventory: { gte: l.qty } }, data: { inventory: { decrement: l.qty } } }); if (!u.count) throw bad('Out of stock: ' + l.title); }
    if (!opts.draft && q.discountId) {
      const d = await t.discount.findUnique({ where: { id: q.discountId } });
      if (!d || (d.usageLimit != null && d.used >= d.usageLimit)) throw bad('Discount usage limit reached');
      const u = await t.discount.updateMany({ where: { id: d.id, used: d.used }, data: { used: { increment: 1 } } });
      if (!u.count) throw bad('This discount was just used by someone else. Please try again.');
    }
    if (!opts.draft && q.giftCardBase) {
      const amt = Math.round(q.giftCardBase); // gift card balances are in the store's base currency
      const g = await t.giftCard.updateMany({ where: { code: b.giftCode, storeId, active: true, balance: { gte: amt } }, data: { balance: { decrement: amt } } });
      if (!g.count) throw bad('Gift card balance changed. Please check it and try again.');
    }
    return t.order.create({ data: { storeId, number: await nextOrderNumber(storeId), customerId: customer.id, email, currency: q.currency, subtotal: q.subtotal, discount: q.discount, shipping: q.shipping, tax: q.tax, giftCard: q.giftCard, total: q.total, shipTo: b.shipTo, draft: !!opts.draft, financial: opts.draft ? 'pending' : protect ? 'held' : 'paid', protected: protect, chargeId, timeline: tl(null, opts.draft ? 'Draft order created' : `Order placed${chargeId ? (protect ? `, payment ${chargeId} held by VendOm Pay Protection until the buyer confirms delivery` : `, payment ${chargeId} received`) : ''}`), lines: { create: q.lines.map(({ tags, ...l }) => l) } }, include: { lines: true } });
  });
  let escrow: any = null;
  if (chargeId && protect) {
    escrow = await holdEscrow(order, buyer!.id, store.feeBps);
    const owner = await db.user.findUnique({ where: { id: store.ownerId }, select: { email: true } });
    if (owner) await notify('email', owner.email, 'ship_now', { number: order.number, total: order.total, currency: order.currency, shipBy: escrow.shipBy?.toISOString().slice(0, 10), days: config.escrowAutoReleaseDays });
    await emit(storeId, 'orders/paid', { ...order, protected: true });
  } else if (chargeId) await creditDirect(order, store.feeBps);
  if (b.cartId) await db.cart.updateMany({ where: { id: b.cartId }, data: { status: 'completed' } });
  if (!opts.draft) { await notify('email', email, 'order_confirmation', { number: order.number, total: order.total, currency: order.currency }); await meterSoft(storeId, 'email', 1, 'order_confirmation'); await emit(storeId, 'orders/create', order); }
  return { order, escrow, chargeId };
}
