import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { db } from '../src/lib/db';

const app = createApp(); const A = () => request(app);
let s: any; const S = (p: string) => `/api/stores/${s.store.id}${p}`; const tok = () => ({ Authorization: 'Bearer ' + s.accessToken });
const realFetch = globalThis.fetch;
const json = (x: any) => new Response(JSON.stringify(x), { status: 200, headers: { 'Content-Type': 'application/json' } });
const nf = () => new Response('nope', { status: 404 });
const PNG = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex');
function site(routes: Record<string, () => Response>) {
  vi.stubGlobal('fetch', vi.fn(async (url: any, init?: any) => {
    const u = String(url); if (u.startsWith('http://127.0.0.1')) return realFetch(url, init);
    const p = new URL(u); const key = p.pathname + p.search;
    for (const k of Object.keys(routes)) if (key === k || (k.endsWith('*') && key.startsWith(k.slice(0, -1)))) return routes[k]();
    return nf();
  }));
}
const O = 'https://93.184.216.34';

beforeAll(async () => { s = (await A().post('/api/auth/signup').send({ email: 'mv@t.io', password: 'password123', storeName: 'Mover' }).expect(201)).body; });
afterEach(() => vi.unstubAllGlobals());

describe('move a store from Shopify', () => {
  const shop = {
    '/meta.json': () => json({ name: 'Old Lawn Shop', currency: 'PKR' }),
    '/products.json?limit=1': () => json({ products: [{}] }),
    '/products.json?limit=250&page=1': () => json({ products: [
      { handle: 'lawn-kurta', title: 'Lawn Kurta', body_html: '<p>Soft</p><script>x()</script>', vendor: 'Noor', product_type: 'Kurta', tags: 'summer, lawn', options: [{ name: 'Size', values: ['S', 'M'] }], images: [{ src: O + '/img/k.png' }], variants: [{ title: 'S', sku: 'K-S', price: '3500.00', compare_at_price: '4000.00', option1: 'S' }, { title: 'M', sku: 'K-M', price: '3600.00', option1: 'M' }] },
      { handle: 'shawl', title: 'Shawl', body_html: '', options: [{ name: 'Title', values: ['Default Title'] }], images: [], variants: [{ title: 'Default Title', price: '1200', option1: 'Default Title' }] }] }),
    '/collections.json?limit=250&page=1': () => json({ collections: [{ handle: 'summer', title: 'Summer', description: 'Hot days' }, { handle: 'all', title: 'All' }] }),
    '/collections/summer/products.json?limit=250&page=1': () => json({ products: [{ handle: 'lawn-kurta' }] }),
    '/img/k.png': () => new Response(PNG, { headers: { 'Content-Type': 'image/png' } }),
  };
  it('needs the owner confirmation', async () => {
    site(shop); await A().post(S('/migrate/scan')).set(tok()).send({ url: O }).expect(422);
  });
  it('scans, previews and imports products, variants, images and collections', async () => {
    site(shop);
    const sc = (await A().post(S('/migrate/scan')).set(tok()).send({ url: O, owner: true }).expect(200)).body;
    expect(sc.platform).toBe('shopify'); expect(sc.store.name).toBe('Old Lawn Shop');
    expect(sc.counts).toEqual({ products: 2, collections: 1, images: 1 });
    const im = (await A().post(S('/migrate/import')).set(tok()).send({}).expect(200)).body;
    expect(im.products.created).toBe(2); expect(im.collections.created).toBe(1); expect(im.images.copied).toBe(1);
    const k = await db.product.findUnique({ where: { storeId_handle: { storeId: s.store.id, handle: 'lawn-kurta' } }, include: { variants: true } });
    expect(k!.price).toBe(350000); expect(k!.compareAt).toBe(400000); expect(k!.description).not.toContain('script');
    expect(k!.variants.map(v => v.sku).sort()).toEqual(['K-M', 'K-S']);
    expect((k!.images as string[])[0]).not.toContain('93.184.216.34'); // copied, not hotlinked
    const sh = await db.product.findUnique({ where: { storeId_handle: { storeId: s.store.id, handle: 'shawl' } } });
    expect(sh!.options).toEqual([]);
    const c = await db.collection.findUnique({ where: { storeId_handle: { storeId: s.store.id, handle: 'summer' } } });
    expect(c!.productIds).toEqual([k!.id]);
  });
  it('a second import skips what exists unless overwrite is on', async () => {
    site(shop);
    await A().post(S('/migrate/scan')).set(tok()).send({ url: O, owner: true }).expect(200);
    expect((await A().post(S('/migrate/import')).set(tok()).send({}).expect(200)).body.products.skipped).toBe(2);
    await A().post(S('/migrate/scan')).set(tok()).send({ url: O, owner: true }).expect(200);
    expect((await A().post(S('/migrate/import')).set(tok()).send({ overwrite: true, copyImages: false }).expect(200)).body.products.updated).toBe(2);
  });
  it('import without a scan is refused', async () => { await A().post(S('/migrate/import')).set(tok()).send({}).expect(400); });
});

describe('other platforms', () => {
  it('reads WooCommerce through its public Store API', async () => {
    site({
      '/wp-json/wc/store/v1/products?per_page=1': () => json([{}]),
      '/wp-json/wc/store/v1/products?per_page=100&page=1': () => json([{ name: 'Mug', slug: 'woo-mug', sku: 'M1', description: '<p>Clay</p>', prices: { price: '150000', regular_price: '200000', currency_minor_unit: 2 }, images: [], categories: [{ slug: 'kitchen', name: 'Kitchen' }], attributes: [] }]),
    });
    const sc = (await A().post(S('/migrate/scan')).set(tok()).send({ url: O, owner: true }).expect(200)).body;
    expect(sc.platform).toBe('woocommerce'); expect(sc.counts.products).toBe(1); expect(sc.collections[0]).toEqual({ title: 'Kitchen', products: 1 });
    await A().post(S('/migrate/import')).set(tok()).send({ copyImages: false }).expect(200);
    const m = await db.product.findUnique({ where: { storeId_handle: { storeId: s.store.id, handle: 'woo-mug' } } });
    expect(m!.price).toBe(150000); expect(m!.compareAt).toBe(200000);
  });
  it('reads any other site from its sitemap and product data (Wix, Squarespace, custom)', async () => {
    site({
      '/sitemap.xml': () => new Response(`<urlset><url><loc>${O}/product-page/silk-scarf</loc></url><url><loc>${O}/about</loc></url></urlset>`),
      '/product-page/silk-scarf': () => new Response(`<html><script type="application/ld+json">{"@context":"https://schema.org","@type":"Product","name":"Silk Scarf","image":["${O}/s.jpg"],"sku":"SS","offers":{"@type":"Offer","price":"25.50","priceCurrency":"USD"}}</script></html>`),
    });
    const sc = (await A().post(S('/migrate/scan')).set(tok()).send({ url: O, owner: true }).expect(200)).body;
    expect(sc.platform).toBe('generic'); expect(sc.sample[0]).toMatchObject({ title: 'Silk Scarf', price: 2550 });
  });
  it('refuses private addresses', async () => {
    const r = await A().post(S('/migrate/scan')).set(tok()).send({ url: 'http://127.0.0.1:4000', owner: true }); expect(r.status).toBe(400);
  });
});
