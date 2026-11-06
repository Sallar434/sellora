import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { db } from '../src/lib/db';
import bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';
const app = createApp();
const A = () => request(app);
let seller: any, store: any, buyer: any, admin: any, product: any;
const H = (t: string) => ({ Authorization: 'Bearer ' + t });
const S = (p: string) => `/api/stores/${store.id}${p}`;
const total = async () => (await db.wallet.findMany()).reduce((s, w) => s + w.available + w.held, 0);
beforeAll(async () => {
  await db.user.create({ data: { email: 'admin@t.io', type: 'ADMIN', passwordHash: await bcrypt.hash('password123', 4) } });
  admin = (await A().post('/api/auth/login').send({ email: 'admin@t.io', password: 'password123' })).body;
});
describe('auth', () => {
  it('signup seller creates store, verify email OTP, login, refresh rotation, logout', async () => {
    const r = await A().post('/api/auth/signup').send({ email: 'seller@t.io', password: 'password123', storeName: 'Active Reality Gear', phone: '+923001234567' }).expect(201);
    seller = r.body; store = r.body.store; expect(store.handle).toBe('active-reality-gear');
    await A().post('/api/auth/otp/verify').set(H(seller.accessToken)).send({ channel: 'email', code: r.body.devCode }).expect(200).then(x => expect(x.body.user.emailVerified).toBe(true));
    const sms = await A().post('/api/auth/otp/send').set(H(seller.accessToken)).send({ channel: 'sms' }).expect(200);
    await A().post('/api/auth/otp/verify').set(H(seller.accessToken)).send({ channel: 'sms', code: sms.body.devCode }).expect(200);
    await A().post('/api/auth/login').send({ email: 'seller@t.io', password: 'nope' }).expect(401);
    const ref = await A().post('/api/auth/refresh').send({ refreshToken: seller.refreshToken }).expect(200);
    await A().post('/api/auth/refresh').send({ refreshToken: seller.refreshToken }).expect(401); // rotated
    await A().post('/api/auth/logout').send({ refreshToken: ref.body.refreshToken }).expect(200);
    await A().get('/api/auth/me').expect(401);
    buyer = (await A().post('/api/auth/signup').send({ email: 'buyer@t.io', password: 'password123', type: 'BUYER' }).expect(201)).body;
    expect(buyer.store).toBeNull();
  });
  it('password reset + TOTP 2FA', async () => {
    const f = await A().post('/api/auth/password/forgot').send({ email: 'buyer@t.io' }).expect(200);
    await A().post('/api/auth/password/reset').send({ email: 'buyer@t.io', code: f.body.devCode, password: 'newpass123' }).expect(200);
    const l = await A().post('/api/auth/login').send({ email: 'buyer@t.io', password: 'newpass123' }).expect(200); buyer = { ...buyer, ...l.body };
    const s = await A().post('/api/auth/2fa/setup').set(H(buyer.accessToken)).expect(200);
    await A().post('/api/auth/2fa/enable').set(H(buyer.accessToken)).send({ code: authenticator.generate(s.body.secret) }).expect(200);
    await A().post('/api/auth/login').send({ email: 'buyer@t.io', password: 'newpass123' }).expect(401);
    const l2 = await A().post('/api/auth/login').send({ email: 'buyer@t.io', password: 'newpass123', totp: authenticator.generate(s.body.secret) }).expect(200); buyer = { ...buyer, ...l2.body };
  });
  it('RBAC: buyer and outsiders cannot access store; staff role limited', async () => {
    await A().get(S('/products')).set(H(buyer.accessToken)).expect(403);
    await A().get('/api/admin/users').set(H(seller.accessToken)).expect(403);
    const st = (await A().post('/api/auth/signup').send({ email: 'ful@t.io', password: 'password123', type: 'BUYER' })).body;
    await A().post(S('/staff')).set(H(seller.accessToken)).send({ email: 'ful@t.io', role: 'fulfillment' }).expect(201);
    await A().get(S('/orders')).set(H(st.accessToken)).expect(200);
    await A().get(S('/products')).set(H(st.accessToken)).expect(403);
  });
});
describe('catalog', () => {
  it('product CRUD with variants, base price inheritance, collections, CSV', async () => {
    const r = await A().post(S('/products')).set(H(seller.accessToken)).send({ title: 'Racing Suit Pro', price: 10000, tags: ['suit'], variants: [{ title: 'S', sku: 'RS-S', inventory: 5 }, { title: 'M', sku: 'RS-M', inventory: 5, price: 12000 }] }).expect(201);
    product = r.body; expect(product.variants).toHaveLength(2);
    await A().patch(S('/products/' + product.id)).set(H(seller.accessToken)).send({ title: 'Racing Suit Pro X', seoTitle: 'Suit' }).expect(200).then(x => expect(x.body.title).toBe('Racing Suit Pro X'));
    const tmp = await A().post(S('/products')).set(H(seller.accessToken)).send({ title: 'Track Gloves', price: 5000, tags: ['gloves'] }).expect(201);
    const m = await A().post(S('/collections')).set(H(seller.accessToken)).send({ title: 'Track Day', productIds: [product.id] }).expect(201);
    await A().post(S('/collections')).set(H(seller.accessToken)).send({ title: 'Gloves', type: 'automated', rules: [{ field: 'tag', op: 'eq', value: 'gloves' }] }).expect(201);
    const cols = (await A().get(S('/collections')).set(H(seller.accessToken))).body;
    expect(cols.find((c: any) => c.title === 'Track Day').productsCount).toBe(1);
    expect(cols.find((c: any) => c.title === 'Gloves').productsCount).toBe(1);
    const csv = (await A().get(S('/products/export.csv')).set(H(seller.accessToken)).expect(200)).text; expect(csv).toContain('RS-M');
    await A().post(S('/products/import')).set(H(seller.accessToken)).set('Content-Type', 'text/csv').send('Handle,Title,Price,Variant,SKU,Inventory\npaddock-tee,Paddock Tee,2900,M,PT-M,9\n').expect(200).then(x => expect(x.body.created).toBe(1));
    await A().post(S('/products/bulk')).set(H(seller.accessToken)).send({ ids: [tmp.body.id], action: 'addTags', data: ['sale'] }).expect(200);
    const t = await A().post(S('/products')).set(H(seller.accessToken)).send({ title: 'Temp' }).expect(201);
    await A().delete(S('/products/' + t.body.id)).set(H(seller.accessToken)).expect(204);
    expect(m.body.type).toBe('manual');
  });
  it('pages, themes, markets duplicate-currency guard', async () => {
    const pg = await A().post(S('/pages')).set(H(seller.accessToken)).send({ title: 'Size Guide', body: '<p>Measure</p>' }).expect(201);
    expect(pg.body.handle).toBe('size-guide');
    await A().post(S('/markets')).set(H(seller.accessToken)).send({ name: 'Pakistan', currency: 'PKR', countries: ['PK'] }).expect(201);
    const dup = await A().post(S('/markets')).set(H(seller.accessToken)).send({ name: 'Pak 2', currency: 'PKR' }).expect(400);
    await A().post(S(`/markets/${dup.body.details.duplicateOf}/merge`)).set(H(seller.accessToken)).send({ countries: ['AE'] }).expect(200).then(x => expect(x.body.countries).toEqual(['PK', 'AE']));
    const th = (await A().get(S('/themes')).set(H(seller.accessToken))).body; expect(th[0].preset).toBe('s-daybreak'); expect(th[0].name).toBe('Daybreak');
  });
});
let order: any;
describe('storefront + checkout', () => {
  it('storefront API: catalog, collection, product, search, page', async () => {
    const h = store.handle;
    const home = (await A().get(`/api/storefront/${h}`).expect(200)).body; expect(home.pages.map((p: any) => p.handle)).toContain('size-guide');
    expect((await A().get(`/api/storefront/${h}/products`).expect(200)).body.length).toBeGreaterThanOrEqual(3);
    const c = (await A().get(`/api/storefront/${h}/collections/gloves`).expect(200)).body; expect(c.products.map((p: any) => p.title)).toEqual(['Track Gloves']);
    const p = (await A().get(`/api/storefront/${h}/products/${product.handle}`).expect(200)).body; expect(p.variants[0].price).toBe(10000); expect(p.variants[1].price).toBe(12000);
    expect((await A().get(`/api/storefront/${h}/products?q=gloves`)).body).toHaveLength(1);
    await A().get(`/api/storefront/${h}/pages/size-guide`).expect(200);
    expect((await A().get(`/feeds/${h}/google.xml`).expect(200)).text).toContain('RS-M');
    expect((await A().get(`/s/${h}/sitemap.xml`).expect(200)).text).toContain('/products/');
    expect((await A().get(`/s/${h}/llms.txt`).expect(200)).text).toContain('Racing Suit');
  });
  it('checkout applies discount + tax + shipping server-side, holds escrow', async () => {
    await A().post(S('/discounts')).set(H(seller.accessToken)).send({ code: 'save10', kind: 'percent', value: 10, usageLimit: 5 }).expect(201);
    await A().post(S('/taxes')).set(H(seller.accessToken)).send({ country: 'US', region: 'CA', rateBps: 725 }).expect(201);
    await A().post(S('/shipping-zones')).set(H(seller.accessToken)).send({ name: 'US', countries: ['US'], rates: [{ name: 'Standard', price: 800 }, { name: 'Express', price: 2500 }] }).expect(201);
    const lines = [{ variantId: product.variants[0].id, qty: 2 }]; // 2 × 100.00
    const body = { lines, email: 'buyer@t.io', discountCode: 'SAVE10', shipTo: { country: 'US', region: 'CA' }, shippingRate: 'Express', payment: { source: 'tok_visa' } };
    const q = (await A().post(`/api/storefront/${store.handle}/checkout/quote`).send(body).expect(200)).body;
    expect(q).toMatchObject({ subtotal: 20000, discount: 2000, shipping: 2500, tax: 1305, total: 21805 });
    await A().post(`/api/storefront/${store.handle}/checkout`).send({ ...body, payment: { source: 'tok_fail' } }).expect(402);
    const before = await total();
    const r = await A().post(`/api/storefront/${store.handle}/checkout`).set(H(buyer.accessToken)).set('Idempotency-Key', 'k1').send(body).expect(201);
    const again = await A().post(`/api/storefront/${store.handle}/checkout`).set(H(buyer.accessToken)).set('Idempotency-Key', 'k1').send(body).expect(201);
    expect(again.body.order.id).toBe(r.body.order.id); expect(again.headers['idempotent-replay']).toBe('true');
    order = r.body.order; expect(order.total).toBe(21805); expect(order.financial).toBe('held'); expect(r.body.escrow.status).toBe('held');
    expect(order.lines[0]).toMatchObject({ price: 10000, sku: 'RS-S', variantTitle: 'S' });
    expect((await db.variant.findUnique({ where: { id: product.variants[0].id } }))!.inventory).toBe(3);
    const sw = await db.wallet.findFirstOrThrow({ where: { ownerType: 'SELLER', ownerId: store.id } }); expect(sw.held).toBe(21805);
    expect(await total()).toBe(before); // double-entry conserves
    await A().post(`/api/storefront/${store.handle}/checkout`).send({ ...body, lines: [{ variantId: product.variants[0].id, qty: 99 }] }).expect(400);
  });
});
describe('Sellora Pay', () => {
  it('escrow hold → buyer confirm → release with platform fee', async () => {
    await A().post(`/api/storefront/${store.handle}/orders/${order.id}/confirm`).send({}).expect(403);
    const e = (await A().post(`/api/storefront/${store.handle}/orders/${order.id}/confirm`).set(H(buyer.accessToken)).expect(200)).body;
    expect(e.status).toBe('released');
    const fee = Math.round(21805 * 250 / 10000);
    const sw = await db.wallet.findFirstOrThrow({ where: { ownerType: 'SELLER', ownerId: store.id } }); expect(sw).toMatchObject({ held: 0, available: 21805 - fee });
    const pw = await db.wallet.findFirstOrThrow({ where: { ownerType: 'ADMIN', ownerId: 'platform' } }); expect(pw.available).toBe(fee);
    const chk = (await A().get('/api/admin/ledger/check').set(H(admin.accessToken)).expect(200)).body; expect(chk.unbalanced).toBe(0);
  });
  it('auto-release after N days via scheduled job', async () => {
    const o = (await A().post(`/api/storefront/${store.handle}/checkout`).send({ lines: [{ variantId: product.variants[1].id, qty: 1 }], email: 'x@t.io', shipTo: { country: 'US' } }).expect(201)).body;
    await db.escrow.update({ where: { id: o.escrow.id }, data: { releaseAt: new Date(Date.now() - 1000) } });
    const r = (await A().post('/api/admin/jobs/escrow-auto-release').set(H(admin.accessToken)).expect(200)).body; expect(r.released).toBe(1);
  });
  it('dispute → admin arbitration → refund buyer', async () => {
    const r = (await A().post(`/api/storefront/${store.handle}/checkout`).set(H(buyer.accessToken)).send({ lines: [{ variantId: product.variants[1].id, qty: 1 }], shipTo: { country: 'US' } }).expect(201)).body;
    const d = (await A().post('/api/pay/disputes').set(H(buyer.accessToken)).send({ orderId: r.order.id, reason: 'Item never arrived' }).expect(201)).body;
    await db.escrow.update({ where: { id: r.escrow.id }, data: { releaseAt: new Date(Date.now() - 1000) } });
    expect((await A().post('/api/admin/jobs/escrow-auto-release').set(H(admin.accessToken))).body.released).toBe(1); // due but disputed → skipped
    expect((await db.escrow.findUnique({ where: { id: r.escrow.id } }))!.status).toBe('held');
    await A().post(`/api/admin/disputes/${d.id}/resolve`).set(H(seller.accessToken)).send({ outcome: 'refund_buyer' }).expect(403);
    await A().post(`/api/admin/disputes/${d.id}/resolve`).set(H(admin.accessToken)).send({ outcome: 'refund_buyer' }).expect(200);
    const bw = (await A().get('/api/pay/wallets').set(H(buyer.accessToken))).body[0]; expect(bw.available).toBe(r.order.total);
    expect((await db.order.findUnique({ where: { id: r.order.id } }))!.financial).toBe('refunded');
  });
  it('partial refund with restock from seller balance', async () => {
    const inv = (await db.variant.findUnique({ where: { id: product.variants[0].id } }))!.inventory;
    const r = (await A().post(S(`/orders/${order.id}/refund`)).set(H(seller.accessToken)).set('Idempotency-Key', 'rf1').send({ lines: [{ lineId: order.lines[0].id, qty: 1 }], restock: true }).expect(200)).body;
    expect(r).toMatchObject({ refunded: 10000, financial: 'partially_refunded' });
    expect((await db.variant.findUnique({ where: { id: product.variants[0].id } }))!.inventory).toBe(inv + 1);
  });
  it('KYC → admin approve → payout request → admin approve', async () => {
    await A().post(S('/payouts')).set(H(seller.accessToken)).send({ amount: 1000, currency: 'USD' }).expect(403);
    await A().post(S('/kyc/submit')).set(H(seller.accessToken)).expect(400);
    await A().patch(S('/kyc')).set(H(seller.accessToken)).send({ business: { legalName: 'ARG LLC', type: 'company', country: 'PK', address: 'Lahore' }, taxId: 'NTN-123', bank: { holder: 'ARG LLC', iban: 'PK36SCBL0000001123456702', country: 'PK', currency: 'USD' } }).expect(200);
    await A().post(S('/kyc/documents')).set(H(seller.accessToken)).field('kind', 'id_front').attach('file', Buffer.from('%PDF-1.4 test'), { filename: 'id.pdf', contentType: 'application/pdf' }).expect(201);
    await A().post(S('/kyc/liveness')).set(H(seller.accessToken)).send({ sessionId: 'sess_1' }).expect(200);
    const md = (await A().post(S('/kyc/bank/micro-deposits')).set(H(seller.accessToken)).expect(200)).body;
    await A().post(S('/kyc/bank/verify')).set(H(seller.accessToken)).send({ amounts: [0, 0] }).expect(400);
    await A().post(S('/kyc/bank/verify')).set(H(seller.accessToken)).send({ amounts: md.devAmounts }).expect(200);
    const k = (await A().post(S('/kyc/submit')).set(H(seller.accessToken)).expect(200)).body;
    expect((await A().get('/api/admin/kyc').set(H(admin.accessToken))).body.map((x: any) => x.id)).toContain(k.id);
    await A().post(`/api/admin/kyc/${k.id}/review`).set(H(admin.accessToken)).send({ decision: 'approved' }).expect(200);
    const sw0 = await db.wallet.findFirstOrThrow({ where: { ownerType: 'SELLER', ownerId: store.id } });
    await A().post(S('/payouts')).set(H(seller.accessToken)).send({ amount: sw0.available + 1, currency: 'USD' }).expect(400);
    const p = (await A().post(S('/payouts')).set(H(seller.accessToken)).set('Idempotency-Key', 'po1').send({ amount: 5000, currency: 'USD' }).expect(201)).body;
    await A().post(S('/payouts')).set(H(seller.accessToken)).set('Idempotency-Key', 'po1').send({ amount: 5000, currency: 'USD' }).expect(201);
    expect(await db.payout.count()).toBe(1);
    const ap = (await A().post(`/api/admin/payouts/${p.id}/approve`).set(H(admin.accessToken)).expect(200)).body; expect(ap.status).toBe('paid');
    const sw = await db.wallet.findFirstOrThrow({ where: { ownerType: 'SELLER', ownerId: store.id } }); expect(sw.available).toBe(sw0.available - 5000); expect(sw.held).toBe(0);
    expect((await A().get('/api/admin/ledger/check').set(H(admin.accessToken))).body.unbalanced).toBe(0);
  });
  it('payment link + embed snippet + signed webhook in', async () => {
    const l = (await A().post(S('/payment-links')).set(H(seller.accessToken)).send({ title: 'Custom suit deposit', amount: 5000, currency: 'USD' }).expect(201)).body;
    expect((await A().get(S('/pay/embed')).set(H(seller.accessToken))).body.snippet).toContain('pk_');
    await A().post(`/api/pay/links/${l.id}/pay`).send({ email: 'link@t.io' }).expect(201);
    expect((await A().get('/embed.js').expect(200)).text).toContain('Sellora Pay');
    const { sign } = await import('../src/lib/crypto'); const body = JSON.stringify({ type: 'charge.succeeded' });
    await A().post('/api/pay/webhooks/mock').set('Content-Type', 'application/json').set('Sellora-Signature', sign(body, 'whsec_dev')).send(body).expect(200);
    await A().post('/api/pay/webhooks/mock').set('Content-Type', 'application/json').set('Sellora-Signature', 't=1,v1=00').send(body).expect(400);
  });
});
describe('ops', () => {
  it('fulfil, analytics from real orders, AI fallback, voice, apps encryption', async () => {
    await A().post(S(`/orders/${order.id}/fulfill`)).set(H(seller.accessToken)).send({ carrier: 'DHL', tracking: 'JD0001' }).expect(200);
    const an = (await A().get(S('/analytics')).set(H(seller.accessToken)).expect(200)).body; expect(an.orders).toBeGreaterThanOrEqual(3); expect(an.refunds).toBeGreaterThan(0);
    const meta = (await A().post(S('/ai/meta')).set(H(seller.accessToken)).send({ title: 'Racing Suit' }).expect(200)).body; expect(meta.source).toBe('template'); expect(meta.result.metaTitle).toContain('Racing Suit');
    expect((await A().get(S('/ai/seo-audit')).set(H(seller.accessToken))).body.score).toBeTypeOf('number');
    const v = (await A().post(S('/voice')).set(H(seller.accessToken)).send({ transcript: 'add product called neck brace for 49.99', execute: true }).expect(200)).body; expect(v).toMatchObject({ executed: true, action: { type: 'product.create', price: 4999 } });
    await A().post(S('/apps/mailchimp/install')).set(H(seller.accessToken)).send({ credentials: { apiKey: 'secret-key' } }).expect(201);
    const row = await db.appInstall.findFirstOrThrow({ where: { appId: 'mailchimp' } }); expect(row.credentialsEnc).not.toContain('secret-key');
    expect((await db.outbox.count({ where: { template: 'order_confirmation' } }))).toBeGreaterThan(0);
    expect((await A().get('/openapi.json')).body.paths['/api/stores/{storeId}/products']).toBeTruthy();
  });
});
describe('shopify parity resources', () => {
  it('CRUD locations, transfers, automations, campaigns, companies, saved views, roles, metaobjects, preferences', async () => {
    const T = H(seller.accessToken);
    const l1 = (await A().post(S('/locations')).set(T).send({ name: 'Sialkot factory' }).expect(201)).body;
    const l2 = (await A().post(S('/locations')).set(T).send({ name: 'Lahore outlet' }).expect(201)).body;
    const tr = (await A().post(S('/transfers')).set(T).send({ originId: l1.id, destinationId: l2.id, items: [{ variantId: 'v1', qty: 5 }] }).expect(201)).body;
    await A().patch(S('/transfers/' + tr.id)).set(T).send({ status: 'received' }).expect(200).then(x => expect(x.body.status).toBe('received'));
    await A().post(S('/automations')).set(T).send({ name: 'COD confirm', trigger: 'cod_order', steps: [{ t: 'whatsapp' }] }).expect(201);
    await A().post(S('/campaigns')).set(T).send({ name: 'Eid sale', channel: 'Meta', budget: 100 }).expect(201);
    await A().post(S('/companies')).set(T).send({ name: 'Gym Wholesale LLC' }).expect(201);
    await A().post(S('/saved-views')).set(T).send({ resource: 'orders', name: 'COD unpaid', query: { q: 'cod' } }).expect(201);
    await A().post(S('/roles')).set(T).send({ name: 'Packer', permissions: ['orders'] }).expect(201);
    await A().post(S('/metaobjects')).set(T).send({ type: 'size_chart', handle: 'gloves', fields: { oz: [10, 12, 14] } }).expect(201);
    await A().post(S('/preferences')).set(T).send({ data: { title: 'Home' } }).expect(201);
    expect((await A().get(S('/locations')).set(T).expect(200)).body.length).toBe(2);
    await A().get(S('/locations')).expect(401);
  });
});
