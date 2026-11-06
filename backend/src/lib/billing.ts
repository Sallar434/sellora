/** Seller subscription plans: quotas, usage metering, enforcement (stop vs auto-pay overage), alerts and invoicing. */
import { db } from './db';
import { HttpError, bad } from './http';
import { rand } from './crypto';
import { post, wallet, externalWallet } from './ledger';
import { payments } from '../providers/payment';
import { notify } from '../providers/notify';
import { emit } from './webhooks';

export const METRICS = ['orders', 'products', 'staff', 'whatsapp', 'email', 'ai', 'storage_gb', 'stores', 'markets'] as const;
export type Metric = typeof METRICS[number];
/** Flow metrics reset each billing period; gauges are point-in-time counts. */
export const FLOW: Metric[] = ['orders', 'whatsapp', 'email', 'ai'];
export const LABEL: Record<Metric, string> = { orders: 'Orders', products: 'Products', staff: 'Staff accounts', whatsapp: 'WhatsApp messages', email: 'Emails', ai: 'AI credits', storage_gb: 'Storage (GB)', stores: 'Stores', markets: 'Markets' };
export const CURRENCY_NAME: Record<string, string> = { PKR: 'Pakistani Rupee (PKR)', USD: 'US Dollar (USD)' };

// [metric, included, unitSize, overage PKR (rupees), overage USD (cents), hard]
type Q = [Metric, number, number, number, number, boolean];
// Overage (all paid plans): order Rs 2 / 1¢, WhatsApp Rs 8 / 3¢, email Rs 60 / 25¢ per 1,000, AI Rs 80 / 29¢ per 100 credits, storage Rs 10 / 4¢ per GB, staff Rs 99 / 40¢ per seat.
const ov = (m: Metric, inc: number): Q => ({
  orders: [m, inc, 1, 2, 1, false], whatsapp: [m, inc, 1, 8, 3, false], email: [m, inc, 1000, 60, 25, false], ai: [m, inc, 100, 80, 29, false],
  storage_gb: [m, inc, 1, 10, 4, false], staff: [m, inc, 1, 99, 40, false], products: [m, inc, 1, 0, 0, true], stores: [m, inc, 1, 0, 0, true], markets: [m, inc, 1, 0, 0, true],
} as Record<Metric, Q>)[m];
const q = (o: number, p: number, s: number, w: number, e: number, a: number, g: number, st: number, mk: number) =>
  ([['orders', o], ['products', p], ['staff', s], ['whatsapp', w], ['email', e], ['ai', a], ['storage_gb', g], ['stores', st], ['markets', mk]] as [Metric, number][]).map(([m, i]) => ov(m, i));
// Low-price plans: Rs 300 / 600 / 1,000 a month. Profit comes mostly from Sellora Pay fees; subscriptions cover worst-case usage cost with >=35% margin.
export const DEFAULT_PLANS = [
  { code: 'starter', name: 'Free', tagline: 'Legacy free plan (not offered to new stores)', active: false, pricePkr: 0, priceUsd: 0, trialDays: 0, cardFeeBps: 450, cardFixedPkr: 3000, cardFixedUsd: 11, walletFeeBps: 300, bankFeeBps: 0, overageAllowed: false, sort: 0, quotas: q(20, 15, 1, 5, 300, 30, 1, 1, 1) },
  { code: 'basic', name: 'Basic', tagline: 'For new sellers', pricePkr: 30000, priceUsd: 109, trialDays: 0, cardFeeBps: 400, cardFixedPkr: 3000, cardFixedUsd: 11, walletFeeBps: 250, bankFeeBps: 0, overageAllowed: true, sort: 1, quotas: q(150, 500, 1, 15, 1500, 100, 2, 1, 1) },
  { code: 'grow', name: 'Grow', tagline: 'For growing shops', pricePkr: 60000, priceUsd: 215, trialDays: 0, cardFeeBps: 375, cardFixedPkr: 3000, cardFixedUsd: 11, walletFeeBps: 250, bankFeeBps: 0, overageAllowed: true, sort: 2, quotas: q(400, 2000, 3, 30, 3000, 200, 5, 1, 2) },
  { code: 'advanced', name: 'Advanced', tagline: 'Everything a small/medium seller needs', pricePkr: 100000, priceUsd: 359, trialDays: 0, cardFeeBps: 350, cardFixedPkr: 3000, cardFixedUsd: 11, walletFeeBps: 250, bankFeeBps: 0, overageAllowed: true, sort: 3, quotas: q(1000, -1, 8, 50, 5000, 400, 10, 2, 5) },
  { code: 'enterprise', name: 'Enterprise', tagline: 'Custom contract — from', pricePkr: 499900, priceUsd: 1790, trialDays: 0, cardFeeBps: 340, cardFixedPkr: 3000, cardFixedUsd: 11, walletFeeBps: 225, bankFeeBps: 0, overageAllowed: true, custom: true, sort: 4, quotas: q(-1, -1, 25, 500, 50000, 5000, 100, 10, -1) },
];
export const TRIAL_PLAN = 'grow';
/** Every new store gets a 4-day free trial of the plan it picks. Publishing needs a paid (active) plan. */
export const TRIAL_DAYS = 4;
export const SELECTABLE = ['basic', 'grow', 'advanced'];

let ensured = false;
export async function ensurePlans() {
  if (ensured) return; if (await db.plan.count()) { ensured = true; return; }
  for (const { quotas, ...p } of DEFAULT_PLANS) await db.plan.upsert({ where: { code: p.code }, update: {}, create: { ...p, quotas: { create: quotas.map(([metric, included, unitSize, ovp, ovu, hard]) => ({ metric, included, unitSize, overagePkr: ovp * 100, overageUsd: ovu, hard })) } } });
  ensured = true;
}
export const resetPlanCache = () => { ensured = false; };
export async function getPlan(code: string) { await ensurePlans(); const p = await db.plan.findUnique({ where: { code }, include: { quotas: true } }); if (!p) throw bad('Unknown plan: ' + code); return p; }
export async function listPlans(all = false) { await ensurePlans(); return db.plan.findMany({ where: all ? {} : { active: true }, include: { quotas: true }, orderBy: { sort: 'asc' } }); }
const addMonths = (d: Date, n: number) => { const x = new Date(d); x.setUTCMonth(x.getUTCMonth() + n); return x; };
export const periodKey = (d: Date) => d.toISOString().slice(0, 10);
export const priceOf = (p: { pricePkr: number; priceUsd: number; annualDiscountBps: number }, cur: string, interval: string) => {
  const m = cur === 'USD' ? p.priceUsd : p.pricePkr; if (interval !== 'annual') return m;
  const unit = cur === 'USD' ? 100 : 100; return Math.round((m * 12 * (10000 - p.annualDiscountBps)) / 10000 / unit) * unit; // whole rupee / dollar
};

export async function getSub(storeId: string) {
  await ensurePlans();
  let s = await db.subscription.findUnique({ where: { storeId } });
  if (!s) {
    const now = new Date(); const store = await db.store.findUnique({ where: { id: storeId } });
    s = await db.subscription.create({ data: { storeId, planCode: TRIAL_PLAN, status: 'trialing', trialEndsAt: new Date(+now + TRIAL_DAYS * 864e5), periodStart: now, periodEnd: new Date(+now + TRIAL_DAYS * 864e5), currency: store?.currency === 'USD' ? 'USD' : 'PKR' } });
  }
  else if (s.status === 'trialing' && s.trialEndsAt && +s.trialEndsAt <= Date.now()) s = await db.subscription.update({ where: { id: s.id }, data: { status: 'expired' } });
  return s;
}
/** Quotas while trialing come from the trial plan; overage is never charged in trial. */
async function ctx(storeId: string) { const sub = await getSub(storeId); const plan = await getPlan(sub.planCode); return { sub, plan, quota: (m: string) => plan.quotas.find(x => x.metric === m) }; }

export async function gauge(storeId: string, m: Metric): Promise<number> {
  switch (m) {
    case 'products': return db.product.count({ where: { storeId } });
    case 'staff': return db.membership.count({ where: { storeId } });
    case 'markets': return db.market.count({ where: { storeId } });
    case 'storage_gb': { const a = await db.upload.aggregate({ where: { storeId }, _sum: { size: true } }); return (a._sum.size || 0) / 1e9; }
    case 'stores': { const s = await db.store.findUnique({ where: { id: storeId } }); return s ? db.store.count({ where: { ownerId: s.ownerId } }) : 0; }
    default: { const sub = await getSub(storeId); return (await db.usageCounter.findUnique({ where: { storeId_period_metric: { storeId, period: periodKey(sub.periodStart), metric: m } } }))?.used || 0; }
  }
}
export const unitPrice = (qt: { overagePkr: number; overageUsd: number }, cur: string) => (cur === 'USD' ? qt.overageUsd : qt.overagePkr);
export const overageAmount = (qt: { unitSize: number; overagePkr: number; overageUsd: number }, units: number, cur: string) => (units <= 0 ? 0 : Math.ceil(units / qt.unitSize) * unitPrice(qt, cur));

const limitErr = (m: Metric, used: number, included: number, plan: string, why: string) =>
  new HttpError(402, `${LABEL[m]} limit reached on the ${plan} plan (${Math.round(used * 100) / 100}/${included}). ${why}`, { metric: m, used, included, plan, upgrade: true });

/** Pre-check: throws 402 when the action would exceed the quota and the merchant (or plan) does not allow paid overage. */
export async function check(storeId: string, m: Metric, qty = 1) {
  const { sub, plan, quota } = await ctx(storeId); const qt = quota(m); if (!qt || qt.included < 0) return;
  const used = await gauge(storeId, m); const after = used + qty; if (after <= qt.included) return;
  if (qt.hard) throw limitErr(m, used, qt.included, plan.name, 'Upgrade your plan to add more.');
  if (sub.status === 'trialing') throw limitErr(m, used, qt.included, plan.name + ' trial', 'Choose a plan to unlock paid overage.');
  if (!plan.overageAllowed) throw limitErr(m, used, qt.included, plan.name, 'Upgrade to a paid plan.');
  if (sub.overageMode !== 'auto') throw limitErr(m, used, qt.included, plan.name, 'Turn on auto-pay overage or upgrade.');
  if (sub.spendCap != null) { const cur = await projectedOverage(storeId); const extra = overageAmount(qt, Math.ceil(after - qt.included), sub.currency) - overageAmount(qt, Math.ceil(Math.max(0, used - qt.included)), sub.currency); if (cur.total + extra > sub.spendCap) throw limitErr(m, used, qt.included, plan.name, `Overage spending cap of ${(sub.spendCap / 100).toFixed(2)} ${sub.currency} reached.`); }
}
/** Records usage of a flow metric and fires 80%/100% alerts once per period. */
export async function record(storeId: string, m: Metric, qty = 1, ref?: string) {
  const { sub, plan, quota } = await ctx(storeId); const period = periodKey(sub.periodStart); const qt = quota(m);
  if (FLOW.includes(m)) {
    const c = await db.usageCounter.upsert({ where: { storeId_period_metric: { storeId, period, metric: m } }, update: { used: { increment: qty } }, create: { storeId, period, metric: m, used: qty } });
    await db.usageRecord.create({ data: { storeId, period, metric: m, qty, ref, overage: !!qt && qt.included >= 0 && c.used > qt.included } });
    if (qt && qt.included > 0) await alerts(storeId, plan.name, m, c.used, qt.included, c);
  } else if (qt && qt.included > 0) {
    const used = await gauge(storeId, m); const c = await db.usageCounter.upsert({ where: { storeId_period_metric: { storeId, period, metric: m } }, update: { used: Math.ceil(used) }, create: { storeId, period, metric: m, used: Math.ceil(used) } });
    await alerts(storeId, plan.name, m, used, qt.included, c);
  }
}
async function alerts(storeId: string, planName: string, m: Metric, used: number, included: number, c: { id: string; alerted80: boolean; alerted100: boolean }) {
  const pct = (used / included) * 100; const lvl = pct >= 100 && !c.alerted100 ? 100 : pct >= 80 && !c.alerted80 ? 80 : 0; if (!lvl) return;
  await db.usageCounter.update({ where: { id: c.id }, data: lvl === 100 ? { alerted100: true, alerted80: true } : { alerted80: true } });
  const store = await db.store.findUnique({ where: { id: storeId } }); const owner = store && await db.user.findUnique({ where: { id: store.ownerId } });
  const text = `You have used ${lvl}% of your ${LABEL[m]} on the ${planName} plan (${Math.round(used * 100) / 100} of ${included}). ${lvl === 100 ? 'Further usage is billed as overage or blocked, depending on your settings.' : 'Consider upgrading to avoid interruptions.'}`;
  if (owner) await notify('email', owner.email, 'generic', { subject: `Sellora usage alert: ${LABEL[m]} at ${lvl}%`, text }).catch(() => {});
  await emit(storeId, 'billing/usage_alert', { metric: m, level: lvl, used, included }).catch(() => {});
}
export async function consume(storeId: string, m: Metric, qty = 1, ref?: string) { await check(storeId, m, qty); await record(storeId, m, qty, ref); }
/** Transactional sends (order confirmations, shipping updates) are never blocked — only metered. */
/** Reverses a reserved flow usage when the metered request failed. */
export async function release(storeId: string, m: Metric, qty: number) { const sub = await getSub(storeId); await db.usageCounter.updateMany({ where: { storeId, period: periodKey(sub.periodStart), metric: m }, data: { used: { decrement: qty } } }); await db.usageRecord.create({ data: { storeId, period: periodKey(sub.periodStart), metric: m, qty: -qty, ref: 'released (request failed)' } }); }
export const meterSoft = (storeId: string, m: Metric, qty = 1, ref?: string) => record(storeId, m, qty, ref).catch(() => {});

export async function usage(storeId: string) {
  const { sub, plan } = await ctx(storeId); const items: any[] = []; let total = 0;
  for (const m of METRICS) {
    const qt = plan.quotas.find(x => x.metric === m); const used = await gauge(storeId, m); const inc = qt?.included ?? 0;
    const over = qt && inc >= 0 && !qt.hard ? Math.max(0, used - inc) : 0; const cost = qt && sub.status !== 'trialing' ? overageAmount(qt, m === 'storage_gb' ? Math.ceil(over) : over, sub.currency) : 0; total += cost;
    items.push({ metric: m, label: LABEL[m], used: Math.round(used * 1000) / 1000, included: inc, unlimited: inc < 0, pct: inc > 0 ? Math.round((used / inc) * 1000) / 10 : inc === 0 ? 100 : 0, hard: !!qt?.hard, unitSize: qt?.unitSize || 1, overageUnitPrice: qt ? unitPrice(qt, sub.currency) : 0, overageUnits: over, overageCost: cost, status: inc < 0 ? 'ok' : used >= inc ? 'limit' : used >= inc * 0.8 ? 'warning' : 'ok' });
  }
  const capped = sub.spendCap != null ? Math.min(total, sub.spendCap) : total;
  return { subscription: { ...sub, plan: plan.name, currencyName: CURRENCY_NAME[sub.currency] }, period: periodKey(sub.periodStart), items, projectedOverage: capped, uncappedOverage: total, currency: sub.currency };
}
export async function projectedOverage(storeId: string) { const u = await usage(storeId); return { total: u.uncappedOverage }; }

const invNo = (d: Date) => `SB-${d.toISOString().slice(0, 7).replace('-', '')}-${rand(5).toUpperCase().replace(/[^A-Z0-9]/g, 'X')}`;
async function createInvoice(storeId: string, currency: string, period: string, lines: { kind: string; description: string; metric?: string; qty: number; unitAmount: number; amount: number }[]) {
  const subtotal = lines.reduce((s, l) => s + l.amount, 0);
  return db.invoice.create({ data: { storeId, number: invNo(new Date()), period, currency, subtotal, total: Math.max(0, subtotal), dueAt: new Date(Date.now() + 7 * 864e5), lines: { create: lines } }, include: { lines: true } });
}
/** Pays from the seller's Sellora Pay wallet when it has funds, otherwise charges the card on file. Revenue → ADMIN/billing wallet. */
export async function payInvoice(id: string, method?: 'wallet' | 'card', source = 'tok_visa') {
  const inv = await db.invoice.findUniqueOrThrow({ where: { id } }); if (inv.status === 'paid' || inv.status === 'void') return inv;
  const sub = await getSub(inv.storeId); const how = method || sub.payMethod; const rev = await wallet('ADMIN', 'billing', inv.currency);
  if (inv.total === 0) return db.invoice.update({ where: { id }, data: { status: 'paid', paidAt: new Date(), method: 'none' } });
  if (how === 'wallet') {
    const w = await wallet('SELLER', inv.storeId, inv.currency);
    if (w.available >= inv.total) { await post(`subscription invoice ${inv.number}`, inv.currency, [{ walletId: w.id, bucket: 'available', amount: -inv.total }, { walletId: rev.id, bucket: 'available', amount: inv.total }]); return paid(inv.id, inv.storeId, 'wallet'); }
  }
  const ch = await payments().charge({ amount: inv.total, currency: inv.currency, source, metadata: { storeId: inv.storeId, invoice: inv.number } });
  if (ch.status === 'succeeded') { const ext = await externalWallet(inv.currency); await post(`subscription invoice ${inv.number} (card)`, inv.currency, [{ walletId: ext.id, bucket: 'available', amount: -inv.total }, { walletId: rev.id, bucket: 'available', amount: inv.total }]); return paid(inv.id, inv.storeId, 'card'); }
  await db.subscription.update({ where: { storeId: inv.storeId }, data: { status: 'past_due' } });
  return db.invoice.update({ where: { id }, data: { status: 'past_due' } });
}
async function paid(id: string, storeId: string, method: string) {
  const s = await db.subscription.findUnique({ where: { storeId } }); if (s?.status === 'past_due') await db.subscription.update({ where: { storeId }, data: { status: 'active' } });
  return db.invoice.update({ where: { id }, data: { status: 'paid', paidAt: new Date(), method }, include: { lines: true } });
}
async function syncStore(storeId: string, plan: { code: string; cardFeeBps: number }) { await db.store.update({ where: { id: storeId }, data: { plan: plan.code, feeBps: plan.cardFeeBps } }); }

/** Gauges (products, staff, stores, markets) must fit the target plan before a downgrade. */
export async function fits(storeId: string, code: string) {
  const p = await getPlan(code); const issues: string[] = [];
  for (const m of ['products', 'staff', 'stores', 'markets', 'storage_gb'] as Metric[]) { const qt = p.quotas.find(x => x.metric === m); if (!qt || qt.included < 0) continue; const u = await gauge(storeId, m); if (u > qt.included && (qt.hard || !p.overageAllowed)) issues.push(`${LABEL[m]}: ${Math.round(u * 100) / 100} in use, ${p.name} allows ${qt.included}`); }
  return issues;
}
/** Upgrade = immediate with prorated charge; downgrade = at period end; leaving trial = new paid period now. */
export async function changePlan(storeId: string, code: string, opts: { interval?: string; currency?: string } = {}) {
  const sub = await getSub(storeId); const to = await getPlan(code); if (!to.active) throw bad('Plan is not available'); if (to.custom) throw new HttpError(409, 'Enterprise is custom — contact sales');
  const from = await getPlan(sub.planCode); const interval = opts.interval || sub.interval; const currency = opts.currency || sub.currency; const now = new Date();
  const issues = await fits(storeId, code); if (issues.length) throw new HttpError(409, 'Your store exceeds the limits of ' + to.name + ': ' + issues.join('; '), { issues });
  if (sub.status === 'trialing' || sub.status === 'expired' || to.pricePkr === 0 && from.pricePkr === 0) {
    const end = addMonths(now, interval === 'annual' ? 12 : 1);
    await db.subscription.update({ where: { storeId }, data: { planCode: code, interval, currency, status: 'active', trialEndsAt: null, periodStart: now, periodEnd: end, pendingPlanCode: null } });
    await syncStore(storeId, to); const fee = priceOf(to, currency, interval); let invoice: any = null;
    if (fee > 0) invoice = await payInvoice((await createInvoice(storeId, currency, periodKey(now), [{ kind: 'plan', description: `${to.name} plan (${interval}) ${periodKey(now)} → ${periodKey(end)}`, qty: 1, unitAmount: fee, amount: fee }])).id);
    return { subscription: await getSub(storeId), invoice, effective: 'now' };
  }
  const oldFee = priceOf(from, sub.currency, sub.interval), newFee = priceOf(to, currency, interval);
  if (newFee > oldFee || (newFee === oldFee && interval !== sub.interval)) {
    const frac = Math.max(0, Math.min(1, (+sub.periodEnd - +now) / (+sub.periodEnd - +sub.periodStart)));
    const sameShape = interval === sub.interval && currency === sub.currency; const end = sameShape ? sub.periodEnd : addMonths(now, interval === 'annual' ? 12 : 1);
    const lines = sameShape ? [{ kind: 'proration', description: `Upgrade ${from.name} → ${to.name}, ${Math.round(frac * 100)}% of period remaining`, qty: 1, unitAmount: Math.round((newFee - oldFee) * frac), amount: Math.round((newFee - oldFee) * frac) }]
      : [{ kind: 'plan', description: `${to.name} plan (${interval}) ${periodKey(now)} → ${periodKey(end)}`, qty: 1, unitAmount: newFee, amount: newFee }, ...(currency === sub.currency ? [{ kind: 'credit', description: `Unused time on ${from.name}`, qty: 1, unitAmount: -Math.round(oldFee * frac), amount: -Math.round(oldFee * frac) }] : [])];
    await db.subscription.update({ where: { storeId }, data: { planCode: code, interval, currency, status: 'active', pendingPlanCode: null, ...(sameShape ? {} : { periodEnd: end }) } });
    await syncStore(storeId, to);
    const invoice = await payInvoice((await createInvoice(storeId, currency, periodKey(sub.periodStart), lines)).id);
    return { subscription: await getSub(storeId), invoice, effective: 'now' };
  }
  await db.subscription.update({ where: { storeId }, data: { pendingPlanCode: code } });
  return { subscription: await getSub(storeId), invoice: null, effective: sub.periodEnd };
}

/** Closes due periods: overage lines (capped by spend cap) + next period's plan fee (applies pending downgrades), then pays. */
export async function runBilling(now = new Date(), onlyStore?: string) {
  await ensurePlans(); const due = await db.subscription.findMany({ where: { periodEnd: { lte: now }, status: { notIn: ['canceled', 'expired'] }, ...(onlyStore ? { storeId: onlyStore } : {}) } }); const out: any[] = [];
  for (const sub of due) {
    if (sub.status === 'trialing') { // trial ended without buying a plan → store locked (read-only), data kept
      await db.subscription.update({ where: { id: sub.id }, data: { status: 'expired' } });
      out.push({ storeId: sub.storeId, trialEnded: true }); continue;
    }
    const plan = await getPlan(sub.planCode); const period = periodKey(sub.periodStart); const lines: any[] = []; let ovTotal = 0;
    for (const qt of plan.quotas) {
      if (qt.included < 0 || qt.hard) continue; const used = await gauge(sub.storeId, qt.metric as Metric); const over = Math.max(0, qt.metric === 'storage_gb' ? Math.ceil(used - qt.included) : used - qt.included); if (!over) continue;
      const amount = overageAmount(qt, over, sub.currency); const blocks = Math.ceil(over / qt.unitSize); ovTotal += amount;
      lines.push({ kind: 'overage', metric: qt.metric, description: `${LABEL[qt.metric as Metric]} overage: ${Math.round(used * 100) / 100} used, ${qt.included} included → ${over} extra${qt.unitSize > 1 ? ` (${blocks} × ${qt.unitSize})` : ''}`, qty: blocks, unitAmount: unitPrice(qt, sub.currency), amount });
    }
    if (sub.spendCap != null && ovTotal > sub.spendCap) lines.push({ kind: 'credit', description: `Overage spending cap (${(sub.spendCap / 100).toFixed(2)} ${sub.currency})`, qty: 1, unitAmount: sub.spendCap - ovTotal, amount: sub.spendCap - ovTotal });
    const next = await getPlan(sub.pendingPlanCode || sub.planCode); const start = sub.periodEnd, end = addMonths(start, sub.interval === 'annual' ? 12 : 1); const fee = priceOf(next, sub.currency, sub.interval);
    if (fee > 0) lines.push({ kind: 'plan', description: `${next.name} plan (${sub.interval}) ${periodKey(start)} → ${periodKey(end)}`, qty: 1, unitAmount: fee, amount: fee });
    let invoice: any = null;
    if (lines.length) {
      invoice = await createInvoice(sub.storeId, sub.currency, period, lines);
      for (const l of lines.filter(l => l.kind === 'overage')) await db.overageCharge.create({ data: { storeId: sub.storeId, period, metric: l.metric, units: l.qty, amount: l.amount, currency: sub.currency, invoiceId: invoice.id } });
      invoice = await payInvoice(invoice.id);
    }
    await db.subscription.update({ where: { id: sub.id }, data: { planCode: next.code, pendingPlanCode: null, periodStart: start, periodEnd: end } }); await syncStore(sub.storeId, next);
    out.push({ storeId: sub.storeId, invoice });
  }
  return out;
}

/** Chosen at signup: (re)start the 4-day trial on a selectable plan. Only while not yet paid. */
export async function startTrial(storeId: string, code: string, interval = 'monthly') {
  if (!SELECTABLE.includes(code)) throw bad('Pick Basic, Grow or Advanced for the trial (Enterprise: contact sales)');
  const sub = await getSub(storeId); if (sub.status === 'active') throw new HttpError(409, 'Store already has a paid plan');
  if (sub.status === 'expired') throw new HttpError(402, 'Trial has ended — buy a plan to continue');
  const p = await getPlan(code);
  await db.subscription.update({ where: { storeId }, data: { planCode: code, interval } }); await syncStore(storeId, p);
  return getSub(storeId);
}
export const isPaid = (s: { status: string }) => s.status === 'active';
