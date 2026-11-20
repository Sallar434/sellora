/**
 * VendOm AI assistant (chat) and connectors API.
 * The assistant's tools call this same API in-process with the seller's own token, so it has exactly the
 * seller's permissions, plan limits and audit trail; it cannot do anything the seller could not do by hand.
 */
import { Router, Request } from 'express';
import { AddressInfo } from 'net';
import { z } from 'zod';
import { db } from '../lib/db';
import { ah, parse, nf, bad } from '../lib/http';
import { storeAccess } from '../lib/auth';
import { config } from '../lib/config';
import { check, record, getSub } from '../lib/billing';
import { INTERNAL_TOKEN } from '../lib/internal';
import { runAgent, providersFor, modelOf, configured, ToolDef, ChatTurn, McpServer, Provider } from '../providers/ai/agent';
import { detect, assertPublicUrl, test as testConnector, sealKey, EVENTS } from '../lib/connectors';
import { decrypt } from '../lib/crypto';

export const r = Router();

/* ---------------- Connectors ---------------- */
const view = (c: any) => ({ id: c.id, kind: c.kind, provider: c.provider, name: c.name, url: c.url.replace(/([?&](key|token|secret|sig)=)[^&]+/gi, '$1•••'), events: c.events, hasKey: !!c.credentialsEnc, status: c.status, lastTestAt: c.lastTestAt, lastTestOk: c.lastTestOk, createdAt: c.createdAt });
r.get('/:storeId/connectors', storeAccess('apps'), ah(async (req, res) => res.json((await db.connector.findMany({ where: { storeId: req.store.id }, orderBy: { createdAt: 'desc' } })).map(view))));
r.post('/:storeId/connectors/detect', storeAccess('apps'), ah(async (req, res) => {
  const { url } = parse(z.object({ url: z.string().min(8).max(2000) }), req.body);
  try { res.json({ ...detect(url), events: EVENTS }); } catch (e: any) { throw bad(e.message); }
}));
r.post('/:storeId/connectors', storeAccess('apps'), ah(async (req, res) => {
  const b = parse(z.object({ url: z.string().min(8).max(2000), name: z.string().max(80).optional(), key: z.string().max(4000).optional(), events: z.array(z.enum(EVENTS)).optional() }), req.body);
  let d; try { d = detect(b.url); } catch (e: any) { throw bad(e.message); }
  if (d.kind === 'app') return res.json({ ...d, openApp: d.appId }); // built-in app: the admin opens its install screen (nothing is fetched)
  try { await assertPublicUrl(b.url); } catch (e: any) { throw bad(e.message); }
  const c = await db.connector.create({ data: { storeId: req.store.id, kind: d.kind, provider: d.provider, name: b.name || d.name, url: b.url.trim(), events: d.kind === 'webhook' ? (b.events || d.events || []) : [], credentialsEnc: sealKey(b.key) } });
  const t = await testConnector(c, req.store.name);
  const saved = await db.connector.update({ where: { id: c.id }, data: { lastTestAt: new Date(), lastTestOk: t.ok } });
  res.status(201).json({ ...view(saved), test: t });
}));
r.patch('/:storeId/connectors/:id', storeAccess('apps'), ah(async (req, res) => {
  const c = await db.connector.findFirst({ where: { id: req.params.id, storeId: req.store.id } }); if (!c) throw nf();
  const b = parse(z.object({ name: z.string().max(80).optional(), key: z.string().max(4000).nullish(), events: z.array(z.enum(EVENTS)).optional(), status: z.enum(['connected', 'paused']).optional() }), req.body);
  res.json(view(await db.connector.update({ where: { id: c.id }, data: { name: b.name, events: b.events, status: b.status, ...(b.key !== undefined ? { credentialsEnc: sealKey(b.key) } : {}) } })));
}));
r.post('/:storeId/connectors/:id/test', storeAccess('apps'), ah(async (req, res) => {
  const c = await db.connector.findFirst({ where: { id: req.params.id, storeId: req.store.id } }); if (!c) throw nf();
  const t = await testConnector(c, req.store.name); await db.connector.update({ where: { id: c.id }, data: { lastTestAt: new Date(), lastTestOk: t.ok } }); res.json(t);
}));
r.delete('/:storeId/connectors/:id', storeAccess('apps'), ah(async (req, res) => {
  const c = await db.connector.findFirst({ where: { id: req.params.id, storeId: req.store.id } }); if (!c) throw nf();
  await db.connector.delete({ where: { id: c.id } }); res.status(204).end();
}));

/* ---------------- Assistant ---------------- */
let selfBase: Promise<string> | null = null;
function base() { // the API itself on a private loopback port, started on first use
  return (selfBase ||= import('../app').then(({ createApp }) => new Promise<string>(ok => { const s = createApp().listen(0, '127.0.0.1', () => ok(`http://127.0.0.1:${(s.address() as AddressInfo).port}`)); s.unref(); })));
}
async function call(req: Request, method: string, path: string, body?: any) {
  const r = await fetch((await base()) + `/api/stores/${req.store.id}` + path, { method, headers: { Authorization: String(req.headers.authorization || ''), 'Content-Type': 'application/json', 'x-vendom-internal': INTERNAL_TOKEN }, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text(); let j: any; try { j = t ? JSON.parse(t) : {}; } catch { j = { text: t }; }
  if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
  return j;
}
const money = (minor: number, cur: string) => `${(minor / 100).toFixed(2)} ${cur}`;

const S = (props: Record<string, any>, required: string[] = []): ToolDef['parameters'] => ({ type: 'object', properties: props, required });
export const TOOLS: ToolDef[] = [
  { name: 'sales_summary', description: 'Sales, orders, average order value, top products and repeat customers for the last N days.', parameters: S({ days: { type: 'integer', minimum: 1, maximum: 365, description: 'Default 30' } }) },
  { name: 'list_orders', description: 'List recent orders, optionally only unfulfilled, unpaid, cancelled or refunded ones, or matching an email/order number.', parameters: S({ filter: { type: 'string', enum: ['all', 'unfulfilled', 'unpaid', 'cancelled', 'refunded'] }, search: { type: 'string' }, limit: { type: 'integer', minimum: 1, maximum: 50 } }) },
  { name: 'get_order', description: 'Full details of one order by its number (e.g. 1004), including lines, payment, escrow and timeline.', parameters: S({ number: { type: 'integer' } }, ['number']) },
  { name: 'fulfill_order', description: 'Mark an order as shipped with an optional courier and tracking number. Only when the seller asked to fulfil it.', parameters: S({ number: { type: 'integer' }, carrier: { type: 'string' }, tracking: { type: 'string' } }, ['number']) },
  { name: 'list_products', description: 'List products with price, stock, status and whether SEO title/description are set. Can filter by text or low stock.', parameters: S({ search: { type: 'string' }, lowStockBelow: { type: 'integer', minimum: 0 }, limit: { type: 'integer', minimum: 1, maximum: 100 } }) },
  { name: 'update_product', description: 'Change a product: title, description (HTML), SEO title, SEO description, price (in minor units, e.g. Rs 1,500 = 150000) or status.', parameters: S({ productId: { type: 'string' }, title: { type: 'string' }, description: { type: 'string' }, seoTitle: { type: 'string' }, seoDesc: { type: 'string' }, price: { type: 'integer', minimum: 0 }, status: { type: 'string', enum: ['active', 'draft', 'archived'] } }, ['productId']) },
  { name: 'write_product_copy', description: 'Write optimised product descriptions in English, Urdu and/or Arabic, optionally saving them to the product.', parameters: S({ productId: { type: 'string' }, langs: { type: 'array', items: { type: 'string', enum: ['en', 'ur', 'ar'] } }, save: { type: 'boolean' } }, ['productId']) },
  { name: 'seo_audit', description: 'Run a full SEO audit of the store: score, issues (missing meta, thin content, alt text, duplicates, broken links) and which can be fixed automatically.', parameters: S({}) },
  { name: 'seo_fix', description: 'Apply the automatic SEO fixes: all of them, or only the issue ids given.', parameters: S({ all: { type: 'boolean' }, ids: { type: 'array', items: { type: 'string' } } }) },
  { name: 'aeo_answers', description: 'AEO: write answer-first FAQ blocks for a topic so AI assistants and Google answer boxes quote the store.', parameters: S({ topic: { type: 'string' } }, ['topic']) },
  { name: 'geo_summary', description: 'GEO: write entity summaries and quotable lines about a topic for generative search engines (ChatGPT, Gemini, Perplexity, AI Overviews).', parameters: S({ topic: { type: 'string' } }, ['topic']) },
  { name: 'keyword_research', description: 'Keyword ideas and clusters for a seed term and country.', parameters: S({ seed: { type: 'string' }, country: { type: 'string', description: 'ISO code, default PK' } }, ['seed']) },
  { name: 'content_calendar', description: 'Plan blog posts for the next weeks.', parameters: S({ weeks: { type: 'integer', minimum: 1, maximum: 26 }, perWeek: { type: 'integer', minimum: 1, maximum: 5 } }) },
  { name: 'social_posts', description: 'Write social posts for a product or topic.', parameters: S({ productId: { type: 'string' }, topic: { type: 'string' }, platforms: { type: 'array', items: { type: 'string', enum: ['facebook', 'instagram', 'x', 'linkedin', 'tiktok', 'whatsapp'] } } }) },
  { name: 'build_website', description: 'Generate a complete store (theme, home sections, products, collections, pages, policies, blog) from a description. Set apply=true only after the seller confirms.', parameters: S({ description: { type: 'string' }, apply: { type: 'boolean' }, products: { type: 'integer', minimum: 1, maximum: 12 } }, ['description']) },
  { name: 'edit_website', description: 'Change the live theme with a plain-language command, e.g. "make the header black", "add an FAQ section".', parameters: S({ command: { type: 'string' } }, ['command']) },
  { name: 'create_discount', description: 'Create a discount code. kind: percent (value = percent), fixed (value in minor units), free_shipping, bogo. Ask before creating.', parameters: S({ code: { type: 'string' }, kind: { type: 'string', enum: ['percent', 'fixed', 'free_shipping', 'bogo'] }, value: { type: 'integer', minimum: 0 }, minSpend: { type: 'integer', minimum: 0 }, usageLimit: { type: 'integer', minimum: 1 }, endsAt: { type: 'string', description: 'ISO date' } }, ['code', 'kind', 'value']) },
  { name: 'list_connectors', description: 'Which outside tools (Zapier, Slack, Google Sheets, MCP servers, APIs) are connected to the store.', parameters: S({}) },
];

export async function runTool(req: Request, name: string, a: any): Promise<string> {
  const cur = req.store.currency;
  const j = (x: any) => JSON.stringify(x);
  switch (name) {
    case 'sales_summary': { const x = await call(req, 'GET', `/analytics?days=${a.days || 30}`); return j({ ...x, note: `money in ${cur} minor units` }); }
    case 'list_orders': {
      let os: any[] = await call(req, 'GET', '/orders'); const f = a.filter || 'all', q = String(a.search || '').toLowerCase();
      os = os.filter(o => f === 'all' || (f === 'unfulfilled' && o.fulfillment !== 'fulfilled' && o.status !== 'cancelled') || (f === 'unpaid' && ['pending'].includes(o.financial)) || (f === 'cancelled' && o.status === 'cancelled') || (f === 'refunded' && /refunded/.test(o.financial)));
      if (q) os = os.filter(o => String(o.number) === q.replace('#', '') || String(o.email).toLowerCase().includes(q));
      return j(os.slice(0, a.limit || 15).map(o => ({ number: o.number, email: o.email, total: money(o.total, o.currency), payment: o.financial, fulfillment: o.fulfillment, status: o.status, placed: o.createdAt, items: (o.lines || []).map((l: any) => `${l.qty}× ${l.title}`) })));
    }
    case 'get_order': case 'fulfill_order': {
      const os: any[] = await call(req, 'GET', '/orders'); const o = os.find(x => x.number === +a.number); if (!o) return j({ error: `No order #${a.number}` });
      if (name === 'fulfill_order') { const d = await call(req, 'POST', `/orders/${o.id}/fulfill`, { carrier: a.carrier, tracking: a.tracking }); return j({ done: true, number: d.number, fulfillment: d.fulfillment }); }
      return j(await call(req, 'GET', `/orders/${o.id}`));
    }
    case 'list_products': {
      let ps: any[] = await call(req, 'GET', '/products'); const q = String(a.search || '').toLowerCase();
      if (q) ps = ps.filter(p => p.title.toLowerCase().includes(q) || (p.tags || []).join(' ').toLowerCase().includes(q));
      const rows = ps.map(p => ({ id: p.id, title: p.title, status: p.status, price: money(p.price, cur), stock: (p.variants || []).reduce((s: number, v: any) => s + (v.inventory || 0), 0), seoTitle: !!p.seoTitle, seoDesc: !!p.seoDesc, descriptionWords: String(p.description || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length }));
      return j(rows.filter(p => a.lowStockBelow == null || p.stock < a.lowStockBelow).slice(0, a.limit || 30));
    }
    case 'update_product': { const { productId, ...d } = a; const p = await call(req, 'PATCH', `/products/${productId}`, d); return j({ done: true, id: p.id, title: p.title, seoTitle: p.seoTitle, seoDesc: p.seoDesc, price: money(p.price, cur), status: p.status }); }
    case 'write_product_copy': return j(await call(req, 'POST', '/ai/describe', { productId: a.productId, langs: a.langs || ['en'], save: !!a.save }));
    case 'seo_audit': { const x = await call(req, 'GET', '/seo/audit'); return j({ score: x.score, issues: (x.issues || []).slice(0, 40).map((i: any) => ({ id: i.id, severity: i.severity, message: i.message || i.msg || i.title, autoFix: !!i.fix })), total: (x.issues || []).length }); }
    case 'seo_fix': return j(await call(req, 'POST', '/seo/fix', a.ids?.length ? { ids: a.ids } : { all: true }));
    case 'aeo_answers': return j(await call(req, 'POST', '/seo/aeo', { topic: a.topic, save: true }));
    case 'geo_summary': return j(await call(req, 'POST', '/seo/geo', { topic: a.topic }));
    case 'keyword_research': return j(await call(req, 'POST', '/seo/keywords', { seed: a.seed, country: a.country || 'PK' }));
    case 'content_calendar': return j(await call(req, 'POST', '/seo/calendar', { weeks: a.weeks || 8, perWeek: a.perWeek || 1 }));
    case 'social_posts': return j(await call(req, 'POST', '/ai/social', { productId: a.productId, topic: a.topic, ...(a.platforms ? { platforms: a.platforms } : {}) }));
    case 'build_website': { const x = await call(req, 'POST', '/ai/site/build', { prompt: a.description, apply: !!a.apply, products: a.products || 4 }); return j({ applied: !!a.apply, created: x.created, name: x.site?.name, tagline: x.site?.tagline, products: (x.site?.products || []).map((p: any) => p.title), pages: (x.site?.pages || []).map((p: any) => p.title) }); }
    case 'edit_website': return j(await call(req, 'POST', '/ai/site/edit', { command: a.command, apply: true }));
    case 'create_discount': { const d = await call(req, 'POST', '/discounts', { code: a.code, kind: a.kind, value: a.value, minSpend: a.minSpend || 0, usageLimit: a.usageLimit, endsAt: a.endsAt }); return j({ done: true, code: d.code, kind: d.kind, value: d.value }); }
    case 'list_connectors': return j(await call(req, 'GET', '/connectors'));
    default: throw new Error(`Unknown tool ${name}`);
  }
}

function systemPrompt(store: any) {
  return [
    `You are VendOm AI, the built-in assistant of the VendOm store "${store.name}" (currency ${store.currency}).`,
    'You help the seller run the store: sales and order questions, products, SEO, AEO (answer engines), GEO (generative search), content, social posts, discounts and building or editing the website.',
    'Use the tools to read real store data and to make changes; never invent numbers, orders or products.',
    'Prices and money in tool inputs and outputs are integer minor units (100 = 1.00).',
    'Before changes that affect many items, publish a new website, or create a discount, say what you will do and wait for the seller to confirm. Small edits the seller asked for directly can be done right away.',
    'After acting, say briefly what changed. Reply in the language the seller writes in (English, Urdu, Arabic, …). Keep answers short and practical.',
  ].join('\n');
}

/** Built-in replies when no AI provider key is set: runs the obvious tool for the question. */
async function localReply(req: Request, text: string): Promise<{ text: string; steps: any[] }> {
  const t = text.toLowerCase(), steps: any[] = [];
  const go = async (n: string, a: any = {}) => { steps.push({ tool: n, input: a, ok: true }); return JSON.parse(await runTool(req, n, a)); };
  if (/\b(fix)\b.*\bseo\b|\bseo\b.*\bfix\b/.test(t)) { const x = await go('seo_fix', { all: true }); return { text: `Done. I applied the automatic SEO fixes${x.fixed ? ` (${x.fixed.length})` : ''}.`, steps }; }
  if (/\bseo|audit\b/.test(t)) { const x = await go('seo_audit'); return { text: `Your SEO score is ${x.score}/100 with ${x.total} issues. ${x.issues.filter((i: any) => i.autoFix).length} can be fixed automatically. Say "fix SEO" to apply them.`, steps }; }
  if (/unfulfil|pending|ship|order/.test(t)) { const x = await go('list_orders', { filter: /unfulfil|pending|ship/.test(t) ? 'unfulfilled' : 'all', limit: 10 }); return { text: x.length ? `${x.length} order(s):\n` + x.map((o: any) => `#${o.number} · ${o.total} · ${o.payment} · ${o.fulfillment}`).join('\n') : 'No matching orders.', steps }; }
  if (/stock|inventory/.test(t)) { const x = await go('list_products', { lowStockBelow: 5 }); return { text: x.length ? 'Low stock:\n' + x.map((p: any) => `${p.title}: ${p.stock}`).join('\n') : 'Nothing is low on stock.', steps }; }
  if (/sale|revenue|how.*doing|summary/.test(t)) { const x = await go('sales_summary', { days: 30 }); return { text: `Last 30 days: ${x.orders ?? x.count ?? 0} orders, net sales ${((x.net || 0) / 100).toFixed(2)} ${req.store.currency}.`, steps }; }
  return { text: 'I can check sales and orders, find low stock, audit and fix SEO, write product copy, plan content, create discounts and build or edit your website. AI models are not connected yet, so I answer simple requests only.', steps };
}

r.get('/:storeId/assistant', storeAccess(), ah(async (req, res) => {
  const sub = await getSub(req.store.id); const order = providersFor(sub.planCode);
  const p = order[0] as Provider | undefined;
  res.json({ plan: sub.planCode, provider: p || 'local', model: p ? modelOf(p) : 'built-in', creditsPerReply: config.aiCredits[p || 'local'], fallbacks: order.slice(1), configured: { deepseek: configured('deepseek'), kimi: configured('kimi'), claude: configured('claude') }, tools: TOOLS.map(t => t.name) });
}));

r.post('/:storeId/assistant/chat', storeAccess(), ah(async (req, res) => {
  const b = parse(z.object({ messages: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().min(1).max(8000) })).min(1).max(40) }), req.body);
  if (b.messages[b.messages.length - 1].role !== 'user') throw bad('The last message must be from the seller');
  const history: ChatTurn[] = b.messages.slice(-20); while (history[0]?.role !== 'user') history.shift();
  const sub = await getSub(req.store.id); const first = providersFor(sub.planCode)[0] || 'local';
  await check(req.store.id, 'ai', config.aiCredits[first] || 0); // 402 when the plan's AI credits are used up and overage is off
  const mcp: McpServer[] = (await db.connector.findMany({ where: { storeId: req.store.id, kind: 'mcp', status: 'connected' } })).map(c => ({ name: c.provider + '-' + c.id.slice(-6), url: c.url, token: c.credentialsEnc ? decrypt(c.credentialsEnc) : undefined }));
  const out = await runAgent(sub.planCode, systemPrompt(req.store), history, TOOLS, (n, a) => runTool(req, n, a), mcp);
  if (!out) { const l = await localReply(req, history[history.length - 1].content); return res.json({ provider: 'local', model: 'built-in', credits: 0, ...l }); }
  const credits = config.aiCredits[out.provider] || 1;
  await record(req.store.id, 'ai', credits, 'assistant');
  await db.aiLog.create({ data: { storeId: req.store.id, kind: 'assistant', credits, provider: out.provider, model: out.model, inputTokens: out.inputTokens, outputTokens: out.outputTokens, estUsd: out.estUsd } });
  res.json({ provider: out.provider, model: out.model, credits, text: out.text, steps: out.steps, refused: !!out.refused });
}));
