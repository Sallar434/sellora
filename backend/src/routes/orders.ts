import { meterSoft } from '../lib/billing';
import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db';
import { ah, parse, bad, nf } from '../lib/http';
import { storeAccess } from '../lib/auth';
import { tl, priceCart } from '../lib/commerce';
import { placeOrder } from '../lib/checkout';
import { refundEscrow, post, wallet, externalWallet, markShipped, settleNotReceived } from '../lib/ledger';
import { payments } from '../providers/payment';
import { idempotent } from '../lib/idem';
import { notify } from '../providers/notify';
import { emit } from '../lib/webhooks';
import { audit } from '../lib/audit';
import { config } from '../lib/config';
export const r = Router();
const get = async (req: any) => { const o = await db.order.findFirst({ where: { id: req.params.id, storeId: req.store.id }, include: { lines: true } }); if (!o) throw nf('Order not found'); return o; };
r.get('/:storeId/orders', storeAccess('orders'), ah(async (req, res) => res.json(await db.order.findMany({ where: { storeId: req.store.id, draft: req.query.draft === '1' }, include: { lines: true }, orderBy: { createdAt: 'desc' } }))));
r.get('/:storeId/orders/:id', storeAccess('orders'), ah(async (req, res) => { const o = await get(req); res.json({ ...o, escrow: await db.escrow.findUnique({ where: { orderId: o.id } }) }); }));
r.post('/:storeId/orders/:id/fulfill', storeAccess('orders'), ah(async (req, res) => {
  const o = await get(req); if (o.status === 'cancelled') throw bad('Cancelled');
  const b = parse(z.object({ carrier: z.string().optional(), tracking: z.string().optional(), url: z.string().optional(), lineIds: z.array(z.string()).optional(), shippingCost: z.number().int().min(0).optional() }), req.body);
  const f = [...((o.fulfillments as any[]) || []), { ...b, at: new Date().toISOString() }];
  const u = await db.order.update({ where: { id: o.id }, data: { fulfillment: 'fulfilled', fulfillments: f, timeline: tl(o, `Fulfilled${b.tracking ? ' — ' + (b.carrier || '') + ' ' + b.tracking : ''}`) } });
  await meterSoft(req.store.id, 'email', 1, 'shipping_update');
  await notify('email', o.email, 'shipping_update', { number: o.number, tracking: b.tracking, url: b.url }); await emit(o.storeId, 'orders/fulfilled', u);
  // VendOm Pay Protection: the confirm window starts now; the seller's courier cost is recorded (defaults to the shipping the buyer paid)
  if (o.protected && await markShipped(o.id, b.shippingCost ?? o.shipping)) await notify('email', o.email, 'confirm_receipt', { number: o.number, tracking: b.tracking });
  res.json(u);
}));
/** Refund (partial/full, optional restock). Refunds come from escrow if still held, else from seller available balance. */
r.post('/:storeId/orders/:id/refund', storeAccess('orders'), idempotent, ah(async (req, res) => {
  const o = await get(req);
  const b = parse(z.object({ amount: z.number().int().positive().optional(), lines: z.array(z.object({ lineId: z.string(), qty: z.number().int().positive() })).default([]), restock: z.boolean().default(true), reason: z.string().optional() }), req.body);
  let amount = b.amount ?? b.lines.reduce((s, l) => s + (o.lines.find(x => x.id === l.lineId)?.price || 0) * l.qty, 0);
  if (!amount) amount = o.total - o.refunded;
  if (amount > o.total - o.refunded) throw bad('Refund exceeds remaining amount');
  const esc = await db.escrow.findUnique({ where: { orderId: o.id } });
  if (esc?.status === 'held') await refundEscrow(esc.id, Math.min(amount, esc.amount));
  else { const sw = await wallet('SELLER', o.storeId, o.currency); const ext = await externalWallet(o.currency); await post(`order ${o.id} refund`, o.currency, [{ walletId: sw.id, bucket: 'available', amount: -amount }, { walletId: ext.id, bucket: 'available', amount }]); }
  await payments().refund({ chargeId: o.id, amount, currency: o.currency });
  for (const l of b.lines) { const line = o.lines.find(x => x.id === l.lineId); if (!line) continue; await db.orderLine.update({ where: { id: line.id }, data: { refundedQty: { increment: l.qty } } }); if (b.restock && line.variantId) await db.variant.update({ where: { id: line.variantId }, data: { inventory: { increment: l.qty } } }); }
  const refunded = o.refunded + amount;
  const u = await db.order.update({ where: { id: o.id }, data: { refunded, financial: refunded >= o.total ? 'refunded' : 'partially_refunded', timeline: tl(o, `Refunded ${amount} ${o.currency}${b.reason ? ' — ' + b.reason : ''}`) } });
  audit(req, 'order.refund', { id: o.id, amount }); await emit(o.storeId, 'orders/refunded', u); res.json(u);
}));
r.post('/:storeId/orders/:id/cancel', storeAccess('orders'), idempotent, ah(async (req, res) => {
  const o = await get(req); if (o.status === 'cancelled') throw bad('Already cancelled'); if (o.fulfillment === 'fulfilled') throw bad('Fulfilled orders must be refunded');
  const esc = await db.escrow.findUnique({ where: { orderId: o.id } }); if (esc?.status === 'held') await refundEscrow(esc.id, esc.amount);
  for (const l of o.lines) if (l.variantId) await db.variant.update({ where: { id: l.variantId }, data: { inventory: { increment: l.qty - l.refundedQty } } });
  const done = await db.order.update({ where: { id: o.id }, data: { status: 'cancelled', financial: esc ? 'refunded' : o.financial, refunded: esc ? o.total : o.refunded, timeline: tl(o, 'Order cancelled' + (esc ? ', buyer refunded from escrow' : '')) } });
  emit(req.store.id, 'orders/cancelled', done).catch(() => {});
  res.json(done);
}));
r.patch('/:storeId/orders/:id', storeAccess('orders'), ah(async (req, res) => {
  const o = await get(req); const b = parse(z.object({ shipTo: z.any(), email: z.string().email(), note: z.string() }).partial(), req.body);
  const { note, ...d } = b; res.json(await db.order.update({ where: { id: o.id }, data: { ...d, timeline: tl(o, note ? 'Note: ' + note : 'Order edited') } }));
}));
// drafts
r.post('/:storeId/draft-orders', storeAccess('orders'), ah(async (req, res) => res.status(201).json((await placeOrder(req.store.id, req.body, undefined, { draft: true })).order)));
r.post('/:storeId/draft-orders/:id/complete', storeAccess('orders'), ah(async (req, res) => {
  const o = await get(req); if (!o.draft) throw bad('Not a draft');
  for (const l of o.lines) if (l.variantId) await db.variant.update({ where: { id: l.variantId }, data: { inventory: { decrement: l.qty } } });
  res.json(await db.order.update({ where: { id: o.id }, data: { draft: false, financial: req.body?.paid ? 'paid' : 'pending', timeline: tl(o, 'Draft completed') } }));
}));
// abandoned checkouts = open carts with email older than 1h (or ?all=1)
r.get('/:storeId/abandoned-checkouts', storeAccess('orders'), ah(async (req, res) => res.json(await db.cart.findMany({ where: { storeId: req.store.id, status: 'open', email: { not: null }, ...(req.query.all ? {} : { updatedAt: { lt: new Date(Date.now() - 36e5) } }) } }))));
r.post('/:storeId/abandoned-checkouts/:id/recover', storeAccess('orders'), ah(async (req, res) => {
  const c = await db.cart.findFirst({ where: { id: req.params.id, storeId: req.store.id } }); if (!c?.email) throw nf();
  res.json(await notify('email', c.email, 'abandoned_cart', { url: `${config.publicUrl}/s/${req.store.handle}/cart/${c.id}` }));
}));
r.post('/:storeId/checkout/quote', storeAccess('orders'), ah(async (req, res) => res.json(await priceCart(req.store.id, req.body))));

/** Seller: the parcel came back (refused, wrong address, not collected). The buyer is refunded minus the seller's shipping cost. */
r.post('/:storeId/orders/:id/returned', storeAccess('orders'), ah(async (req, res) => {
  const o = await get(req); const e = await db.escrow.findUnique({ where: { orderId: o.id } }); if (!e || e.status !== 'held') throw bad('This payment is not held by VendOm Pay');
  if (!e.shippedAt) throw bad('Mark the order as shipped first');
  const out = await settleNotReceived(e.id, 'parcel returned to seller'); audit(req, 'order.returned', { id: o.id, ...out });
  await notify('email', o.email, 'refund_notice', { number: o.number, amount: out.refunded, currency: o.currency, why: 'The parcel was returned to the seller; their shipping cost was deducted.' });
  res.json(out);
}));
/** Store payment settings: direct | protected | choice (buyer picks at checkout). */
r.get('/:storeId/payments/settings', storeAccess(), ah(async (req, res) => res.json({ mode: (req.store.settings as any)?.payments?.mode || 'choice', shipByDays: config.shipByDays, confirmDays: config.escrowAutoReleaseDays, notReceivedResponseDays: config.notReceivedResponseDays, feeBps: req.store.feeBps })));
r.put('/:storeId/payments/settings', storeAccess('settings'), ah(async (req, res) => {
  const b = parse(z.object({ mode: z.enum(['direct', 'protected', 'choice']) }), req.body); const set = (req.store.settings as any) || {};
  await db.store.update({ where: { id: req.store.id }, data: { settings: { ...set, payments: { ...(set.payments || {}), mode: b.mode } } } }); audit(req, 'payments.mode', b); res.json({ mode: b.mode });
}));
