import { db } from '../lib/db';
import { config } from '../lib/config';
import { app, P, O } from './apps';
import { call, mock, loadCreds, has, log, IntegrationError, Res } from './core';
/** Runs one adapter action. Live when keys are present, else returns a mock with the redacted request. */
export async function run(storeId: string, appId: string, action: string, input?: any): Promise<Res> {
  const a = app(appId); if (!a) throw Object.assign(new Error('Unknown app'), { status: 404 });
  const fn = a.actions[action]; if (!fn) throw Object.assign(new Error(`Action ${action} not supported by ${appId}`), { status: 400 });
  const { creds, config: cfg } = await loadCreds(storeId, appId); const ctx = { storeId, creds, config: cfg };
  const rq = fn(ctx, input);
  if (!has(creds, ...a.required)) { await log(storeId, appId, 'out', action, 200, false, 'mock: missing keys ' + a.required.filter(k => !creds[k]).join(',')); return mock(rq); }
  try { const r = await call(rq); await log(storeId, appId, 'out', action, r.status, true, JSON.stringify(r.data).slice(0, 300)); return { ...r, request: mock(rq).request }; }
  catch (e: any) { if (e instanceof IntegrationError) { await log(storeId, appId, 'out', action, e.status, true, JSON.stringify(e.data).slice(0, 300)); } throw e; }
}
export async function productsFor(storeId: string, ids?: string[]): Promise<P[]> {
  const s = await db.store.findUniqueOrThrow({ where: { id: storeId } });
  const ps = await db.product.findMany({ where: { storeId, status: 'active', ...(ids?.length ? { id: { in: ids } } : {}) }, include: { variants: true }, take: 1000 });
  return ps.map(p => { const inv = p.variants.reduce((a, v: any) => a + (v.inventory || 0), 0); const sku = (p.variants[0] as any)?.sku; return { id: p.id, sku: sku || p.id, title: p.title, description: p.description.replace(/<[^>]+>/g, ''), link: `${config.publicUrl}/s/${s.handle}/products/${p.handle}`, image: ((p.images as string[]) || [])[0] || '', price: p.price, currency: s.currency, inStock: inv > 0, brand: p.vendor || s.name, qty: inv }; });
}
export async function orderFor(storeId: string, orderId: string, extra: Partial<O> = {}): Promise<O> {
  const o = await db.order.findFirst({ where: { id: orderId, storeId }, include: { lines: true } }); if (!o) throw Object.assign(new Error('Order not found'), { status: 404 });
  const st: any = o.shipTo || {};
  return { id: o.id, number: o.number, email: o.email, phone: st.phone, name: [st.firstName, st.lastName].filter(Boolean).join(' ') || st.name, address: [st.address1, st.address2].filter(Boolean).join(', ') || st.address, city: st.city, country: st.country, currency: o.currency, total: o.total, cod: o.financial === 'pending' ? o.total : 0, items: o.lines.map(l => ({ id: l.sku || l.productId || l.id, title: l.title, qty: l.qty, price: l.price })), createdAt: o.createdAt, ...extra };
}
/** Fire purchase events to every connected marketing/analytics app (used after checkout). */
export async function fanOutPurchase(storeId: string, orderId: string) {
  const ins = await db.appInstall.findMany({ where: { storeId } }); const o = await orderFor(storeId, orderId); const out: Record<string, any> = {};
  for (const i of ins) { const a = app(i.appId); if (!a?.actions.event || !i.credentialsEnc) continue; try { out[i.appId] = (await run(storeId, i.appId, 'event', o)).status; } catch (e: any) { out[i.appId] = 'error ' + (e.status || ''); } }
  return out;
}
