import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { db } from '../src/lib/db';
import { config } from '../src/lib/config';
import { llmChat, llmChatBest, llmInfo, costUsd } from '../src/providers/llm';
import { parseEdit, applyOps, mockSite } from '../src/lib/sitegen';
const app = createApp(); const A = () => request(app);
const H = (t: string) => ({ Authorization: 'Bearer ' + t });
let s: any; const S = (p: string) => `/api/stores/${s.store.id}${p}`; const tok = () => H(s.accessToken);
const used = async () => (await A().get(S('/billing/usage')).set(tok())).body.items.find((i: any) => i.metric === 'ai').used;
beforeAll(async () => { s = (await A().post('/api/auth/signup').send({ email: 'grow@t.io', password: 'password123', storeName: 'Noor Lawn' }).expect(201)).body; });
afterEach(() => { vi.unstubAllGlobals(); Object.assign(config, { llmProvider: 'mock', deepseekKey: '', anthropicKey: '' }); });

describe('DeepSeek provider', () => {
  it('mock when no key; DeepSeek request shape (OpenAI-compatible, JSON mode, thinking off) and cost', async () => {
    expect(llmInfo().provider).toBe('mock'); expect(await llmChat('s', 'u')).toBeNull();
    Object.assign(config, { llmProvider: 'deepseek', deepseekKey: 'sk-test' });
    const f = vi.fn(async () => new Response(JSON.stringify({ choices: [{ message: { content: '{"ok":true}' } }], usage: { prompt_tokens: 1000, prompt_cache_hit_tokens: 400, completion_tokens: 2000 } }), { status: 200 })); vi.stubGlobal('fetch', f);
    const out = await llmChat('sys', 'hi', { json: true }); expect(out!.text).toBe('{"ok":true}');
    const [url, init] = f.mock.calls[0] as any; expect(url).toBe('https://api.deepseek.com/chat/completions'); expect(init.headers.Authorization).toBe('Bearer sk-test');
    const body = JSON.parse(init.body); expect(body.model).toBe('deepseek-flash'); expect(body.response_format).toEqual({ type: 'json_object' }); expect(body.thinking).toEqual({ type: 'disabled' });
    expect(out!.usage.estUsd).toBeCloseTo(costUsd('deepseek-flash', 1000, 400, 2000)); expect(costUsd('deepseek-flash', 1e6, 0, 0)).toBeCloseTo(0.30); expect(costUsd('deepseek-v4-pro', 0, 0, 1e6)).toBeCloseTo(3.96);
  });
  it('store copy tries Claude first when ANTHROPIC_API_KEY is set, then DeepSeek', async () => {
    Object.assign(config, { llmProvider: 'deepseek', deepseekKey: 'sk-ds', anthropicKey: 'sk-ant', anthropicModel: 'claude-sonnet-4-5' });
    const f = vi.fn(async (url: string) => {
      if (String(url).includes('anthropic.com')) return new Response(JSON.stringify({ content: [{ type: 'text', text: '{"tagline":"From Claude"}' }], usage: { input_tokens: 10, output_tokens: 5 } }), { status: 200 });
      return new Response(JSON.stringify({ choices: [{ message: { content: '{"tagline":"From DeepSeek"}' } }], usage: { prompt_tokens: 8, completion_tokens: 4 } }), { status: 200 });
    });
    vi.stubGlobal('fetch', f);
    const best = await llmChatBest('sys', 'hi', { json: true });
    expect(best!.text).toContain('From Claude'); expect(best!.usage.provider).toBe('claude');
    expect(String(f.mock.calls[0][0])).toContain('anthropic.com');
    f.mockImplementation(async (url: string) => {
      if (String(url).includes('anthropic.com')) return new Response('no', { status: 500 });
      return new Response(JSON.stringify({ choices: [{ message: { content: '{"tagline":"From DeepSeek"}' } }], usage: { prompt_tokens: 8, completion_tokens: 4 } }), { status: 200 });
    });
    const fell = await llmChatBest('sys', 'hi', { json: true });
    expect(fell!.text).toContain('From DeepSeek'); expect(fell!.usage.provider).toBe('deepseek');
  });
  it('falls back to templates on HTTP error / bad JSON', async () => {
    Object.assign(config, { llmProvider: 'deepseek', deepseekKey: 'sk-test' }); vi.stubGlobal('fetch', vi.fn(async () => new Response('err', { status: 500 })));
    const r = (await A().post(S('/ai/site/build')).set(tok()).send({ prompt: 'lawn kurta brand in Lahore' }).expect(200)).body; expect(r.source).toBe('template'); expect(r.site.products.length).toBe(4);
  });
  it('uses DeepSeek output when valid', async () => {
    Object.assign(config, { llmProvider: 'deepseek', deepseekKey: 'sk-test' });
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ reply: 'From DeepSeek', tone: 'grateful' }) } }], usage: { prompt_tokens: 100, completion_tokens: 50 } }))));
    const r = (await A().post(S('/ai/review-reply')).set(tok()).send({ text: 'Great', rating: 5 }).expect(200)).body; expect(r.source).toBe('llm'); expect(r.result.reply).toBe('From DeepSeek'); expect(r.usage.model).toBe('deepseek-flash');
  });
});
describe('AI website builder', () => {
  it('generates + applies a full site and meters 25 credits', async () => {
    const before = await used();
    const r = (await A().post(S('/ai/site/build')).set(tok()).send({ prompt: 'Women lawn clothing brand in Lahore', apply: true, via: 'voice' }).expect(200)).body;
    expect(r.site.theme.palette.bg).toBe('#FFFFFF'); expect(r.site.menus[0].items.length).toBeGreaterThan(3); expect(Object.keys(r.site.policies)).toEqual(['refund', 'shipping', 'privacy', 'terms']);
    expect(r.created).toMatchObject({ products: 4, collections: 2, pages: 3, blog: 2, menus: 2 }); expect(await used()).toBe(before + 25);
    expect(await db.product.count({ where: { storeId: s.store.id, status: 'draft' } })).toBeGreaterThanOrEqual(4);
  });
  it('edits by command (rules) and rejects gibberish without charging', async () => {
    let r = (await A().post(S('/ai/site/edit')).set(tok()).send({ command: 'Make header black' }).expect(200)).body; expect(r.theme.palette.header).toBe('#000000'); expect(r.theme.settings.header.tx).toBe('#FFFFFF');
    r = (await A().post(S('/ai/site/edit')).set(tok()).send({ command: 'add FAQ section at the top' }).expect(200)).body; expect(r.theme.sections.home[0].type).toBe('faq');
    r = (await A().post(S('/ai/site/edit')).set(tok()).send({ command: 'change headline to "Eid Sale is live"' }).expect(200)).body; expect(r.theme.sections.home.find((x: any) => x.type === 'hero').settings.heading).toBe('Eid Sale is live');
    const b = await used(); await A().post(S('/ai/site/edit')).set(tok()).send({ command: 'qwerty zxcv' }).expect(422); expect(await used()).toBe(b);
  });
  it('sitegen unit: parseEdit/applyOps/niche', () => {
    expect(parseEdit('remove newsletter section')).toEqual([{ op: 'removeSection', type: 'newsletter' }]); expect(parseEdit('set accent to #ff0000')[0]).toMatchObject({ path: 'palette.ac', value: '#FF0000' });
    expect(applyOps({ palette: {}, sections: { home: [{ type: 'hero' }] }, settings: {} }, [{ op: 'set', path: '__proto__.x', value: 1 }]).palette).toEqual({});
    expect(mockSite('honey and spices shop', 'X').niche).toBe('food');
  });
  it('server STT is a placeholder (browser Web Speech by default)', async () => { const r = (await A().post(S('/ai/stt')).set(tok()).send({}).expect(501)).body; expect(r.useBrowser).toBe(true); });
});
describe('SEO / AEO / GEO suite', () => {
  it('audit → one-click fix raises the score', async () => {
    const p = await db.product.findFirstOrThrow({ where: { storeId: s.store.id } }); await db.product.update({ where: { id: p.id }, data: { images: ['/u/a.jpg', '/u/b.jpg'], seoTitle: null, seoDesc: null, description: '<p>Short. <a href="/products/nope">x</a></p>' } });
    const a = (await A().get(S('/seo/audit')).set(tok()).expect(200)).body; expect(a.issues.some((i: any) => i.id === `alt:${p.id}`)).toBe(true); expect(a.issues.some((i: any) => i.issue.includes('/products/nope'))).toBe(true); expect(a.cwv.lcp.target).toBe('< 2.5 s');
    const f = (await A().post(S('/seo/fix')).set(tok()).send({ all: true }).expect(200)).body; expect(f.after).toBeGreaterThan(f.before);
    const p2 = await db.product.findUniqueOrThrow({ where: { id: p.id } }); expect(p2.seoTitle!.length).toBeLessThanOrEqual(60); expect(p2.seoDesc!.length).toBeLessThanOrEqual(155);
    expect((await A().get(S('/seo/broken-links')).set(tok())).body).toEqual([]); // redirect created
  });
  it('schema, head tags, sitemap with hreflang, meta suggestions', async () => {
    const sc = (await A().get(S('/seo/schema')).set(tok()).expect(200)).body; const types = new Set(sc.map((x: any) => x['@type'])); for (const t of ['Organization', 'WebSite', 'LocalBusiness', 'FAQPage']) expect(types.has(t)).toBe(true);
    const p = await db.product.findFirstOrThrow({ where: { storeId: s.store.id } }); await db.product.update({ where: { id: p.id }, data: { status: 'active' } }); await db.review.create({ data: { storeId: s.store.id, productId: p.id, rating: 5, author: 'Ayesha', body: 'Lovely', approved: true } });
    const sc2 = (await A().get(S('/seo/schema?type=Product')).set(tok())).body; expect(sc2[0].aggregateRating.reviewCount).toBe(1); expect(sc2[0].offers['@type']).toBe('Offer');
    expect((await A().get(S('/seo/schema?type=BreadcrumbList')).set(tok())).body.length).toBeGreaterThan(0);
    const h = (await A().get(S(`/seo/head?path=/products/${p.handle}`)).set(tok()).expect(200)).body; expect(h.og['og:type']).toBe('product'); expect(h.hreflang.map((x: any) => x.lang)).toContain('x-default'); expect(h.html).toContain('rel="canonical"');
    const sm = await A().get(S('/seo/sitemap.xml')).set(tok()).expect(200); expect(sm.text).toContain('hreflang="ur"');
    expect((await A().get(S('/seo/meta')).set(tok())).body.find((x: any) => x.type === 'product').suggested.slug).toMatch(/^[a-z0-9-]+$/);
  });
  it('AEO/GEO, keywords, gaps, calendar, internal links', async () => {
    const aeo = (await A().post(S('/seo/aeo')).set(tok()).send({ topic: 'lawn suits' }).expect(200)).body; expect(aeo.result.faq.length).toBeGreaterThan(3);
    const geo = (await A().post(S('/seo/geo')).set(tok()).send({ topic: 'lawn suits' }).expect(200)).body; expect(geo.result.citationTips.length).toBeGreaterThan(2);
    const k = (await A().post(S('/seo/keywords')).set(tok()).send({ seed: 'lawn suit' }).expect(200)).body; expect(Object.keys(k.clusters).length).toBeGreaterThan(3);
    expect((await A().get(S('/seo/keywords')).set(tok())).body.length).toBeGreaterThan(10);
    expect((await A().get(S('/seo/content-gaps')).set(tok())).body.gaps.length).toBeGreaterThan(0);
    const c = (await A().post(S('/seo/calendar')).set(tok()).send({ weeks: 4 }).expect(200)).body; expect(c.result.posts.length).toBe(4);
    expect(Array.isArray((await A().get(S('/seo/internal-links')).set(tok()).expect(200)).body)).toBe(true);
  });
  it('redirects (loop guard), IndexNow (simulated) / GSC placeholder, rank tracker, image optimisation', async () => {
    const rd = (await A().post(S('/seo/redirects')).set(tok()).send({ from: '/old', to: '/new' }).expect(201)).body; await A().post(S('/seo/redirects')).set(tok()).send({ from: '/new', to: '/old' }).expect(400);
    expect((await A().get(`/api/storefront/${s.store.id}/redirect?path=/old`).expect(200)).body).toEqual({ to: '/new', code: 301 }); await A().delete(S(`/seo/redirects/${rd.id}`)).set(tok()).expect(204);
    expect((await A().post(S('/seo/submit')).set(tok()).send({}).expect(200)).body.status).toBe('simulated'); expect((await A().post(S('/seo/submit')).set(tok()).send({ engine: 'google' })).body.status).toBe('placeholder');
    const rk = (await A().post(S('/seo/rank/check')).set(tok()).expect(200)).body; expect(rk.results[0].source).toBe('simulated');
    expect((await A().post(S('/seo/images/optimize')).set(tok()).expect(200)).body.format).toBe('webp');
  });
  it('off-page: citations checklist, outreach, GBP, social', async () => {
    const c = (await A().get(S('/seo/citations')).set(tok())).body; expect(c.pakistan.find((x: any) => x.name === 'Google Business Profile').status).toBe('todo');
    await A().patch(S('/seo/citations')).set(tok()).send({ name: 'Google Business Profile', status: 'live' }).expect(200); expect((await A().get(S('/seo/citations')).set(tok())).body.pakistan[0].status).toBe('live');
    expect((await A().post(S('/seo/outreach')).set(tok()).send({ niche: 'lawn' }).expect(200)).body.result.targets.length).toBeGreaterThan(2);
    expect((await A().post(S('/seo/gbp')).set(tok()).send({}).expect(200)).body.result.description.length).toBeLessThanOrEqual(750);
    expect((await A().post(S('/ai/social')).set(tok()).send({ topic: 'Eid sale', platforms: ['x', 'instagram'] }).expect(200)).body.result.posts.length).toBe(2);
  });
});
describe('Extra AI tools + metering', () => {
  it('EN/UR/AR descriptions metered per language, alt text, campaigns, competitor placeholder', async () => {
    const p = await db.product.findFirstOrThrow({ where: { storeId: s.store.id } }); const b = await used();
    const d = (await A().post(S('/ai/describe')).set(tok()).send({ productId: p.id, langs: ['en', 'ur', 'ar'] }).expect(200)).body; expect(d.result.ur).toContain('dir="rtl"'); expect(await used()).toBe(b + 3);
    expect((await A().post(S('/ai/alt-text')).set(tok()).send({ productId: p.id }).expect(200)).body.images.length).toBe(2);
    expect((await A().post(S('/ai/campaign')).set(tok()).send({ channel: 'whatsapp', goal: 'Eid sale 20% off' }).expect(200)).body.result.text).toContain('STOP');
    expect((await A().post(S('/ai/campaign')).set(tok()).send({ channel: 'email', goal: 'New arrivals' }).expect(200)).body.result.subject).toBeTruthy();
    const c = (await A().post(S('/ai/competitor')).set(tok()).send({ url: 'https://example.com/p', productId: p.id }).expect(200)).body; expect(c.placeholder).toBe(true);
    const pv = (await A().get(S('/ai/provider')).set(tok()).expect(200)).body; expect(pv.provider).toBe('mock'); expect(pv.credits).toBeGreaterThan(30);
  });
  it('storefront chatbot answers from store data and meters the store', async () => {
    const p = await db.product.findFirstOrThrow({ where: { storeId: s.store.id, status: 'active' } }); const b = await used();
    const r = (await A().post(`/api/storefront/${s.store.id}/chat`).send({ message: `Do you have ${p.title.split(' ')[0]}?` }).expect(200)).body; expect(r.result.reply).toContain(p.title.split(' ')[0]);
    expect((await A().post(`/api/storefront/${s.store.id}/chat`).send({ message: 'How long is delivery?' })).body.result.reply).toMatch(/working days/);
    expect(await used()).toBe(b + 2);
  });
  it('blocks AI when credits are exhausted (trial cannot overage)', async () => {
    await db.usageCounter.updateMany({ where: { storeId: s.store.id, metric: 'ai' }, data: { used: 199 } });
    const r = await A().post(S('/ai/site/build')).set(tok()).send({ prompt: 'more stuff' }); expect(r.status).toBe(402);
    await db.usageCounter.updateMany({ where: { storeId: s.store.id, metric: 'ai' }, data: { used: 0 } });
  });
});
