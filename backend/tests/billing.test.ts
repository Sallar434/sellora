import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app';
import { db } from '../src/lib/db';
const app = createApp(); const A = () => request(app);
const H = (t: string) => ({ Authorization: 'Bearer ' + t });
let s: any, admin: any; const S = (p: string) => `/api/stores/${s.store.id}${p}`;
beforeAll(async () => {
  s = (await A().post('/api/auth/signup').send({ email: 'bill@t.io', password: 'password123', storeName: 'Bill Gear' }).expect(201)).body;
  await db.user.create({ data: { email: 'bill-admin@t.io', type: 'ADMIN', passwordHash: await bcrypt.hash('password123', 4) } });
  admin = (await A().post('/api/auth/login').send({ email: 'bill-admin@t.io', password: 'password123' })).body;
});
describe('Subscription plans & usage billing', () => {
  it('public plan catalogue: 4 tiers, PKR + USD, annual 20% off', async () => {
    const p = (await A().get('/api/plans').expect(200)).body; expect(p.map((x: any) => x.code)).toEqual(['basic', 'grow', 'advanced', 'enterprise']); // Free/starter is legacy-only, not offered
    const basic = p.find((x: any) => x.code === 'basic'); expect(basic.prices.monthly).toEqual({ PKR: 30000, USD: 109 }); expect(basic.prices.annual.PKR).toBe(288000);
    expect(basic.currencies.PKR).toBe('Pakistani Rupee (PKR)'); expect(basic.quotas.find((q: any) => q.metric === 'whatsapp').overagePkr).toBe(800);
    for (const x of p) expect(x.cardFeeBps).toBeGreaterThan(290);
  });
  it('new store starts on 4-day trial with usage meters', async () => {
    const u = (await A().get(S('/billing/usage')).set(H(s.accessToken)).expect(200)).body;
    const days = (+new Date(u.subscription.trialEndsAt) - Date.now()) / 864e5; expect(days).toBeGreaterThan(3.9); expect(days).toBeLessThanOrEqual(4);
    expect(u.subscription.planCode).toBe('grow'); expect(u.subscription.status).toBe('trialing'); expect(u.items.map((i: any) => i.metric)).toContain('ai');
    expect(u.items.find((i: any) => i.metric === 'staff').used).toBe(1);
  });
  it('admin edits plans/quotas; non-admin forbidden', async () => {
    await A().get('/api/admin/plans').set(H(s.accessToken)).expect(403);
    await A().post('/api/admin/plans').set(H(admin.accessToken)).send({ code: 'tiny', name: 'Tiny', pricePkr: 25000, priceUsd: 90, cardFeeBps: 400, walletFeeBps: 275, sort: 9, quotas: [{ metric: 'ai', included: 3, unitSize: 100, overagePkr: 25000, overageUsd: 90 }, { metric: 'products', included: 2, hard: true }, { metric: 'whatsapp', included: 10, overagePkr: 800, overageUsd: 3 }] }).expect(201);
    const t = (await A().patch('/api/admin/plans/tiny').set(H(admin.accessToken)).send({ tagline: 'test plan' }).expect(200)).body; expect(t.tagline).toBe('test plan');
    await A().put('/api/admin/plans/tiny/quotas').set(H(admin.accessToken)).send({ quotas: [{ metric: 'ai', included: 4, unitSize: 100, overagePkr: 25000, overageUsd: 90 }] }).expect(200);
    await A().put('/api/admin/plans/tiny/quotas').set(H(admin.accessToken)).send({ quotas: [{ metric: 'bogus', included: 1 }] }).expect(422);
  });
  it('leaving trial: choose plan → invoice paid by card (wallet empty), store fee synced', async () => {
    const r = (await A().post(S('/billing/plan')).set(H(s.accessToken)).send({ plan: 'tiny', currency: 'PKR' }).expect(200)).body;
    expect(r.subscription.status).toBe('active'); expect(r.invoice.status).toBe('paid'); expect(r.invoice.method).toBe('card'); expect(r.invoice.total).toBe(25000);
    expect((await db.store.findUnique({ where: { id: s.store.id } }))!.feeBps).toBe(400);
    await A().post(S('/billing/plan')).set(H(s.accessToken)).send({ plan: 'enterprise' }).expect(409);
  });
  it('stop-at-limit: AI blocked with 402 + upgrade hint; 80%/100% alerts', async () => {
    for (let i = 0; i < 4; i++) await A().post(S('/ai/product-copy')).set(H(s.accessToken)).send({ title: 'Glove' }).expect(200);
    const e = await A().post(S('/ai/product-copy')).set(H(s.accessToken)).send({ title: 'Glove' }).expect(402); expect(e.body.details.upgrade).toBe(true);
    const c = await db.usageCounter.findFirstOrThrow({ where: { storeId: s.store.id, metric: 'ai' } }); expect(c.used).toBe(4); expect(c.alerted80 && c.alerted100).toBe(true);
    expect(await db.outbox.count({ where: { to: 'bill@t.io', template: 'generic' } })).toBeGreaterThanOrEqual(1);
  });
  it('hard cap on products always requires upgrade', async () => {
    await A().post(S('/products')).set(H(s.accessToken)).send({ title: 'P1', price: 100 }).expect(201);
    await A().post(S('/products')).set(H(s.accessToken)).send({ title: 'P2', price: 100 }).expect(201);
    await A().put(S('/billing/settings')).set(H(s.accessToken)).send({ overageMode: 'auto' }).expect(200);
    expect((await A().post(S('/products')).set(H(s.accessToken)).send({ title: 'P3', price: 100 }).expect(402)).body.error).toMatch(/Upgrade/);
  });
  it('auto-pay overage + spending cap; billing run invoices overage lines and plan fee', async () => {
    await A().put(S('/billing/settings')).set(H(s.accessToken)).send({ overageMode: 'auto', spendCap: 30000, payMethod: 'wallet' }).expect(200);
    await A().post(S('/ai/product-copy')).set(H(s.accessToken)).send({ title: 'Glove' }).expect(200); // 5/4 → 1 block of 100 = Rs 250
    const u = (await A().get(S('/billing/usage')).set(H(s.accessToken)).expect(200)).body; expect(u.projectedOverage).toBe(25000);
    await A().post(S('/ai/product-copy')).set(H(s.accessToken)).send({ title: 'Glove' }).expect(200); // still same block
    const capped = await A().post(S('/ai/store')).set(H(s.accessToken)).send({ niche: 'sports' }); expect(capped.status).toBe(200); // 16 used: still 1 block of 100
    await A().put(S('/billing/settings')).set(H(s.accessToken)).send({ spendCap: 25000 }).expect(200);
    const sub = await db.subscription.findUniqueOrThrow({ where: { storeId: s.store.id } });
    const run = (await A().post('/api/admin/billing/run').set(H(admin.accessToken)).send({ now: new Date(+sub.periodEnd + 1000).toISOString(), storeId: s.store.id }).expect(200)).body;
    const inv = run[0].invoice; expect(inv.lines.find((l: any) => l.kind === 'overage' && l.metric === 'ai').amount).toBe(25000);
    expect(inv.lines.find((l: any) => l.kind === 'plan').amount).toBe(25000); expect(inv.total).toBe(50000); expect(inv.status).toBe('paid');
    expect(await db.overageCharge.count({ where: { storeId: s.store.id } })).toBe(1);
    const list = (await A().get(S('/billing/invoices')).set(H(s.accessToken)).expect(200)).body; expect(list.length).toBe(2);
    const after = (await A().get(S('/billing/usage')).set(H(s.accessToken)).expect(200)).body; expect(after.items.find((i: any) => i.metric === 'ai').used).toBe(0);
  });
  it('upgrade is prorated now; downgrade waits for period end and must fit limits', async () => {
    const up = (await A().post(S('/billing/plan')).set(H(s.accessToken)).send({ plan: 'basic' }).expect(200)).body; expect(up.effective).toBe('now'); expect(up.invoice.lines[0].kind).toBe('proration');
    const dn = (await A().post(S('/billing/plan')).set(H(s.accessToken)).send({ plan: 'tiny' }).expect(200)).body; expect(dn.subscription.pendingPlanCode).toBe('tiny'); expect(dn.subscription.planCode).toBe('basic');
    await A().post(S('/products')).set(H(s.accessToken)).send({ title: 'P3', price: 100 }).expect(201);
    expect((await A().post(S('/billing/plan')).set(H(s.accessToken)).send({ plan: 'tiny' }).expect(409)).body.error).toMatch(/Products/);
    await A().post(S('/billing/cancel-downgrade')).set(H(s.accessToken)).expect(200);
  });
  it('trial ending without a plan closes the store (expired: admin + storefront 402/503, data kept)', async () => {
    const t = (await A().post('/api/auth/signup').send({ email: 'bill2@t.io', password: 'password123', storeName: 'Trial Shop' }).expect(201)).body;
    const sub = (await A().get(`/api/stores/${t.store.id}/billing/usage`).set(H(t.accessToken)).expect(200)).body.subscription;
    await A().post('/api/admin/billing/run').set(H(admin.accessToken)).send({ now: new Date(+new Date(sub.periodEnd) + 1000).toISOString(), storeId: t.store.id }).expect(200);
    const u = (await A().get(`/api/stores/${t.store.id}/billing/usage`).set(H(t.accessToken)).expect(200)).body; expect(u.subscription.status).toBe('expired'); expect(u.subscription.planCode).toBe('grow');
    const e = await A().post(`/api/stores/${t.store.id}/products`).set(H(t.accessToken)).send({ title: 'Blocked' }).expect(402); expect(e.body.error).toMatch(/trial has ended/i);
    await A().get(`/api/stores/${t.store.id}/products`).set(H(t.accessToken)).expect(402); await A().get(`/api/stores/${t.store.id}/orders`).set(H(t.accessToken)).expect(402);
    await A().get(`/api/storefront/${t.store.id}`).expect(503); await A().get(`/api/stores/${t.store.id}/billing`).set(H(t.accessToken)).expect(200);
    await A().post(`/api/stores/${t.store.id}/billing/plan`).set(H(t.accessToken)).send({ plan: 'basic' }).expect(200);
    await A().post(`/api/stores/${t.store.id}/products`).set(H(t.accessToken)).send({ title: 'Allowed now' }).expect(201);
    await A().get(`/api/stores/${t.store.id}/products`).set(H(t.accessToken)).expect(200); await A().get(`/api/storefront/${t.store.id}`).expect(200);
  });
  it('Swagger lists billing + admin plan endpoints', async () => {
    const o = (await A().get('/openapi.json').expect(200)).body.paths;
    expect(o['/api/plans/'] || o['/api/plans']).toBeTruthy(); for (const k of ['/api/stores/{storeId}/billing/usage', '/api/stores/{storeId}/billing/settings', '/api/stores/{storeId}/billing/invoices/{id}/pay', '/api/admin/plans/{code}/quotas', '/api/admin/billing/run']) expect(o[k]).toBeTruthy();
  });
});
