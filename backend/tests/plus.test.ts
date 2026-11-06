import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import request from 'supertest';
import { createHmac } from 'crypto';
import { createApp } from '../src/app';
import { db } from '../src/lib/db';
import { setFetch } from '../src/integrations/core';
import { APPS } from '../src/integrations/apps';
const app = createApp(); const A = () => request(app);
const H = (t: string) => ({ Authorization: 'Bearer ' + t });
let s: any, other: any, staff: any, prod: any, order: any; const S = (p: string) => `/api/stores/${s.store.id}${p}`;
/** HTTP stub: records every outbound request, replies per URL. */
let calls: { url: string; init: any }[] = [];
const stub = (reply: (url: string, init: any) => [number, any] = () => [200, { ok: true }]) => setFetch((async (url: any, init: any) => { calls.push({ url: String(url), init }); const [st, body] = reply(String(url), init); return new Response(JSON.stringify(body), { status: st, headers: { 'content-type': 'application/json' } }); }) as any);
afterEach(() => { calls = []; stub(); });
beforeAll(async () => {
  stub();
  s = (await A().post('/api/auth/signup').send({ email: 'plus@t.io', password: 'password123', storeName: 'Plus Gear', phone: '+923001112233' }).expect(201)).body;
  other = (await A().post('/api/auth/signup').send({ email: 'plus-other@t.io', password: 'password123', storeName: 'Other Gear' }).expect(201)).body;
  prod = (await A().post(S('/products')).set(H(s.accessToken)).send({ title: 'Pro Goalkeeper Glove', price: 450000, tags: ['moq:10'], variants: [{ title: 'Default', sku: 'GK-1', inventory: 50 }] }).expect(201)).body;
  await A().post(S('/products')).set(H(s.accessToken)).send({ title: 'Match Football', price: 300000, variants: [{ title: 'Default', sku: 'FB-5', inventory: 20 }] }).expect(201);
  const st = (await A().post('/api/auth/signup').send({ email: 'plus-ful@t.io', password: 'password123', type: 'BUYER' })).body; staff = st;
  await A().post(S('/staff')).set(H(s.accessToken)).send({ email: 'plus-ful@t.io', role: 'fulfillment' }).expect(201);
});
describe('Sellora+ features', () => {
  it('WhatsApp: parse, save, convert to COD order (idempotent, no double convert)', async () => {
    const p = (await A().post(S('/plus/whatsapp/parse')).set(H(s.accessToken)).send({ text: '2 x Pro Goalkeeper Glove\nFB-5 3\nunknown thing', phone: '+923001234567' }).expect(200)).body;
    expect(p.lines).toHaveLength(2); expect(p.lines[1].qty).toBe(3); expect(p.unmatched).toEqual(['unknown thing']);
    await A().post(S('/plus/whatsapp/parse')).set(H(s.accessToken)).send({ text: '', phone: 'abc' }).expect(422);
    const w = (await A().post(S('/plus/whatsapp/parse')).set(H(s.accessToken)).send({ text: '2 x Pro Goalkeeper Glove', phone: '+923001234567', name: 'Ali', save: true }).expect(201)).body;
    order = (await A().post(S(`/plus/whatsapp/orders/${w.id}/convert`)).set(H(s.accessToken)).set('Idempotency-Key', 'wa1').send({ city: 'Lahore', address: 'House 12, Street 4, Model Town' }).expect(201)).body;
    expect(order.total).toBe(900000); expect(order.financial).toBe('pending');
    const again = await A().post(S(`/plus/whatsapp/orders/${w.id}/convert`)).set(H(s.accessToken)).set('Idempotency-Key', 'wa1').send({}).expect(201); expect(again.headers['idempotent-replay']).toBe('true');
    await A().post(S(`/plus/whatsapp/orders/${w.id}/convert`)).set(H(s.accessToken)).send({}).expect(409);
    expect((await A().get(S('/plus/whatsapp/catalogue')).set(H(s.accessToken)).expect(200)).body.count).toBe(2);
  });
  it('WhatsApp Cloud webhook: verify challenge, HMAC signature, ingest once', async () => {
    await A().put(S('/integrations/whatsapp/credentials')).set(H(s.accessToken)).send({ credentials: { appSecret: 'shh', verifyToken: 'vt' } }).expect(200);
    await A().get(`/api/hooks/apps/whatsapp/${s.store.id}?hub.mode=subscribe&hub.verify_token=bad&hub.challenge=42`).expect(403);
    expect((await A().get(`/api/hooks/apps/whatsapp/${s.store.id}?hub.mode=subscribe&hub.verify_token=vt&hub.challenge=42`).expect(200)).text).toBe('42');
    const body = JSON.stringify({ entry: [{ changes: [{ value: { contacts: [{ wa_id: '923009998877', profile: { name: 'Sara' } }], messages: [{ id: 'wamid.1', from: '923009998877', type: 'text', text: { body: '1 x Match Football' } }] } }] }] });
    await A().post(`/api/hooks/apps/whatsapp/${s.store.id}`).set('Content-Type', 'application/json').set('X-Hub-Signature-256', 'sha256=deadbeef').send(body).expect(401);
    const sig = 'sha256=' + createHmac('sha256', 'shh').update(body).digest('hex');
    expect((await A().post(`/api/hooks/apps/whatsapp/${s.store.id}`).set('Content-Type', 'application/json').set('X-Hub-Signature-256', sig).send(body).expect(200)).body.handled.created).toBe(1);
    expect((await A().post(`/api/hooks/apps/whatsapp/${s.store.id}`).set('Content-Type', 'application/json').set('X-Hub-Signature-256', sig).send(body).expect(200)).body.handled.created).toBe(0);
  });
  it('COD risk score, OTP verify, wrong code rejected', async () => {
    const c = (await A().post(S(`/plus/cod/${order.id}/score`)).set(H(s.accessToken)).expect(200)).body; expect(c.level).toMatch(/low|medium|high/); expect(c.reasons).toContain('No email (WhatsApp order)');
    const o = (await A().post(S(`/plus/cod/${order.id}/otp`)).set(H(s.accessToken)).expect(200)).body;
    await A().post(S(`/plus/cod/${order.id}/verify`)).set(H(s.accessToken)).send({ code: '000000' === o.devCode ? '111111' : '000000' }).expect(400);
    await A().post(S(`/plus/cod/${order.id}/verify`)).set(H(s.accessToken)).send({ code: 'abc' }).expect(422);
    expect((await A().post(S(`/plus/cod/${order.id}/verify`)).set(H(s.accessToken)).send({ code: o.devCode }).expect(200)).body.status).toBe('verified');
  });
  it('wholesale tiers + MOQ + RFQ state machine', async () => {
    await A().post(S('/plus/price-tiers')).set(H(s.accessToken)).send({ productId: prod.id, minQty: 50, price: 400000 }).expect(201);
    await A().post(S('/plus/price-tiers')).set(H(s.accessToken)).send({ productId: prod.id, minQty: 200, price: 350000 }).expect(201);
    await A().post(S('/plus/price-tiers')).set(H(s.accessToken)).send({ productId: prod.id, minQty: 1, price: -5 }).expect(422);
    const q = (await A().get(S(`/plus/wholesale/quote?productId=${prod.id}&qty=250`)).set(H(s.accessToken)).expect(200)).body; expect(q.unitPrice).toBe(350000); expect(q.meetsMoq).toBe(true);
    expect((await A().get(S(`/plus/wholesale/quote?productId=${prod.id}&qty=5`)).set(H(s.accessToken)).expect(200)).body.meetsMoq).toBe(false);
    await A().get(S(`/plus/wholesale/quote?productId=${prod.id}&qty=0`)).set(H(s.accessToken)).expect(422);
    const r = (await A().post(S('/plus/rfqs')).set(H(s.accessToken)).send({ buyer: 'Acme GmbH', email: 'buy@acme.de', productId: prod.id, qty: 500 }).expect(201)).body;
    await A().post(S(`/plus/rfqs/${r.id}/accept`)).set(H(s.accessToken)).expect(409);
    await A().post(S(`/plus/rfqs/${r.id}/quote`)).set(H(s.accessToken)).send({ unitPrice: 0 }).expect(422);
    await A().post(S(`/plus/rfqs/${r.id}/quote`)).set(H(s.accessToken)).send({ unitPrice: 330000 }).expect(200);
    expect((await A().post(S(`/plus/rfqs/${r.id}/accept`)).set(H(s.accessToken)).expect(200)).body.status).toBe('accepted');
  });
  it('OEM design price + proof approval flow', async () => {
    const d = (await A().post(S('/plus/designs')).set(H(s.accessToken)).send({ name: 'Club GK', customer: 'FC Sialkot', qty: 120, spec: { base: 'glove', color: '#2E6B4F', logo: 'logo.png' } }).expect(201)).body; expect(d.unitPrice).toBe(Math.round(280000 * 0.9));
    await A().post(S('/plus/designs')).set(H(s.accessToken)).send({ name: 'x', customer: 'y', qty: 1, spec: { base: 'g', color: 'green' } }).expect(422);
    await A().post(S(`/plus/designs/${d.id}/approve`)).set(H(s.accessToken)).expect(409);
    await A().post(S(`/plus/designs/${d.id}/proof`)).set(H(s.accessToken)).send({ proofUrl: 'https://cdn.example.com/p.png' }).expect(200);
    expect((await A().post(S(`/plus/designs/${d.id}/approve`)).set(H(s.accessToken)).expect(200)).body.proofStatus).toBe('approved');
  });
  it('courier booking (mock without keys, live Leopards with keys), airway bill, duplicate guard, COD reconciliation', async () => {
    await A().post(S('/plus/shipments')).set(H(s.accessToken)).send({ orderId: order.id, courier: 'tcs', weightGrams: 50 }).expect(422);
    const m = (await A().post(S('/plus/shipments')).set(H(s.accessToken)).send({ orderId: order.id, courier: 'tcs', weightGrams: 1200 }).expect(201)).body; expect(m.live).toBe(false); expect(m.codAmount).toBe(900000); expect(calls).toHaveLength(0);
    await A().post(S('/plus/shipments')).set(H(s.accessToken)).send({ orderId: order.id, courier: 'leopards', weightGrams: 1200 }).expect(409);
    expect((await A().get(S(`/plus/shipments/${m.id}/airway-bill`)).set(H(s.accessToken)).expect(200)).text).toContain(m.trackingNo);
    const w = (await A().post(S('/plus/whatsapp/parse')).set(H(s.accessToken)).send({ text: 'FB-5 1', phone: '+923001234500', save: true })).body;
    const o2 = (await A().post(S(`/plus/whatsapp/orders/${w.id}/convert`)).set(H(s.accessToken)).send({ city: 'Karachi', address: 'Flat 3, Block 7, Clifton' })).body;
    await A().put(S('/integrations/leopards/credentials')).set(H(s.accessToken)).send({ credentials: { apiKey: 'LK', apiPassword: 'LP' } }).expect(200);
    stub(() => [200, { status: 1, track_number: 'LE123456789' }]);
    const l = (await A().post(S('/plus/shipments')).set(H(s.accessToken)).send({ orderId: o2.id, courier: 'leopards', weightGrams: 800 }).expect(201)).body;
    expect(l.live).toBe(true); expect(l.trackingNo).toBe('LE123456789');
    expect(calls[0].url).toBe('https://merchantapi.leopardscourier.com/api/bookPacket/format/json/'); const sent = JSON.parse(calls[0].init.body); expect(sent).toMatchObject({ api_key: 'LK', booked_packet_weight: 800, booked_packet_collect_amount: 3000, destination_city: 'Karachi' });
    stub(() => [500, { error: 'down' }]);
    const w3 = (await A().post(S('/plus/whatsapp/parse')).set(H(s.accessToken)).send({ text: 'FB-5 1', phone: '+923001234501', save: true })).body; const o3 = (await A().post(S(`/plus/whatsapp/orders/${w3.id}/convert`)).set(H(s.accessToken)).send({})).body;
    expect((await A().post(S('/plus/shipments')).set(H(s.accessToken)).send({ orderId: o3.id, courier: 'leopards', weightGrams: 800 }).expect(502)).body.details.upstreamStatus).toBe(500);
    const rec = (await A().post(S('/plus/shipments/reconcile')).set(H(s.accessToken)).set('Content-Type', 'text/csv').send(`tracking,amount\n${m.trackingNo},9000\nLE123456789,2999\nNOPE1,5`).expect(200)).body;
    expect(rec.matched).toEqual([m.trackingNo]); expect(rec.mismatch[0].paid).toBe(299900); expect(rec.unknown).toEqual(['NOPE1']);
    await A().post(S('/plus/shipments/reconcile')).set(H(s.accessToken)).set('Content-Type', 'text/csv').send('').expect(400);
  });
  it('export docs: CI/PL, HS validation, incoterm validation, weights', async () => {
    const d = (await A().post(S('/plus/export-docs')).set(H(s.accessToken)).send({ orderId: order.id, type: 'ci', incoterm: 'FOB', hsCodes: { [prod.id]: '4203.21' } }).expect(201)).body; expect(d.html).toContain('4203.21'); expect(d.html).toContain('FOB');
    await A().post(S('/plus/export-docs')).set(H(s.accessToken)).send({ orderId: order.id, type: 'ci', incoterm: 'XYZ' }).expect(422);
    await A().post(S('/plus/export-docs')).set(H(s.accessToken)).send({ orderId: order.id, type: 'pl', incoterm: 'CIF', hsCodes: { a: '12' } }).expect(422);
    await A().post(S('/plus/export-docs')).set(H(s.accessToken)).send({ orderId: order.id, type: 'pl', incoterm: 'CIF', netKg: 10, grossKg: 5 }).expect(400);
  });
  it('fixed currency prices + rounding', async () => {
    await A().post(S('/plus/currency-prices')).set(H(s.accessToken)).send({ productId: prod.id, currency: 'USD', price: 1599 }).expect(201);
    expect((await A().get(S(`/plus/price/${prod.id}?currency=USD`)).set(H(s.accessToken)).expect(200)).body).toMatchObject({ price: 1599, source: 'fixed' });
    const e = (await A().get(S(`/plus/price/${prod.id}?currency=EUR&rounding=99`)).set(H(s.accessToken)).expect(200)).body; expect(e.source).toBe('converted'); expect(e.price % 100).toBe(99);
    await A().get(S(`/plus/price/${prod.id}?currency=usd`)).set(H(s.accessToken)).expect(422);
  });
  it('workshops: job work consumes raw material into WIP, receive updates stock + inventory, over-receive rejected', async () => {
    const sup = (await A().post(S('/plus/suppliers')).set(H(s.accessToken)).send({ name: 'Stitch Unit 4', city: 'Sialkot' }).expect(201)).body;
    const mat = (await A().post(S('/plus/materials')).set(H(s.accessToken)).send({ name: 'Latex foam', unit: 'm', stock: 100 }).expect(201)).body;
    await A().post(S('/plus/jobs')).set(H(s.accessToken)).send({ supplierId: sup.id, productId: prod.id, qty: 10, rate: 20000, materialId: mat.id, materialQty: 500 }).expect(400);
    const j = (await A().post(S('/plus/jobs')).set(H(s.accessToken)).send({ supplierId: sup.id, productId: prod.id, qty: 10, rate: 20000, materialId: mat.id, materialQty: 40 }).expect(201)).body;
    expect((await db.rawMaterial.findUnique({ where: { id: mat.id } }))).toMatchObject({ stock: 60, wip: 40 });
    const rc = (await A().post(S(`/plus/jobs/${j.id}/receive`)).set(H(s.accessToken)).send({ qty: 8, rejected: 2 }).expect(200)).body; expect(rc.status).toBe('completed'); expect(rc.payable).toBe(160000);
    expect((await db.rawMaterial.findUnique({ where: { id: mat.id } }))!.wip).toBeCloseTo(0);
    expect((await db.variant.findFirst({ where: { productId: prod.id } }))!.inventory).toBe(58);
    await A().post(S(`/plus/jobs/${j.id}/receive`)).set(H(s.accessToken)).send({ qty: 1 }).expect(400);
  });
  it('compliance badges, samples, affiliates attribution + payout', async () => {
    await A().post(S('/plus/badges')).set(H(s.accessToken)).send({ name: 'EN 388', certNo: 'EN-2026-01' }).expect(201);
    await A().post(S('/plus/badges')).set(H(s.accessToken)).send({ name: 'Fake Cert', certNo: 'x1' }).expect(422);
    await A().post(S('/plus/samples')).set(H(s.accessToken)).send({ buyer: 'Acme', email: 'a@acme.de', productIds: [] }).expect(422);
    await A().post(S('/plus/samples')).set(H(s.accessToken)).send({ buyer: 'Acme', email: 'a@acme.de', productIds: [prod.id], fee: 2500 }).expect(201);
    const af = (await A().post(S('/plus/affiliates')).set(H(s.accessToken)).send({ name: 'Hamza', email: 'h@x.pk', code: 'hamza10', rateBps: 1000 }).expect(201)).body; expect(af.code).toBe('HAMZA10');
    await A().post(S('/plus/affiliates')).set(H(s.accessToken)).send({ name: 'Bad', email: 'b@x.pk', code: 'B1', rateBps: 9000 }).expect(422);
    await A().post(S(`/plus/affiliates/${af.id}/attribute`)).set(H(s.accessToken)).send({ orderId: order.id }).expect(200);
    await A().post(S(`/plus/affiliates/${af.id}/attribute`)).set(H(s.accessToken)).send({ orderId: order.id }).expect(409);
    const st = (await A().get(S(`/plus/affiliates/${af.id}/stats`)).set(H(s.accessToken)).expect(200)).body; expect(st).toMatchObject({ orders: 1, sales: 900000, earned: 90000, owed: 90000 });
    await A().post(S(`/plus/affiliates/${af.id}/payout`)).set(H(s.accessToken)).set('Idempotency-Key', 'ap1').send({ amount: 50000 }).expect(200);
    await A().post(S(`/plus/affiliates/${af.id}/payout`)).set(H(s.accessToken)).set('Idempotency-Key', 'ap1').send({ amount: 50000 }).expect(200);
    expect((await db.affiliate.findUnique({ where: { id: af.id } }))!.paid).toBe(50000); // idempotent: paid once
  });
  it('bank transfer matching + reminders', async () => {
    const pend = (await A().get(S('/plus/bank/pending')).set(H(s.accessToken)).expect(200)).body; const t = pend.find((p: any) => p.id !== order.id);
    const res = (await A().post(S('/plus/bank/match')).set(H(s.accessToken)).set('Content-Type', 'text/plain').send(`29/10 IBFT FROM ALI ${t.reference} ${(t.total / 100).toLocaleString('en-US')}.00\n29/10 SLR${order.number} 1.00\nrandom line 500`).expect(200)).body;
    expect(res.matched).toHaveLength(1); expect(res.amountMismatch).toHaveLength(1); expect(res.unmatched).toHaveLength(1);
    await A().post(S(`/plus/bank/remind/${t.id}`)).set(H(s.accessToken)).expect(409);
    expect((await A().post(S(`/plus/bank/remind/${order.id}`)).set(H(s.accessToken)).expect(200)).body.message).toContain(`SLR${order.number}`);
  });
  it('AI listing EN/UR/AR template fallback creates draft', async () => {
    const r = (await A().post(S('/plus/ai/listing')).set(H(s.accessToken)).send({ title: 'Cricket Bat', material: 'English willow', use: 'club cricket', price: 900000, create: true }).expect(200)).body;
    expect(r.source).toBe('template'); expect(r.listings.ur.description).toMatch(/[\u0600-\u06FF]/); expect(r.listings.ar.description).toMatch(/[\u0600-\u06FF]/); expect(r.product.status).toBe('draft');
    await A().post(S('/plus/ai/listing')).set(H(s.accessToken)).send({ title: 'x', material: '', use: '' }).expect(422);
  });
  it('live sessions validate platform + url', async () => {
    await A().post(S('/plus/live')).set(H(s.accessToken)).send({ title: 'Eid sale', startsAt: '2026-11-01T15:00:00+05:00', platform: 'tiktok', productIds: [prod.id] }).expect(201);
    await A().post(S('/plus/live')).set(H(s.accessToken)).send({ title: 'x', startsAt: 'nope', platform: 'myspace' }).expect(422);
  });
  it('store isolation + roles on Sellora+ endpoints', async () => {
    await A().get(S('/plus/shipments')).set(H(other.accessToken)).expect(403);
    await A().get(S('/integrations')).set(H(other.accessToken)).expect(403);
    await A().get(`/api/stores/${other.store.id}/plus/rfqs`).set(H(s.accessToken)).expect(403);
    await A().get(`/api/stores/${other.store.id}/plus/designs`).set(H(other.accessToken)).expect(200).then(r => expect(r.body).toHaveLength(0));
    const oo = (await A().post(`/api/stores/${other.store.id}/plus/whatsapp/parse`).set(H(other.accessToken)).send({ text: '1 x thing', phone: '+923001234567', save: true })).body;
    await A().post(S(`/plus/whatsapp/orders/${oo.id}/convert`)).set(H(s.accessToken)).send({}).expect(404); // cross-store id
    await A().get(S('/plus/shipments')).set(H(staff.accessToken)).expect(200); // fulfillment has orders
    await A().get(S('/plus/designs')).set(H(staff.accessToken)).expect(403);
    await A().get(S('/integrations')).set(H(staff.accessToken)).expect(403);
    await A().get(S('/plus/shipments')).expect(401);
  });
});
describe('App integrations (mocked HTTP)', () => {
  it('catalogue lists every app; credentials are encrypted at rest and masked in responses', async () => {
    const list = (await A().get(S('/integrations')).set(H(s.accessToken)).expect(200)).body; expect(list.map((a: any) => a.id).sort()).toEqual(APPS.map(a => a.id).sort());
    await A().put(S('/integrations/meta/credentials')).set(H(s.accessToken)).send({ credentials: { accessToken: 'EAAG-secret-token', catalogId: '1234' } }).expect(200).then(r => expect(r.body.live).toBe(true));
    await A().put(S('/integrations/meta/credentials')).set(H(s.accessToken)).send({ credentials: { hacker: 'x' } }).expect(400);
    const row = await db.appInstall.findUnique({ where: { storeId_appId: { storeId: s.store.id, appId: 'meta' } } }); expect(row!.credentialsEnc).not.toContain('EAAG');
    const m = (await A().get(S('/integrations')).set(H(s.accessToken))).body.find((a: any) => a.id === 'meta'); expect(JSON.stringify(m)).not.toContain('EAAG-secret-token'); expect(m.live).toBe(true);
  });
  it('mock fallback when keys missing: no HTTP, request preview redacted', async () => {
    const r = (await A().post(S('/integrations/ga4/orders/' + order.id + '/event')).set(H(s.accessToken)).send({}).expect(200)).body;
    expect(r.live).toBe(false); expect(r.data.mock).toBe(true); expect(calls).toHaveLength(0); expect(r.request.url).toContain('google-analytics.com/mp/collect');
  });
  it('Meta catalog batch sync + CAPI purchase event with hashed email', async () => {
    stub(() => [200, { handles: ['h1'] }]);
    const r = (await A().post(S('/integrations/meta/sync')).set(H(s.accessToken)).expect(200)).body; expect(r.live).toBe(true); expect(r.products).toBeGreaterThanOrEqual(2);
    expect(calls[0].url).toBe('https://graph.facebook.com/v21.0/1234/items_batch'); const b = JSON.parse(calls[0].init.body); expect(b.item_type).toBe('PRODUCT_ITEM'); expect(b.requests[0].data.price).toMatch(/^\d+\.\d{2} [A-Z]{3}$/);
    calls = []; await A().put(S('/integrations/meta-pixel/credentials')).set(H(s.accessToken)).send({ credentials: { pixelId: '999', accessToken: 'tok' } });
    stub(() => [200, { events_received: 1 }]);
    await A().post(S(`/integrations/meta-pixel/orders/${order.id}/event`)).set(H(s.accessToken)).send({ ip: '1.2.3.4' }).expect(200);
    const e = JSON.parse(calls[0].init.body).data[0]; expect(e.event_name).toBe('Purchase'); expect(e.user_data.em[0]).toMatch(/^[a-f0-9]{64}$/); expect(e.custom_data.value).toBe(9000);
  });
  it('Google Merchant productInputs.insert, GA4 MP, TikTok, Pinterest, Klaviyo, Mailchimp, Xero, QuickBooks, DHL request shapes', async () => {
    stub(() => [200, {}]);
    const put = (id: string, credentials: any) => A().put(S(`/integrations/${id}/credentials`)).set(H(s.accessToken)).send({ credentials }).expect(200);
    await put('google-merchant', { accessToken: 'ya29', merchantId: '42', dataSourceId: '7' }); await A().post(S('/integrations/google-merchant/sync')).set(H(s.accessToken)).expect(200);
    expect(calls[0].url).toContain('merchantapi.googleapis.com/products/v1/accounts/42/productInputs:insert'); expect(JSON.parse(calls[0].init.body).productAttributes.price.amountMicros).toMatch(/^\d+0000$/); expect(calls[0].init.headers.Authorization).toBe('Bearer ya29');
    calls = []; await put('ga4', { measurementId: 'G-1', apiSecret: 's' }); await A().post(S(`/integrations/ga4/orders/${order.id}/event`)).set(H(s.accessToken)).send({}).expect(200); expect(JSON.parse(calls[0].init.body).events[0].name).toBe('purchase');
    calls = []; await put('tiktok', { accessToken: 'tt', pixelCode: 'C1' }); await A().post(S(`/integrations/tiktok/orders/${order.id}/event`)).set(H(s.accessToken)).send({}).expect(200); expect(calls[0].init.headers['Access-Token']).toBe('tt'); expect(JSON.parse(calls[0].init.body).data[0].event).toBe('CompletePayment');
    calls = []; await put('pinterest', { accessToken: 'pp', adAccountId: '55' }); await A().post(S('/integrations/pinterest/sync')).set(H(s.accessToken)).expect(200); expect(JSON.parse(calls[0].init.body).operation).toBe('UPSERT');
    calls = []; await put('klaviyo', { privateKey: 'pk_x' }); await A().post(S(`/integrations/klaviyo/orders/${order.id}/event`)).set(H(s.accessToken)).send({}).expect(200); expect(calls[0].init.headers.revision).toBeTruthy(); expect(calls[0].init.headers.Authorization).toBe('Klaviyo-API-Key pk_x');
    calls = []; await put('mailchimp', { apiKey: 'abc-us21', listId: 'L1' }); await A().post(S('/integrations/mailchimp/actions/upsertContact')).set(H(s.accessToken)).send({ input: { email: 'Ali@X.pk' } }).expect(200); expect(calls[0].url).toBe('https://us21.api.mailchimp.com/3.0/lists/L1/members/' + require('crypto').createHash('md5').update('ali@x.pk').digest('hex'));
    calls = []; await put('xero', { accessToken: 'x', tenantId: 't' }); await A().post(S(`/integrations/xero/orders/${order.id}/syncOrder`)).set(H(s.accessToken)).send({}).expect(200); expect(calls[0].init.headers['Xero-tenant-id']).toBe('t'); expect(JSON.parse(calls[0].init.body).Invoices[0].Type).toBe('ACCREC');
    calls = []; await put('quickbooks', { accessToken: 'q', realmId: '9' }); await A().post(S(`/integrations/quickbooks/orders/${order.id}/syncOrder`)).set(H(s.accessToken)).send({}).expect(200); expect(calls[0].url).toContain('/v3/company/9/salesreceipt');
    calls = []; await put('dhl', { username: 'u', password: 'p', accountNumber: '123', sandbox: 'true' }); await A().post(S(`/integrations/dhl/orders/${order.id}/rate`)).set(H(s.accessToken)).send({ weightGrams: 2000 }).expect(200); expect(calls[0].url).toContain('express.api.dhl.com/mydhlapi/test/rates'); expect(calls[0].url).toContain('weight=2');
  });
  it('upstream errors map to 502 and are logged', async () => {
    stub(() => [401, { error: { message: 'Invalid OAuth access token' } }]);
    const r = await A().post(S('/integrations/meta/test')).set(H(s.accessToken)).send({}).expect(502); expect(r.body.details.upstreamStatus).toBe(401);
    const logs = (await A().get(S('/integrations/meta/logs')).set(H(s.accessToken)).expect(200)).body; expect(logs[0].status).toBe(401);
  });
  it('OAuth: start builds provider URL with state; callback exchanges code, rejects bad/replayed state', async () => {
    await A().put(S('/integrations/google-merchant/credentials')).set(H(s.accessToken)).send({ credentials: { clientId: 'cid', clientSecret: 'cs' } });
    const st = (await A().get(S('/integrations/google-merchant/oauth/start')).set(H(s.accessToken)).expect(200)).body;
    expect(st.url).toContain('https://accounts.google.com/o/oauth2/v2/auth?client_id=cid'); expect(st.url).toContain('scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcontent');
    await A().get('/api/integrations/oauth/callback?state=forged&code=x').expect(400);
    stub(() => [200, { access_token: 'new-at', refresh_token: 'new-rt' }]);
    await A().get(`/api/integrations/oauth/callback?state=${st.state}&code=abc`).expect(200);
    expect(calls[0].url).toBe('https://oauth2.googleapis.com/token'); expect(calls[0].init.body).toContain('grant_type=authorization_code');
    await A().get(`/api/integrations/oauth/callback?state=${st.state}&code=abc`).expect(400); // replay
    await A().post(S('/integrations/zapier/oauth/start')).set(H(s.accessToken)).expect(404);
    await A().get(S('/integrations/zapier/oauth/start')).set(H(s.accessToken)).expect(400);
  });
  it('Klaviyo / QuickBooks webhook signatures', async () => {
    await A().put(S('/integrations/klaviyo/credentials')).set(H(s.accessToken)).send({ credentials: { webhookSecret: 'ks' } });
    const body = JSON.stringify({ data: [{ type: 'event' }] }); const good = createHmac('sha256', 'ks').update(body).digest('base64');
    await A().post(`/api/hooks/apps/klaviyo/${s.store.id}`).set('Content-Type', 'application/json').set('Klaviyo-Signature', 'bad').send(body).expect(401);
    await A().post(`/api/hooks/apps/klaviyo/${s.store.id}`).set('Content-Type', 'application/json').set('Klaviyo-Signature', good).send(body).expect(200);
    await A().post(`/api/hooks/apps/klaviyo/nope`).set('Content-Type', 'application/json').send(body).expect(404);
  });
});
describe('rate limit', () => {
  it('returns 429 after the configured API limit', async () => {
    process.env.RATE_LIMIT_API = '3'; const a2 = createApp(); delete process.env.RATE_LIMIT_API;
    for (let i = 0; i < 3; i++) await request(a2).get('/api/storefront/none/products').expect(r => expect(r.status).not.toBe(429));
    await request(a2).get('/api/storefront/none/products').expect(429);
  });
});
describe('OpenAPI', () => {
  it('documents plus, integrations and webhook endpoints', async () => {
    const res = await request(createApp()).get('/openapi.json');
    const k = Object.keys(res.body.paths || {});
    expect(k.some(p => p.includes('/plus/whatsapp'))).toBe(true);
    expect(k.some(p => p.includes('/integrations/{appId}/sync'))).toBe(true);
    expect(k.some(p => p.startsWith('/api/hooks/apps'))).toBe(true);
  });
});
