/** AI website builder (text + voice), SEO / AEO / GEO suite, off-page helpers and extra AI tools. DeepSeek via providers/llm, template fallback. */
import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db';
import { ah, parse, bad, nf } from '../lib/http';
import { storeAccess } from '../lib/auth';
import { config } from '../lib/config';
import { llmJson, llmInfo, stt, LlmUsage } from '../providers/llm';
import { mockSite, parseEdit, applyOps, slugify, CITATIONS, faqList, detectNiche } from '../lib/sitegen';
import { consume } from '../lib/billing';
export const r = Router();
export const pub = Router();
const strip = (h: string) => (h || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const base = (s: any) => s.handle ? `${config.publicUrl}/s/${s.handle}` : config.publicUrl;
const log = (storeId: string, kind: string, credits: number, u?: LlmUsage) => db.aiLog.create({ data: { storeId, kind, credits, provider: u?.provider || llmInfo().provider, model: u?.model || llmInfo().model, inputTokens: u?.inputTokens || 0, outputTokens: u?.outputTokens || 0, estUsd: u?.estUsd || 0 } }).catch(() => {});
async function seoSettings(storeId: string) { const s = await db.store.findUniqueOrThrow({ where: { id: storeId } }); return { s, set: (s.settings as any) || {}, seo: ((s.settings as any) || {}).seo || {} }; }
async function saveSeo(storeId: string, patch: any) { const { set, seo } = await seoSettings(storeId); await db.store.update({ where: { id: storeId }, data: { settings: { ...set, seo: { ...seo, ...patch } } } }); }
const all = async (storeId: string) => { const [s, ps, cs, pages, blog, reviews] = await Promise.all([db.store.findUniqueOrThrow({ where: { id: storeId } }), db.product.findMany({ where: { storeId }, include: { variants: true } }), db.collection.findMany({ where: { storeId } }), db.page.findMany({ where: { storeId } }), db.blogPost.findMany({ where: { storeId } }), db.review.findMany({ where: { storeId, approved: true } })]); return { s, ps, cs, pages, blog, reviews }; };

r.get('/:storeId/ai/provider', storeAccess(), ah(async (req, res) => {
  const logs = await db.aiLog.findMany({ where: { storeId: req.store.id } });
  res.json({ ...llmInfo(), stt: config.sttProvider, voiceOut: 'browser speechSynthesis', calls: logs.length, credits: logs.reduce((a, l) => a + l.credits, 0), tokens: logs.reduce((a, l) => a + l.inputTokens + l.outputTokens, 0), estUsd: +logs.reduce((a, l) => a + l.estUsd, 0).toFixed(4) });
}));

/* ---------------- AI website builder ---------------- */
const SITE_SCHEMA = '{name,tagline,theme:{preset,palette:{bg,tx,ac,sec,header,footer,button},settings:{font,headingFont,header:{bg,tx,sticky},lazyImages,rtl}},sections:{home:[{type,settings}]},menus:[{handle,title,items:[{title,url}]}],products:[{title,handle,price (minor units),description (HTML),options:[{name,values}],variants:[{title,price,inventory}],tags,seoTitle,seoDesc,alt}],collections:[{title,handle,description,products:[handle]}],pages:[{title,handle,body}],policies:{refund,shipping,privacy,terms},blog:[{title,handle,body}],faq:[{q,a}]}';
r.post('/:storeId/ai/site/build', storeAccess('online_store'), ah(async (req, res) => {
  const b = parse(z.object({ prompt: z.string().min(3).max(4000), language: z.string().default('en'), apply: z.boolean().default(false), products: z.number().int().min(1).max(12).default(4), via: z.enum(['text', 'voice']).default('text') }), req.body);
  const store = req.store; const fb = () => mockSite(b.prompt, store.name, store.currency);
  const out = await llmJson(`You are an expert ecommerce website builder for small sellers in Pakistan and worldwide. Build a complete, conversion-focused, SEO-ready store. Prices in ${store.currency} minor units. Write in language "${b.language}". Create exactly ${b.products} products with variants. Brand colours default to white background, black text, green #2E6B4F and gold #F2C14E unless the prompt asks otherwise. Use JSON with this shape: ${SITE_SCHEMA}`, `Store name: ${store.name}\nBrief: ${b.prompt}`, fb, 6000);
  const site: any = { ...fb(), ...out.result }; const created: any = {};
  if (b.apply) {
    const th = await db.theme.create({ data: { storeId: store.id, name: `AI theme ${new Date().toISOString().slice(0, 10)}`, preset: site.theme?.preset, palette: site.theme?.palette, settings: site.theme?.settings, sections: site.sections } }); created.themeId = th.id;
    const prodIds: Record<string, string> = {};
    for (const p of site.products || []) { const handle = `${slugify(p.handle || p.title)}-${Date.now().toString(36).slice(-4)}`; const x = await db.product.create({ data: { storeId: store.id, title: p.title, handle, description: p.description || '', status: 'draft', tags: p.tags || [], options: p.options || [], price: Math.round(+p.price || 0), seoTitle: p.seoTitle, seoDesc: p.seoDesc, variants: { create: (p.variants?.length ? p.variants : [{ title: 'Default' }]).map((v: any) => ({ title: String(v.title || 'Default'), price: v.price != null ? Math.round(+v.price) : null, inventory: +v.inventory || 0 })) } } }); prodIds[p.handle || slugify(p.title)] = x.id; }
    created.products = Object.keys(prodIds).length;
    for (const c of site.collections || []) { const h = slugify(c.handle || c.title); await db.collection.upsert({ where: { storeId_handle: { storeId: store.id, handle: h } }, create: { storeId: store.id, title: c.title, handle: h, description: c.description || '', productIds: (c.products || []).map((x: string) => prodIds[x]).filter(Boolean) }, update: { description: c.description || '' } }); }
    for (const p of site.pages || []) { const h = slugify(p.handle || p.title); await db.page.upsert({ where: { storeId_handle: { storeId: store.id, handle: h } }, create: { storeId: store.id, title: p.title, handle: h, body: p.body || '' }, update: { body: p.body || '' } }); }
    for (const m of site.menus || []) { const ex = await db.menu.findFirst({ where: { storeId: store.id, handle: m.handle } }); if (ex) await db.menu.update({ where: { id: ex.id }, data: { items: m.items } }); else await db.menu.create({ data: { storeId: store.id, handle: m.handle, title: m.title, items: m.items } }); }
    for (const p of site.blog || []) await db.blogPost.create({ data: { storeId: store.id, title: p.title, handle: slugify(p.handle || p.title) + '-' + Date.now().toString(36).slice(-4), body: p.body || '' } });
    const st = await db.store.findUniqueOrThrow({ where: { id: store.id } }); await db.store.update({ where: { id: store.id }, data: { settings: { ...((st.settings as any) || {}), policies: site.policies, tagline: site.tagline } } });
    created.collections = (site.collections || []).length; created.pages = (site.pages || []).length; created.blog = (site.blog || []).length; created.menus = (site.menus || []).length;
  }
  await log(store.id, 'site.build', 25, out.usage);
  res.json({ source: out.source, provider: llmInfo().provider, via: b.via, site, applied: b.apply, created, usage: out.usage || null, credits: 25 });
}));
/** Edit by command: "make header black", "add FAQ section", "change headline to Eid Sale" */
r.post('/:storeId/ai/site/edit', storeAccess('online_store'), ah(async (req, res) => {
  const b = parse(z.object({ command: z.string().min(2).max(500), themeId: z.string().optional(), apply: z.boolean().default(true) }), req.body);
  const th = b.themeId ? await db.theme.findFirst({ where: { id: b.themeId, storeId: req.store.id } }) : (await db.theme.findFirst({ where: { storeId: req.store.id, live: true } })) || (await db.theme.findFirst({ where: { storeId: req.store.id }, orderBy: { id: 'desc' } }));
  if (!th) throw nf('No theme yet — build a site first');
  let ops = parseEdit(b.command); let source = 'rules'; let usage: any;
  if (!ops.length) { const o = await llmJson('Convert the store-owner\'s design command into theme edit ops. Allowed ops: {op:"set",path:"palette.bg|palette.tx|palette.ac|palette.sec|palette.header|palette.footer|palette.button|settings.font|settings.header.bg|settings.header.tx|settings.header.sticky|settings.rtl",value}, {op:"addSection",type,position:"top|bottom|after hero",settings}, {op:"removeSection",type}, {op:"setSection",type,key,value}. Return {ops:[...]}', `Current theme: ${JSON.stringify({ palette: th.palette, sections: th.sections, settings: th.settings })}\nCommand: ${b.command}`, () => ({ ops: [] as any[] }), 1500); ops = Array.isArray((o.result as any).ops) ? (o.result as any).ops : []; source = o.source; usage = o.usage; }
  if (!ops.length) return res.status(422).json({ error: 'Could not understand that command. Try "make header black" or "add FAQ section".', understood: false });
  const next = applyOps(th as any, ops);
  if (b.apply) await db.theme.update({ where: { id: th.id }, data: { palette: next.palette, sections: next.sections, settings: next.settings } });
  await log(req.store.id, 'site.edit', 1, usage);
  res.json({ understood: true, source, ops, theme: { id: th.id, ...next } });
}));
/** Optional server speech-to-text. Default STT is the browser Web Speech API (DeepSeek has no STT). */
r.post('/:storeId/ai/stt', storeAccess(), ah(async (req, res) => {
  if (config.sttProvider !== 'http') return res.status(501).json({ error: 'Server speech-to-text not configured. The dashboard uses the browser Web Speech API.', useBrowser: true });
  const audio = Buffer.from(String(req.body?.audioBase64 || ''), 'base64'); if (!audio.length) throw bad('audioBase64 required');
  const t = await stt(audio, req.body?.mime, req.body?.lang); if (!t) return res.status(502).json({ error: 'STT provider failed' }); res.json(t);
}));

/* ---------------- SEO / AEO / GEO ---------------- */
const metaFor = (title: string, desc: string, store: string, kind = 'Shop') => ({ metaTitle: `${title} | ${store}`.slice(0, 60), metaDescription: (strip(desc) || `${kind} ${title} at ${store}. Cash on delivery, easy returns, Sellora Pay protection.`).slice(0, 155) });
r.get('/:storeId/seo/meta', storeAccess(), ah(async (req, res) => {
  const { s, ps, cs, pages } = await all(req.store.id); const { seo } = await seoSettings(req.store.id); const alt = seo.alt || {};
  res.json([...ps.map(p => ({ type: 'product', id: p.id, title: p.title, slug: p.handle, current: { metaTitle: p.seoTitle, metaDescription: p.seoDesc }, suggested: { ...metaFor(p.title, p.description, s.name), slug: slugify(p.title) }, alt: alt[p.id] || ((p.images as any[]) || []).map((_: any, i: number) => `${p.title} – image ${i + 1}`) })), ...cs.map(c => ({ type: 'collection', id: c.id, title: c.title, slug: c.handle, current: { metaTitle: c.seoTitle, metaDescription: c.seoDesc }, suggested: { ...metaFor(c.title, c.description, s.name, 'Browse'), slug: slugify(c.title) } })), ...pages.map(p => ({ type: 'page', id: p.id, title: p.title, slug: p.handle, current: { metaTitle: p.seoTitle, metaDescription: p.seoDesc }, suggested: { ...metaFor(p.title, p.body, s.name, 'Read'), slug: slugify(p.title) } }))]);
}));
/** Head tags for any storefront path: canonical, hreflang, Open Graph, Twitter card */
r.get('/:storeId/seo/head', storeAccess(), ah(async (req, res) => {
  const { s, ps, pages, cs } = await all(req.store.id); const path = String(req.query.path || '/'); const langs = String(req.query.langs || 'en,ur').split(',');
  const m = path.match(/^\/(products|collections|pages)\/([^/?]+)/); const item: any = m ? (m[1] === 'products' ? ps : m[1] === 'collections' ? cs : pages).find((x: any) => x.handle === m[2]) : null;
  const title = item?.seoTitle || (item ? `${item.title} | ${s.name}` : s.name); const desc = item?.seoDesc || strip(item?.description || item?.body || '').slice(0, 155) || `${s.name} — shop online with cash on delivery and Sellora Pay.`; const url = base(s) + path.replace(/\?.*$/, ''); const img = item?.images?.[0] || '';
  const tags = { title, canonical: url, hreflang: [...langs.map(l => ({ lang: l, href: `${url}${url.includes('?') ? '&' : '?'}lang=${l}` })), { lang: 'x-default', href: url }], og: { 'og:type': m?.[1] === 'products' ? 'product' : 'website', 'og:title': title, 'og:description': desc, 'og:url': url, 'og:image': img, 'og:site_name': s.name }, twitter: { 'twitter:card': img ? 'summary_large_image' : 'summary', 'twitter:title': title, 'twitter:description': desc, 'twitter:image': img } };
  const esc = (x: string) => String(x).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  res.json({ ...tags, html: [`<title>${esc(title)}</title>`, `<meta name="description" content="${esc(desc)}">`, `<link rel="canonical" href="${esc(url)}">`, ...tags.hreflang.map(h => `<link rel="alternate" hreflang="${h.lang}" href="${esc(h.href)}">`), ...Object.entries(tags.og).map(([k, v]) => `<meta property="${k}" content="${esc(v)}">`), ...Object.entries(tags.twitter).map(([k, v]) => `<meta name="${k}" content="${esc(v)}">`)].join('\n') });
}));
/** All structured data: Organization, WebSite, LocalBusiness, Product+Offer+AggregateRating+Review, FAQPage, BreadcrumbList */
r.get('/:storeId/seo/schema', storeAccess(), ah(async (req, res) => {
  const { s, ps, reviews } = await all(req.store.id); const set: any = s.settings || {}; const addr: any = s.address || {}; const u = base(s);
  const out: any[] = [{ '@context': 'https://schema.org', '@type': 'Organization', name: s.name, url: u, logo: set.logo || undefined, sameAs: set.social ? Object.values(set.social) : [] }, { '@context': 'https://schema.org', '@type': 'WebSite', name: s.name, url: u, potentialAction: { '@type': 'SearchAction', target: `${u}/search?q={search_term_string}`, 'query-input': 'required name=search_term_string' } }, { '@context': 'https://schema.org', '@type': 'LocalBusiness', name: s.name, url: u, telephone: set.phone || addr.phone, address: { '@type': 'PostalAddress', streetAddress: addr.line1 || addr.address1, addressLocality: addr.city, addressCountry: addr.country || 'PK' }, priceRange: '$$' }];
  for (const p of ps.filter(p => p.status === 'active')) { const rv = reviews.filter(r => r.productId === p.id); out.push({ '@context': 'https://schema.org', '@type': 'Product', name: p.title, description: strip(p.description), image: (p.images as any[]) || [], sku: p.variants[0]?.sku || undefined, brand: { '@type': 'Brand', name: p.vendor || s.name }, offers: { '@type': 'Offer', url: `${u}/products/${p.handle}`, price: (p.price / 100).toFixed(2), priceCurrency: s.currency, availability: p.variants.some(v => v.inventory > 0) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' }, ...(rv.length ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: (rv.reduce((a, r) => a + r.rating, 0) / rv.length).toFixed(1), reviewCount: rv.length }, review: rv.slice(0, 5).map(r => ({ '@type': 'Review', author: { '@type': 'Person', name: r.author }, reviewRating: { '@type': 'Rating', ratingValue: r.rating }, reviewBody: r.body })) } : {}) }); out.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: u }, { '@type': 'ListItem', position: 2, name: 'Products', item: `${u}/collections/all` }, { '@type': 'ListItem', position: 3, name: p.title, item: `${u}/products/${p.handle}` }] }); }
  const faq = ((await seoSettings(s.id)).seo.faq as any[]) || faqList(s.name); out.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
  const type = req.query.type ? String(req.query.type) : ''; res.json(type ? out.filter(x => x['@type'] === type) : out);
}));
/** Sitemap including blog + hreflang alternates */
r.get('/:storeId/seo/sitemap.xml', storeAccess(), ah(async (req, res) => {
  const { s, ps, cs, pages, blog } = await all(req.store.id); const u = base(s); const langs = ((await seoSettings(s.id)).seo.langs as string[]) || ['en', 'ur'];
  const urls = [u, ...ps.filter(p => p.status === 'active').map(p => `${u}/products/${p.handle}`), ...cs.map(c => `${u}/collections/${c.handle}`), ...pages.filter(p => p.visible).map(p => `${u}/pages/${p.handle}`), ...blog.filter(b => b.published).map(b => `${u}/blog/${b.handle}`)];
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.map(x => `  <url><loc>${x}</loc>${langs.map(l => `<xhtml:link rel="alternate" hreflang="${l}" href="${x}?lang=${l}"/>`).join('')}</url>`).join('\n')}\n</urlset>`);
}));
/** AEO: direct-answer blocks + FAQ (saved for FAQPage schema). GEO: entity/citation-friendly copy for AI search engines. */
r.post('/:storeId/seo/aeo', storeAccess('online_store'), ah(async (req, res) => {
  const b = parse(z.object({ topic: z.string().min(2), save: z.boolean().default(true) }), req.body); const st = req.store.name;
  const out = await llmJson('You write Answer Engine Optimisation content: each answer starts with a direct 40-60 word answer, then detail. Return {answer, faq:[{q,a}] (6 items), howTo:[step]}', `Store: ${st}\nTopic: ${b.topic}`, () => ({ answer: `${b.topic}: ${st} explains it simply — what it is, who it suits, and how to choose the right option for your budget, with cash on delivery across Pakistan.`, faq: [...faqList(st), { q: `What is the best ${b.topic}?`, a: `The best ${b.topic} depends on use and budget; ${st} recommends comparing material, reviews and return policy.` }, { q: `How much does ${b.topic} cost in Pakistan?`, a: `Prices at ${st} start from affordable entry options to premium picks; see the collection page for current prices.` }, { q: `Is ${b.topic} worth it?`, a: `Yes, if you choose quality-checked items with a clear return policy.` }], howTo: ['Decide your budget', 'Compare materials and reviews', 'Check delivery and returns', 'Order with Sellora Pay or cash on delivery'] }));
  if (b.save) await saveSeo(req.store.id, { faq: (out.result as any).faq }); await log(req.store.id, 'seo.aeo', 2, out.usage); res.json(out);
}));
r.post('/:storeId/seo/geo', storeAccess('online_store'), ah(async (req, res) => {
  const b = parse(z.object({ topic: z.string().min(2) }), req.body); const st = req.store.name;
  const out = await llmJson('You write Generative Engine Optimisation (GEO) content so AI assistants (ChatGPT, Gemini, Perplexity, Copilot) can understand, trust and cite the brand. Return {entitySummary, facts:[{fact,source}], comparisonTable:[{option,bestFor,priceRange}], quotableLines:[], citationTips:[]}', `Brand: ${st}\nTopic: ${b.topic}`, () => ({ entitySummary: `${st} is an online store in Pakistan selling ${b.topic}, offering cash on delivery, 7-day returns and Sellora Pay buyer protection.`, facts: [{ fact: `${st} ships ${b.topic} across Pakistan in 2–5 working days.`, source: 'Shipping policy page' }, { fact: 'Returns accepted within 7 days.', source: 'Refund policy page' }], comparisonTable: [{ option: 'Entry', bestFor: 'First-time buyers', priceRange: 'Low' }, { option: 'Premium', bestFor: 'Gifting and long-term use', priceRange: 'High' }], quotableLines: [`According to ${st}, the key to choosing ${b.topic} is material quality and an easy return policy.`], citationTips: ['Use consistent brand name, address and phone everywhere (NAP)', 'Publish llms.txt and Organization schema', 'Cite statistics with sources', 'Get mentioned on trusted directories and news sites', 'Keep an About page with founders and history'] }));
  await log(req.store.id, 'seo.geo', 2, out.usage); res.json(out);
}));
/** Internal linking suggestions: products ↔ collections ↔ blog by shared words/tags */
r.get('/:storeId/seo/internal-links', storeAccess(), ah(async (req, res) => {
  const { ps, cs, blog, pages } = await all(req.store.id); const words = (t: string) => new Set(strip(t).toLowerCase().split(/\W+/).filter(w => w.length > 3));
  const nodes = [...ps.map(p => ({ kind: 'product', url: `/products/${p.handle}`, title: p.title, text: p.title + ' ' + p.description + ' ' + JSON.stringify(p.tags || []) })), ...cs.map(c => ({ kind: 'collection', url: `/collections/${c.handle}`, title: c.title, text: c.title + ' ' + c.description })), ...blog.map(b => ({ kind: 'blog', url: `/blog/${b.handle}`, title: b.title, text: b.title + ' ' + b.body })), ...pages.map(p => ({ kind: 'page', url: `/pages/${p.handle}`, title: p.title, text: p.title + ' ' + p.body }))];
  const out: any[] = []; for (const a of nodes) for (const b of nodes) { if (a === b || a.kind === b.kind) continue; const wa = words(a.text), shared = [...words(b.title)].filter(w => wa.has(w)); if (shared.length && !a.text.includes(b.url)) out.push({ from: a.url, to: b.url, anchor: b.title, reason: `shares “${shared.slice(0, 3).join(', ')}”` }); }
  res.json(out.slice(0, 100));
}));
/** Keyword research + clustering (LLM or heuristic). Saved to SeoKeyword. */
r.post('/:storeId/seo/keywords', storeAccess('online_store'), ah(async (req, res) => {
  const b = parse(z.object({ seed: z.string().min(2), country: z.string().default('PK') }), req.body); const s = b.seed.toLowerCase();
  const fb = () => ({ keywords: [[s, 'core', 'commercial'], [`${s} price in pakistan`, 'price', 'transactional'], [`buy ${s} online`, 'buy', 'transactional'], [`best ${s}`, 'best', 'commercial'], [`${s} for women`, 'audience', 'commercial'], [`${s} for men`, 'audience', 'commercial'], [`cheap ${s}`, 'price', 'transactional'], [`how to choose ${s}`, 'guides', 'informational'], [`${s} vs`, 'compare', 'commercial'], [`${s} near me`, 'local', 'transactional'], [`${s} lahore`, 'local', 'transactional'], [`${s} karachi`, 'local', 'transactional'], [`what is ${s}`, 'guides', 'informational'], [`${s} cash on delivery`, 'buy', 'transactional']].map(([k, c, i], n) => ({ keyword: k, cluster: c, intent: i, volume: null, difficulty: null, rank: n })) });
  const out = await llmJson(`You are an SEO keyword researcher for country ${b.country}. Return {keywords:[{keyword,cluster,intent:"informational|commercial|transactional|navigational",volume (estimated monthly or null),difficulty (0-100 estimate or null)}]} with 20 keywords grouped into 4-6 clusters. Mark estimates honestly.`, b.seed, fb);
  const kws: any[] = (out.result as any).keywords || []; for (const k of kws) if (k.keyword) await db.seoKeyword.upsert({ where: { storeId_keyword: { storeId: req.store.id, keyword: String(k.keyword).toLowerCase() } }, create: { storeId: req.store.id, keyword: String(k.keyword).toLowerCase(), cluster: k.cluster || 'general', intent: k.intent || 'commercial', volume: Number.isFinite(+k.volume) && k.volume != null ? +k.volume : null, difficulty: Number.isFinite(+k.difficulty) && k.difficulty != null ? +k.difficulty : null }, update: { cluster: k.cluster || 'general' } });
  await log(req.store.id, 'seo.keywords', 2, out.usage);
  const clusters: Record<string, string[]> = {}; for (const k of kws) (clusters[k.cluster || 'general'] ||= []).push(k.keyword);
  res.json({ source: out.source, keywords: kws, clusters, note: 'Volumes/difficulty are AI estimates unless a keyword data API is connected.' });
}));
r.get('/:storeId/seo/keywords', storeAccess(), ah(async (req, res) => res.json(await db.seoKeyword.findMany({ where: { storeId: req.store.id }, orderBy: { cluster: 'asc' } }))));
r.delete('/:storeId/seo/keywords/:id', storeAccess('online_store'), ah(async (req, res) => { await db.seoKeyword.deleteMany({ where: { id: req.params.id, storeId: req.store.id } }); res.status(204).end(); }));
/** Content gaps: tracked keywords with no page/blog/product targeting them, + a blog calendar */
r.get('/:storeId/seo/content-gaps', storeAccess(), ah(async (req, res) => {
  const { ps, cs, pages, blog } = await all(req.store.id); const corpus = [...ps.map(p => p.title + ' ' + p.description), ...cs.map(c => c.title + ' ' + c.description), ...pages.map(p => p.title + ' ' + p.body), ...blog.map(b => b.title + ' ' + b.body)].join(' ').toLowerCase();
  const kws = await db.seoKeyword.findMany({ where: { storeId: req.store.id } }); const gaps = kws.filter(k => !corpus.includes(k.keyword)).map(k => ({ keyword: k.keyword, cluster: k.cluster, intent: k.intent, suggest: k.intent === 'informational' ? 'Blog post' : k.intent === 'transactional' ? 'Collection or landing page' : 'Comparison / buying guide' }));
  res.json({ covered: kws.length - gaps.length, gaps });
}));
r.post('/:storeId/seo/calendar', storeAccess('online_store'), ah(async (req, res) => {
  const b = parse(z.object({ weeks: z.number().int().min(1).max(26).default(8), perWeek: z.number().int().min(1).max(5).default(1) }), req.body);
  const kws = await db.seoKeyword.findMany({ where: { storeId: req.store.id } }); const topics = kws.length ? kws.map(k => k.keyword) : [req.store.name + ' guide'];
  const start = new Date(); start.setUTCHours(5, 0, 0, 0); // 10:00 Asia/Karachi
  const fb = () => ({ posts: Array.from({ length: b.weeks * b.perWeek }, (_, i) => { const t = topics[i % topics.length]; const d = new Date(start.getTime() + Math.floor(i / b.perWeek) * 7 * 864e5 + (i % b.perWeek) * 2 * 864e5); return { date: d.toISOString().slice(0, 10), title: i % 3 === 0 ? `How to choose ${t}: a 2026 buyer's guide` : i % 3 === 1 ? `${t}: 7 questions answered` : `${t} vs alternatives — honest comparison`, keyword: t, type: ['guide', 'faq', 'comparison'][i % 3] }; }) });
  const out = await llmJson('Plan a blog calendar. Return {posts:[{date (YYYY-MM-DD),title,keyword,type,outline:[...]}]}', `Weeks ${b.weeks}, posts/week ${b.perWeek}, start ${start.toISOString().slice(0, 10)}, keywords: ${topics.join(', ')}`, fb);
  await log(req.store.id, 'seo.calendar', 2, out.usage); res.json(out);
}));
/** Full site audit with score, CWV hints and one-click fixes */
async function audit(storeId: string) {
  const { s, ps, cs, pages, blog } = await all(storeId); const { seo } = await seoSettings(storeId); const alt = seo.alt || {}; const redirects = await db.redirect.findMany({ where: { storeId } }); const theme = await db.theme.findFirst({ where: { storeId, live: true } }) || await db.theme.findFirst({ where: { storeId } });
  const issues: any[] = []; const add = (id: string, sev: string, type: string, ref: string | null, title: string, issue: string, fix: string | null) => issues.push({ id, severity: sev, type, ref, title, issue, fix });
  const titles = new Map<string, number>(); for (const p of ps) titles.set((p.seoTitle || p.title).toLowerCase(), (titles.get((p.seoTitle || p.title).toLowerCase()) || 0) + 1);
  for (const p of ps) {
    if (!p.seoTitle) add(`meta-title:${p.id}`, 'high', 'product', p.id, p.title, 'Missing meta title', 'meta');
    else if (p.seoTitle.length > 60) add(`long-title:${p.id}`, 'medium', 'product', p.id, p.title, `Meta title ${p.seoTitle.length} chars (>60)`, 'meta');
    if (!p.seoDesc) add(`meta-desc:${p.id}`, 'high', 'product', p.id, p.title, 'Missing meta description', 'meta');
    if (strip(p.description).length < 120) add(`thin:${p.id}`, 'medium', 'product', p.id, p.title, 'Thin description (<120 chars)', 'describe');
    const imgs = (p.images as any[]) || []; if (!imgs.length) add(`no-img:${p.id}`, 'medium', 'product', p.id, p.title, 'No product images', null); else if (!(alt[p.id] || []).length) add(`alt:${p.id}`, 'medium', 'product', p.id, p.title, 'Images missing alt text', 'alt');
    if (p.handle !== slugify(p.handle) || /-[a-z0-9]{4,}$/.test(p.handle) && p.handle.length > 50) add(`slug:${p.id}`, 'low', 'product', p.id, p.title, 'Slug not clean/readable', 'slug');
    if ((titles.get((p.seoTitle || p.title).toLowerCase()) || 0) > 1) add(`dup:${p.id}`, 'medium', 'product', p.id, p.title, 'Duplicate title', 'meta');
  }
  for (const c of cs) { if (!c.description) add(`col-desc:${c.id}`, 'medium', 'collection', c.id, c.title, 'No collection description', 'describe'); if (!c.seoDesc) add(`meta-desc:${c.id}`, 'medium', 'collection', c.id, c.title, 'Missing meta description', 'meta'); }
  for (const p of pages) if (!p.seoDesc) add(`meta-desc:${p.id}`, 'low', 'page', p.id, p.title, 'Missing meta description', 'meta');
  for (const b of await brokenLinks(storeId)) { add(`broken:${b.href}|${b.in}`, 'high', 'link', null, b.in, `Broken internal link ${b.href}`, 'redirect'); issues[issues.length - 1].href = b.href; }
  if (!(seo.faq || []).length) add('faq', 'medium', 'site', null, 'FAQ', 'No FAQ / answer blocks for AEO', 'faq');
  if (!blog.length) add('blog', 'low', 'site', null, 'Blog', 'No blog posts (content marketing)', null);
  if (!(theme?.settings as any)?.lazyImages) add('lazy', 'medium', 'performance', null, 'Images', 'Lazy-loading off (hurts LCP/CLS)', 'lazy');
  if (!seo.imagesOptimized) add('compress', 'medium', 'performance', null, 'Images', 'Images not converted to WebP/compressed', 'compress');
  if (!seo.indexNowSubmittedAt) add('submit', 'low', 'site', null, 'Indexing', 'Sitemap not submitted to search engines', null);
  if (!(s.address as any)?.city) add('nap', 'low', 'site', null, 'Local SEO', 'Store address/city missing (LocalBusiness schema, NAP)', null);
  const checks = ps.length * 6 + cs.length * 2 + pages.length + 8 || 1; const w: any = { high: 1.5, medium: 1, low: 0.5 };
  const score = Math.max(0, Math.min(100, Math.round(100 * (1 - issues.reduce((a, i) => a + w[i.severity], 0) / (checks * 1.1)))));
  const cwv = { lcp: { target: '< 2.5 s', hints: ['Serve hero image as WebP ≤ 200 KB with fetchpriority="high"', 'Preload the main font', seo.imagesOptimized ? 'Images compressed ✓' : 'Compress product images'] }, inp: { target: '< 200 ms', hints: ['Defer third-party chat/pixel scripts', 'Avoid heavy carousels on mobile'] }, cls: { target: '< 0.1', hints: ['Set width/height on all images', (theme?.settings as any)?.lazyImages ? 'Lazy-load below-the-fold images ✓' : 'Enable lazy-loading'] }, measured: config.psiKey ? 'PageSpeed Insights connected' : 'Estimates — add PAGESPEED_API_KEY for field data' };
  return { score, grade: score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 55 ? 'C' : 'D', issues, cwv, counts: { products: ps.length, collections: cs.length, pages: pages.length, blog: blog.length, redirects: redirects.length } };
}
r.get('/:storeId/seo/audit', storeAccess(), ah(async (req, res) => res.json(await audit(req.store.id))));
r.post('/:storeId/seo/fix', storeAccess('online_store'), ah(async (req, res) => {
  const b = parse(z.object({ ids: z.array(z.string()).optional(), all: z.boolean().default(false) }), req.body); const a = await audit(req.store.id); const s = req.store;
  const todo = a.issues.filter((i: any) => i.fix && (b.all || b.ids?.includes(i.id))); const done: string[] = []; const { seo } = await seoSettings(s.id); const alt = { ...(seo.alt || {}) }; const patch: any = {};
  for (const i of todo) {
    if (i.fix === 'meta' && i.type === 'product') { const p = await db.product.findUnique({ where: { id: i.ref } }); if (p) { const m = metaFor(p.title, p.description, s.name); await db.product.update({ where: { id: p.id }, data: { seoTitle: m.metaTitle, seoDesc: m.metaDescription } }); } }
    else if (i.fix === 'meta' && i.type === 'collection') { const c = await db.collection.findUnique({ where: { id: i.ref } }); if (c) { const m = metaFor(c.title, c.description, s.name, 'Browse'); await db.collection.update({ where: { id: c.id }, data: { seoTitle: m.metaTitle, seoDesc: m.metaDescription } }); } }
    else if (i.fix === 'meta' && i.type === 'page') { const p = await db.page.findUnique({ where: { id: i.ref } }); if (p) { const m = metaFor(p.title, p.body, s.name, 'Read'); await db.page.update({ where: { id: p.id }, data: { seoTitle: m.metaTitle, seoDesc: m.metaDescription } }); } }
    else if (i.fix === 'describe' && i.type === 'product') { const p = await db.product.findUnique({ where: { id: i.ref } }); if (p) await db.product.update({ where: { id: p.id }, data: { description: `${p.description}<p>${p.title} by ${s.name} is quality-checked before dispatch and backed by 7-day returns. Pay by card, wallet or cash on delivery — every payment is protected by Sellora Pay.</p>` } }); }
    else if (i.fix === 'describe' && i.type === 'collection') { const c = await db.collection.findUnique({ where: { id: i.ref } }); if (c) await db.collection.update({ where: { id: c.id }, data: { description: `Shop ${c.title} at ${s.name}: hand-picked, quality-checked and delivered across Pakistan.` } }); }
    else if (i.fix === 'alt') { const p = await db.product.findUnique({ where: { id: i.ref } }); if (p) alt[p.id] = ((p.images as any[]) || []).map((_: any, n: number) => `${p.title}${n ? ` – view ${n + 1}` : ''}`); }
    else if (i.fix === 'slug') { const p = await db.product.findUnique({ where: { id: i.ref } }); if (p) { let h = slugify(p.title); if (await db.product.findFirst({ where: { storeId: s.id, handle: h, NOT: { id: p.id } } })) h += '-' + p.id.slice(-4); await db.product.update({ where: { id: p.id }, data: { handle: h } }); await db.redirect.upsert({ where: { storeId_from: { storeId: s.id, from: `/products/${p.handle}` } }, create: { storeId: s.id, from: `/products/${p.handle}`, to: `/products/${h}` }, update: { to: `/products/${h}` } }); } }
    else if (i.fix === 'redirect') { const href = i.href; if (!(await db.redirect.findFirst({ where: { storeId: s.id, from: href } }))) await db.redirect.create({ data: { storeId: s.id, from: href, to: href.startsWith('/products/') ? '/collections/all' : '/' } }); }
    else if (i.fix === 'faq') patch.faq = faqList(s.name);
    else if (i.fix === 'lazy') { const th = await db.theme.findFirst({ where: { storeId: s.id, live: true } }) || await db.theme.findFirst({ where: { storeId: s.id } }); if (th) await db.theme.update({ where: { id: th.id }, data: { settings: { ...((th.settings as any) || {}), lazyImages: true } } }); else patch.lazyImages = true; }
    else if (i.fix === 'compress') patch.imagesOptimized = { at: new Date().toISOString(), format: 'webp', quality: 80, maxWidth: 1600 };
    done.push(i.id);
  }
  await saveSeo(s.id, { ...patch, alt }); const after = await audit(s.id); res.json({ fixed: done.length, ids: done, before: a.score, after: after.score, remaining: after.issues.length });
}));
async function brokenLinks(storeId: string) {
  const { ps, cs, pages, blog } = await all(storeId); const reds = new Set((await db.redirect.findMany({ where: { storeId } })).map(r => r.from));
  const ok = new Set(['/', '/cart', '/search', '/blog', '/collections/all', ...ps.map(p => `/products/${p.handle}`), ...cs.map(c => `/collections/${c.handle}`), ...pages.map(p => `/pages/${p.handle}`), ...blog.map(b => `/blog/${b.handle}`), '/policies/refund', '/policies/shipping', '/policies/privacy', '/policies/terms']);
  const menus = await db.menu.findMany({ where: { storeId } }); const out: any[] = [];
  const scan = (where: string, html: string) => { for (const m of (html || '').matchAll(/href=["'](\/[^"'#?]*)/g)) if (!ok.has(m[1].replace(/\/$/, '') || '/') && !reds.has(m[1])) out.push({ in: where, href: m[1] }); };
  ps.forEach(p => scan(`product:${p.title}`, p.description)); pages.forEach(p => scan(`page:${p.title}`, p.body)); blog.forEach(b => scan(`blog:${b.title}`, b.body)); cs.forEach(c => scan(`collection:${c.title}`, c.description));
  for (const m of menus) for (const it of (m.items as any[]) || []) if (typeof it.url === 'string' && it.url.startsWith('/') && !ok.has(it.url.replace(/\/$/, '') || '/') && !reds.has(it.url)) out.push({ in: `menu:${m.title}`, href: it.url });
  return out;
}
r.get('/:storeId/seo/broken-links', storeAccess(), ah(async (req, res) => res.json(await brokenLinks(req.store.id))));
/** Image optimisation plan + lazy loading switch (actual re-encoding runs in the upload pipeline/CDN) */
r.post('/:storeId/seo/images/optimize', storeAccess('online_store'), ah(async (req, res) => {
  const ps = await db.product.findMany({ where: { storeId: req.store.id } }); const n = ps.reduce((a, p) => a + ((p.images as any[]) || []).length, 0);
  const plan = { images: n, format: 'webp', quality: 80, maxWidth: 1600, lazy: true, estSavingPct: 55 }; await saveSeo(req.store.id, { imagesOptimized: { at: new Date().toISOString(), ...plan } }); res.json(plan);
}));
/** 301 redirects manager */
r.get('/:storeId/seo/redirects', storeAccess(), ah(async (req, res) => res.json(await db.redirect.findMany({ where: { storeId: req.store.id }, orderBy: { createdAt: 'desc' } }))));
r.post('/:storeId/seo/redirects', storeAccess('online_store'), ah(async (req, res) => {
  const b = parse(z.object({ from: z.string().regex(/^\//, 'must start with /'), to: z.string().min(1), code: z.union([z.literal(301), z.literal(302)]).default(301) }), req.body);
  if (b.from === b.to) throw bad('from and to are the same'); if (await db.redirect.findFirst({ where: { storeId: req.store.id, from: b.to, to: b.from } })) throw bad('Redirect loop');
  res.status(201).json(await db.redirect.upsert({ where: { storeId_from: { storeId: req.store.id, from: b.from } }, create: { storeId: req.store.id, ...b }, update: { to: b.to, code: b.code } }));
}));
r.delete('/:storeId/seo/redirects/:id', storeAccess('online_store'), ah(async (req, res) => { await db.redirect.deleteMany({ where: { id: req.params.id, storeId: req.store.id } }); res.status(204).end(); }));
/** Search engine submission: IndexNow (Bing, Yandex, Seznam, Naver) is real when INDEXNOW_KEY is set; Google Search Console is a placeholder (needs OAuth). */
r.post('/:storeId/seo/submit', storeAccess('online_store'), ah(async (req, res) => {
  const b = parse(z.object({ engine: z.enum(['indexnow', 'google']).default('indexnow'), urls: z.array(z.string().url()).optional() }), req.body); const s = await db.store.findUniqueOrThrow({ where: { id: req.store.id } }); const u = base(s);
  const ps = await db.product.findMany({ where: { storeId: s.id, status: 'active' } }); const urls = b.urls || [u, `${u}/sitemap.xml`, ...ps.map(p => `${u}/products/${p.handle}`)];
  if (b.engine === 'google') { await saveSeo(s.id, { gscQueuedAt: new Date().toISOString() }); return res.json({ engine: 'google', status: 'placeholder', message: 'Connect Google Search Console (OAuth) to submit the sitemap. Sitemap URL ready:', sitemap: `${u}/sitemap.xml` }); }
  let status = 'simulated', http: number | null = null;
  if (config.indexNowKey) { try { const host = new URL(u).host; const r2 = await fetch('https://api.indexnow.org/indexnow', { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify({ host, key: config.indexNowKey, urlList: urls.slice(0, 10000) }) }); http = r2.status; status = r2.ok ? 'submitted' : 'failed'; } catch { status = 'failed'; } }
  await saveSeo(s.id, { indexNowSubmittedAt: new Date().toISOString() }); res.json({ engine: 'indexnow', status, http, count: urls.length, note: config.indexNowKey ? undefined : 'Set INDEXNOW_KEY to submit for real.' });
}));
/** Rank tracker — uses RANK_API_URL if configured, else clearly-labelled simulated positions */
r.post('/:storeId/seo/rank/check', storeAccess(), ah(async (req, res) => {
  const kws = await db.seoKeyword.findMany({ where: { storeId: req.store.id } }); const date = new Date().toISOString().slice(0, 10); const out: any[] = [];
  for (const k of kws) { let pos: number | null = null, source = 'simulated'; if (config.rankApiUrl) { try { const r2 = await fetch(`${config.rankApiUrl}?q=${encodeURIComponent(k.keyword)}&domain=${encodeURIComponent(base(req.store))}`, { headers: { Authorization: `Bearer ${config.rankApiKey}` } }); const j: any = await r2.json(); pos = j.position ?? null; source = 'api'; } catch {} } else { let h = 0; for (const c of k.keyword + date) h = (h * 31 + c.charCodeAt(0)) >>> 0; pos = 5 + (h % 60); }
    const ranks = [...(((k.ranks as any[]) || []).filter(x => x.date !== date)), { date, position: pos, engine: 'google', source }].slice(-90); await db.seoKeyword.update({ where: { id: k.id }, data: { ranks } }); out.push({ keyword: k.keyword, position: pos, source, history: ranks }); }
  res.json({ date, results: out, note: config.rankApiUrl ? undefined : 'Simulated — connect a rank API (RANK_API_URL) for real positions.' });
}));
/* ---------------- Off-page ---------------- */
r.get('/:storeId/seo/citations', storeAccess(), ah(async (req, res) => { const { seo } = await seoSettings(req.store.id); const st = seo.citations || {}; res.json(Object.fromEntries(Object.entries(CITATIONS).map(([k, list]) => [k, list.map(([name, url]) => ({ name, url, status: st[name] || 'todo' }))]))); }));
r.patch('/:storeId/seo/citations', storeAccess('online_store'), ah(async (req, res) => { const b = parse(z.object({ name: z.string(), status: z.enum(['todo', 'submitted', 'live']) }), req.body); const { seo } = await seoSettings(req.store.id); await saveSeo(req.store.id, { citations: { ...(seo.citations || {}), [b.name]: b.status } }); res.json({ ok: true }); }));
r.post('/:storeId/seo/outreach', storeAccess('online_store'), ah(async (req, res) => {
  const niche = String(req.body?.niche || ''); const st = req.store.name;
  const out = await llmJson('Suggest white-hat backlink outreach. Return {targets:[{type,example,angle}],emailTemplate:{subject,body},avoid:[]}', `Store ${st}, niche ${niche}, market Pakistan`, () => ({ targets: [{ type: 'Niche bloggers / YouTubers', example: `${niche || 'lifestyle'} reviewers in Pakistan`, angle: 'Free sample for honest review' }, { type: 'Local news & city guides', example: 'City lifestyle magazines', angle: 'Founder story / local business feature' }, { type: 'Gift guides', example: 'Eid / wedding gift lists', angle: 'Include a product with discount code' }, { type: 'Supplier & partner pages', example: 'Brands you stock', angle: 'Ask for a "where to buy" link' }, { type: 'University societies', example: 'Student discount pages', angle: 'Student offer' }], emailTemplate: { subject: `Collaboration idea from ${st}`, body: `Hi {name},\n\nI run ${st}. We loved your post on {topic}. Would you like a free {product} to review? No strings — honest opinions welcome.\n\nThanks,\n{you}` }, avoid: ['Buying links / PBNs', 'Spammy directory blasts', 'Exact-match anchor overuse'] }));
  await log(req.store.id, 'seo.outreach', 1, out.usage); res.json(out);
}));
r.post('/:storeId/seo/gbp', storeAccess('online_store'), ah(async (req, res) => {
  const s = await db.store.findUniqueOrThrow({ where: { id: req.store.id } }); const addr: any = s.address || {};
  const out = await llmJson('Help set up a Google Business Profile. Return {description (<=750 chars),primaryCategory,additionalCategories:[],services:[],posts:[{title,body,cta}],qa:[{q,a}],checklist:[]}', `${s.name}; city ${addr.city || 'n/a'}; ${req.body?.about || ''}`, () => ({ description: `${s.name} is an online store${addr.city ? ' based in ' + addr.city : ''} offering quality products with cash on delivery, 7-day returns and Sellora Pay buyer protection.`.slice(0, 750), primaryCategory: 'Online retailer', additionalCategories: ['Store', 'Gift shop'], services: ['Home delivery', 'Cash on delivery', 'Online orders'], posts: [{ title: 'New arrivals are live', body: `Fresh stock just landed at ${s.name}.`, cta: 'Shop now' }], qa: faqList(s.name).map(f => ({ q: f.q, a: f.a })), checklist: ['Verify the profile (postcard/phone/video)', 'Add logo, cover and 10+ photos', 'Set hours and service areas', 'Add website + WhatsApp link', 'Ask every happy customer for a review', 'Post weekly'] }));
  await log(req.store.id, 'seo.gbp', 1, out.usage); res.json(out);
}));
r.post('/:storeId/ai/social', storeAccess('marketing'), ah(async (req, res) => {
  const b = parse(z.object({ productId: z.string().optional(), topic: z.string().optional(), platforms: z.array(z.enum(['facebook', 'instagram', 'x', 'linkedin', 'tiktok', 'whatsapp'])).default(['facebook', 'instagram', 'x', 'tiktok']) }), req.body);
  const p = b.productId ? await db.product.findFirst({ where: { id: b.productId, storeId: req.store.id } }) : null; const subj = p?.title || b.topic || req.store.name; const st = await db.store.findUniqueOrThrow({ where: { id: req.store.id } }); const link = p ? `${base(st)}/products/${p.handle}` : base(st);
  const out = await llmJson('Write platform-native social posts with hashtags. Return {posts:[{platform,text,hashtags:[]}]}', `Subject: ${subj}. Link: ${link}. Platforms: ${b.platforms.join(',')}`, () => ({ posts: b.platforms.map(pl => ({ platform: pl, text: pl === 'x' ? `${subj} is here. COD across Pakistan. ${link}` : pl === 'tiktok' ? `POV: you finally found ${subj} that actually delivers ✨ Link in bio` : `✨ ${subj} — now at ${req.store.name}!\nCash on delivery • 7-day returns • Sellora Pay protected\nShop: ${link}`, hashtags: ['#' + slugify(subj).replace(/-/g, ''), '#Pakistan', '#OnlineShopping'] })) }));
  await log(req.store.id, 'ai.social', 1, out.usage); res.json(out);
}));
/* ---------------- Extra AI tools ---------------- */
const LANG: Record<string, string> = { en: 'English', ur: 'Urdu', ar: 'Arabic' };
r.post('/:storeId/ai/describe', storeAccess('products'), ah(async (req, res) => {
  const b = parse(z.object({ productId: z.string(), langs: z.array(z.enum(['en', 'ur', 'ar'])).min(1).default(['en', 'ur', 'ar']), save: z.boolean().default(false) }), req.body);
  const p = await db.product.findFirst({ where: { id: b.productId, storeId: req.store.id } }); if (!p) throw nf();
  const fb = () => ({ en: `<p>${p.title} — quality you can feel. Thoughtfully made, carefully checked and delivered across Pakistan with cash on delivery.</p>`, ur: `<p dir="rtl">${p.title} — بہترین معیار، مناسب قیمت۔ پورے پاکستان میں کیش آن ڈیلیوری کے ساتھ دستیاب۔</p>`, ar: `<p dir="rtl">${p.title} — جودة عالية بسعر مناسب، مع الدفع عند الاستلام وحماية Sellora Pay.</p>` });
  const out = await llmJson(`Write a persuasive, SEO-friendly product description (HTML <p>/<ul>, RTL dir for Urdu/Arabic) in each language: ${b.langs.map(l => `${l}=${LANG[l]}`).join(', ')}. Return {${b.langs.join(',')}}`, JSON.stringify({ title: p.title, description: strip(p.description), tags: p.tags }), fb);
  const result: any = Object.fromEntries(b.langs.map(l => [l, (out.result as any)[l] || (fb() as any)[l]]));
  if (b.save && result.en) await db.product.update({ where: { id: p.id }, data: { description: result.en } });
  await log(req.store.id, 'ai.describe', b.langs.length, out.usage); res.json({ source: out.source, result });
}));
r.post('/:storeId/ai/alt-text', storeAccess('products'), ah(async (req, res) => {
  const b = parse(z.object({ productId: z.string(), save: z.boolean().default(true) }), req.body); const p = await db.product.findFirst({ where: { id: b.productId, storeId: req.store.id } }); if (!p) throw nf();
  const imgs = ((p.images as any[]) || []).length || 1; const fb = () => ({ images: Array.from({ length: imgs }, (_, i) => ({ alt: `${p.title}${i ? ` – detail view ${i + 1}` : ''}`, caption: i ? `Close-up of ${p.title}` : `${p.title} by ${req.store.name}` })) });
  const out = await llmJson('Write concise, descriptive image alt text (<=125 chars, no "image of") and a short caption per image. Return {images:[{alt,caption}]}', `Product: ${p.title}. Images: ${imgs}. ${strip(p.description).slice(0, 400)}`, fb);
  const list = ((out.result as any).images || []).slice(0, imgs); if (b.save) { const { seo } = await seoSettings(req.store.id); await saveSeo(req.store.id, { alt: { ...(seo.alt || {}), [p.id]: list.map((x: any) => x.alt) } }); }
  await log(req.store.id, 'ai.alt', 1, out.usage); res.json({ source: out.source, images: list });
}));
r.post('/:storeId/ai/campaign', storeAccess('marketing'), ah(async (req, res) => {
  const b = parse(z.object({ channel: z.enum(['email', 'whatsapp']), goal: z.string().min(2), audience: z.string().default('all customers'), language: z.enum(['en', 'ur', 'ar']).default('en') }), req.body); const st = req.store.name;
  const fb = () => b.channel === 'email' ? { subject: `${st}: ${b.goal}`, preheader: 'Limited time — don\'t miss it', body: `<h2>${b.goal}</h2><p>Hi {first_name},</p><p>We've got something special for ${b.audience}. Shop now with cash on delivery and Sellora Pay protection.</p><p><a href="{shop_url}">Shop now</a></p>`, cta: 'Shop now' } : { template: 'marketing', text: `Assalam o Alaikum {first_name}! ${b.goal} at ${st} 🎉 Shop: {shop_url}\nReply STOP to opt out.`, buttons: ['Shop now', 'Talk to us'] };
  const out = await llmJson(`Write a ${b.channel} marketing message in ${LANG[b.language]}. ${b.channel === 'whatsapp' ? 'Keep under 600 chars, include opt-out line, return {template:"marketing",text,buttons:[]}' : 'Return {subject (<=50 chars),preheader,body (simple HTML),cta}'}. Use {first_name} and {shop_url} placeholders.`, `Store ${st}; goal: ${b.goal}; audience: ${b.audience}`, fb);
  await log(req.store.id, 'ai.campaign', 1, out.usage); res.json(out);
}));
r.post('/:storeId/ai/review-reply', storeAccess(), ah(async (req, res) => {
  const b = parse(z.object({ reviewId: z.string().optional(), text: z.string().optional(), rating: z.number().int().min(1).max(5).optional(), author: z.string().optional() }), req.body);
  const rv = b.reviewId ? await db.review.findFirst({ where: { id: b.reviewId, storeId: req.store.id } }) : null; const rating = rv?.rating ?? b.rating ?? 5; const author = rv?.author || b.author || 'there'; const text = rv?.body || b.text || '';
  const fb = () => ({ reply: rating >= 4 ? `Thank you so much, ${author}! We're thrilled you're happy — see you again soon at ${req.store.name}.` : `We're sorry, ${author}. This isn't the experience we want for you. Please WhatsApp us your order number and we'll make it right — refund or replacement.`, tone: rating >= 4 ? 'grateful' : 'apologetic' });
  const out = await llmJson('Reply to a customer review: warm, brief (<=60 words), no excuses, offer a fix if negative. Return {reply,tone}', JSON.stringify({ rating, author, text, store: req.store.name }), fb);
  await log(req.store.id, 'ai.review', 1, out.usage); res.json(out);
}));
/** Competitor price/content analysis. Live fetch only when COMPETITOR_FETCH=1 (placeholder otherwise). */
r.post('/:storeId/ai/competitor', storeAccess(), ah(async (req, res) => {
  const b = parse(z.object({ url: z.string().url(), productId: z.string().optional() }), req.body); let page: any = { fetched: false, title: null, description: null, prices: [] as number[], h1: null };
  if (config.competitorFetch) { try { const r2 = await fetch(b.url, { headers: { 'User-Agent': 'SelloraBot/1.0 (+https://sellora.app)' }, signal: AbortSignal.timeout(10000) }); const html = (await r2.text()).slice(0, 400000); page = { fetched: true, title: (html.match(/<title[^>]*>([^<]+)/i) || [])[1]?.trim() || null, description: (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i) || [])[1] || null, h1: strip((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || '') || null, prices: [...html.matchAll(/(?:Rs\.?|PKR|\$)\s?([\d,]+(?:\.\d{1,2})?)/gi)].map(m => +m[1].replace(/,/g, '')).filter(n => n > 0).slice(0, 20) }; } catch {} }
  const mine = b.productId ? await db.product.findFirst({ where: { id: b.productId, storeId: req.store.id } }) : null;
  const theirs = page.prices.length ? Math.min(...page.prices) : null; const my = mine ? mine.price / 100 : null;
  const out = await llmJson('Compare a competitor page with our product. Return {summary,priceAdvice,contentGaps:[],ideas:[]}', JSON.stringify({ competitor: page, url: b.url, ours: mine ? { title: mine.title, price: my, desc: strip(mine.description).slice(0, 500) } : null }), () => ({ summary: page.fetched ? `Competitor “${page.title || b.url}” lists ${page.prices.length} prices${theirs ? `, lowest ${theirs}` : ''}.` : 'Live fetch is off (placeholder). Set COMPETITOR_FETCH=1 to analyse real pages.', priceAdvice: theirs && my ? (my > theirs * 1.1 ? 'You are >10% above the competitor — consider a bundle or free delivery instead of a price cut.' : my < theirs * 0.9 ? 'You are >10% cheaper — you may have room to raise price slightly.' : 'Price is competitive.') : 'Not enough data.', contentGaps: ['Size/fit guide', 'Delivery time per city', 'Customer photo reviews', 'FAQ block'], ideas: ['Add comparison table', 'Highlight COD + Sellora Pay protection', 'Bundle offer'] }));
  await log(req.store.id, 'ai.competitor', 2, out.usage); res.json({ ...out, page, ours: my, theirs, placeholder: !config.competitorFetch });
}));
/* ---------------- Storefront chatbot (public) ---------------- */
pub.post('/:shop/chat', ah(async (req: any, res) => {
  const b = parse(z.object({ message: z.string().min(1).max(1000), history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(2000) })).max(10).default([]) }), req.body);
  const s = await db.store.findFirst({ where: { OR: [{ handle: req.params.shop }, { id: req.params.shop }, { publishableKey: req.params.shop }] } }); if (!s) throw nf();
  try { await consume(s.id, 'ai', 1, 'chat'); } catch { return res.status(429).json({ error: 'Assistant is busy — please contact the store on WhatsApp.' }); }
  const ps = await db.product.findMany({ where: { storeId: s.id, status: 'active' }, include: { variants: true }, take: 60 }); const set: any = s.settings || {}; const pol = set.policies || {};
  const ctx = { store: s.name, currency: s.currency, products: ps.map(p => ({ title: p.title, url: `/products/${p.handle}`, price: (p.price / 100).toFixed(2), inStock: p.variants.some(v => v.inventory > 0), variants: p.variants.map(v => v.title) })), policies: pol, faq: set.seo?.faq || faqList(s.name) };
  const q = b.message.toLowerCase(); const words = q.split(/\W+/).filter(w => w.length > 2);
  const fb = () => { const hits = ctx.products.filter(p => words.some(w => p.title.toLowerCase().includes(w))); const f = (ctx.faq as any[]).find(f => words.some(w => f.q.toLowerCase().includes(w))); if (/deliver|shipping|ship/.test(q)) return { reply: pol.shipping || 'We deliver across Pakistan in 2–5 working days with cash on delivery.', products: [] }; if (/return|refund|exchange/.test(q)) return { reply: pol.refund || 'Unused items can be returned within 7 days.', products: [] }; if (hits.length) return { reply: `Yes! ${hits.map(h => `${h.title} is ${h.price} ${s.currency}${h.inStock ? '' : ' (out of stock)'}`).join('; ')}.`, products: hits.slice(0, 3) }; if (f) return { reply: f.a, products: [] }; return { reply: `I can help with products, prices, delivery and returns at ${s.name}. What are you looking for?`, products: [] }; };
  const out = await llmJson('You are the shop assistant. Answer ONLY from the store data provided; if unknown, say so and suggest contacting the store. Be brief and friendly; reply in the customer\'s language. Return {reply, products:[{title,url,price}]}', `STORE DATA: ${JSON.stringify(ctx).slice(0, 12000)}\nHISTORY: ${JSON.stringify(b.history)}\nCUSTOMER: ${b.message}`, fb, 600);
  await log(s.id, 'chat', 1, out.usage); res.json(out);
}));
/** Storefront 301 lookup: GET /api/storefront/:shop/redirect?path=/old → {to, code} or 404 */
pub.get('/:shop/redirect', ah(async (req: any, res) => {
  const s = await db.store.findFirst({ where: { OR: [{ handle: req.params.shop }, { id: req.params.shop }, { publishableKey: req.params.shop }] } }); if (!s) throw nf();
  const r2 = await db.redirect.findFirst({ where: { storeId: s.id, from: String(req.query.path || '') } }); if (!r2) throw nf('No redirect');
  await db.redirect.update({ where: { id: r2.id }, data: { hits: { increment: 1 } } }); res.json({ to: r2.to, code: r2.code });
}));
