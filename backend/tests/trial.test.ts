import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
const app = createApp(); const A = () => request(app);
const H = (t: string) => ({ Authorization: 'Bearer ' + t });
let s: any; const S = (p: string) => `/api/stores/${s.store.id}${p}`;
beforeAll(async () => { s = (await A().post('/api/auth/signup').send({ email: 'trial@t.io', password: 'password123', storeName: 'Trial Gear' }).expect(201)).body; });
describe('4-day trial, publish gating, product CSV', () => {
  it('picks a trial plan; Free and Enterprise are not selectable', async () => {
    const r = (await A().post(S('/billing/trial')).set(H(s.accessToken)).send({ plan: 'advanced', interval: 'annual' }).expect(200)).body;
    expect(r.subscription.planCode).toBe('advanced'); expect(r.subscription.status).toBe('trialing'); expect(r.trialDaysLeft).toBe(4); expect(r.canPublish).toBe(false);
    await A().post(S('/billing/trial')).set(H(s.accessToken)).send({ plan: 'starter' }).expect(400);
    await A().post(S('/billing/trial')).set(H(s.accessToken)).send({ plan: 'enterprise' }).expect(400);
    const b = (await A().get(S('/billing')).set(H(s.accessToken)).expect(200)).body; expect(b.canPublish).toBe(false); expect(b.trialDaysLeft).toBe(4);
  });
  it('trial can build but not publish (402)', async () => {
    const th = (await A().get(S('/themes')).set(H(s.accessToken)).expect(200)).body; const id = (th.items || th)[0]?.id;
    if (id) await A().post(S(`/themes/${id}/publish`)).set(H(s.accessToken)).expect(402);
    const e = await A().post(S('/online-store/publish')).set(H(s.accessToken)).expect(402); expect(e.body.error).toMatch(/Buy a plan/);
    await A().patch(S('')).set(H(s.accessToken)).send({ settings: { passwordEnabled: false } }).expect(402);
    await A().patch(S('')).set(H(s.accessToken)).send({ settings: { brand: 'ok' } }).expect(200);
  });
  it('CSV import during trial: template, dry-run preview with bad rows, then import', async () => {
    const tpl = (await A().get(S('/products/import/template.csv')).set(H(s.accessToken)).expect(200)).text; expect(tpl).toMatch(/^Handle,Title,Body \(HTML\),Vendor/);
    const bad = 'Handle,Title,Variant Price,Variant Inventory Qty,Status\nok-one,OK One,10.50,3,active\nbad-one,Bad One,abc,2,active\nbad-two,Bad Two,5,1,wrong\n';
    const p = (await A().post(S('/products/import?dryRun=1')).set(H(s.accessToken)).set('Content-Type', 'text/csv').send(bad).expect(200)).body;
    expect(p.rows).toBe(3); expect(p.errors.map((e: any) => e.row)).toEqual([3, 4]); expect(p.preview[0].action).toBe('create');
    await A().post(S('/products/import')).set(H(s.accessToken)).set('Content-Type', 'text/csv').send(bad).expect(422);
    const r = (await A().post(S('/products/import')).set(H(s.accessToken)).set('Content-Type', 'text/csv').send(tpl).expect(200)).body; expect(r.created).toBe(1);
    const again = (await A().post(S('/products/import?overwrite=false')).set(H(s.accessToken)).set('Content-Type', 'text/csv').send(tpl).expect(200)).body; expect(again.skipped).toBe(1);
    const up = (await A().post(S('/products/import?overwrite=true')).set(H(s.accessToken)).set('Content-Type', 'text/csv').send(tpl).expect(200)).body; expect(up.updated).toBe(1);
  });
  it('CSV export: Shopify columns, variants, Excel BOM, search scope', async () => {
    const csv = (await A().get(S('/products/export.csv?format=excel')).set(H(s.accessToken)).expect(200)).text;
    expect(csv.charCodeAt(0)).toBe(0xfeff); expect(csv).toContain('Variant SKU'); expect(csv).toContain('TEE-M-BLK'); expect(csv).toContain('1499.00');
    const q = (await A().get(S('/products/export.csv?q=nomatch')).set(H(s.accessToken)).expect(200)).text; expect(q.trim().split(/\r?\n/).length).toBe(1);
  });
  it('buying a plan unlocks publishing', async () => {
    await A().post(S('/billing/plan')).set(H(s.accessToken)).send({ plan: 'advanced' }).expect(200);
    const r = (await A().post(S('/online-store/publish')).set(H(s.accessToken)).expect(200)).body; expect(r.published).toBe(true);
    expect((await A().get(S('/billing')).set(H(s.accessToken)).expect(200)).body.canPublish).toBe(true);
  });
});
