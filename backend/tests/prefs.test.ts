import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import crypto from 'crypto';
import { createApp } from '../src/app';
import { db } from '../src/lib/db';

const app = createApp(); const A = () => request(app);
let s: any; const S = (p: string) => `/api/stores/${s.store.id}${p}`; const tok = () => ({ Authorization: 'Bearer ' + s.accessToken });
const plan = (status: string) => db.subscription.update({ where: { storeId: s.store.id }, data: { status } });
const pub = (p: string) => `/s/${s.store.handle}${p}`;

beforeAll(async () => { s = (await A().post('/api/auth/signup').send({ email: 'pref@t.io', password: 'password123', storeName: 'Active Reality' }).expect(201)).body; await A().get(S('/billing')).set(tok()); });

describe('store access (private mode)', () => {
  it('a new store is private with a generated password', async () => {
    const p = (await A().get(S('/online-store/preferences')).set(tok()).expect(200)).body;
    expect(p.private).toBe(true); expect(p.canRemovePassword).toBe(false); expect(p.password).toMatch(/^[a-z]{6}$/);
  });
  it('the password and visitor message can be changed', async () => {
    const p = (await A().put(S('/online-store/preferences')).set(tok()).send({ password: 'miskea', message: 'Opening soon' }).expect(200)).body;
    expect(p.password).toBe('miskea'); expect(p.message).toBe('Opening soon');
    await A().put(S('/online-store/preferences')).set(tok()).send({ password: '  ' }).expect(422);
  });
  it('the password cannot be removed before the plan is paid', async () => {
    const r = await A().put(S('/online-store/preferences')).set(tok()).send({ private: false }).expect(402);
    expect(r.body.error.code || r.body.code || JSON.stringify(r.body)).toMatch(/plan_required/);
    await A().patch(S('')).set(tok()).send({ settings: { passwordEnabled: false } }).expect(402);
  });
  it('visitors see the password page and can unlock it with the password', async () => {
    const a = (await A().get(pub('/access')).expect(200)).body; expect(a.private).toBe(true); expect(a.message).toBe('Opening soon');
    expect((await A().get(pub('/access')).expect(200)).body).not.toHaveProperty('password');
    await A().post(pub('/unlock')).send({ password: 'wrong' }).expect(401);
    const u = (await A().post(pub('/unlock')).send({ password: 'miskea' }).expect(200)).body; expect(u.token).toBeTruthy();
    expect((await A().get(pub('/access')).set('x-store-unlock', u.token).expect(200)).body.private).toBe(false);
  });
  it('private stores ask search engines not to index them', async () => {
    expect((await A().get(pub('/robots.txt')).expect(200)).text).toMatch(/Disallow: \/\n/);
    expect((await A().get(S('/seo/head?path=/')).set(tok()).expect(200)).body.html).toMatch(/noindex/);
  });
  it('after paying, the password can be removed; if the plan stops, the store is private again', async () => {
    await plan('active');
    expect((await A().put(S('/online-store/preferences')).set(tok()).send({ private: false }).expect(200)).body.private).toBe(false);
    expect((await A().get(pub('/access')).expect(200)).body.private).toBe(false);
    expect((await A().get(pub('/robots.txt')).expect(200)).text).toMatch(/Allow: \//);
    await plan('past_due');
    expect((await A().get(pub('/access')).expect(200)).body.private).toBe(true);
    expect((await A().get(S('/online-store/preferences')).set(tok()).expect(200)).body.private).toBe(true);
    await plan('active');
  });
});

describe('social sharing image and SEO', () => {
  it('home page title, description and image go into the page head', async () => {
    await A().put(S('/online-store/preferences')).set(tok()).send({ prefs: { title: 'Active Reality | Buy Boxing Gloves & Gear, Free Shipping', desc: 'Shop boxing gloves made in Sialkot.', img: 'https://cdn.example.com/og.jpg' } }).expect(200);
    const h = (await A().get(S('/seo/head?path=/')).set(tok()).expect(200)).body;
    expect(h.title).toBe('Active Reality | Buy Boxing Gloves & Gear, Free Shipping'); expect(h.og['og:description']).toBe('Shop boxing gloves made in Sialkot.'); expect(h.og['og:image']).toBe('https://cdn.example.com/og.jpg');
    expect(h.html).not.toMatch(/noindex/); expect(h.hreflang.length).toBeGreaterThan(0);
    await A().put(S('/online-store/preferences')).set(tok()).send({ prefs: { hreflang: false } }).expect(200);
    expect((await A().get(S('/seo/head?path=/')).set(tok()).expect(200)).body.hreflang).toEqual([]);
  });
  it('limits match the counters (70 / 320 characters)', async () => {
    await A().put(S('/online-store/preferences')).set(tok()).send({ prefs: { title: 'x'.repeat(71) } }).expect(422);
    await A().put(S('/online-store/preferences')).set(tok()).send({ prefs: { desc: 'x'.repeat(321) } }).expect(422);
  });
  it('the public access endpoint shares the SEO, redirection and spam settings', async () => {
    await A().put(S('/online-store/preferences')).set(tok()).send({ prefs: { redirLang: false, capLogin: false } }).expect(200);
    const a = (await A().get(pub('/access')).expect(200)).body;
    expect(a.seo.title).toMatch(/Boxing/); expect(a.redirect).toEqual({ country: true, language: false }); expect(a.captcha).toEqual({ contact: true, login: false });
  });
});

describe('trusted domains and crawler access', () => {
  it('trusted domains are cleaned and checked', async () => {
    const p = (await A().put(S('/online-store/preferences')).set(tok()).send({ prefs: { trusted: ['https://Example.com/path', 'shop.example.org'] } }).expect(200)).body;
    expect(p.prefs.trusted).toEqual(['example.com', 'shop.example.org']);
    await A().put(S('/online-store/preferences')).set(tok()).send({ prefs: { trusted: ['not a domain'] } }).expect(400);
  });
  it('a crawler signature lets a trusted tool into a private store; expired or forged ones do not', async () => {
    await plan('trialing');
    const c = (await A().post(S('/crawler-signatures')).set(tok()).send({ name: 'SEO audit tool', days: 7 }).expect(201)).body;
    expect(c.headers['Signature-Input']).toMatch(/^sig1=\("@authority" "signature-agent"\);created=\d+;expires=\d+;keyid="[^"]+";alg="ed25519";tag="web-bot-auth"$/);
    expect(c.headers.Signature).toMatch(/^sig1=:[A-Za-z0-9+/=]+:$/);
    const host = `${s.store.handle}.vendom.app`;
    const ok = (await A().get(pub('/access')).set('Host', host).set('Signature-Input', c.headers['Signature-Input']).set('Signature', c.headers.Signature).set('Signature-Agent', c.headers['Signature-Agent']).expect(200)).body;
    expect(ok.private).toBe(false); expect(ok.crawler).toBe(true);
    const forged = 'sig1=:' + crypto.randomBytes(64).toString('base64') + ':';
    expect((await A().get(pub('/access')).set('Host', host).set('Signature-Input', c.headers['Signature-Input']).set('Signature', forged).set('Signature-Agent', c.headers['Signature-Agent']).expect(200)).body.private).toBe(true);
    const list = (await A().get(S('/online-store/preferences')).set(tok()).expect(200)).body.prefs.crawlers; expect(list[0]).toMatchObject({ name: 'SEO audit tool', active: true });
    await A().delete(S('/crawler-signatures/' + c.id)).set(tok()).expect(204);
    expect((await A().get(pub('/access')).set('Host', host).set('Signature-Input', c.headers['Signature-Input']).set('Signature', c.headers.Signature).set('Signature-Agent', c.headers['Signature-Agent']).expect(200)).body.private).toBe(true);
    await A().post(S('/crawler-signatures')).set(tok()).send({ name: '', days: 7 }).expect(422);
  });
});
