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
  return db.escrow.create({ data: { orderId: order.id, storeId: order.storeId, buyerWalletId: buyer.id, sellerWalletId: seller.id, amount: order.total, fee: feeFor(order.total, feeBps), currency: cur, releaseAt: new Date(Date.now() + config.escrowAutoReleaseDays * 864e5) } });
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
export async function autoReleaseDue() {
  const due = await db.escrow.findMany({ where: { status: 'held', releaseAt: { lte: new Date() } } });
  for (const e of due) { const d = await db.dispute.findFirst({ where: { escrowId: e.id, status: 'open' } }); if (!d) await releaseEscrow(e.id, 'auto'); }
  return due.length;
}
