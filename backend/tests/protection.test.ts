import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app';
import { db } from '../src/lib/db';

const app = createApp(); const A = () => request(app);
const H = (t: string) => ({ Authorization: 'Bearer ' + t });
let s: any, buyer: any, admin: any, product: any, n = 0;
const S = (p: string) => `/api/stores/${s.store.id}${p}`; const tok = () => H(s.accessToken);
const fee = (x: number) => Math.round((x * 250) / 10000);
const sellerW = () => db.wallet.findFirst({ where: { ownerType: 'SELLER', ownerId: s.store.id, currency: 'USD' } });
const mode = (m: string) => A().put(S('/payments/settings')).set(tok()).send({ mode: m }).expect(200);
const lines = () => [{ variantId: product.variants[0].id, qty: 1 }];
const checkout = (extra: any = {}, who?: any) => { const r = A().post(`/api/storefront/${s.store.handle}/checkout`).set('Idempotency-Key', 'k' + (++n)); if (who) r.set(H(who.accessToken)); return r.send({ lines: lines(), email: 'guest@t.io', shipTo: { country: 'PK' }, shippingRate: 'Standard', ...extra }); };
const ship = (id: string, shippingCost?: number) => A().post(S(`/orders/${id}/fulfill`)).set(tok()).send({ carrier: 'TCS', tracking: 'T' + n, ...(shippingCost != null ? { shippingCost } : {}) }).expect(200);
const notReceived = (id: string) => A().post(`/api/storefront/${s.store.handle}/orders/${id}/not-received`).set(H(buyer.accessToken)).send({ note: 'Nothing came' });
const job = async () => (await A().post('/api/admin/jobs/escrow-auto-release').set(H(admin.accessToken)).expect(200)).body.released;
const balanced = async () => expect((await A().get('/api/admin/ledger/check').set(H(admin.accessToken))).body.unbalanced).toBe(0);

beforeAll(async () => {
  s = (await A().post('/api/auth/signup').send({ email: 'shop@t.io', password: 'password123', storeName: 'Noor Lawn' }).expect(201)).body;
  await db.store.update({ where: { id: s.store.id }, data: { currency: 'USD' } });
  await A().get(S('/billing/usage')).set(tok()); await db.subscription.update({ where: { storeId: s.store.id }, data: { status: 'active', planCode: 'advanced' } });
  buyer = (await A().post('/api/auth/signup').send({ email: 'amna@t.io', password: 'password123', type: 'BUYER' }).expect(201)).body;
  await db.user.create({ data: { email: 'boss@t.io', type: 'ADMIN', passwordHash: await bcrypt.hash('password123', 4) } });
  admin = (await A().post('/api/auth/login').send({ email: 'boss@t.io', password: 'password123' })).body;
  product = (await A().post(S('/products')).set(tok()).send({ title: 'Lawn Suit', price: 10000, variants: [{ title: 'M', price: 10000, inventory: 50 }] }).expect(201)).body;
  await A().post(S('/shipping-zones')).set(tok()).send({ name: 'PK', countries: ['PK'], rates: [{ name: 'Standard', price: 2000 }] }).expect(201);
});

describe('direct payments (no protection)', () => {
  it('store set to Direct: guest pays, seller is paid at once minus the platform fee', async () => {
    await mode('direct');
    const before = (await sellerW())?.available || 0;
    const r = (await checkout().expect(201)).body;
    expect(r.order).toMatchObject({ protected: false, financial: 'paid', total: 12000 }); expect(r.escrow).toBeNull();
    expect((await sellerW())!.available - before).toBe(12000 - fee(12000));
    await A().post(`/api/storefront/${s.store.handle}/orders/${r.order.id}/confirm`).set(H(buyer.accessToken)).expect(403); // not their order
    await balanced();
  });
});

describe('VendOm Pay Protection', () => {
  it('"buyer chooses": guests pay directly; asking for protection needs a free buyer account', async () => {
    await mode('choice');
    expect((await checkout().expect(201)).body.order.protected).toBe(false);
    const no = (await checkout({ protection: true }).expect(401)).body; expect(no.error).toMatch(/buyer account/);
    expect((await checkout({ protection: true }, buyer).expect(201)).body.order.protected).toBe(true);
    expect((await checkout({ protection: false }, buyer).expect(201)).body.order.protected).toBe(false);
  });

  it('"always protected": guests must sign up; paid → seller told to ship → buyer confirms → released', async () => {
    await mode('protected');
    await checkout().expect(401);
    const r = (await checkout({}, buyer).expect(201)).body;
    expect(r.order).toMatchObject({ protected: true, financial: 'held' });
    const mail = await db.outbox.findFirst({ where: { template: 'ship_now', to: 'shop@t.io' }, orderBy: { createdAt: 'desc' } });
    expect(mail!.payload).toMatchObject({ number: r.order.number, total: 12000 });
    await ship(r.order.id);
    expect(await db.outbox.count({ where: { template: 'confirm_receipt', to: 'amna@t.io' } })).toBeGreaterThan(0);
    const before = (await sellerW())!.available;
    const e = (await A().post(`/api/storefront/${s.store.handle}/orders/${r.order.id}/confirm`).set(H(buyer.accessToken)).expect(200)).body;
    expect(e.status).toBe('released'); expect((await sellerW())!.available - before).toBe(12000 - fee(12000));
    await balanced();
  });

  it('not received before shipping → full refund, order cancelled, stock back', async () => {
    const inv0 = (await db.variant.findUniqueOrThrow({ where: { id: product.variants[0].id } })).inventory;
    const r = (await checkout({}, buyer).expect(201)).body;
    const out = (await notReceived(r.order.id).expect(200)).body;
    expect(out.outcome).toBe('refunded_in_full');
    expect(await db.order.findUniqueOrThrow({ where: { id: r.order.id } })).toMatchObject({ status: 'cancelled', financial: 'refunded', refunded: 12000 });
    expect((await db.variant.findUniqueOrThrow({ where: { id: product.variants[0].id } })).inventory).toBe(inv0);
    await balanced();
  });

  it('parcel returned to the seller → seller keeps the shipping cost, buyer gets the rest', async () => {
    const r = (await checkout({}, buyer).expect(201)).body;
    await A().post(S(`/orders/${r.order.id}/returned`)).set(tok()).expect(400); // not shipped yet
    await ship(r.order.id, 1500);
    const rep = (await notReceived(r.order.id).expect(201)).body;
    expect(rep).toMatchObject({ outcome: 'reported', refundIfNotDelivered: 10500, sellerKeeps: 1500 });
    expect(await db.outbox.count({ where: { template: 'not_received', to: 'shop@t.io' } })).toBeGreaterThan(0);
    await notReceived(r.order.id).expect(400); // only one report at a time
    const before = (await sellerW())!.available;
    const out = (await A().post(S(`/orders/${r.order.id}/returned`)).set(tok()).expect(200)).body;
    expect(out).toEqual({ refunded: 10500, sellerKept: 1500 });
    expect((await sellerW())!.available - before).toBe(1500); // no platform fee on the shipping cost
    expect(await db.order.findUniqueOrThrow({ where: { id: r.order.id } })).toMatchObject({ financial: 'partially_refunded', refunded: 10500 });
    expect((await db.dispute.findFirstOrThrow({ where: { kind: 'not_received', escrowId: r.escrow.id } })).status).toBe('resolved');
    await balanced();
  });

  it('seller does not answer a "not received" report → settled automatically with the shipping cost deducted', async () => {
    const r = (await checkout({}, buyer).expect(201)).body;
    await ship(r.order.id); // shipping cost defaults to what the buyer paid for shipping (2000)
    await notReceived(r.order.id).expect(201);
    expect(await job()).toBe(0); // seller still has time
    await db.dispute.updateMany({ where: { escrowId: r.escrow.id }, data: { respondBy: new Date(Date.now() - 1000) } });
    expect(await job()).toBe(1);
    expect(await db.order.findUniqueOrThrow({ where: { id: r.order.id } })).toMatchObject({ refunded: 10000, financial: 'partially_refunded' });
    await balanced();
  });

  it('seller answers with proof → VendOm decides (not received → deduct shipping)', async () => {
    const r = (await checkout({}, buyer).expect(201)).body;
    await ship(r.order.id, 800);
    const d = (await notReceived(r.order.id).expect(201)).body.dispute;
    await A().post(S(`/pay/disputes/${d.id}/respond`)).set(tok()).send({ message: 'Courier says delivered' }).expect(200);
    await db.dispute.update({ where: { id: d.id }, data: { respondBy: new Date(Date.now() - 1000) } });
    expect(await job()).toBe(0); // answered, so it waits for VendOm, not the timer
    const res = (await A().post(`/api/admin/disputes/${d.id}/resolve`).set(H(admin.accessToken)).send({ outcome: 'not_received', note: 'no signature on delivery' }).expect(200)).body;
    expect(res).toMatchObject({ refunded: 11200, sellerKept: 800, status: 'resolved' });
    await balanced();
  });

  it('seller never ships → refunded in full after the ship-by date', async () => {
    const r = (await checkout({}, buyer).expect(201)).body;
    expect(+new Date(r.escrow.releaseAt ?? 0)).toBe(0);
    await db.escrow.update({ where: { id: r.escrow.id }, data: { shipBy: new Date(Date.now() - 1000) } });
    expect(await job()).toBe(1);
    expect(await db.order.findUniqueOrThrow({ where: { id: r.order.id } })).toMatchObject({ status: 'cancelled', financial: 'refunded' });
    await balanced();
  });

  it('shipping cost can never be more than the order', async () => {
    const r = (await checkout({}, buyer).expect(201)).body;
    await ship(r.order.id, 999999);
    expect((await A().post(S(`/orders/${r.order.id}/returned`)).set(tok()).expect(200)).body).toEqual({ refunded: 0, sellerKept: 12000 });
    await balanced();
  });
});

describe('international payment methods', () => {
  it('cards, Apple Pay and Google Pay everywhere, plus local methods by country', async () => {
    const m = async (c: string) => (await A().get(`/api/storefront/${s.store.handle}/payment-methods?country=${c}`).expect(200)).body;
    const us = await m('US'); expect(us.methods.methods.map((x: any) => x.id)).toEqual(expect.arrayContaining(['card', 'apple_pay', 'google_pay', 'klarna']));
    expect((await m('PK')).methods.methods.map((x: any) => x.id)).toEqual(expect.arrayContaining(['card', 'jazzcash', 'easypaisa']));
    expect((await m('NL')).methods.methods.map((x: any) => x.id)).toContain('ideal');
    expect((await m('ZW')).methods.methods.map((x: any) => x.id)).toEqual(['card', 'apple_pay', 'google_pay']); // any other country: cards and wallets
    expect(us).toMatchObject({ mode: 'protected', protection: true });
    expect((await A().get(S('/payments/settings')).set(tok()).expect(200)).body).toMatchObject({ mode: 'protected', shipByDays: 5, confirmDays: 7 });
  });
});
