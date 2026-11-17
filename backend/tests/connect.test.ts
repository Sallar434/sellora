import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import request from 'supertest';
import crypto from 'crypto';
import { createApp } from '../src/app';
import { db } from '../src/lib/db';
import { config } from '../src/lib/config';
import { decrypt } from '../src/lib/crypto';
import { applicationFeeCents, setCheckoutCaller, setWebhookConstruct } from '../src/routes/payments';
import { setAiCaller, parseCopy } from '../src/routes/aiGenerate';
import { verifyCourierSignature } from '../src/routes/merchantApps';

const app = createApp();
const A = () => request(app);
const parts = (setCookie: string[] | string = []) => (Array.isArray(setCookie) ? setCookie : [String(setCookie)]).map(c => c.split(';')[0]);
const cookieHeader = (setCookie: string[] | string = []) => parts(setCookie).join('; ');
const csrfOf = (setCookie: string[] | string = []) => decodeURIComponent((parts(setCookie).find(p => p.startsWith('sellora_csrf=')) || '').slice('sellora_csrf='.length));

describe('cookie auth and connections', () => {
  let seller: any;
  beforeAll(async () => {
    const res = await A().post('/api/auth/register').send({ email: 'merchant-a@connect.test', password: 'password123', storeName: 'Connect A' }).expect(201);
    seller = res.body;
    expect(res.body.accessToken).toBeUndefined();
    expect(res.body.refreshToken).toBeUndefined();
    expect(String(res.headers['set-cookie'])).toContain('sellora_session');
    expect(String(res.headers['set-cookie'])).toContain('HttpOnly');
  });
  afterEach(() => { setAiCaller(async () => { throw new Error('reset'); }); });

  it('reads /session/me from the cookie and rejects a missing CSRF token', async () => {
    const agent = request.agent(app);
    const reg = await agent.post('/api/auth/register').send({ email: 'merchant-c@connect.test', password: 'password123', storeName: 'Connect C' }).expect(201);
    const me = await agent.get('/api/auth/session/me').expect(200);
    expect(me.body.user.email).toBe('merchant-c@connect.test');
    expect(me.body.accessToken).toBeUndefined();
    await agent.post('/api/integrations/test').send({ storeId: reg.body.store.id, appName: 'tcs' }).expect(403);
    const token = csrfOf(reg.headers['set-cookie'] as any);
    await agent.post('/api/integrations/test').set('x-csrf-token', token).send({ storeId: reg.body.store.id, appName: 'tcs' }).expect(409);
    await agent.post('/api/auth/session/logout').set('x-csrf-token', token).expect(200);
    await agent.get('/api/auth/session/me').expect(401);
  });

  it('does not let merchant A read merchant B integrations', async () => {
    const b = (await A().post('/api/auth/register').send({ email: 'merchant-b@connect.test', password: 'password123', storeName: 'Connect B' })).body;
    const login = await A().post('/api/auth/session/login').send({ email: 'merchant-a@connect.test', password: 'password123' }).expect(200);
    expect(login.body.accessToken).toBeUndefined();
    const cookie = cookieHeader(login.headers['set-cookie'] as any);
    await A().get('/api/integrations?storeId=' + b.store.id).set('Cookie', cookie).expect(403);
    await A().get('/api/integrations?storeId=' + seller.store.id).set('Cookie', cookie).expect(200);
  });

  it('charges 2% from the database price and refuses a store with no Stripe account', async () => {
    expect(applicationFeeCents(10000)).toBe(200);
    expect(applicationFeeCents(199)).toBe(4);
    const product = await db.product.create({ data: { storeId: seller.store.id, title: 'Mug', handle: 'mug-' + Date.now(), price: 2500 } });
    await A().post('/api/payments/checkout').set('Authorization', 'Bearer ' + (await tokenFor('merchant-a@connect.test'))).send({ productId: product.id, storeId: seller.store.id }).expect(409);
    await db.store.update({ where: { id: seller.store.id }, data: { stripeAccountId: 'acct_test_123' } });
    const prev = config.stripeKey;
    (config as any).stripeKey = '';
    await A().post('/api/payments/checkout').set('Authorization', 'Bearer ' + (await tokenFor('merchant-a@connect.test'))).send({ productId: product.id, storeId: seller.store.id }).expect(503);
    (config as any).stripeKey = 'sk_test_placeholder';
    let seen: any;
    setCheckoutCaller(async (args) => { seen = args; return { id: 'cs_test', url: 'https://checkout.stripe.com/test' }; });
    const res = await A().post('/api/payments/checkout').set('Authorization', 'Bearer ' + (await tokenFor('merchant-a@connect.test'))).send({ productId: product.id, storeId: seller.store.id, price: 1 }).expect(200);
    expect(seen.line_items[0].price_data.unit_amount).toBe(2500);
    expect(seen.payment_intent_data.application_fee_amount).toBe(50);
    expect(seen.payment_intent_data.transfer_data.destination).toBe('acct_test_123');
    expect(res.body.amount).toBe(2500);
    (config as any).stripeKey = prev;
    (config as any).stripeWebhookSecret = 'whsec_test';
    await A().post('/api/webhooks/stripe').set('stripe-signature', 'bad').send({}).expect(400);
    setWebhookConstruct(() => ({ type: 'checkout.session.completed', data: { object: { metadata: { orderId: res.body.orderId } } } }));
    await A().post('/api/webhooks/stripe').set('stripe-signature', 't').send({}).expect(200);
    expect((await db.order.findUnique({ where: { id: res.body.orderId } }))!.financial).toBe('paid');
  });

  it('passes a provider balance error through and validates JSON', async () => {
    setAiCaller(async () => { const err: any = new Error('insufficient balance'); err.status = 402; throw Object.assign(new (await import('../src/lib/http')).HttpError(402, 'The AI provider refused the request: insufficient balance'), {}); });
    const denied = await A().post('/api/ai/generate').set('Authorization', 'Bearer ' + (await tokenFor('merchant-a@connect.test'))).send({ prompt: 'mug' });
    expect(denied.status).toBe(402);
    expect(denied.body.title).toBeUndefined();
    setAiCaller(async () => ({ text: JSON.stringify({ title: 'Mug', description: 'Clay mug', seoTitle: 'Mug', seoDescription: 'A clay mug' }), inputTokens: 11, outputTokens: 7, provider: 'kimi', model: 'moonshot-v1-8k' }));
    const ok = await A().post('/api/ai/generate').set('Authorization', 'Bearer ' + (await tokenFor('merchant-a@connect.test'))).send({ prompt: 'mug', storeId: seller.store.id }).expect(200);
    expect(ok.body.title).toBe('Mug');
    expect(ok.body.provider).toBe('kimi');
    const usage = await db.aiUsage.findMany({ where: { storeId: seller.store.id } });
    expect(usage.reduce((n, u) => n + u.inputTokens + u.outputTokens, 0)).toBe(18);
    expect(() => parseCopy('not-json')).toThrow();
  });

  it('encrypts credentials, masks them, and does not call an unverified courier', async () => {
    const login = await A().post('/api/auth/session/login').send({ email: 'merchant-a@connect.test', password: 'password123' });
    const cookie = cookieHeader(login.headers['set-cookie'] as any);
    const token = csrfOf(login.headers['set-cookie'] as any);
    const saved = await A().post('/api/integrations/connect').set('Cookie', cookie).set('x-csrf-token', token).send({ storeId: seller.store.id, appName: 'tcs', credentials: { apiKey: 'super-secret' } }).expect(200);
    expect(JSON.stringify(saved.body)).not.toContain('super-secret');
    expect(saved.body.secret).toBe('••••');
    const row = await db.integration.findUniqueOrThrow({ where: { storeId_appName: { storeId: seller.store.id, appName: 'tcs' } } });
    expect(decrypt(row.credentialsEnc)).toContain('super-secret');
    expect(row.credentialsEnc).not.toContain('super-secret');
    await A().post('/api/integrations/test').set('Cookie', cookie).set('x-csrf-token', token).send({ storeId: seller.store.id, appName: 'tcs' }).expect(501);
  });

  it('lets only a platform admin open the owner overview and rejects a bad courier signature', async () => {
    const sellerTok = await tokenFor('merchant-a@connect.test');
    await A().get('/api/owner/overview').set('Authorization', 'Bearer ' + sellerTok).expect(403);
    (config as any).platformAdminEmail = 'platform@connect.test';
    const admin = await A().post('/api/auth/register').send({ email: 'platform@connect.test', password: 'password123', storeName: 'Platform' }).expect(201);
    expect(admin.body.user.type).toBe('PLATFORM_ADMIN');
    const view = await A().get('/api/owner/overview').set('Authorization', 'Bearer ' + (await tokenFor('platform@connect.test'))).expect(200);
    expect(view.body.stores.length).toBeGreaterThan(0);
    expect(JSON.stringify(view.body)).not.toContain('super-secret');
    expect(JSON.stringify(view.body)).not.toContain('credentialsEnc');
    (config as any).courierWebhookSecret = '';
    await A().post('/api/webhooks/courier/tcs').set('x-sellora-signature', 'nope').send({ orderId: 'x' }).expect(503);
    (config as any).courierWebhookSecret = 'courier-secret';
    await A().post('/api/webhooks/courier/tcs').set('x-sellora-signature', 'nope').send({ orderId: 'x' }).expect(401);
    const raw = JSON.stringify({ orderId: 'none', financial: 'paid' });
    const sig = crypto.createHmac('sha256', 'courier-secret').update(raw).digest('hex');
    expect(verifyCourierSignature(raw, sig, 'courier-secret')).toBe(true);
    await A().post('/api/webhooks/courier/tcs').set('Content-Type', 'application/json').set('x-sellora-signature', sig).send(raw).expect(200);
  });
});

async function tokenFor(email: string) {
  const u = await db.user.findUniqueOrThrow({ where: { email } });
  const { accessToken } = await import('../src/lib/auth');
  return accessToken({ sub: u.id, type: u.type as any, email: u.email });
}
