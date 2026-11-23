import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { db } from '../src/lib/db';
import { config } from '../src/lib/config';
import { record } from '../src/lib/billing';
import { providersFor, setClaudeClient } from '../src/providers/ai/agent';
import { detect, payload } from '../src/lib/connectors';

const app = createApp(); const A = () => request(app);
const H = (t: string) => ({ Authorization: 'Bearer ' + t });
let s: any, product: any; const S = (p: string) => `/api/stores/${s.store.id}${p}`; const tok = () => H(s.accessToken);
const realFetch = globalThis.fetch;
const PUBLIC = 'https://93.184.216.34'; // a public IP literal, so tests need no DNS
const json = (x: any, status = 200) => new Response(JSON.stringify(x), { status, headers: { 'Content-Type': 'application/json' } });
/** Stub fetch for outside services; the assistant's own loopback calls go through for real. */
function outside(handler: (url: string, init: any) => Response | Promise<Response>) {
  const f = vi.fn(async (url: any, init?: any) => (String(url).startsWith('http://127.0.0.1') ? realFetch(url, init) : handler(String(url), init)));
  vi.stubGlobal('fetch', f); return f;
}
const plan = (code: string) => db.subscription.update({ where: { storeId: s.store.id }, data: { planCode: code, status: 'active' } });
const aiUsed = async () => (await A().get(S('/billing/usage')).set(tok())).body.items.find((i: any) => i.metric === 'ai').used;
const chat = (text: string) => A().post(S('/assistant/chat')).set(tok()).send({ messages: [{ role: 'user', content: text }] });

beforeAll(async () => {
  s = (await A().post('/api/auth/signup').send({ email: 'ai@t.io', password: 'password123', storeName: 'Noor Lawn' }).expect(201)).body;
  product = (await A().post(S('/products')).set(tok()).send({ title: 'Lawn Kurta', price: 350000, description: '<p>Soft lawn</p>', variants: [{ title: 'M', price: 350000, inventory: 3, sku: 'LK-M' }] }).expect(201)).body;
  await A().post(S('/shipping-zones')).set(tok()).send({ name: 'PK', countries: ['PK'], rates: [{ name: 'Standard', price: 25000 }] }).expect(201);
});
afterEach(() => { vi.unstubAllGlobals(); setClaudeClient(null); Object.assign(config, { deepseekKey: '', kimiKey: '', anthropicKey: '', llmProvider: 'mock' }); });

describe('model routing by plan', () => {
  it('plan picks the model; lower plans never fall up to a more expensive one', () => {
    Object.assign(config, { deepseekKey: 'd', kimiKey: 'k', anthropicKey: 'a' });
    expect(providersFor('basic')).toEqual(['deepseek']);
    expect(providersFor('grow')).toEqual(['kimi', 'deepseek']);
    expect(providersFor('advanced')).toEqual(['claude', 'kimi', 'deepseek']);
    expect(providersFor('enterprise')[0]).toBe('claude');
    Object.assign(config, { anthropicKey: '', kimiKey: '' });
    expect(providersFor('advanced')).toEqual(['deepseek']);
    Object.assign(config, { deepseekKey: '' });
    expect(providersFor('advanced')).toEqual([]);
  });
  it('GET /assistant reports the plan, model and credits per reply', async () => {
    const info = (await A().get(S('/assistant')).set(tok()).expect(200)).body;
    expect(info).toMatchObject({ plan: 'grow', model: 'VendOm AI', creditsPerReply: 0, ready: false }); expect(info.tools).toContain('seo_audit'); expect(JSON.stringify(info)).not.toMatch(/deepseek|kimi|claude/i);
    Object.assign(config, { kimiKey: 'k' });
    const i2 = (await A().get(S('/assistant')).set(tok())).body; expect(i2).toMatchObject({ model: 'VendOm AI Plus', creditsPerReply: 2, ready: true }); expect(JSON.stringify(i2)).not.toMatch(/kimi|moonshot/i);
  });
});

describe('assistant chat', () => {
  it('no AI keys: built-in replies still run real tools (SEO audit, low stock)', async () => {
    const r = (await chat('check my SEO please').expect(200)).body;
    expect(r.brand).toBe('VendOm AI'); expect(r.steps[0].tool).toBe('seo_audit'); expect(r.text).toMatch(/SEO score is \d+\/100/);
    expect((await chat('what is low on stock?')).body.text).toContain('Lawn Kurta: 3');
  });

  it('Basic plan → DeepSeek with function calling over real store data; 1 credit', async () => {
    await plan('basic'); Object.assign(config, { deepseekKey: 'sk-ds' });
    const calls: any[] = [];
    const f = outside((url, init) => {
      const body = JSON.parse(init.body); calls.push({ url, body });
      if (calls.length === 1) return json({ choices: [{ message: { content: '', tool_calls: [{ id: 'c1', type: 'function', function: { name: 'list_products', arguments: '{"lowStockBelow":5}' } }] } }], usage: { prompt_tokens: 900, completion_tokens: 40 } });
      return json({ choices: [{ message: { content: 'Lawn Kurta has only 3 left.' } }], usage: { prompt_tokens: 1000, completion_tokens: 20 } });
    });
    const before = await aiUsed();
    const r = (await chat('anything low on stock?').expect(200)).body;
    expect(r).toMatchObject({ brand: 'VendOm AI Lite', credits: 1, text: 'Lawn Kurta has only 3 left.' }); expect(r.provider).toBeUndefined();
    expect(calls[0].url).toBe('https://api.deepseek.com/chat/completions'); expect(calls[0].body.tools.map((t: any) => t.function.name)).toContain('build_website');
    const toolMsg = calls[1].body.messages.find((m: any) => m.role === 'tool'); expect(toolMsg.tool_call_id).toBe('c1'); expect(toolMsg.content).toContain('"stock":3');
    expect(await aiUsed()).toBe(before + 1);
    expect(await db.aiLog.count({ where: { storeId: s.store.id, kind: 'assistant', provider: 'deepseek' } })).toBe(1);
    expect(f).toHaveBeenCalled();
  });

  it('Grow plan → Kimi (Moonshot, OpenAI-compatible); 2 credits', async () => {
    await plan('grow'); Object.assign(config, { kimiKey: 'sk-kimi', deepseekKey: 'sk-ds' });
    const urls: string[] = [];
    outside((url, init) => { urls.push(url); expect(JSON.parse(init.body).model).toBe('kimi-k2.6'); expect(init.headers.Authorization).toBe('Bearer sk-kimi'); return json({ choices: [{ message: { content: 'Salam! How can I help?' } }], usage: { prompt_tokens: 10, completion_tokens: 5 } }); });
    const r = (await chat('salam').expect(200)).body;
    expect(r).toMatchObject({ brand: 'VendOm AI Plus', credits: 2 }); expect(urls).toEqual(['https://api.moonshot.ai/v1/chat/completions']);
  });

  it('Advanced plan → Claude via the official SDK: tool loop edits the product; 5 credits', async () => {
    await plan('advanced'); Object.assign(config, { anthropicKey: 'sk-ant', anthropicModel: 'claude-opus-5-5' });
    const reqs: any[] = [];
    const first = { stop_reason: 'tool_use', content: [{ type: 'text', text: 'Updating the SEO title.' }, { type: 'tool_use', id: 'tu1', name: 'update_product', input: { productId: product.id, seoTitle: 'Lawn Kurta | Noor Lawn' } }], usage: { input_tokens: 1200, output_tokens: 60 } };
    const create = vi.fn(async (p: any) => { reqs.push(structuredClone(p)); return reqs.length === 1 ? first : { stop_reason: 'end_turn', content: [{ type: 'text', text: 'Done: the SEO title is set.' }], usage: { input_tokens: 1400, output_tokens: 12, cache_read_input_tokens: 1000 } }; });
    setClaudeClient({ beta: { messages: { create } } } as any);
    const before = await aiUsed();
    const r = (await chat('set a better SEO title for the lawn kurta').expect(200)).body;
    expect(r).toMatchObject({ brand: 'VendOm AI Pro', credits: 5, text: 'Done: the SEO title is set.' }); expect(JSON.stringify(r)).not.toMatch(/claude|anthropic/i);
    expect(r.steps).toEqual([{ tool: 'update_product', input: { productId: product.id, seoTitle: 'Lawn Kurta | Noor Lawn' }, ok: true }]);
    expect((await db.product.findUnique({ where: { id: product.id } }))!.seoTitle).toBe('Lawn Kurta | Noor Lawn');
    const q = reqs[0]; expect(q.model).toBe('claude-opus-5-5'); expect(q.fallbacks).toBe('default'); expect(q.betas).toContain('server-side-fallback-2026-07-01');
    expect(q.thinking).toBeUndefined(); expect(q.output_config).toEqual({ effort: 'medium' }); expect(q.system[0].cache_control).toEqual({ type: 'ephemeral' });
    expect(q.tools.find((t: any) => t.name === 'update_product').input_schema.required).toEqual(['productId']);
    const second = reqs[1].messages; expect(second[1]).toEqual({ role: 'assistant', content: first.content }); // assistant content passed back unchanged
    expect(second[2].role).toBe('user'); expect(second[2].content[0]).toMatchObject({ type: 'tool_result', tool_use_id: 'tu1' });
    expect(await aiUsed()).toBe(before + 5);
  });

  it('Claude refusal is reported; a failing provider falls back to the next model', async () => {
    await plan('advanced'); Object.assign(config, { anthropicKey: 'sk-ant', kimiKey: 'sk-kimi' });
    setClaudeClient({ beta: { messages: { create: async () => ({ stop_reason: 'refusal', content: [], usage: { input_tokens: 5, output_tokens: 0 } }) } } } as any);
    expect((await chat('hi').expect(200)).body).toMatchObject({ brand: 'VendOm AI Pro', refused: true });
    setClaudeClient({ beta: { messages: { create: async () => { throw new Error('overloaded'); } } } } as any);
    outside(() => json({ choices: [{ message: { content: 'From Kimi' } }], usage: {} }));
    expect((await chat('hi').expect(200)).body).toMatchObject({ brand: 'VendOm AI Plus', text: 'From Kimi' });
  });

  it('402 when the plan has no AI credits left (trial)', async () => {
    await db.subscription.update({ where: { storeId: s.store.id }, data: { planCode: 'grow', status: 'trialing' } }); Object.assign(config, { kimiKey: 'sk-kimi' });
    const it = (await A().get(S('/billing/usage')).set(tok())).body.items.find((i: any) => i.metric === 'ai');
    await record(s.store.id, 'ai', Math.max(0, it.included - it.used));
    outside(() => json({ choices: [{ message: { content: 'x' } }] }));
    await chat('hi').expect(402);
    await plan('advanced');
  });
});

describe('connectors (paste a link)', () => {
  it('detects the service from the link', () => {
    expect(detect('https://hooks.zapier.com/hooks/catch/1/abc/')).toMatchObject({ kind: 'webhook', provider: 'zapier' });
    expect(detect('https://hook.eu2.make.com/xyz')).toMatchObject({ kind: 'webhook', provider: 'make' });
    expect(detect('https://hooks.slack.com/services/T/B/x')).toMatchObject({ kind: 'webhook', provider: 'slack' });
    expect(detect('https://discord.com/api/webhooks/1/x')).toMatchObject({ kind: 'webhook', provider: 'discord' });
    expect(detect('https://my.n8n.cloud/webhook/abc')).toMatchObject({ kind: 'webhook', provider: 'n8n' });
    expect(detect('https://script.google.com/macros/s/x/exec')).toMatchObject({ provider: 'google-apps-script' });
    expect(detect('https://mcp.example.com/mcp')).toMatchObject({ kind: 'mcp' });
    expect(detect('https://api.example.com/openapi.json')).toMatchObject({ kind: 'api', provider: 'openapi' });
    expect(detect('https://www.facebook.com/mybrand')).toMatchObject({ kind: 'app', appId: 'meta' });
    expect(detect('https://www.tiktok.com/@shop')).toMatchObject({ kind: 'app', appId: 'tiktok' });
    expect(() => detect('not a link')).toThrow(/valid link/);
    expect(payload('slack', 'orders/create', { number: 1001, total: 350000, currency: 'PKR' }, 'Noor Lawn')).toEqual({ text: 'Noor Lawn: New order #1001 · 3500.00 PKR' });
    expect(payload('discord', 'test', {}, 'X')).toHaveProperty('content');
  });

  it('refuses private addresses (SSRF guard)', async () => {
    for (const url of ['http://127.0.0.1:4000/hook', 'https://10.0.0.5/x', 'https://192.168.1.1/x', 'https://169.254.169.254/latest', 'http://localhost/x'])
      expect((await A().post(S('/connectors')).set(tok()).send({ url }).expect(400)).body.error).toMatch(/Private/);
  });

  it('links a webhook, tests it, masks secrets and delivers real order events', async () => {
    const got: any[] = [];
    outside((url, init) => { got.push({ url, body: JSON.parse(init.body), headers: init.headers }); return new Response('ok', { status: 200 }); });
    const c = (await A().post(S('/connectors')).set(tok()).send({ url: `${PUBLIC}/hook?token=abc123`, key: 'sk-secret' }).expect(201)).body;
    expect(c).toMatchObject({ kind: 'webhook', provider: 'webhook', hasKey: true, lastTestOk: true }); expect(c.test.ok).toBe(true);
    expect(c.url).not.toContain('abc123'); expect(JSON.stringify(c)).not.toContain('sk-secret');
    expect(got[0].body.event).toBe('test'); expect(got[0].headers.Authorization).toBe('Bearer sk-secret');
    const app2 = (await A().post(S('/connectors')).set(tok()).send({ url: 'https://www.facebook.com/noorlawn' }).expect(200)).body;
    expect(app2.openApp).toBe('meta'); expect(await db.connector.count({ where: { storeId: s.store.id } })).toBe(1);
    // a real checkout fires orders/create to the connector
    await A().post(`/api/storefront/${s.store.handle}/checkout`).send({ lines: [{ variantId: product.variants[0].id, qty: 1 }], email: 'buyer@t.io', shipTo: { country: 'PK' }, payment: { source: 'tok_visa' } }).expect(201);
    await vi.waitFor(() => expect(got.some(g => g.body.event === 'orders/create')).toBe(true));
    const ev = got.find(g => g.body.event === 'orders/create').body; expect(ev.store).toBe('Noor Lawn'); expect(ev.data.total).toBeGreaterThan(0);
    expect((await A().get(S('/connectors')).set(tok()).expect(200)).body).toHaveLength(1);
    await A().delete(S(`/connectors/${c.id}`)).set(tok()).expect(204);
  });

  it('an MCP server link becomes tools for Claude', async () => {
    outside(() => json({ jsonrpc: '2.0', id: 1, result: {} }));
    const c = (await A().post(S('/connectors')).set(tok()).send({ url: `${PUBLIC}/mcp`, key: 'mcp-token' }).expect(201)).body;
    expect(c).toMatchObject({ kind: 'mcp', lastTestOk: true });
    await plan('advanced'); Object.assign(config, { anthropicKey: 'sk-ant' });
    const create = vi.fn(async (_p: any) => ({ stop_reason: 'end_turn', content: [{ type: 'text', text: 'ok' }], usage: { input_tokens: 1, output_tokens: 1 } }));
    setClaudeClient({ beta: { messages: { create } } } as any);
    await chat('use my tools').expect(200);
    const q = create.mock.calls[0][0];
    expect(q.betas).toContain('mcp-client-2025-11-20');
    expect(q.mcp_servers[0]).toMatchObject({ type: 'url', url: `${PUBLIC}/mcp`, authorization_token: 'mcp-token' });
    expect(q.tools.find((t: any) => t.type === 'mcp_toolset').mcp_server_name).toBe(q.mcp_servers[0].name);
  });
});
