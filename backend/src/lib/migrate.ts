/**
 * "Move your store": read a store on another platform from its public pages and copy the catalog into VendOm.
 *  - Shopify: /meta.json, /products.json and /collections.json (public on most stores; no login needed)
 *  - WooCommerce: the Store API /wp-json/wc/store/v1 (public)
 *  - Any other site: /sitemap.xml → product pages → schema.org Product data (JSON-LD), which Wix, Squarespace, BigCommerce and most themes publish
 * Products keep their title, description, price, compare-at price, options, variants, SKUs, images, tags, vendor and type.
 * Collections keep their title, description and products. Images are copied into VendOm storage so they keep working after the old store closes.
 */
import { db } from './db';
import { assertPublicUrl } from './connectors';
import { put } from '../providers/storage';

export type Platform = 'shopify' | 'woocommerce' | 'generic';
type PVariant = { title: string; sku?: string; price: number; compareAt?: number; options: Record<string, string> };
export type PProduct = { handle: string; title: string; description: string; vendor?: string; type?: string; tags: string[]; images: string[]; options: { name: string; values: string[] }[]; variants: PVariant[]; price: number; compareAt?: number; sourceUrl?: string };
export type PCollection = { handle: string; title: string; description: string; image?: string; productHandles: string[] };
export type Scan = { platform: Platform; origin: string; store: { name?: string; currency?: string; description?: string }; products: PProduct[]; collections: PCollection[]; warnings: string[] };

const MAX_PRODUCTS = 2000, MAX_PAGES = 40;
const UA = 'VendOm-StoreMover/1.0 (+https://vendom.app)';
export const fetcher = { fetch: (u: string, i?: RequestInit) => fetch(u, i) }; // tests swap this
async function get(url: string, accept = 'application/json') {
  await assertPublicUrl(url);
  const r = await fetcher.fetch(url, { headers: { 'User-Agent': UA, Accept: accept }, redirect: 'follow', signal: AbortSignal.timeout(20000) });
  return r;
}
async function json(url: string) { const r = await get(url); if (!r.ok) return null; const t = await r.text(); if (t.length > 20e6) return null; try { return JSON.parse(t); } catch { return null; } }
const minor = (v: any) => { const n = parseFloat(String(v ?? '').replace(/[^\d.]/g, '')); return Number.isFinite(n) ? Math.round(n * 100) : 0; };
const slug = (s: string) => String(s || '').toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 80) || 'item';
const strip = (h: string) => String(h || '').replace(/<script[\s\S]*?<\/script>/gi, '').replace(/ on\w+="[^"]*"/gi, '');

export function normalizeUrl(raw: string) { let s = String(raw || '').trim(); if (!/^https?:\/\//i.test(s)) s = 'https://' + s; const u = new URL(s); return u.origin; }

export async function detect(origin: string): Promise<Platform> {
  const s = await json(origin + '/products.json?limit=1'); if (s && Array.isArray(s.products)) return 'shopify';
  const w = await json(origin + '/wp-json/wc/store/v1/products?per_page=1'); if (Array.isArray(w)) return 'woocommerce';
  return 'generic';
}

/* ---------- Shopify ---------- */
async function shopify(origin: string, warn: string[]): Promise<Omit<Scan, 'platform' | 'origin' | 'warnings'>> {
  const meta = (await json(origin + '/meta.json')) || {};
  const products: PProduct[] = [];
  for (let page = 1; page <= MAX_PAGES && products.length < MAX_PRODUCTS; page++) {
    const j = await json(`${origin}/products.json?limit=250&page=${page}`); const list = j?.products || [];
    for (const p of list) {
      const opts = (p.options || []).filter((o: any) => o.name && !(o.name === 'Title' && (o.values || []).join() === 'Default Title')).map((o: any) => ({ name: o.name, values: o.values || [] }));
      const variants: PVariant[] = (p.variants || []).map((v: any) => ({ title: v.title === 'Default Title' ? 'Default' : v.title, sku: v.sku || undefined, price: minor(v.price), compareAt: v.compare_at_price ? minor(v.compare_at_price) : undefined, options: Object.fromEntries(opts.map((o: any, i: number) => [o.name, v['option' + (i + 1)]])) }));
      products.push({ handle: p.handle, title: p.title, description: strip(p.body_html || ''), vendor: p.vendor || undefined, type: p.product_type || undefined, tags: typeof p.tags === 'string' ? p.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : (p.tags || []), images: (p.images || []).map((i: any) => i.src).filter(Boolean), options: opts, variants: variants.length ? variants : [{ title: 'Default', price: 0, options: {} }], price: variants[0]?.price || 0, compareAt: variants[0]?.compareAt, sourceUrl: `${origin}/products/${p.handle}` });
    }
    if (list.length < 250) break;
  }
  const collections: PCollection[] = [];
  for (let page = 1; page <= 10; page++) {
    const j = await json(`${origin}/collections.json?limit=250&page=${page}`); const list = j?.collections || [];
    for (const c of list) {
      if (c.handle === 'all' || c.handle === 'frontpage') continue;
      const handles: string[] = [];
      for (let pp = 1; pp <= 10; pp++) { const cp = await json(`${origin}/collections/${c.handle}/products.json?limit=250&page=${pp}`); const L = cp?.products || []; handles.push(...L.map((x: any) => x.handle)); if (L.length < 250) break; }
      collections.push({ handle: c.handle, title: c.title, description: strip(c.description || ''), image: c.image?.src, productHandles: handles });
    }
    if (list.length < 250) break;
  }
  if (!products.length) warn.push('This Shopify store hides its product list. Export products to CSV in its admin (Products › Export) and import the file here.');
  return { store: { name: meta.name, currency: meta.currency, description: meta.description }, products, collections };
}

/* ---------- WooCommerce ---------- */
async function woo(origin: string, warn: string[]): Promise<Omit<Scan, 'platform' | 'origin' | 'warnings'>> {
  const products: PProduct[] = []; const cats: Record<string, PCollection> = {};
  for (let page = 1; page <= MAX_PAGES && products.length < MAX_PRODUCTS; page++) {
    const list = await json(`${origin}/wp-json/wc/store/v1/products?per_page=100&page=${page}`); if (!Array.isArray(list) || !list.length) break;
    for (const p of list) {
      const div = Math.pow(10, p.prices?.currency_minor_unit ?? 2), toMinor = (v: any) => Math.round((parseInt(v || '0', 10) / div) * 100);
      const attrs = (p.attributes || []).filter((a: any) => a.has_variations).map((a: any) => ({ name: a.name, values: (a.terms || []).map((t: any) => t.name) }));
      const price = toMinor(p.prices?.price), reg = toMinor(p.prices?.regular_price);
      const handle = p.slug || slug(p.name);
      products.push({ handle, title: p.name, description: strip(p.description || p.short_description || ''), tags: (p.tags || []).map((t: any) => t.name), images: (p.images || []).map((i: any) => i.src).filter(Boolean), options: attrs, variants: [{ title: 'Default', sku: p.sku || undefined, price, compareAt: reg > price ? reg : undefined, options: {} }], price, compareAt: reg > price ? reg : undefined, sourceUrl: p.permalink });
      for (const c of p.categories || []) { const k = c.slug || slug(c.name); (cats[k] ||= { handle: k, title: c.name, description: '', productHandles: [] }).productHandles.push(handle); }
    }
    if (list.length < 100) break;
  }
  if (!products.length) warn.push('This WooCommerce store hides its products from the public API. Export them to CSV (Products › Export) and import the file here.');
  return { store: {}, products, collections: Object.values(cats) };
}

/* ---------- any other site: sitemap + schema.org Product ---------- */
function locs(xml: string) { return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map(m => m[1].replace(/&amp;/g, '&')); }
function ld(html: string) { const out: any[] = []; for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) { try { const j = JSON.parse(m[1].trim()); (Array.isArray(j) ? j : j['@graph'] || [j]).forEach((x: any) => out.push(x)); } catch { /* skip bad block */ } } return out; }
async function generic(origin: string, warn: string[]): Promise<Omit<Scan, 'platform' | 'origin' | 'warnings'>> {
  const sm = await get(origin + '/sitemap.xml', 'application/xml'); let urls: string[] = [];
  if (sm.ok) { let L = locs(await sm.text()); const subs = L.filter(u => /sitemap/i.test(u) && /\.xml/i.test(u)); if (subs.length) { L = []; for (const s of subs.filter(u => /product|store|shop|item/i.test(u)).concat(subs).slice(0, 6)) { const r = await get(s, 'application/xml').catch(() => null); if (r?.ok) L.push(...locs(await r.text())); } } urls = L; }
  let prodUrls = [...new Set(urls.filter(u => /\/(product|products|product-page|item|items|shop|store|p)\//i.test(u)))].slice(0, 300);
  if (!prodUrls.length) prodUrls = [...new Set(urls)].filter(u => !/\.(xml|jpg|png|pdf)$/i.test(u)).slice(0, 60); // no clear product URLs: look at the first pages
  const products: PProduct[] = [];
  for (const u of prodUrls) {
    const r = await get(u, 'text/html').catch(() => null); if (!r?.ok) continue; const html = await r.text();
    const p = ld(html).find(x => /Product/i.test(String(x['@type']))); if (!p) continue;
    const off = Array.isArray(p.offers) ? p.offers[0] : p.offers?.offers?.[0] || p.offers || {};
    const imgs = (Array.isArray(p.image) ? p.image : [p.image]).map((i: any) => (typeof i === 'string' ? i : i?.url)).filter(Boolean);
    const price = minor(off.price ?? off.lowPrice);
    products.push({ handle: slug(new URL(u).pathname.split('/').filter(Boolean).pop() || p.name), title: String(p.name || '').slice(0, 200), description: strip(p.description || ''), vendor: p.brand?.name || (typeof p.brand === 'string' ? p.brand : undefined), tags: [], images: imgs, options: [], variants: [{ title: 'Default', sku: p.sku || undefined, price, options: {} }], price, sourceUrl: u });
  }
  if (!products.length) warn.push('No products were found on this site. Export your products to a CSV file from your old platform and import it here.');
  return { store: {}, products, collections: [] };
}

export async function scan(rawUrl: string): Promise<Scan> {
  const origin = normalizeUrl(rawUrl); await assertPublicUrl(origin);
  const platform = await detect(origin); const warnings: string[] = [];
  const data = platform === 'shopify' ? await shopify(origin, warnings) : platform === 'woocommerce' ? await woo(origin, warnings) : await generic(origin, warnings);
  if (data.products.length >= MAX_PRODUCTS) warnings.push(`Only the first ${MAX_PRODUCTS} products were read. Import the rest with a CSV file.`);
  return { platform, origin, ...data, warnings };
}

async function copyImage(storeId: string, src: string): Promise<string> {
  try {
    const r = await get(src.startsWith('//') ? 'https:' + src : src, 'image/*'); if (!r.ok) return src;
    const type = r.headers.get('content-type') || 'image/jpeg'; if (!/^image\//.test(type)) return src;
    const buf = Buffer.from(await r.arrayBuffer()); if (buf.length > 15e6) return src;
    const name = (new URL(src.startsWith('//') ? 'https:' + src : src).pathname.split('/').pop() || 'image').slice(0, 80);
    return (await put(storeId, name, buf, type)).url || src;
  } catch { return src; }
}

/** Copy a scan into the store. Existing products/collections with the same handle are updated when overwrite is on, skipped otherwise. */
export async function importScan(storeId: string, s: Scan, o: { overwrite?: boolean; copyImages?: boolean; status?: 'active' | 'draft' } = {}) {
  const res = { products: { created: 0, updated: 0, skipped: 0 }, collections: { created: 0, updated: 0 }, images: { copied: 0, linked: 0 }, errors: [] as string[] };
  const ids: Record<string, string> = {};
  for (const p of s.products) {
    try {
      const ex = await db.product.findUnique({ where: { storeId_handle: { storeId, handle: p.handle } } });
      if (ex && !o.overwrite) { res.products.skipped++; ids[p.handle] = ex.id; continue; }
      const images: string[] = [];
      for (const src of p.images.slice(0, 12)) { const u = o.copyImages === false ? src : await copyImage(storeId, src); images.push(u); if (u !== src) res.images.copied++; else res.images.linked++; }
      const data = { title: p.title, description: p.description, vendor: p.vendor, type: p.type, tags: p.tags, options: p.options, images, price: p.price, compareAt: p.compareAt ?? null, status: o.status || 'active' };
      const variants = p.variants.map(v => ({ title: v.title, sku: v.sku, price: v.price, options: v.options, inventory: 0 }));
      if (ex) { await db.variant.deleteMany({ where: { productId: ex.id } }); await db.product.update({ where: { id: ex.id }, data: { ...data, variants: { create: variants } } }); ids[p.handle] = ex.id; res.products.updated++; }
      else { const c = await db.product.create({ data: { storeId, handle: p.handle, ...data, variants: { create: variants } } }); ids[p.handle] = c.id; res.products.created++; }
    } catch (e: any) { res.errors.push(`${p.title}: ${e.message}`); }
  }
  for (const c of s.collections) {
    const productIds = c.productHandles.map(h => ids[h]).filter(Boolean);
    const ex = await db.collection.findUnique({ where: { storeId_handle: { storeId, handle: c.handle } } });
    if (ex) { await db.collection.update({ where: { id: ex.id }, data: { title: c.title, description: c.description, productIds } }); res.collections.updated++; }
    else { await db.collection.create({ data: { storeId, handle: c.handle, title: c.title, description: c.description, productIds } }); res.collections.created++; }
  }
  return res;
}
