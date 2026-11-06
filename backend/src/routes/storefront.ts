import { HttpError } from '../lib/http';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '../lib/db';
import { ah, parse, nf, bad, forbid } from '../lib/http';
import { config } from '../lib/config';
import { collectionProducts, priceCart } from '../lib/commerce';
import { placeOrder } from '../lib/checkout';
import { idempotent } from '../lib/idem';
import { releaseEscrow } from '../lib/ledger';
export const r = Router();
const optUser = (req: any, _r: any, n: any) => { try { const t = (req.headers.authorization || '').slice(7); if (t) req.user = jwt.verify(t, config.jwtSecret); } catch {} n(); };
r.use(optUser);
/** :shop = store handle, store id, or publishable key */
r.param('shop', (async (req: any, _res: any, next: any, shop: string) => { try { const s = await db.store.findFirst({ where: { OR: [{ handle: shop }, { id: shop }, { publishableKey: shop }] } }); if (!s) throw nf('Store not found'); { const { getSub } = await import('../lib/billing'); if ((await getSub(s.id)).status === 'expired') throw new HttpError(503, 'Store unavailable', { code: 'store_unavailable' }); } req.shop = s; next(); } catch (e) { next(e); } }) as any);
const clean = (p: any) => ({ id: p.id, title: p.title, handle: p.handle, description: p.description, vendor: p.vendor, type: p.type, tags: p.tags, options: p.options, images: p.images, price: p.price, compareAt: p.compareAt, seoTitle: p.seoTitle, seoDesc: p.seoDesc, variants: (p.variants || []).map((v: any) => ({ id: v.id, title: v.title, sku: v.sku, price: v.price ?? p.price, options: v.options, available: v.inventory > 0, imageIndex: v.imageIndex })) });
r.get('/:shop', ah(async (req: any, res) => {
  const s = req.shop;
  const [theme, menus, pages, markets] = await Promise.all([db.theme.findFirst({ where: { storeId: s.id, live: true } }), db.menu.findMany({ where: { storeId: s.id } }), db.page.findMany({ where: { storeId: s.id, visible: true }, select: { title: true, handle: true } }), db.market.findMany({ where: { storeId: s.id, active: true } })]);
  res.json({ store: { id: s.id, name: s.name, handle: s.handle, currency: s.currency, publishableKey: s.publishableKey, address: s.address, policies: (s.settings as any)?.policies }, theme, menus, pages, markets });
}));
r.get('/:shop/products', ah(async (req: any, res) => {
  const q = String(req.query.q || '').toLowerCase();
  const ps = await db.product.findMany({ where: { storeId: req.shop.id, status: 'active' }, include: { variants: true }, orderBy: { createdAt: 'desc' } });
  res.json(ps.filter(p => !q || (p.title + ' ' + p.description + ' ' + ((p.tags as string[]) || []).join(' ')).toLowerCase().includes(q)).map(clean));
}));
r.get('/:shop/search', ah(async (req: any, res) => res.redirect(307, `/api/storefront/${req.params.shop}/products?q=${encodeURIComponent(String(req.query.q || ''))}`)));
r.get('/:shop/products/:handle', ah(async (req: any, res) => { const p = await db.product.findFirst({ where: { storeId: req.shop.id, status: 'active', OR: [{ handle: req.params.handle }, { id: req.params.handle }] }, include: { variants: true } }); if (!p) throw nf(); const reviews = await db.review.findMany({ where: { productId: p.id, approved: true } }); res.json({ ...clean(p), reviews }); }));
r.get('/:shop/collections', ah(async (req: any, res) => { const cs = await db.collection.findMany({ where: { storeId: req.shop.id } }); res.json(await Promise.all(cs.map(async c => ({ id: c.id, title: c.title, handle: c.handle, description: c.description, productsCount: (await collectionProducts(req.shop.id, c, true)).length })))); }));
r.get('/:shop/collections/:handle', ah(async (req: any, res) => { const c = await db.collection.findFirst({ where: { storeId: req.shop.id, handle: req.params.handle } }); if (!c) throw nf(); res.json({ ...c, products: (await collectionProducts(req.shop.id, c, true)).map(clean) }); }));
r.get('/:shop/pages/:handle', ah(async (req: any, res) => { const p = await db.page.findFirst({ where: { storeId: req.shop.id, handle: req.params.handle, visible: true } }); if (!p) throw nf(); res.json(p); }));
r.get('/:shop/blog', ah(async (req: any, res) => res.json(await db.blogPost.findMany({ where: { storeId: req.shop.id, published: true } }))));
// carts
const lineS = z.array(z.object({ variantId: z.string(), qty: z.number().int().positive() }));
r.post('/:shop/carts', ah(async (req: any, res) => { const b = parse(z.object({ lines: lineS.default([]), currency: z.string().length(3).optional(), email: z.string().email().optional() }), req.body); res.status(201).json(await db.cart.create({ data: { storeId: req.shop.id, lines: b.lines as any, currency: b.currency || req.shop.currency, email: b.email } })); }));
r.get('/:shop/carts/:id', ah(async (req: any, res) => { const c = await db.cart.findFirst({ where: { id: req.params.id, storeId: req.shop.id } }); if (!c) throw nf(); res.json({ ...c, quote: (c.lines as any[]).length ? await priceCart(req.shop.id, { ...(c as any), lines: c.lines as any, currency: c.currency, discountCode: c.discountCode || undefined, giftCode: c.giftCode || undefined, shipTo: c.shipTo as any, shippingRate: c.shippingRate || undefined }) : null }); }));
r.patch('/:shop/carts/:id', ah(async (req: any, res) => { const b = parse(z.object({ lines: lineS, email: z.string().email(), discountCode: z.string().nullable(), giftCode: z.string().nullable(), shipTo: z.any(), shippingRate: z.string(), currency: z.string().length(3) }).partial(), req.body); res.json(await db.cart.update({ where: { id: req.params.id }, data: b })); }));
r.post('/:shop/checkout/quote', ah(async (req: any, res) => res.json(await priceCart(req.shop.id, req.body))));
r.post('/:shop/checkout', idempotent, ah(async (req: any, res) => {
  const b = parse(z.object({ cartId: z.string().optional(), lines: lineS.optional(), email: z.string().email().optional(), currency: z.string().length(3).optional(), discountCode: z.string().optional(), giftCode: z.string().optional(), shipTo: z.object({ name: z.string().optional(), address1: z.string().optional(), city: z.string().optional(), country: z.string().length(2), region: z.string().optional(), zip: z.string().optional() }).optional(), shippingRate: z.string().optional(), payment: z.object({ source: z.string() }).optional() }), req.body);
  let input: any = b;
  if (b.cartId) { const c = await db.cart.findFirst({ where: { id: b.cartId, storeId: req.shop.id, status: 'open' } }); if (!c) throw nf('Cart not found'); input = { currency: c.currency, discountCode: c.discountCode || undefined, giftCode: c.giftCode || undefined, shipTo: c.shipTo, shippingRate: c.shippingRate || undefined, email: c.email || undefined, ...b, lines: c.lines }; }
  if (!input.lines?.length) throw bad('Cart is empty');
  const buyer = req.user?.type === 'BUYER' ? { id: req.user.sub, email: req.user.email } : undefined;
  const out = await placeOrder(req.shop.id, input, buyer);
  res.status(201).json({ order: out.order, escrow: out.escrow && { id: out.escrow.id, status: out.escrow.status, releaseAt: out.escrow.releaseAt } });
}));
/** Buyer confirms receipt → escrow released to seller (minus platform fee). */
r.post('/:shop/orders/:id/confirm', ah(async (req: any, res) => {
  const o = await db.order.findFirst({ where: { id: req.params.id, storeId: req.shop.id } }); if (!o) throw nf();
  const ok = (req.user?.type === 'BUYER' && req.user.email === o.email) || (req.body?.email && req.body.email.toLowerCase() === o.email && req.body.orderNumber === o.number);
  if (!ok) throw forbid('Only the buyer can confirm');
  const e = await db.escrow.findUnique({ where: { orderId: o.id } }); if (!e) throw bad('No escrow');
  res.json(await releaseEscrow(e.id, 'buyer confirmed'));
}));
// buyer: my orders
r.get('/:shop/me/orders', ah(async (req: any, res) => { if (req.user?.type !== 'BUYER') throw forbid(); res.json(await db.order.findMany({ where: { storeId: req.shop.id, email: req.user.email }, include: { lines: true } })); }));
r.post('/:shop/reviews', ah(async (req: any, res) => { const b = parse(z.object({ productId: z.string(), rating: z.number().int().min(1).max(5), author: z.string(), body: z.string().max(4000) }), req.body); res.status(201).json(await db.review.create({ data: { ...b, storeId: req.shop.id } })); }));
// payment links (public pay page data + pay)
r.get('/:shop/pay/:linkId', ah(async (req: any, res) => { const l = await db.paymentLink.findFirst({ where: { id: req.params.linkId, storeId: req.shop.id, active: true } }); if (!l) throw nf(); res.json(l); }));
