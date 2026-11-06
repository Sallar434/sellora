import { THEME_LIBRARY, DEFAULT_THEME, migrateThemes } from '../lib/themes';
import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { db } from '../lib/db';
import { ah, parse, bad, nf, slug, HttpError } from '../lib/http';
import { storeAccess, requirePaid } from '../lib/auth';
import { crud } from '../lib/crud';
import { rand, encrypt } from '../lib/crypto';
import { createStore } from './auth';
import { put } from '../providers/storage';
import { audit } from '../lib/audit';
import { collectionProducts, inCollection } from '../lib/commerce';
import { fx } from '../providers/fx';
export const r = Router();
const J = z.any();
// ---- stores
r.get('/', ah(async (req, res) => { const ms = await db.membership.findMany({ where: { userId: req.user!.sub }, include: { store: true } }); res.json(ms.map(m => ({ ...m.store, secretKey: undefined, role: m.role }))); }));
r.post('/', ah(async (req, res) => { const b = parse(z.object({ name: z.string().min(1), currency: z.string().length(3).optional() }), req.body); if (req.user!.type === 'BUYER') throw bad('Buyers cannot own stores'); res.status(201).json(await createStore(req.user!.sub, b.name, b.currency)); }));
r.get('/:storeId', storeAccess(), ah(async (req, res) => res.json({ ...req.store, secretKey: req.role === 'owner' ? req.store.secretKey : undefined })));
r.patch('/:storeId', storeAccess('settings'), ah(async (req, res) => {
  const b = parse(z.object({ name: z.string(), currency: z.string().length(3), address: J, settings: z.record(J) }).partial(), req.body);
  if ((b.settings as any)?.passwordEnabled === false) { const { getSub } = await import('../lib/billing'); if ((await getSub(req.store.id)).status !== 'active') throw new HttpError(402, 'Buy a plan to remove the storefront password and go live.', { code: 'plan_required' }); }
  if (b.settings) b.settings = { ...(req.store.settings || {}), ...b.settings }; // merge sections: general, policies, checkout, notifications
  const s = await db.store.update({ where: { id: req.store.id }, data: b }); audit(req, 'store.update'); res.json(s);
}));
r.delete('/:storeId', storeAccess('*'), ah(async (req, res) => { if (req.role !== 'owner' && req.role !== 'admin') throw bad('Only owner'); await db.store.delete({ where: { id: req.store.id } }); res.status(204).end(); }));
r.post('/:storeId/keys/rotate', storeAccess('*'), ah(async (req, res) => res.json(await db.store.update({ where: { id: req.store.id }, data: { publishableKey: 'pk_' + rand(18), secretKey: 'sk_' + rand(24) } }))));
// ---- staff & roles
r.get('/:storeId/staff', storeAccess('*'), ah(async (req, res) => res.json(await db.membership.findMany({ where: { storeId: req.store.id }, include: { user: { select: { id: true, email: true, name: true } } } }))));
r.post('/:storeId/staff', storeAccess('*'), ah(async (req, res) => {
  const b = parse(z.object({ email: z.string().email(), role: z.enum(['admin', 'manager', 'staff', 'fulfillment']), permissions: z.array(z.string()).optional() }), req.body);
  const u = await db.user.findUnique({ where: { email: b.email.toLowerCase() } }); if (!u) throw nf('User must sign up first');
  res.status(201).json(await db.membership.upsert({ where: { userId_storeId: { userId: u.id, storeId: req.store.id } }, update: { role: b.role, permissions: b.permissions }, create: { userId: u.id, storeId: req.store.id, role: b.role, permissions: b.permissions } }));
}));
r.delete('/:storeId/staff/:userId', storeAccess('*'), ah(async (req, res) => { await db.membership.deleteMany({ where: { storeId: req.store.id, userId: req.params.userId, role: { not: 'owner' } } }); res.status(204).end(); }));
// ---- domains (stub verification via TXT token)
crud(r, ':storeId/domains', 'domain', z.object({ host: z.string() }), 'settings', { before: d => (d.host ? { ...d, token: 'sellora-verify=' + rand(10) } : d) });
r.post('/:storeId/domains/:id/verify', storeAccess('settings'), ah(async (req, res) => res.json(await db.domain.update({ where: { id: req.params.id }, data: { verified: true } })))); // TODO real DNS TXT lookup
// ---- uploads
const up = multer({ limits: { fileSize: 10 * 1024 * 1024 } });
r.post('/:storeId/uploads', storeAccess(), up.single('file'), ah(async (req, res) => {
  const f = (req as any).file; if (!f) throw bad('file required');
  if (!/^(image\/|application\/pdf)/.test(f.mimetype)) throw bad('Only images/PDF');
  const o = await put(req.store.id, f.originalname, f.buffer, f.mimetype);
  res.status(201).json(await db.upload.create({ data: { storeId: req.store.id, key: o.key, url: o.url, mime: f.mimetype, size: f.size } }));
}));

// ---- products
const variantS = z.object({ id: z.string().optional(), title: z.string().default('Default'), sku: z.string().nullish(), price: z.number().int().nullish(), options: J.optional(), inventory: z.number().int().default(0), imageIndex: z.number().int().nullish() });
const productS = z.object({ title: z.string().min(1), handle: z.string().optional(), description: z.string().default(''), status: z.enum(['active', 'draft', 'archived']).default('active'), vendor: z.string().nullish(), type: z.string().nullish(), tags: z.array(z.string()).default([]), options: J.optional(), images: z.array(z.string()).default([]), price: z.number().int().min(0).default(0), compareAt: z.number().int().nullish(), seoTitle: z.string().nullish(), seoDesc: z.string().nullish(), variants: z.array(variantS).optional(), collections: z.array(z.string()).optional() });
async function setCollections(storeId: string, pid: string, ids?: string[]) {
  if (!ids) return;
  const cols = await db.collection.findMany({ where: { storeId, type: 'manual' } });
  for (const c of cols) { const s = new Set((c.productIds as string[]) || []); const want = ids.includes(c.id) || ids.includes(c.title); if (want === s.has(pid)) continue; want ? s.add(pid) : s.delete(pid); await db.collection.update({ where: { id: c.id }, data: { productIds: [...s] } }); }
}
r.get('/:storeId/products', storeAccess('products'), ah(async (req, res) => {
  const q = String(req.query.q || ''); const status = req.query.status as string | undefined;
  res.json(await db.product.findMany({ where: { storeId: req.store.id, ...(status ? { status } : {}), ...(q ? { OR: [{ title: { contains: q } }, { variants: { some: { sku: { contains: q } } } }] } : {}) }, include: { variants: true }, orderBy: { createdAt: 'desc' } }));
}));
r.post('/:storeId/products', storeAccess('products'), ah(async (req, res) => {
  const { variants, collections, ...d } = parse(productS, req.body);
  const p = await db.product.create({ data: { ...d, handle: slug(d.handle || d.title) + (await db.product.count({ where: { storeId: req.store.id, handle: slug(d.handle || d.title) } }) ? '-' + rand(3).toLowerCase() : ''), storeId: req.store.id, variants: { create: (variants?.length ? variants : [{ title: 'Default', inventory: 0 }]).map(({ id, ...v }) => v) } }, include: { variants: true } });
  await setCollections(req.store.id, p.id, collections); audit(req, 'product.create', { id: p.id }); res.status(201).json(p);
}));
/** Shopify-style product CSV. Prices in the file are in major units (e.g. 1499.00); stored as minor units. */
export const CSV_COLS = ['Handle', 'Title', 'Body (HTML)', 'Vendor', 'Type', 'Tags', 'Published', 'Option1 Name', 'Option1 Value', 'Option2 Name', 'Option2 Value', 'Option3 Name', 'Option3 Value', 'Variant SKU', 'Variant Price', 'Variant Compare At Price', 'Variant Inventory Qty', 'Image Src', 'SEO Title', 'SEO Description', 'Status'];
const money = (n: number | null | undefined) => (n == null ? '' : (n / 100).toFixed(2));
r.get('/:storeId/products/export.csv', storeAccess('products'), ah(async (req, res) => {
  const ids = String(req.query.ids || '').split(',').filter(Boolean); const qq = String(req.query.q || '').trim();
  const where: any = { storeId: req.store.id, ...(ids.length ? { id: { in: ids } } : {}), ...(qq ? { OR: [{ title: { contains: qq } }, { handle: { contains: qq } }] } : {}) };
  const take = req.query.limit ? Math.min(+req.query.limit || 50, 500) : undefined; const skip = take ? ((+(req.query.page as string) || 1) - 1) * take : undefined;
  const ps = await db.product.findMany({ where, include: { variants: true }, orderBy: { createdAt: 'asc' }, take, skip });
  const esc = (v: any) => { const t = String(v ?? ''); return /[",\n\r]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; };
  const rows: string[][] = [CSV_COLS];
  for (const p of ps) {
    const opts = ((p.options as any[]) || []).map(o => o?.name || ''); const imgs = ((p.images as string[]) || []);
    const vs = p.variants.length ? p.variants : [{ title: 'Default', sku: '', price: null, inventory: 0, options: null } as any];
    vs.forEach((v: any, k: number) => {
      const vals: string[] = Array.isArray(v.options) ? v.options : v.title === 'Default' ? [] : String(v.title).split(' / ');
      const first = k === 0;
      rows.push([p.handle, first ? p.title : '', first ? p.description : '', first ? p.vendor || '' : '', first ? p.type || '' : '', first ? ((p.tags as string[]) || []).join(', ') : '', first ? String(p.status === 'active') : '',
        vals[0] ? opts[0] || 'Title' : first && !vals.length ? 'Title' : '', vals[0] || (first && !vals.length ? 'Default Title' : ''), vals[1] ? opts[1] || 'Option2' : '', vals[1] || '', vals[2] ? opts[2] || 'Option3' : '', vals[2] || '',
        v.sku || '', money(v.price ?? p.price), money(p.compareAt), String(v.inventory ?? 0), imgs[k] || '', first ? p.seoTitle || '' : '', first ? p.seoDesc || '' : '', first ? p.status : '']);
    });
  }
  const body = rows.map(r => r.map(esc).join(',')).join('\r\n');
  const excel = req.query.format === 'excel';
  res.type('text/csv').set('Content-Disposition', 'attachment; filename="products_export.csv"').send(excel ? '\uFEFF' + body : body);
}));
function parseCsv(t: string) { t = t.replace(/^\uFEFF/, ''); const out: string[][] = []; let row: string[] = [], f = '', q = false; for (let i = 0; i < t.length; i++) { const c = t[i]; if (q) { if (c === '"' && t[i + 1] === '"') { f += '"'; i++; } else if (c === '"') q = false; else f += c; } else if (c === '"') q = true; else if (c === ',') { row.push(f); f = ''; } else if (c === '\n' || c === '\r') { if (c === '\r' && t[i + 1] === '\n') i++; row.push(f); out.push(row); row = []; f = ''; } else f += c; } if (f || row.length) { row.push(f); out.push(row); } return out; }
/** Groups CSV rows by handle into products, validating as it goes. Accepts Shopify columns and the older Sellora columns. */
export function readProductCsv(text: string) {
  const [head, ...rows] = parseCsv(text); if (!head || !head.some(Boolean)) throw bad('Empty CSV');
  const H = head.map(h => h.trim().toLowerCase()); const ix = (...n: string[]) => { for (const x of n) { const i = H.indexOf(x.toLowerCase()); if (i >= 0) return i; } return -1; };
  if (ix('handle', 'title') < 0) throw bad('CSV needs a Handle or Title column');
  const errors: { row: number; message: string }[] = []; const items = new Map<string, any>(); let last = '';
  rows.forEach((row, n) => {
    if (!row.some(c => c.trim())) return; const line = n + 2;
    const g = (...k: string[]) => { const i = ix(...k); return i >= 0 ? (row[i] || '').trim() : ''; };
    const handle = slug(g('handle') || g('title') || last); if (!handle) { errors.push({ row: line, message: 'Missing Handle and Title' }); return; } last = handle;
    let it = items.get(handle); const isNew = !it;
    if (!it) { it = { handle, title: '', description: '', variants: [], options: [], images: [], tags: [] }; items.set(handle, it); }
    if (g('title')) it.title = g('title'); if (g('body (html)', 'description', 'body')) it.description = g('body (html)', 'description', 'body');
    if (g('vendor')) it.vendor = g('vendor'); if (g('type')) it.type = g('type'); if (g('tags')) it.tags = g('tags').split(/[,;]/).map(s => s.trim()).filter(Boolean);
    const st = g('status').toLowerCase(); const pub = g('published').toLowerCase();
    if (st) { if (!['active', 'draft', 'archived'].includes(st)) errors.push({ row: line, message: `Status "${g('status')}" must be active, draft or archived` }); else it.status = st; }
    else if (pub) it.status = pub === 'true' ? 'active' : 'draft';
    if (g('seo title')) it.seoTitle = g('seo title'); if (g('seo description')) it.seoDesc = g('seo description'); if (g('image src')) it.images.push(g('image src'));
    const num = (v: string, label: string, minor: boolean) => { if (!v) return undefined; const x = Number(v.replace(/,/g, '')); if (!isFinite(x) || x < 0) { errors.push({ row: line, message: `${label} "${v}" is not a valid number` }); return undefined; } return minor ? Math.round(x * 100) : Math.round(x); };
    const vp = num(g('variant price'), 'Variant Price', true); const cmp = num(g('variant compare at price', 'compare at price'), 'Compare At Price', true);
    const oldP = num(g('price'), 'Price', false); const oldVp = num(g('variantprice'), 'VariantPrice', false);
    const inv = num(g('variant inventory qty', 'inventory qty', 'inventory'), 'Inventory Qty', false);
    if (cmp != null) it.compareAt = cmp;
    const vals = [1, 2, 3].map(k => g(`option${k} value`)).filter(Boolean); [1, 2, 3].forEach(k => { const nm = g(`option${k} name`); if (nm && !it.options[k - 1]) it.options[k - 1] = { name: nm, values: [] }; });
    vals.forEach((v, k) => { const o = it.options[k] || (it.options[k] = { name: 'Option' + (k + 1), values: [] }); if (!o.values.includes(v)) o.values.push(v); });
    const price = vp ?? oldVp ?? oldP; if (isNew || it.price == null) it.price = vp ?? oldP ?? 0;
    const title = vals.length && !(vals.length === 1 && vals[0] === 'Default Title') ? vals.join(' / ') : g('variant') || 'Default';
    it.variants.push({ title, sku: g('variant sku', 'sku') || null, price: price ?? null, inventory: inv ?? 0, options: title === 'Default' ? undefined : vals });
    if (isNew && !g('title') && !g('handle')) errors.push({ row: line, message: 'Missing Title' });
  });
  for (const it of items.values()) { if (!it.title) it.title = it.handle; it.options = it.options.filter(Boolean); }
  return { items: [...items.values()], errors, rows: rows.filter(r => r.some(c => c.trim())).length };
}
r.post('/:storeId/products/import', storeAccess('products'), ah(async (req, res) => {
  const text = typeof req.body === 'string' ? req.body : String(req.body?.csv || '');
  const q = (k: string) => String(req.query[k] ?? (typeof req.body === 'object' ? req.body?.[k] : '') ?? '');
  const dryRun = q('dryRun') === 'true' || q('dryRun') === '1'; const overwrite = q('overwrite') !== 'false';
  const { items, errors, rows } = readProductCsv(text);
  const existing = new Set((await db.product.findMany({ where: { storeId: req.store.id, handle: { in: items.map(i => i.handle) } }, select: { handle: true } })).map(p => p.handle));
  const preview = items.map(i => ({ handle: i.handle, title: i.title, variants: i.variants.length, price: i.price, action: existing.has(i.handle) ? (overwrite ? 'update' : 'skip') : 'create' }));
  if (dryRun || errors.length) return res.status(errors.length && !dryRun ? 422 : 200).json({ dryRun: true, rows, products: items.length, errors, preview });
  let created = 0, updated = 0, skipped = 0;
  for (const it of items) {
    const { variants, handle, ...d } = it; const data: any = { ...d, options: d.options.length ? d.options : undefined, images: d.images.length ? d.images : undefined };
    if (!data.status) delete data.status;
    let p = await db.product.findUnique({ where: { storeId_handle: { storeId: req.store.id, handle } } });
    if (p && !overwrite) { skipped++; continue; }
    if (!p) { p = await db.product.create({ data: { ...data, handle, storeId: req.store.id } }); created++; } else { await db.product.update({ where: { id: p.id }, data }); updated++; }
    for (const vd of variants) { const v = await db.variant.findFirst({ where: { productId: p.id, title: vd.title } }); v ? await db.variant.update({ where: { id: v.id }, data: vd }) : await db.variant.create({ data: { ...vd, productId: p.id } }); }
  }
  audit(req, 'product.import', { created, updated, skipped }); res.json({ created, updated, skipped, errors: [] });
}));
r.get('/:storeId/products/import/template.csv', storeAccess('products'), (_req, res) => {
  res.type('text/csv').set('Content-Disposition', 'attachment; filename="product_template.csv"').send(CSV_COLS.join(',') + '\r\nclassic-tee,Classic Tee,<p>Soft cotton tee</p>,Sellora,Shirts,"cotton, summer",true,Size,S,Color,Black,,,TEE-S-BLK,1499.00,1999.00,25,https://example.com/tee.jpg,Classic Tee,Soft cotton tee,active\r\nclassic-tee,,,,,,,Size,M,Color,Black,,,TEE-M-BLK,1499.00,,30,,,,\r\n');
});
r.post('/:storeId/products/bulk', storeAccess('products'), ah(async (req, res) => {
  const b = parse(z.object({ ids: z.array(z.string()), action: z.enum(['update', 'delete', 'addTags', 'removeTags', 'adjustPrice']), data: J.optional() }), req.body);
  const where = { id: { in: b.ids }, storeId: req.store.id };
  if (b.action === 'delete') return res.json(await db.product.deleteMany({ where }));
  if (b.action === 'update') return res.json(await db.product.updateMany({ where, data: parse(productS.omit({ variants: true, collections: true }).partial(), b.data) }));
  const ps = await db.product.findMany({ where });
  for (const p of ps) {
    const tags = new Set((p.tags as string[]) || []);
    if (b.action === 'addTags') (b.data as string[]).forEach(t => tags.add(t));
    if (b.action === 'removeTags') (b.data as string[]).forEach(t => tags.delete(t));
    await db.product.update({ where: { id: p.id }, data: b.action === 'adjustPrice' ? { price: Math.max(0, Math.round(p.price * (1 + (+b.data) / 100))) } : { tags: [...tags] } });
  }
  res.json({ count: ps.length });
}));
r.get('/:storeId/products/:id', storeAccess('products'), ah(async (req, res) => { const p = await db.product.findFirst({ where: { id: req.params.id, storeId: req.store.id }, include: { variants: true } }); if (!p) throw nf(); const cols = (await db.collection.findMany({ where: { storeId: req.store.id } })).filter(c => inCollection(p, c)).map(c => ({ id: c.id, title: c.title })); res.json({ ...p, collections: cols }); }));
r.patch('/:storeId/products/:id', storeAccess('products'), ah(async (req, res) => {
  const old = await db.product.findFirst({ where: { id: req.params.id, storeId: req.store.id }, include: { variants: true } }); if (!old) throw nf();
  const { variants, collections, ...d } = parse(productS.partial(), req.body);
  if (d.handle) d.handle = slug(d.handle);
  await db.product.update({ where: { id: old.id }, data: d });
  if (variants) { // upsert by id; remove missing. Base price applies when variant price is null.
    const keep = variants.filter(v => v.id).map(v => v.id!);
    await db.variant.deleteMany({ where: { productId: old.id, id: { notIn: keep } } });
    for (const { id, ...v } of variants) id ? await db.variant.update({ where: { id }, data: v }) : await db.variant.create({ data: { ...v, productId: old.id } });
  }
  await setCollections(req.store.id, old.id, collections);
  res.json(await db.product.findUnique({ where: { id: old.id }, include: { variants: true } }));
}));
r.delete('/:storeId/products/:id', storeAccess('products'), ah(async (req, res) => { await db.product.deleteMany({ where: { id: req.params.id, storeId: req.store.id } }); res.status(204).end(); }));
r.patch('/:storeId/inventory/:variantId', storeAccess('products'), ah(async (req, res) => {
  const b = parse(z.object({ set: z.number().int().optional(), adjust: z.number().int().optional() }), req.body);
  const v = await db.variant.findFirst({ where: { id: req.params.variantId, product: { storeId: req.store.id } } }); if (!v) throw nf();
  res.json(await db.variant.update({ where: { id: v.id }, data: { inventory: b.set ?? v.inventory + (b.adjust || 0) } }));
}));
// ---- collections
const ruleS = z.object({ field: z.enum(['tag', 'title', 'type', 'vendor', 'price', 'inventory']), op: z.enum(['eq', 'neq', 'contains', 'gt', 'lt']), value: z.union([z.string(), z.number()]) });
const colS = z.object({ title: z.string().min(1), handle: z.string().optional(), type: z.enum(['manual', 'automated']).default('manual'), rules: z.array(ruleS).optional(), disjunctive: z.boolean().default(false), productIds: z.array(z.string()).default([]), description: z.string().default(''), seoTitle: z.string().nullish(), seoDesc: z.string().nullish() });
r.get('/:storeId/collections', storeAccess('products'), ah(async (req, res) => {
  const cols = await db.collection.findMany({ where: { storeId: req.store.id } }); const ps = await db.product.findMany({ where: { storeId: req.store.id }, include: { variants: true } });
  res.json(cols.map(c => ({ ...c, productsCount: ps.filter(p => inCollection(p, c)).length })));
}));
r.post('/:storeId/collections', storeAccess('products'), ah(async (req, res) => { const d = parse(colS, req.body); if (d.type === 'automated' && !d.rules?.length) throw bad('Automated collections need rules'); res.status(201).json(await db.collection.create({ data: { ...d, handle: slug(d.handle || d.title), storeId: req.store.id } })); }));
r.get('/:storeId/collections/:id', storeAccess('products'), ah(async (req, res) => { const c = await db.collection.findFirst({ where: { id: req.params.id, storeId: req.store.id } }); if (!c) throw nf(); res.json({ ...c, products: await collectionProducts(req.store.id, c) }); }));
r.patch('/:storeId/collections/:id', storeAccess('products'), ah(async (req, res) => { const d = parse(colS.partial(), req.body); if (d.handle) d.handle = slug(d.handle); await db.collection.updateMany({ where: { id: req.params.id, storeId: req.store.id }, data: d }); res.json(await db.collection.findUnique({ where: { id: req.params.id } })); }));
r.delete('/:storeId/collections/:id', storeAccess('products'), ah(async (req, res) => { await db.collection.deleteMany({ where: { id: req.params.id, storeId: req.store.id } }); res.status(204).end(); }));
// ---- purchase orders
crud(r, ':storeId/purchase-orders', 'purchaseOrder', z.object({ supplier: z.string(), status: z.enum(['draft', 'ordered', 'received', 'cancelled']).default('draft'), lines: z.array(z.object({ variantId: z.string(), qty: z.number().int().positive(), cost: z.number().int().min(0) })) }), 'products');
r.post('/:storeId/purchase-orders/:id/receive', storeAccess('products'), ah(async (req, res) => {
  const po = await db.purchaseOrder.findFirst({ where: { id: req.params.id, storeId: req.store.id } }); if (!po) throw nf(); if (po.status === 'received') throw bad('Already received');
  for (const l of po.lines as any[]) await db.variant.update({ where: { id: l.variantId }, data: { inventory: { increment: l.qty } } });
  res.json(await db.purchaseOrder.update({ where: { id: po.id }, data: { status: 'received' } }));
}));
// ---- online store
r.get('/:storeId/themes/library', storeAccess('online_store'), ah(async (req, res) => { const migrated = await migrateThemes(req.store.id); res.json({ themes: THEME_LIBRARY, default: DEFAULT_THEME.id, migrated }); }));
crud(r, ':storeId/themes', 'theme', z.object({ name: z.string(), live: z.boolean().default(false), palette: z.record(z.string(), z.string()).optional(), preset: z.string().nullish(), sections: J.optional(), settings: J.optional() }), 'online_store');
r.post('/:storeId/themes/:id/publish', storeAccess('online_store'), requirePaid, ah(async (req, res) => { await db.theme.updateMany({ where: { storeId: req.store.id }, data: { live: false } }); res.json(await db.theme.update({ where: { id: req.params.id }, data: { live: true } })); }));
const pageS = z.object({ title: z.string().min(1), handle: z.string().optional(), body: z.string().default(''), visible: z.boolean().default(true), seoTitle: z.string().nullish(), seoDesc: z.string().nullish() });
crud(r, ':storeId/pages', 'page', pageS, 'online_store', { before: d => (d.title || d.handle ? { ...d, handle: slug(d.handle || d.title) } : d) });
crud(r, ':storeId/blog', 'blogPost', z.object({ title: z.string(), handle: z.string().optional(), body: z.string().default(''), published: z.boolean().default(false) }), 'online_store', { before: d => (d.title ? { ...d, handle: slug(d.handle || d.title) } : d) });
crud(r, ':storeId/menus', 'menu', z.object({ handle: z.string(), title: z.string(), items: z.array(z.object({ title: z.string(), url: z.string(), children: J.optional() })) }), 'online_store');

// ---- Shopify parity: locations, transfers, metaobjects, automations, campaigns, companies, saved views, roles, preferences
crud(r, ':storeId/locations', 'location', z.object({ name: z.string(), address: z.string().default(''), fulfillsOnline: z.boolean().default(true), active: z.boolean().default(true) }), 'settings');
crud(r, ':storeId/transfers', 'transfer', z.object({ originId: z.string(), destinationId: z.string(), items: z.array(z.object({ variantId: z.string(), qty: z.number().int().positive() })), tracking: z.string().optional(), status: z.enum(['draft', 'in_transit', 'received']).default('draft') }), 'products');
crud(r, ':storeId/metaobjects', 'metaobject', z.object({ type: z.string(), handle: z.string(), fields: J }), 'online_store');
crud(r, ':storeId/automations', 'automation', z.object({ name: z.string(), trigger: z.string(), steps: z.array(J), active: z.boolean().default(false) }), 'marketing');
crud(r, ':storeId/campaigns', 'campaign', z.object({ name: z.string(), channel: z.string(), budget: z.number().nonnegative().default(0), status: z.string().default('draft') }), 'marketing');
crud(r, ':storeId/companies', 'company', z.object({ name: z.string(), terms: z.string().default('Due on receipt'), contacts: z.array(J).default([]) }), 'customers');
crud(r, ':storeId/saved-views', 'savedView', z.object({ resource: z.string(), name: z.string(), query: J }), 'products');
crud(r, ':storeId/roles', 'staffRole', z.object({ name: z.string(), permissions: z.array(z.string()) }), 'settings');
crud(r, ':storeId/preferences', 'preference', z.object({ data: J }), 'online_store');
// ---- customers & segments
crud(r, ':storeId/customers', 'customer', z.object({ email: z.string().email(), name: z.string().nullish(), phone: z.string().nullish(), tags: z.array(z.string()).default([]), addresses: z.array(J).default([]), acceptsMarketing: z.boolean().default(false) }), 'customers', { orderBy: { createdAt: 'desc' } });
r.get('/:storeId/customers/:id/orders', storeAccess('customers'), ah(async (req, res) => { const c = await db.customer.findFirst({ where: { id: req.params.id, storeId: req.store.id } }); if (!c) throw nf(); res.json(await db.order.findMany({ where: { storeId: req.store.id, OR: [{ customerId: c.id }, { email: c.email }] }, include: { lines: true } })); }));
crud(r, ':storeId/segments', 'segment', z.object({ name: z.string(), query: z.object({ tag: z.string().optional(), minOrders: z.number().optional(), minSpent: z.number().optional(), acceptsMarketing: z.boolean().optional() }) }), 'customers');
r.get('/:storeId/segments/:id/customers', storeAccess('customers'), ah(async (req, res) => {
  const s = await db.segment.findFirst({ where: { id: req.params.id, storeId: req.store.id } }); if (!s) throw nf(); const q: any = s.query;
  const cs = await db.customer.findMany({ where: { storeId: req.store.id } }); const os = await db.order.findMany({ where: { storeId: req.store.id, status: { not: 'cancelled' }, draft: false } });
  res.json(cs.filter(c => { const mine = os.filter(o => o.customerId === c.id || o.email === c.email); return (!q.tag || ((c.tags as string[]) || []).includes(q.tag)) && (q.minOrders == null || mine.length >= q.minOrders) && (q.minSpent == null || mine.reduce((s, o) => s + o.total, 0) >= q.minSpent) && (q.acceptsMarketing == null || c.acceptsMarketing === q.acceptsMarketing); }));
}));
// ---- discounts, gift cards, taxes, shipping, markets
crud(r, ':storeId/discounts', 'discount', z.object({ code: z.string().transform(s => s.toUpperCase()).nullish(), automatic: z.boolean().default(false), kind: z.enum(['percent', 'fixed', 'free_shipping', 'bogo']), value: z.number().int().min(0), minSpend: z.number().int().min(0).default(0), usageLimit: z.number().int().nullish(), startsAt: z.coerce.date().nullish(), endsAt: z.coerce.date().nullish(), buyQty: z.number().int().nullish(), getQty: z.number().int().nullish(), active: z.boolean().default(true) }), 'discounts');
crud(r, ':storeId/gift-cards', 'giftCard', z.object({ code: z.string().optional(), balance: z.number().int().positive(), currency: z.string().length(3), active: z.boolean().default(true) }), 'discounts', { before: d => (d.balance != null && !d.code ? { ...d, code: 'GC' + rand(8).toUpperCase().replace(/[^A-Z0-9]/g, 'X') } : d) });
crud(r, ':storeId/taxes', 'taxRate', z.object({ country: z.string().length(2), region: z.string().nullish(), rateBps: z.number().int().min(0).max(10000), includeShipping: z.boolean().default(false) }), 'settings');
crud(r, ':storeId/shipping-zones', 'shippingZone', z.object({ name: z.string(), countries: z.array(z.string()), rates: z.array(z.object({ name: z.string(), price: z.number().int().min(0), freeOver: z.number().int().nullish(), days: z.string().optional() })) }), 'settings');
crud(r, ':storeId/markets', 'market', z.object({ name: z.string(), currency: z.string().length(3), countries: z.array(z.string()).default([]), primary: z.boolean().default(false), active: z.boolean().default(true) }), 'settings', {
  before: async (d, req) => { if (d.currency && !req.query.allowDuplicate) { const dup = await db.market.findFirst({ where: { storeId: req.store.id, currency: d.currency, NOT: { id: req.params.id || '' } } }); if (dup) throw bad(`Market "${dup.name}" already uses ${d.currency}. Merge countries into it or pass ?allowDuplicate=1`, { duplicateOf: dup.id }); } return d; } });
r.post('/:storeId/markets/:id/merge', storeAccess('settings'), ah(async (req, res) => { const into = await db.market.findFirst({ where: { id: req.params.id, storeId: req.store.id } }); if (!into) throw nf(); const countries = [...new Set([...(into.countries as string[]), ...((req.body?.countries as string[]) || [])])]; res.json(await db.market.update({ where: { id: into.id }, data: { countries } })); }));
r.get('/:storeId/fx', storeAccess(), ah(async (req, res) => res.json({ base: req.store.currency, rates: await fx().rates(req.store.currency) })));
// ---- apps & reviews
export const APPS = [
  { id: 'google-merchant', name: 'Google & YouTube', kind: 'feed' }, { id: 'meta', name: 'Facebook & Instagram', kind: 'feed+pixel' }, { id: 'tiktok', name: 'TikTok', kind: 'pixel' },
  { id: 'ga4', name: 'Google Analytics 4', kind: 'pixel' }, { id: 'zapier', name: 'Zapier', kind: 'webhook' }, { id: 'reviews', name: 'Sellora Reviews', kind: 'reviews' }, { id: 'mailchimp', name: 'Mailchimp', kind: 'oauth' },
];
r.get('/:storeId/apps', storeAccess('apps'), ah(async (req, res) => { const ins = await db.appInstall.findMany({ where: { storeId: req.store.id } }); res.json(APPS.map(a => { const i = ins.find(x => x.appId === a.id); return { ...a, installed: !!i, config: i?.config, connected: !!i?.credentialsEnc }; })); }));
r.post('/:storeId/apps/:appId/install', storeAccess('apps'), ah(async (req, res) => {
  if (!APPS.some(a => a.id === req.params.appId)) throw nf('Unknown app');
  const { config, credentials } = req.body || {};
  const data = { config: config || {}, credentialsEnc: credentials ? encrypt(JSON.stringify(credentials)) : undefined };
  const i = await db.appInstall.upsert({ where: { storeId_appId: { storeId: req.store.id, appId: req.params.appId } }, update: data, create: { ...data, storeId: req.store.id, appId: req.params.appId } });
  res.status(201).json({ ...i, credentialsEnc: undefined, connected: !!i.credentialsEnc });
}));
r.delete('/:storeId/apps/:appId', storeAccess('apps'), ah(async (req, res) => { await db.appInstall.deleteMany({ where: { storeId: req.store.id, appId: req.params.appId } }); res.status(204).end(); }));
r.get('/:storeId/apps/pixels', storeAccess('apps'), ah(async (req, res) => {
  const ins = await db.appInstall.findMany({ where: { storeId: req.store.id } }); const cfg = (id: string) => (ins.find(i => i.appId === id)?.config as any) || null; const out: string[] = [];
  if (cfg('ga4')?.measurementId) out.push(`<script async src="https://www.googletagmanager.com/gtag/js?id=${cfg('ga4').measurementId}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${cfg('ga4').measurementId}');</script>`);
  if (cfg('meta')?.pixelId) out.push(`<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${cfg('meta').pixelId}');fbq('track','PageView');</script>`);
  if (cfg('tiktok')?.pixelId) out.push(`<!-- TikTok pixel ${cfg('tiktok').pixelId} -->`);
  res.json({ snippets: out });
}));
crud(r, ':storeId/reviews', 'review', z.object({ productId: z.string(), rating: z.number().int().min(1).max(5), author: z.string(), body: z.string(), approved: z.boolean().default(false) }), 'products');
crud(r, ':storeId/webhooks', 'webhookEndpoint', z.object({ url: z.string().url(), events: z.array(z.string()), secret: z.string().optional() }), 'apps', { before: d => (d.url && !d.secret ? { ...d, secret: 'whsec_' + rand(16) } : d) });
crud(r, ':storeId/payment-links', 'paymentLink', z.object({ title: z.string(), amount: z.number().int().positive(), currency: z.string().length(3), active: z.boolean().default(true) }), 'orders');
r.get('/:storeId/audit-log', storeAccess('*'), ah(async (req, res) => res.json(await db.auditLog.findMany({ where: { storeId: req.store.id }, orderBy: { createdAt: 'desc' }, take: 200 }))));

/** Go live: removes the storefront password. Paid plans only. */
r.post('/:storeId/online-store/publish', storeAccess('online_store'), requirePaid, ah(async (req, res) => { const s = await db.store.update({ where: { id: req.store.id }, data: { settings: { ...(req.store.settings || {}), passwordEnabled: false, publishedAt: new Date().toISOString() } } }); audit(req, 'store.publish'); res.json({ published: true, settings: s.settings }); }));
