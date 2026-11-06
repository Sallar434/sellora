import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db';
import { ah, parse, bad, nf } from '../lib/http';
import { requireType, auth } from '../lib/auth';
import { releaseEscrow, refundEscrow, post, externalWallet, autoReleaseDue } from '../lib/ledger';
import { payments } from '../providers/payment';
import { notify } from '../providers/notify';
import { audit } from '../lib/audit';
export const r = Router();
r.use(auth, requireType('ADMIN'));
r.get('/users', ah(async (req, res) => res.json(await db.user.findMany({ select: { id: true, email: true, type: true, name: true, emailVerified: true, phoneVerified: true, createdAt: true } }))));
r.patch('/users/:id', ah(async (req, res) => res.json(await db.user.update({ where: { id: req.params.id }, data: parse(z.object({ type: z.enum(['ADMIN', 'SELLER', 'BUYER']), name: z.string() }).partial(), req.body), select: { id: true, email: true, type: true } }))));
r.get('/stores', ah(async (req, res) => res.json(await db.store.findMany({ select: { id: true, name: true, handle: true, plan: true, feeBps: true, ownerId: true, createdAt: true } }))));
r.patch('/stores/:id/fees', ah(async (req, res) => { const { feeBps } = parse(z.object({ feeBps: z.number().int().min(0).max(5000) }), req.body); audit(req, 'admin.fee', { store: req.params.id, feeBps }); res.json(await db.store.update({ where: { id: req.params.id }, data: { feeBps } })); }));
r.get('/kyc', ah(async (req, res) => res.json(await db.kyc.findMany({ where: { status: String(req.query.status || 'submitted') } }))));
r.post('/kyc/:id/review', ah(async (req, res) => { const b = parse(z.object({ decision: z.enum(['approved', 'rejected', 'needs_info']), notes: z.string().optional() }), req.body); audit(req, 'admin.kyc', { id: req.params.id, ...b }); res.json(await db.kyc.update({ where: { id: req.params.id }, data: { status: b.decision, notes: b.notes } })); }));
r.get('/disputes', ah(async (req, res) => res.json(await db.dispute.findMany({ orderBy: { createdAt: 'desc' } }))));
r.post('/disputes/:id/resolve', ah(async (req, res) => {
  const b = parse(z.object({ outcome: z.enum(['refund_buyer', 'release_seller', 'partial']), refundAmount: z.number().int().positive().optional(), note: z.string().optional() }), req.body);
  const d = await db.dispute.findUnique({ where: { id: req.params.id } }); if (!d || d.status === 'resolved') throw bad('Dispute not open');
  const e = await db.escrow.findUniqueOrThrow({ where: { id: d.escrowId } }); let refund = 0;
  if (b.outcome === 'refund_buyer') { refund = e.amount; await refundEscrow(e.id, e.amount); }
  if (b.outcome === 'partial') { refund = b.refundAmount || 0; await refundEscrow(e.id, refund); }
  if (b.outcome !== 'refund_buyer') { const ne = await db.escrow.findUniqueOrThrow({ where: { id: e.id } }); if (ne.status === 'held' && ne.amount > 0) await releaseEscrow(e.id, 'dispute resolved'); }
  if (refund) { const o = await db.order.findUniqueOrThrow({ where: { id: e.orderId } }); const tot = o.refunded + refund; await db.order.update({ where: { id: o.id }, data: { refunded: tot, financial: tot >= o.total ? 'refunded' : 'partially_refunded' } }); }
  audit(req, 'admin.dispute', { id: d.id, ...b });
  res.json(await db.dispute.update({ where: { id: d.id }, data: { status: 'resolved', resolution: `${b.outcome}${b.note ? ': ' + b.note : ''}`, refundAmount: refund || null } }));
}));
r.get('/payouts', ah(async (req, res) => res.json(await db.payout.findMany({ where: req.query.status ? { status: String(req.query.status) } : {}, orderBy: { createdAt: 'desc' } }))));
r.post('/payouts/:id/approve', ah(async (req, res) => {
  const p = await db.payout.findUnique({ where: { id: req.params.id } }); if (!p || p.status !== 'pending') throw bad('Payout not pending');
  const out = await payments().payout({ amount: p.amount, currency: p.currency, destination: p.destination });
  const ext = await externalWallet(p.currency);
  await post(`payout ${p.id}`, p.currency, [{ walletId: p.walletId, bucket: 'held', amount: -p.amount }, { walletId: ext.id, bucket: 'available', amount: p.amount }]);
  const owner = await db.store.findUniqueOrThrow({ where: { id: p.storeId } }); const u = await db.user.findUnique({ where: { id: owner.ownerId } });
  if (u) await notify('email', u.email, 'payout_paid', { amount: p.amount, currency: p.currency });
  audit(req, 'admin.payout.approve', { id: p.id }); res.json(await db.payout.update({ where: { id: p.id }, data: { status: out.status === 'failed' ? 'failed' : 'paid', providerRef: out.id } }));
}));
r.post('/payouts/:id/reject', ah(async (req, res) => {
  const p = await db.payout.findUnique({ where: { id: req.params.id } }); if (!p || p.status !== 'pending') throw bad('Payout not pending');
  await post(`payout ${p.id} rejected`, p.currency, [{ walletId: p.walletId, bucket: 'held', amount: -p.amount }, { walletId: p.walletId, bucket: 'available', amount: p.amount }]);
  res.json(await db.payout.update({ where: { id: p.id }, data: { status: 'rejected' } }));
}));
r.get('/wallets', ah(async (req, res) => res.json(await db.wallet.findMany())));
r.get('/ledger/check', ah(async (req, res) => { const es = await db.ledgerEntry.groupBy({ by: ['txId'], _sum: { amount: true } }); const bad = es.filter(e => e._sum.amount !== 0); res.json({ transactions: es.length, unbalanced: bad.length }); }));
r.post('/jobs/escrow-auto-release', ah(async (req, res) => res.json({ released: await autoReleaseDue() })));
r.get('/audit-log', ah(async (req, res) => res.json(await db.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 500 }))));
r.get('/outbox', ah(async (req, res) => res.json(await db.outbox.findMany({ orderBy: { createdAt: 'desc' }, take: 200 }))));
// ---- platform owner: subscription plans, quotas, prices, billing runs
import { listPlans, getPlan, runBilling, METRICS, resetPlanCache } from '../lib/billing';
const planS = z.object({ code: z.string().regex(/^[a-z0-9-]{2,30}$/), name: z.string().min(1), tagline: z.string(), pricePkr: z.number().int().min(0), priceUsd: z.number().int().min(0), annualDiscountBps: z.number().int().min(0).max(9000), trialDays: z.number().int().min(0).max(90), cardFeeBps: z.number().int().min(0).max(2000), cardFixedPkr: z.number().int().min(0), cardFixedUsd: z.number().int().min(0), walletFeeBps: z.number().int().min(0).max(2000), bankFeeBps: z.number().int().min(0).max(2000), overageAllowed: z.boolean(), custom: z.boolean(), active: z.boolean(), sort: z.number().int() });
const quotaS = z.array(z.object({ metric: z.enum(METRICS), included: z.number().int().min(-1), unitSize: z.number().int().min(1).default(1), overagePkr: z.number().int().min(0).default(0), overageUsd: z.number().int().min(0).default(0), hard: z.boolean().default(false) }));
r.get('/plans', ah(async (_q, res) => res.json(await listPlans(true))));
r.post('/plans', ah(async (req, res) => { const b = parse(planS.partial({ tagline: true, annualDiscountBps: true, trialDays: true, cardFixedPkr: true, cardFixedUsd: true, bankFeeBps: true, overageAllowed: true, custom: true, active: true, sort: true }).extend({ quotas: quotaS.default([]) }), req.body); await listPlans(); const { quotas, ...p } = b; audit(req, 'admin.plan.create', { code: p.code }); res.status(201).json(await db.plan.create({ data: { ...p, quotas: { create: quotas } }, include: { quotas: true } })); }));
r.patch('/plans/:code', ah(async (req, res) => { const p = await getPlan(req.params.code); const b = parse(planS.omit({ code: true }).partial(), req.body); audit(req, 'admin.plan.update', { code: p.code, ...b }); const out = await db.plan.update({ where: { id: p.id }, data: b, include: { quotas: true } }); if (b.cardFeeBps != null) await db.store.updateMany({ where: { plan: p.code }, data: { feeBps: b.cardFeeBps } }); res.json(out); }));
r.put('/plans/:code/quotas', ah(async (req, res) => { const p = await getPlan(req.params.code); const qs = parse(quotaS, req.body?.quotas ?? req.body); for (const q of qs) await db.planQuota.upsert({ where: { planId_metric: { planId: p.id, metric: q.metric } }, update: q, create: { ...q, planId: p.id } }); audit(req, 'admin.plan.quotas', { code: p.code }); resetPlanCache(); res.json(await getPlan(p.code)); }));
r.post('/billing/run', ah(async (req, res) => { const b = parse(z.object({ now: z.string().datetime().optional(), storeId: z.string().optional() }), req.body || {}); res.json(await runBilling(b.now ? new Date(b.now) : new Date(), b.storeId)); }));
r.get('/billing/invoices', ah(async (_q, res) => res.json(await db.invoice.findMany({ include: { lines: true }, orderBy: { createdAt: 'desc' }, take: 500 }))));
r.get('/billing/subscriptions', ah(async (_q, res) => res.json(await db.subscription.findMany({ orderBy: { createdAt: 'desc' } }))));
