import { db } from './db';
import { bad } from './http';
import { convert } from '../providers/fx';
/** Collection membership: manual → productIds; automated → rules [{field,op,value}] (all/any). */
export function inCollection(p: any, c: any) {
  if (c.type !== 'automated') return ((c.productIds as string[]) || []).includes(p.id);
  const rules = (c.rules as any[]) || []; if (!rules.length) return false;
  const test = (r: any) => {
    const tags: string[] = (p.tags as string[]) || [];
    const val = r.field === 'tag' ? tags : r.field === 'price' ? p.price : r.field === 'inventory' ? (p.variants || []).reduce((s: number, v: any) => s + v.inventory, 0) : String(p[r.field] ?? '');
    const rv = r.value;
    switch (r.op) {
      case 'eq': return Array.isArray(val) ? val.map(x => x.toLowerCase()).includes(String(rv).toLowerCase()) : String(val).toLowerCase() === String(rv).toLowerCase();
      case 'neq': return Array.isArray(val) ? !val.includes(rv) : String(val) !== String(rv);
      case 'contains': return (Array.isArray(val) ? val.join(' ') : String(val)).toLowerCase().includes(String(rv).toLowerCase());
      case 'gt': return +val > +rv; case 'lt': return +val < +rv;
      default: return false;
    }
  };
  return c.disjunctive ? rules.some(test) : rules.every(test);
}
export async function collectionProducts(storeId: string, c: any, onlyActive = false) {
  const ps = await db.product.findMany({ where: { storeId, ...(onlyActive ? { status: 'active' } : {}) }, include: { variants: true } });
  return ps.filter(p => inCollection(p, c));
}
export const vPrice = (p: any, v?: any) => (v && v.price != null ? v.price : p.price);

/** Server-side pricing — the only source of truth for totals. */
export async function priceCart(storeId: string, input: { lines: { variantId: string; qty: number }[]; currency?: string; discountCode?: string; giftCode?: string; shipTo?: { country?: string; region?: string }; shippingRate?: string; email?: string }) {
  const store = await db.store.findUniqueOrThrow({ where: { id: storeId } });
  const base = store.currency; const cur = input.currency || base;
  const variants = await db.variant.findMany({ where: { id: { in: input.lines.map(l => l.variantId) }, product: { storeId } }, include: { product: true } });
  const lines = input.lines.map(l => {
    const v = variants.find(x => x.id === l.variantId); if (!v || v.product.status !== 'active') throw bad('Unavailable item ' + l.variantId);
    if (l.qty < 1) throw bad('Invalid quantity');
    if (v.inventory < l.qty) throw bad(`Only ${v.inventory} left of ${v.product.title}`);
    return { variantId: v.id, productId: v.productId, title: v.product.title, variantTitle: v.title, sku: v.sku, price: vPrice(v.product, v), qty: l.qty, tags: (v.product.tags as string[]) || [] };
  });
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  // discounts: one code + best automatic
  const now = new Date();
  const ds = await db.discount.findMany({ where: { storeId, active: true, OR: [{ automatic: true }, ...(input.discountCode ? [{ code: input.discountCode.toUpperCase() }] : [])] } });
  if (input.discountCode && !ds.some(d => d.code === input.discountCode!.toUpperCase())) throw bad('Invalid discount code');
  let discount = 0; let applied: any = null; let freeShip = false;
  for (const d of ds) {
    if ((d.startsAt && d.startsAt > now) || (d.endsAt && d.endsAt < now)) { if (!d.automatic) throw bad('Discount expired'); continue; }
    if (d.usageLimit != null && d.used >= d.usageLimit) { if (!d.automatic) throw bad('Discount usage limit reached'); continue; }
    if (subtotal < d.minSpend) { if (!d.automatic) throw bad(`Minimum spend ${d.minSpend}`); continue; }
    let amt = 0;
    if (d.kind === 'percent') amt = Math.round((subtotal * d.value) / 100);
    else if (d.kind === 'fixed') amt = Math.min(d.value, subtotal);
    else if (d.kind === 'free_shipping') { freeShip = true; amt = 0; }
    else if (d.kind === 'bogo') { // buy X get Y of cheapest units at value% off
      const units = lines.flatMap(l => Array(l.qty).fill(l.price)).sort((a, b) => a - b);
      const group = (d.buyQty || 1) + (d.getQty || 1); const freeCount = Math.floor(units.length / group) * (d.getQty || 1);
      amt = Math.round(units.slice(0, freeCount).reduce((s, x) => s + x, 0) * (d.value || 100) / 100);
    }
    if (amt > discount || (d.kind === 'free_shipping' && !applied)) { discount = amt; applied = d; }
  }
  const after = subtotal - discount;
  // shipping
  const zones = await db.shippingZone.findMany({ where: { storeId } });
  const country = input.shipTo?.country;
  const zone = zones.find(z => country && (z.countries as string[]).includes(country)) || zones.find(z => (z.countries as string[]).includes('*'));
  const rates = ((zone?.rates as any[]) || []).map(r => ({ ...r, price: r.freeOver != null && after >= r.freeOver ? 0 : r.price }));
  const rate = rates.find(r => r.name === input.shippingRate) || rates[0];
  if (country && !zone) throw bad('No shipping to ' + country);
  const shipping = freeShip ? 0 : rate?.price || 0;
  // tax
  const tr = country ? await db.taxRate.findMany({ where: { storeId, country } }) : [];
  const t = tr.find(x => x.region && x.region === input.shipTo?.region) || tr.find(x => !x.region);
  const tax = t ? Math.round(((after + (t.includeShipping ? shipping : 0)) * t.rateBps) / 10000) : 0;
  let total = after + shipping + tax;
  // gift card
  let giftCard = 0;
  if (input.giftCode) { const g = await db.giftCard.findUnique({ where: { code: input.giftCode } }); if (!g || !g.active || g.storeId !== storeId) throw bad('Invalid gift card'); giftCard = Math.min(g.balance, total); total -= giftCard; }
  const fx = async (n: number) => convert(n, base, cur);
  return { currency: cur, baseCurrency: base, lines, subtotal: await fx(subtotal), discount: await fx(discount), shipping: await fx(shipping), tax: await fx(tax), giftCard: await fx(giftCard), total: await fx(total), discountId: applied?.id || null, shippingRates: rates.map(r => r.name), shippingRate: rate?.name || null };
}
export async function nextOrderNumber(storeId: string) { const last = await db.order.findFirst({ where: { storeId }, orderBy: { number: 'desc' } }); return (last?.number || 1000) + 1; }
export const tl = (o: any, msg: string) => [...((o?.timeline as any[]) || []), { at: new Date().toISOString(), msg }];
