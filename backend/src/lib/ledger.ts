import { db } from './db';
import { bad } from './http';
import { rand } from './crypto';
import { config } from './config';
type Entry = { walletId: string; bucket: 'available' | 'held'; amount: number };
export async function wallet(ownerType: 'ADMIN' | 'SELLER' | 'BUYER' | 'EXTERNAL', ownerId: string, currency: string) {
  return db.wallet.upsert({ where: { ownerType_ownerId_currency: { ownerType, ownerId, currency } }, update: {}, create: { ownerType, ownerId, currency } });
}
export const platformWallet = (cur: string) => wallet('ADMIN', 'platform', cur);
export const externalWallet = (cur: string) => wallet('EXTERNAL', 'world', cur); // counterparty for money entering/leaving the system
/** Double-entry post: entries must sum to zero; non-external wallets may not go negative. */
export async function post(memo: string, currency: string, entries: Entry[], tx = db as any) {
  if (entries.reduce((s, e) => s + e.amount, 0) !== 0) throw bad('Unbalanced ledger transaction');
  const txId = 'tx_' + rand(10);
  const run = async (t: any) => {
    for (const e of entries) {
      const w = await t.wallet.update({ where: { id: e.walletId }, data: { [e.bucket]: { increment: e.amount } } });
      if (w.ownerType !== 'EXTERNAL' && w[e.bucket] < 0) throw bad(`Insufficient ${e.bucket} balance`);
      await t.ledgerEntry.create({ data: { txId, walletId: e.walletId, bucket: e.bucket, amount: e.amount, currency, memo } });
    }
    return txId;
  };
  return tx === db ? db.$transaction(run) : run(tx);
}
export const feeFor = (amount: number, bps = config.platformFeeBps) => Math.round((amount * bps) / 10000);

/** Buyer payment captured → funds held for seller. */
export async function holdEscrow(order: { id: string; storeId: string; total: number; currency: string }, buyerId: string, feeBps: number) {
  const cur = order.currency;
  const [ext, buyer, seller] = await Promise.all([externalWallet(cur), wallet('BUYER', buyerId, cur), wallet('SELLER', order.storeId, cur)]);
  // card funds enter buyer wallet then move into seller's held bucket (audit trail on both)
  await post(`order ${order.id} payment`, cur, [
    { walletId: ext.id, bucket: 'available', amount: -order.total },
    { walletId: buyer.id, bucket: 'available', amount: order.total },
    { walletId: buyer.id, bucket: 'available', amount: -order.total },
    { walletId: seller.id, bucket: 'held', amount: order.total },
  ]);
  return db.escrow.create({ data: { orderId: order.id, storeId: order.storeId, buyerWalletId: buyer.id, sellerWalletId: seller.id, amount: order.total, fee: feeFor(order.total, feeBps), currency: cur, shipBy: new Date(Date.now() + config.shipByDays * 864e5) } });
}
export async function releaseEscrow(escrowId: string, reason: string) {
  const e = await db.escrow.findUnique({ where: { id: escrowId } });
  if (!e || e.status !== 'held') throw bad('Escrow not releasable');
  const net = e.amount; const fee = Math.min(e.fee, net); const admin = await platformWallet(e.currency);
  await post(`escrow ${e.id} release (${reason})`, e.currency, [
    { walletId: e.sellerWalletId, bucket: 'held', amount: -net },
    { walletId: e.sellerWalletId, bucket: 'available', amount: net - fee },
    { walletId: admin.id, bucket: 'available', amount: fee },
  ]);
  await db.order.update({ where: { id: e.orderId }, data: { financial: 'paid' } });
  return db.escrow.update({ where: { id: e.id }, data: { status: 'released' } });
}
/** Refund from held escrow back to buyer wallet (and out to card via provider). amount=remaining held → full. */
export async function refundEscrow(escrowId: string, amount: number) {
  const e = await db.escrow.findUnique({ where: { id: escrowId } });
  if (!e || e.status !== 'held') throw bad('Escrow not refundable');
  if (amount <= 0 || amount > e.amount) throw bad('Invalid refund amount');
  await post(`escrow ${e.id} refund`, e.currency, [
    { walletId: e.sellerWalletId, bucket: 'held', amount: -amount },
    { walletId: e.buyerWalletId, bucket: 'available', amount },
  ]);
  const left = e.amount - amount;
  const fee = Math.round((e.fee * left) / e.amount);
  return db.escrow.update({ where: { id: e.id }, data: { amount: left, fee, status: left === 0 ? 'refunded' : 'held' } });
}
/** Direct payment (no protection): money goes to the seller's available balance right away, minus the platform fee. */
export async function creditDirect(order: { id: string; storeId: string; total: number; currency: string }, feeBps: number) {
  const cur = order.currency, fee = Math.min(feeFor(order.total, feeBps), order.total);
  const [ext, seller, admin] = await Promise.all([externalWallet(cur), wallet('SELLER', order.storeId, cur), platformWallet(cur)]);
  await post(`order ${order.id} direct payment`, cur, [
    { walletId: ext.id, bucket: 'available', amount: -order.total },
    { walletId: seller.id, bucket: 'available', amount: order.total - fee },
    { walletId: admin.id, bucket: 'available', amount: fee },
  ]);
}
/** Seller shipped a protected order: the buyer now has the confirm window before automatic release. */
export async function markShipped(orderId: string, shippingCost?: number) {
  const e = await db.escrow.findUnique({ where: { orderId } }); if (!e || e.status !== 'held') return null;
  return db.escrow.update({ where: { id: e.id }, data: { shippedAt: e.shippedAt || new Date(), releaseAt: new Date(Date.now() + config.escrowAutoReleaseDays * 864e5), ...(shippingCost != null ? { shippingCost: Math.max(0, Math.round(shippingCost)) } : {}) } });
}
/** Send money from held escrow back to the buyer, and out to their card when they paid by card. */
export async function refundBuyer(escrowId: string, amount: number) {
  const e = await refundEscrow(escrowId, amount);
  const o = await db.order.findUniqueOrThrow({ where: { id: e.orderId } });
  if (o.chargeId) {
    const { payments } = await import('../providers/payment');
    const r = await payments().refund({ chargeId: o.chargeId, amount, currency: o.currency });
    if (r.status === 'succeeded') { const ext = await externalWallet(o.currency); await post(`order ${o.id} refund to card`, o.currency, [{ walletId: e.buyerWalletId, bucket: 'available', amount: -amount }, { walletId: ext.id, bucket: 'available', amount }]); }
  }
  const tot = o.refunded + amount;
  await db.order.update({ where: { id: o.id }, data: { refunded: tot, financial: tot >= o.total ? 'refunded' : 'partially_refunded' } });
  return e;
}
/**
 * Buyer did not receive the parcel (or it came back to the seller): the seller keeps their shipping cost,
 * the rest goes back to the buyer. If the order was never shipped, the buyer gets everything back.
 */
export async function settleNotReceived(escrowId: string, why: string) {
  const e = await db.escrow.findUnique({ where: { id: escrowId } }); if (!e || e.status !== 'held') throw bad('Payment is no longer held');
  const keep = e.shippedAt ? Math.min(e.shippingCost, e.amount) : 0, back = e.amount - keep;
  if (back > 0) await refundBuyer(e.id, back);
  if (keep > 0) { await db.escrow.update({ where: { id: e.id }, data: { fee: 0 } }); await releaseEscrow(e.id, 'shipping cost kept by seller'); await db.order.update({ where: { id: e.orderId }, data: { financial: back > 0 ? 'partially_refunded' : 'paid' } }); }
  const o = await db.order.findUniqueOrThrow({ where: { id: e.orderId } });
  const { tl } = await import('./commerce');
  await db.order.update({ where: { id: o.id }, data: { timeline: tl(o, `Parcel not received (${why}): ${(back / 100).toFixed(2)} ${o.currency} refunded to the buyer${keep ? `, ${(keep / 100).toFixed(2)} ${o.currency} shipping cost paid to the seller` : ''}`) } });
  await db.dispute.updateMany({ where: { escrowId: e.id, status: { in: ['open', 'under_review'] } }, data: { status: 'resolved', resolution: `not_received: ${why}`, refundAmount: back || null } });
  return { refunded: back, sellerKept: keep };
}
/** Scheduled job: release shipped orders past their confirm window, refund unshipped ones past the ship-by date, settle unanswered "not received" reports. */
export async function autoReleaseDue() {
  const now = new Date(); let n = 0;
  const due = await db.escrow.findMany({ where: { status: 'held', shippedAt: { not: null }, releaseAt: { lte: now } } });
  for (const e of due) { const d = await db.dispute.findFirst({ where: { escrowId: e.id, status: { in: ['open', 'under_review'] } } }); if (!d) { await releaseEscrow(e.id, 'auto'); n++; } }
  const late = await db.escrow.findMany({ where: { status: 'held', shippedAt: null, shipBy: { lte: now } } });
  for (const e of late) { await cancelUnshipped(e.id, 'seller did not ship in time'); n++; }
  const silent = await db.dispute.findMany({ where: { kind: 'not_received', status: 'open', respondBy: { lte: now } } });
  for (const d of silent) { await settleNotReceived(d.escrowId, 'seller did not answer'); n++; }
  return n;
}
/** Full refund + cancel + restock for a protected order the seller never shipped. */
export async function cancelUnshipped(escrowId: string, why: string) {
  const e = await db.escrow.findUniqueOrThrow({ where: { id: escrowId } });
  await refundBuyer(e.id, e.amount);
  const o = await db.order.findUniqueOrThrow({ where: { id: e.orderId }, include: { lines: true } });
  for (const l of o.lines) if (l.variantId) await db.variant.update({ where: { id: l.variantId }, data: { inventory: { increment: l.qty - l.refundedQty } } });
  const { tl } = await import('./commerce');
  return db.order.update({ where: { id: o.id }, data: { status: 'cancelled', timeline: tl(o, `Cancelled and refunded in full: ${why}`) } });
}
