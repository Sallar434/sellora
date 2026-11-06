import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db';
import { ah, parse, bad, slug } from '../lib/http';
import { storeAccess } from '../lib/auth';
import { llmChat } from '../providers/llm';
import { config } from '../lib/config';
export const r = Router();
const money = (n: number, c: string) => `${(n / 100).toFixed(2)} ${c}`;
const ask = async (sys: string, user: string, fallback: () => any, asJson = false) => { const o = await llmChat(sys + (asJson ? ' Reply with a single valid JSON object only.' : ''), user, { json: asJson }); const out = o?.text; if (out == null) return { source: 'template', result: fallback() }; if (!asJson) return { source: 'llm', result: out }; try { return { source: 'llm', result: JSON.parse(out.replace(/^```json|```$/g, '')) }; } catch { return { source: 'template', result: fallback() }; } };
const base = (s: any) => s.handle ? `${config.publicUrl}/s/${s.handle}` : config.publicUrl;
r.post('/:storeId/ai/store', storeAccess('online_store'), ah(async (req, res) => {
  const b = parse(z.object({ niche: z.string(), audience: z.string().optional(), tone: z.string().default('confident') }), req.body);
  const fb = () => ({ name: req.store.name, tagline: `${b.niche} built for ${b.audience || 'people who care about quality'}`, palette: { bg: '#FFFFFF', tx: '#000000', ac: '#0B6B3A', sec: '#D4AF37' }, sections: { home: [{ type: 'hero', settings: { heading: `The ${b.niche} you'll actually use`, sub: 'Shop the collection' } }, { type: 'featured', settings: { heading: 'Bestsellers' } }, { type: 'imgtext', settings: { heading: 'Why us', text: `We obsess over ${b.niche}.` } }, { type: 'testimonials', settings: {} }, { type: 'faq', settings: {} }, { type: 'newsletter', settings: {} }] }, collections: ['New arrivals', 'Bestsellers', 'Sale'], pages: ['About us', 'Contact', 'Shipping & returns'] });
  const out = await ask('You design ecommerce stores. Return {name,tagline,palette:{bg,tx,ac,sec},sections:{home:[{type,settings}]},collections:[],pages:[]}', JSON.stringify(b), fb, true);
  if (req.body?.apply) await db.theme.create({ data: { storeId: req.store.id, name: 'AI theme', palette: out.result.palette, sections: out.result.sections } });
  res.json(out);
}));
r.post('/:storeId/ai/product-copy', storeAccess('products'), ah(async (req, res) => {
  const b = parse(z.object({ title: z.string(), features: z.array(z.string()).default([]), tone: z.string().default('clear') }), req.body);
  res.json(await ask('Write a concise, benefit-led product description (HTML <p>/<ul>).', JSON.stringify(b), () => `<p>${b.title} — made to perform.</p>${b.features.length ? '<ul>' + b.features.map(f => `<li>${f}</li>`).join('') + '</ul>' : ''}`));
}));
r.post('/:storeId/ai/meta', storeAccess('products'), ah(async (req, res) => {
  const b = parse(z.object({ title: z.string(), description: z.string().default('') }), req.body);
  res.json(await ask('Return {metaTitle (<=60 chars), metaDescription (<=155 chars)}', JSON.stringify(b), () => ({ metaTitle: `${b.title} | ${req.store.name}`.slice(0, 60), metaDescription: (b.description.replace(/<[^>]+>/g, '') || `Shop ${b.title} at ${req.store.name}.`).slice(0, 155) }), true));
}));
r.post('/:storeId/ai/seo-content', storeAccess('online_store'), ah(async (req, res) => {
  const b = parse(z.object({ topic: z.string(), kind: z.enum(['seo', 'aeo', 'geo']).default('seo'), keywords: z.array(z.string()).default([]) }), req.body);
  const fb = () => ({ title: b.topic, outline: ['What it is', 'How to choose', 'FAQ'], faq: [{ q: `What is ${b.topic}?`, a: `${b.topic} explained simply.` }], tips: b.kind === 'aeo' ? ['Lead with a direct 40-word answer', 'Use FAQ schema'] : b.kind === 'geo' ? ['Cite facts and sources', 'Use clear entity names', 'Publish llms.txt'] : ['Target one primary keyword', 'Internal links to collections'] });
  res.json(await ask(`Write ${b.kind.toUpperCase()}-optimised content plan as JSON {title,outline,faq:[{q,a}],tips}`, JSON.stringify(b), fb, true));
}));
async function storeData(storeId: string) { const [s, ps, cs, pages] = await Promise.all([db.store.findUniqueOrThrow({ where: { id: storeId } }), db.product.findMany({ where: { storeId, status: 'active' }, include: { variants: true } }), db.collection.findMany({ where: { storeId } }), db.page.findMany({ where: { storeId, visible: true } })]); return { s, ps, cs, pages }; }
export async function jsonLd(storeId: string) { const { s, ps } = await storeData(storeId); return [{ '@context': 'https://schema.org', '@type': 'Organization', name: s.name, url: base(s) }, ...ps.map(p => ({ '@context': 'https://schema.org', '@type': 'Product', name: p.title, description: p.description.replace(/<[^>]+>/g, ''), image: (p.images as string[]) || [], sku: p.variants[0]?.sku, offers: { '@type': 'Offer', price: (p.price / 100).toFixed(2), priceCurrency: s.currency, availability: p.variants.some(v => v.inventory > 0) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', url: `${base(s)}/products/${p.handle}` } }))]; }
export async function sitemap(storeId: string) { const { s, ps, cs, pages } = await storeData(storeId); const u = [base(s), ...ps.map(p => `${base(s)}/products/${p.handle}`), ...cs.map(c => `${base(s)}/collections/${c.handle}`), ...pages.map(p => `${base(s)}/pages/${p.handle}`)]; return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${u.map(x => `  <url><loc>${x}</loc></url>`).join('\n')}\n</urlset>`; }
export async function robots(storeId: string) { const { s } = await storeData(storeId); return `User-agent: *\nAllow: /\nDisallow: /cart\nDisallow: /checkout\nSitemap: ${base(s)}/sitemap.xml\n`; }
export async function llmsTxt(storeId: string) { const { s, ps, cs, pages } = await storeData(storeId); return `# ${s.name}\n\n> Online store on Sellora. Currency: ${s.currency}.\n\n## Collections\n${cs.map(c => `- [${c.title}](${base(s)}/collections/${c.handle})`).join('\n')}\n\n## Products\n${ps.map(p => `- [${p.title}](${base(s)}/products/${p.handle}): ${money(p.price, s.currency)}`).join('\n')}\n\n## Pages\n${pages.map(p => `- [${p.title}](${base(s)}/pages/${p.handle})`).join('\n')}\n`; }
r.get('/:storeId/ai/json-ld', storeAccess(), ah(async (req, res) => res.json(await jsonLd(req.store.id))));
r.get('/:storeId/ai/sitemap.xml', storeAccess(), ah(async (req, res) => res.type('application/xml').send(await sitemap(req.store.id))));
r.get('/:storeId/ai/robots.txt', storeAccess(), ah(async (req, res) => res.type('text/plain').send(await robots(req.store.id))));
r.get('/:storeId/ai/llms.txt', storeAccess(), ah(async (req, res) => res.type('text/plain').send(await llmsTxt(req.store.id))));
r.get('/:storeId/ai/seo-audit', storeAccess(), ah(async (req, res) => {
  const { ps, cs, pages } = await storeData(req.store.id); const issues: any[] = [];
  for (const p of ps) { if (!p.seoTitle) issues.push({ type: 'product', id: p.id, title: p.title, issue: 'Missing meta title' }); if (!p.seoDesc) issues.push({ type: 'product', id: p.id, title: p.title, issue: 'Missing meta description' }); if (!((p.images as any[]) || []).length) issues.push({ type: 'product', id: p.id, title: p.title, issue: 'No images (alt text impossible)' }); if (p.description.replace(/<[^>]+>/g, '').length < 120) issues.push({ type: 'product', id: p.id, title: p.title, issue: 'Thin description (<120 chars)' }); }
  for (const c of cs) if (!c.description) issues.push({ type: 'collection', id: c.id, title: c.title, issue: 'No collection description' });
  for (const p of pages) if (!p.seoDesc) issues.push({ type: 'page', id: p.id, title: p.title, issue: 'Missing meta description' });
  const checks = ps.length * 4 + cs.length + pages.length || 1; res.json({ score: Math.max(0, Math.round(100 * (1 - issues.length / checks))), issues });
}));
r.post('/:storeId/ai/offpage-plan', storeAccess(), ah(async (req, res) => res.json(await ask('Create a 30-day off-page SEO plan JSON {weeks:[{week,tasks:[]}]}', `${req.store.name} ${req.body?.niche || ''}`, () => ({ weeks: [{ week: 1, tasks: ['Claim Google Business Profile', 'Submit sitemap to Search Console & Bing'] }, { week: 2, tasks: ['List on 10 niche directories', 'Pitch 5 bloggers for reviews'] }, { week: 3, tasks: ['Publish 2 guest posts', 'Start Reddit/Quora answers with value'] }, { week: 4, tasks: ['Run a giveaway with a partner brand', 'Collect & publish customer reviews'] }] }), true))));
/** Voice: browser does speech-to-text; we parse the transcript into actions and (optionally) execute. */
r.post('/:storeId/voice', storeAccess('products'), ah(async (req, res) => {
  const { transcript, execute } = parse(z.object({ transcript: z.string().min(1), execute: z.boolean().default(false) }), req.body);
  const t = transcript.toLowerCase().trim(); let action: any = { type: 'unknown', transcript };
  let m;
  if ((m = t.match(/(?:add|create) (?:a )?product (?:called |named )?(.+?)(?: (?:for|at|price) \$?([\d.]+))?$/))) action = { type: 'product.create', title: m[1].replace(/\b\w/g, c => c.toUpperCase()), price: m[2] ? Math.round(+m[2] * 100) : 0 };
  else if ((m = t.match(/(?:create|make) (?:a )?discount (?:code )?(\w+)(?: for)? (\d+) ?(?:%|percent)/))) action = { type: 'discount.create', code: m[1].toUpperCase(), value: +m[2] };
  else if ((m = t.match(/(?:go to|open|show) (.+)/))) action = { type: 'navigate', route: slug(m[1]) };
  else if (/sales|revenue/.test(t)) action = { type: 'report.sales' };
  let result: any = null;
  if (execute && action.type === 'product.create') result = await db.product.create({ data: { storeId: req.store.id, title: action.title, handle: slug(action.title) + '-' + Date.now().toString(36), price: action.price, status: 'draft', variants: { create: [{ title: 'Default' }] } } });
  if (execute && action.type === 'discount.create') result = await db.discount.create({ data: { storeId: req.store.id, code: action.code, kind: 'percent', value: action.value } });
  if (action.type === 'report.sales') { const os = await db.order.findMany({ where: { storeId: req.store.id, draft: false, status: { not: 'cancelled' } } }); result = { orders: os.length, revenue: os.reduce((s, o) => s + o.total - o.refunded, 0) }; }
  res.json({ action, executed: !!(execute && result), result });
}));
/** Analytics computed from real orders */
r.get('/:storeId/analytics', storeAccess('analytics'), ah(async (req, res) => {
  const days = +(req.query.days || 30); const since = new Date(Date.now() - days * 864e5);
  const os = await db.order.findMany({ where: { storeId: req.store.id, draft: false, createdAt: { gte: since } }, include: { lines: true } });
  const live = os.filter(o => o.status !== 'cancelled'); const gross = live.reduce((s, o) => s + o.subtotal, 0); const net = live.reduce((s, o) => s + o.total - o.refunded, 0);
  const byDay: Record<string, number> = {}; live.forEach(o => { const d = o.createdAt.toISOString().slice(0, 10); byDay[d] = (byDay[d] || 0) + o.total - o.refunded; });
  const prod: Record<string, { title: string; qty: number; revenue: number }> = {}; live.forEach(o => o.lines.forEach(l => { const k = l.productId || l.title; prod[k] = prod[k] || { title: l.title, qty: 0, revenue: 0 }; prod[k].qty += l.qty - l.refundedQty; prod[k].revenue += l.price * (l.qty - l.refundedQty); }));
  const emails = live.map(o => o.email); const repeat = new Set(emails.filter((e, i) => emails.indexOf(e) !== i)).size;
  const carts = await db.cart.count({ where: { storeId: req.store.id, createdAt: { gte: since } } });
  res.json({ currency: req.store.currency, days, orders: live.length, cancelled: os.length - live.length, grossSales: gross, discounts: live.reduce((s, o) => s + o.discount, 0), refunds: live.reduce((s, o) => s + o.refunded, 0), shipping: live.reduce((s, o) => s + o.shipping, 0), taxes: live.reduce((s, o) => s + o.tax, 0), netSales: net, aov: live.length ? Math.round(net / live.length) : 0, customers: new Set(emails).size, repeatCustomers: repeat, conversionRate: carts ? +(live.length / carts).toFixed(3) : null, salesByDay: byDay, topProducts: Object.values(prod).sort((a, b) => b.revenue - a.revenue).slice(0, 10) });
}));
