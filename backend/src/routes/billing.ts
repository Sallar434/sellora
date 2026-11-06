/** Seller billing: plans, usage meters, overage settings, plan changes, invoices. Platform-owner plan admin lives in admin.ts. */
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../lib/db';
import { ah, parse, nf } from '../lib/http';
import { storeAccess } from '../lib/auth';
import { listPlans, getSub, usage, changePlan, startTrial, payInvoice, priceOf, check, record, release, CURRENCY_NAME, LABEL, Metric } from '../lib/billing';
export const r = Router();
export const pub = Router();
const shape = (p: any) => ({ ...p, prices: { monthly: { PKR: priceOf(p, 'PKR', 'monthly'), USD: priceOf(p, 'USD', 'monthly') }, annual: { PKR: priceOf(p, 'PKR', 'annual'), USD: priceOf(p, 'USD', 'annual') } }, currencies: CURRENCY_NAME, quotas: p.quotas.map((q: any) => ({ ...q, label: LABEL[q.metric as Metric] })) });
pub.get('/', ah(async (_q, res) => res.json((await listPlans()).map(shape))));
r.get('/:storeId/billing', storeAccess(), ah(async (req, res) => { const u = await usage(req.store.id); res.json({ plan: u.subscription.planCode, subscription: u.subscription, canPublish: u.subscription.status === 'active', trialDaysLeft: u.subscription.status === 'trialing' && u.subscription.trialEndsAt ? Math.max(0, Math.ceil((+u.subscription.trialEndsAt - Date.now()) / 864e5)) : 0, usage: u, plans: (await listPlans()).map(shape), invoices: await db.invoice.findMany({ where: { storeId: req.store.id }, include: { lines: true }, orderBy: { createdAt: 'desc' } }) }); }));
r.get('/:storeId/billing/plans', storeAccess(), ah(async (_q, res) => res.json((await listPlans()).map(shape))));
r.get('/:storeId/billing/usage', storeAccess(), ah(async (req, res) => res.json(await usage(req.store.id))));
r.put('/:storeId/billing/settings', storeAccess('*'), ah(async (req, res) => {
  const b = parse(z.object({ overageMode: z.enum(['auto', 'stop']), spendCap: z.number().int().min(0).max(1e10).nullable(), payMethod: z.enum(['wallet', 'card']), currency: z.enum(['PKR', 'USD']) }).partial(), req.body);
  await getSub(req.store.id); res.json(await db.subscription.update({ where: { storeId: req.store.id }, data: b }));
}));
r.post('/:storeId/billing/trial', storeAccess('*'), ah(async (req, res) => { const b = parse(z.object({ plan: z.string().min(1), interval: z.enum(['monthly', 'annual']).optional() }), req.body); const s = await startTrial(req.store.id, b.plan, b.interval); res.json({ subscription: s, trialDaysLeft: Math.max(0, Math.ceil((+s.trialEndsAt! - Date.now()) / 864e5)), canPublish: false }); }));
r.post('/:storeId/billing/plan', storeAccess('*'), ah(async (req, res) => { const b = parse(z.object({ plan: z.string().min(1), interval: z.enum(['monthly', 'annual']).optional(), currency: z.enum(['PKR', 'USD']).optional() }), req.body); res.json(await changePlan(req.store.id, b.plan, b)); }));
r.post('/:storeId/billing/cancel-downgrade', storeAccess('*'), ah(async (req, res) => { await getSub(req.store.id); res.json(await db.subscription.update({ where: { storeId: req.store.id }, data: { pendingPlanCode: null } })); }));
r.get('/:storeId/billing/invoices', storeAccess(), ah(async (req, res) => res.json(await db.invoice.findMany({ where: { storeId: req.store.id }, include: { lines: true }, orderBy: { createdAt: 'desc' } }))));
r.get('/:storeId/billing/invoices/:id', storeAccess(), ah(async (req, res) => { const i = await db.invoice.findFirst({ where: { id: req.params.id, storeId: req.store.id }, include: { lines: true } }); if (!i) throw nf(); res.json(i); }));
r.post('/:storeId/billing/invoices/:id/pay', storeAccess('*'), ah(async (req, res) => { const i = await db.invoice.findFirst({ where: { id: req.params.id, storeId: req.store.id } }); if (!i) throw nf(); const b = parse(z.object({ method: z.enum(['wallet', 'card']).optional(), source: z.string().optional() }), req.body || {}); res.json(await payInvoice(i.id, b.method, b.source)); }));
r.get('/:storeId/billing/usage/records', storeAccess(), ah(async (req, res) => { const s = await getSub(req.store.id); res.json(await db.usageRecord.findMany({ where: { storeId: req.store.id, period: String(req.query.period || s.periodStart.toISOString().slice(0, 10)) }, orderBy: { createdAt: 'desc' }, take: 500 })); }));

/** Route → metric rules. Pre-checks quota (402 when blocked); records usage once the request succeeds. */
type Rule = [string, RegExp, Metric, (req: Request) => number];
const n1 = () => 1;
const RULES: Rule[] = [
  ['POST', /^\/products$/, 'products', n1],
  ['POST', /^\/products\/import$/, 'products', req => Array.isArray(req.body) ? req.body.length : Array.isArray(req.body?.products) ? req.body.products.length : typeof req.body === 'string' ? Math.max(0, req.body.trim().split('\n').length - 1) : 1],
  ['POST', /^\/staff$/, 'staff', n1],
  ['POST', /^\/markets$/, 'markets', n1],
  ['POST', /^\/uploads$/, 'storage_gb', req => (+(req.headers['content-length'] || 0)) / 1e9],
  ['POST', /^\/plus\/whatsapp\/send$/, 'whatsapp', req => (req.body?.category === 'marketing' ? 3 : 1)],
  ['POST', /^\/plus\/cod\/[^/]+\/otp$/, 'whatsapp', n1],
  ['POST', /^\/plus\/bank\/remind\/[^/]+$/, 'whatsapp', n1],
  ['POST', /^\/abandoned-checkouts\/[^/]+\/recover$/, 'email', n1],
  ['POST', /^\/ai\/store$/, 'ai', () => 10],
  ['POST', /^\/ai\/(product-copy|meta|seo-content|offpage-plan)$/, 'ai', n1],
  ['POST', /^\/voice$/, 'ai', () => 5],
  ['POST', /^\/ai\/site\/build$/, 'ai', () => 25],
  ['POST', /^\/ai\/site\/edit$/, 'ai', n1],
  ['POST', /^\/ai\/describe$/, 'ai', req => (Array.isArray(req.body?.langs) ? Math.max(1, req.body.langs.length) : 3)],
  ['POST', /^\/ai\/(alt-text|campaign|review-reply|social)$/, 'ai', n1],
  ['POST', /^\/ai\/competitor$/, 'ai', () => 2],
  ['POST', /^\/seo\/(aeo|geo|keywords|calendar)$/, 'ai', () => 2],
  ['POST', /^\/seo\/(outreach|gbp)$/, 'ai', n1],
  ['POST', /^\/plus\/ai\/listing$/, 'ai', req => (Array.isArray(req.body?.langs) ? req.body.langs.length : 3)],
];
export async function meter(req: Request, res: Response, next: NextFunction) {
  try {
    const m = req.path.match(/^\/([^/]+)(\/.*)$/); if (!m) return next();
    const [, storeId, rest] = m; const rule = RULES.find(([meth, re]) => meth === req.method && re.test(rest)); if (!rule) return next();
    if (!(await db.store.findUnique({ where: { id: storeId }, select: { id: true } }))) return next();
    const metric = rule[2]; const qty = rule[3](req); const gaugeMetric = !['whatsapp', 'email', 'ai', 'orders'].includes(metric);
    await check(storeId, metric, qty);
    if (gaugeMetric) res.on('finish', () => { if (res.statusCode < 400) record(storeId, metric, 0, req.method + ' ' + rest).catch(() => {}); });
    else { await record(storeId, metric, qty, req.method + ' ' + rest); res.on('finish', () => { if (res.statusCode >= 400) release(storeId, metric, qty).catch(() => {}); }); } // reserve, refund on failure
    next();
  } catch (e) { next(e); }
}
/** POST /api/stores (new store) is limited by the best "stores" quota among the stores the user owns. */
export async function meterNewStore(req: Request, _r: Response, next: NextFunction) {
  try {
    if (req.method !== 'POST' || req.path !== '/' || !req.user) return next();
    const owned = await db.store.findMany({ where: { ownerId: req.user.sub }, select: { id: true } }); if (!owned.length) return next();
    let ok = false, last: any = null; for (const s of owned) { try { await check(s.id, 'stores', 1); ok = true; break; } catch (e) { last = e; } }
    if (!ok) throw last; next();
  } catch (e) { next(e); }
}
