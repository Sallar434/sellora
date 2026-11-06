/** Sellora+ — features beyond Shopify (WhatsApp, COD risk, wholesale, OEM, PK couriers, export docs, fixed FX prices, live, workshops, compliance, affiliates, bank transfers, AI listings). */
import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db';
import { ah, parse, bad, nf, HttpError } from '../lib/http';
import { storeAccess } from '../lib/auth';
import { crud } from '../lib/crud';
import { idempotent } from '../lib/idem';
import { sha256, rand } from '../lib/crypto';
import { config } from '../lib/config';
import { nextOrderNumber, tl } from '../lib/commerce';
import { emit } from '../lib/webhooks';
import { fx } from '../providers/fx';
import { llm } from '../providers/llm';
import { notify } from '../providers/notify';
import { app } from '../integrations/apps';
import { loadCreds, has, IntegrationError } from '../integrations/core';
import { run, orderFor } from '../integrations/run';
export const r = Router();
const B = '/:storeId/plus';
const money = z.number().int().min(0).max(1e11);
const own = async (model: string, storeId: string, id: string) => { const x = await (db as any)[model].findFirst({ where: { id, storeId } }); if (!x) throw nf(); return x; };
const conflict = (m: string) => new HttpError(409, m);
const esc = (s: any) => String(s ?? '').replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' } as any)[c]);

// ---------- 1. WhatsApp ordering
/** Parses "2 x Pro Glove", "Pro Glove x2", "SKU-1 3" lines against the catalogue. */
export async function parseWa(storeId: string, text: string) {
  const ps = await db.product.findMany({ where: { storeId, status: 'active' }, include: { variants: true } });
  const lines: any[] = [], unmatched: string[] = [];
  for (const raw of text.split(/\n|,|;/).map(s => s.trim()).filter(Boolean)) {
    let qty = 1, name = raw; const a = raw.match(/^(\d{1,5})\s*[x×]?\s+(.+)$/i), b = raw.match(/^(.+?)\s*[x×]\s*(\d{1,5})$/i), c = raw.match(/^(\S+)\s+(\d{1,5})$/);
    if (a) { qty = +a[1]; name = a[2]; } else if (b) { qty = +b[2]; name = b[1]; } else if (c) { qty = +c[2]; name = c[1]; }
    const n = name.toLowerCase();
    const v = ps.flatMap(p => p.variants.map(v => ({ p, v }))).find(x => x.v.sku && x.v.sku.toLowerCase() === n);
    const p = v?.p || ps.find(p => p.title.toLowerCase() === n) || ps.find(p => p.title.toLowerCase().includes(n) || n.includes(p.title.toLowerCase()));
    if (p && qty > 0) lines.push({ productId: p.id, variantId: (v?.v || p.variants[0])?.id, title: p.title, qty, price: (v?.v || p.variants[0])?.price ?? p.price }); else unmatched.push(raw);
  }
  return { lines, unmatched };
}
/** Called by the signed WhatsApp Cloud API webhook. Idempotent on wa message id. */
export async function ingestWhatsapp(storeId: string, body: any) {
  const msgs = (body?.entry || []).flatMap((e: any) => (e.changes || []).flatMap((c: any) => (c.value?.messages || []).map((m: any) => ({ m, contact: (c.value.contacts || []).find((x: any) => x.wa_id === m.from) }))));
  let created = 0;
  for (const { m, contact } of msgs) {
    if (m.type !== 'text' || !m.text?.body) continue;
    if (await db.whatsappOrder.findUnique({ where: { waMessageId: m.id } })) continue;
    const p = await parseWa(storeId, m.text.body);
    await db.whatsappOrder.create({ data: { storeId, phone: '+' + m.from, name: contact?.profile?.name, text: m.text.body, lines: p.lines, unmatched: p.unmatched, waMessageId: m.id } }); created++;
  }
  return { created };
}
r.get(`${B}/whatsapp/orders`, storeAccess('orders'), ah(async (req, res) => res.json(await db.whatsappOrder.findMany({ where: { storeId: req.store.id }, orderBy: { createdAt: 'desc' } }))));
r.post(`${B}/whatsapp/parse`, storeAccess('orders'), ah(async (req, res) => { const b = parse(z.object({ text: z.string().min(1).max(4000), phone: z.string().regex(/^\+?\d{8,15}$/), name: z.string().max(120).optional(), save: z.boolean().default(false) }), req.body); const p = await parseWa(req.store.id, b.text); if (b.save) return res.status(201).json(await db.whatsappOrder.create({ data: { storeId: req.store.id, phone: b.phone, name: b.name, text: b.text, lines: p.lines, unmatched: p.unmatched } })); res.json(p); }));
r.post(`${B}/whatsapp/orders/:id/convert`, storeAccess('orders'), idempotent, ah(async (req, res) => {
  const w = await own('whatsappOrder', req.store.id, req.params.id); if (w.status === 'converted') throw conflict('Already converted');
  const lines = (w.lines as any[]) || []; if (!lines.length) throw bad('No matched products');
  const city = parse(z.object({ city: z.string().max(80).optional(), address: z.string().max(300).optional() }), req.body || {});
  const subtotal = lines.reduce((a, l) => a + l.price * l.qty, 0);
  const o = await db.order.create({ data: { storeId: req.store.id, number: await nextOrderNumber(req.store.id), email: `${w.phone.replace(/\D/g, '')}@whatsapp.sellora`, currency: req.store.currency, subtotal, total: subtotal, financial: 'pending', shipTo: { name: w.name, phone: w.phone, ...city }, timeline: tl(null, 'Created from WhatsApp (Cash on delivery)'), lines: { create: lines.map(l => ({ productId: l.productId, variantId: l.variantId, title: l.title, price: l.price, qty: l.qty })) } } });
  await db.whatsappOrder.update({ where: { id: w.id }, data: { status: 'converted', orderId: o.id } }); await emit(req.store.id, 'orders/create', { id: o.id, source: 'whatsapp' });
  res.status(201).json(o);
}));
r.get(`${B}/whatsapp/catalogue`, storeAccess('orders'), ah(async (req, res) => { const ps = await db.product.findMany({ where: { storeId: req.store.id, status: 'active' }, take: 200 }); res.json({ text: `${req.store.name} catalogue\n` + ps.map((p, i) => `${i + 1}. ${p.title} — ${(p.price / 100).toFixed(0)} ${req.store.currency}`).join('\n') + '\nReply e.g. "2 x ' + (ps[0]?.title || 'Product') + '"', count: ps.length }); }));
r.post(`${B}/whatsapp/send`, storeAccess('orders'), ah(async (req, res) => { const b = parse(z.object({ to: z.string().regex(/^\+?\d{8,15}$/), text: z.string().min(1).max(4096) }), req.body); res.json(await run(req.store.id, 'whatsapp', 'sendText', b)); }));

// ---------- 2. COD risk scoring
export function codScore(o: any, history: { returned: number; delivered: number }) {
  let s = 0; const why: string[] = []; const st = o.shipTo || {};
  if (o.total > 1500000) { s += 25; why.push('High order value'); }
  if (!st.address || String(st.address).length < 12) { s += 20; why.push('Short or missing address'); }
  if (!st.phone || !/^\+?92\d{10}$|^03\d{9}$/.test(String(st.phone).replace(/[\s-]/g, ''))) { s += 20; why.push('Phone is not a valid Pakistani mobile'); }
  if (history.returned > 0) { s += Math.min(40, history.returned * 20); why.push(`${history.returned} previous COD return(s)`); }
  if (history.delivered >= 2) { s -= 15; why.push('Repeat buyer with deliveries'); }
  if (/whatsapp\.sellora$/.test(o.email)) { s += 5; why.push('No email (WhatsApp order)'); }
  s = Math.max(0, Math.min(100, s)); return { score: s, level: s >= 60 ? 'high' : s >= 30 ? 'medium' : 'low', reasons: why };
}
r.post(`${B}/cod/:orderId/score`, storeAccess('orders'), ah(async (req, res) => {
  const o = await own('order', req.store.id, req.params.orderId); const st: any = o.shipTo || {};
  const sh = await db.shipment.findMany({ where: { storeId: req.store.id } }); const prior = await db.order.findMany({ where: { storeId: req.store.id, id: { not: o.id }, OR: [{ email: o.email }, ...(st.phone ? [{ shipTo: { path: '$.phone', equals: st.phone } } as any] : [])] }, select: { id: true } }).catch(() => db.order.findMany({ where: { storeId: req.store.id, id: { not: o.id }, email: o.email }, select: { id: true } }));
  const ids = new Set(prior.map(p => p.id)); const h = { returned: sh.filter(s => ids.has(s.orderId) && s.status === 'returned').length, delivered: sh.filter(s => ids.has(s.orderId) && ['delivered', 'cod_reconciled'].includes(s.status)).length };
  const sc = codScore(o, h);
  res.json(await db.codCheck.upsert({ where: { storeId_orderId: { storeId: req.store.id, orderId: o.id } }, update: { score: sc.score, level: sc.level, reasons: sc.reasons }, create: { storeId: req.store.id, orderId: o.id, ...sc } }));
}));
r.post(`${B}/cod/:orderId/otp`, storeAccess('orders'), ah(async (req, res) => {
  const c = await db.codCheck.findUnique({ where: { storeId_orderId: { storeId: req.store.id, orderId: req.params.orderId } } }); if (!c) throw bad('Score the order first');
  const o = await own('order', req.store.id, req.params.orderId); const phone = (o.shipTo as any)?.phone; if (!phone) throw bad('Order has no phone');
  const code = String(Math.floor(100000 + Math.random() * 900000)); await db.codCheck.update({ where: { id: c.id }, data: { status: 'otp_sent', otpHash: sha256(c.id + code) } });
  await notify('sms', phone, 'otp', { code }).catch(() => {}); res.json({ sent: true, ...(config.env !== 'production' ? { devCode: code } : {}) });
}));
r.post(`${B}/cod/:orderId/verify`, storeAccess('orders'), ah(async (req, res) => {
  const b = parse(z.object({ code: z.string().regex(/^\d{6}$/) }), req.body); const c = await db.codCheck.findUnique({ where: { storeId_orderId: { storeId: req.store.id, orderId: req.params.orderId } } });
  if (!c?.otpHash) throw bad('No OTP sent'); if (sha256(c.id + b.code) !== c.otpHash) throw bad('Wrong code');
  res.json(await db.codCheck.update({ where: { id: c.id }, data: { status: 'verified', otpHash: null } }));
}));
r.post(`${B}/cod/:orderId/reject`, storeAccess('orders'), ah(async (req, res) => { const c = await db.codCheck.findUnique({ where: { storeId_orderId: { storeId: req.store.id, orderId: req.params.orderId } } }); if (!c) throw nf(); await db.order.update({ where: { id: c.orderId }, data: { status: 'cancelled' } }); res.json(await db.codCheck.update({ where: { id: c.id }, data: { status: 'rejected' } })); }));

// ---------- 3. Wholesale / RFQ
crud(r, ':storeId/plus/price-tiers', 'priceTier', z.object({ productId: z.string(), minQty: z.number().int().min(2).max(1e6), price: money }), 'products');
export function tierFor(base: number, tiers: { minQty: number; price: number }[], qty: number) { const t = [...tiers].sort((a, b) => b.minQty - a.minQty).find(t => qty >= t.minQty); return t ? t.price : base; }
r.get(`${B}/wholesale/quote`, storeAccess('products'), ah(async (req, res) => {
  const q = parse(z.object({ productId: z.string(), qty: z.coerce.number().int().min(1).max(1e6) }), req.query); const p = await own('product', req.store.id, q.productId);
  const moq = +(((p.tags as string[]) || []).find(t => /^moq:\d+$/.test(t))?.split(':')[1] || 1); const tiers = await db.priceTier.findMany({ where: { storeId: req.store.id, productId: p.id } });
  const unit = tierFor(p.price, tiers, q.qty); res.json({ productId: p.id, qty: q.qty, moq, meetsMoq: q.qty >= moq, unitPrice: unit, total: unit * q.qty, savings: (p.price - unit) * q.qty, currency: req.store.currency });
}));
crud(r, ':storeId/plus/rfqs', 'rfq', z.object({ buyer: z.string().min(1).max(120), email: z.string().email(), productId: z.string(), qty: z.number().int().min(1).max(1e6), unitPrice: money.default(0), notes: z.string().max(2000).optional() }), 'orders');
const rfqStep = (to: string, from: string[]) => ah(async (req: any, res: any) => { const x = await own('rfq', req.store.id, req.params.id); if (!from.includes(x.status)) throw conflict(`Cannot ${to} an RFQ that is ${x.status}`); const d: any = { status: to }; if (to === 'quoted') d.unitPrice = parse(z.object({ unitPrice: money.refine(v => v > 0) }), req.body).unitPrice; res.json(await db.rfq.update({ where: { id: x.id }, data: d })); });
r.post(`${B}/rfqs/:id/quote`, storeAccess('orders'), rfqStep('quoted', ['requested', 'quoted']));
r.post(`${B}/rfqs/:id/accept`, storeAccess('orders'), rfqStep('accepted', ['quoted']));
r.post(`${B}/rfqs/:id/decline`, storeAccess('orders'), rfqStep('declined', ['requested', 'quoted']));

// ---------- 4. OEM builder + proof approval
const spec = z.object({ base: z.string().max(60), color: z.string().regex(/^#[0-9a-fA-F]{6}$/), logo: z.string().max(200).optional(), text: z.string().max(40).optional(), size: z.string().max(10).optional() });
export const oemPrice = (s: z.infer<typeof spec>, qty: number) => { let u = 250000; if (s.logo) u += 30000; if (s.text) u += 15000; if (qty >= 500) u = Math.round(u * 0.8); else if (qty >= 100) u = Math.round(u * 0.9); return u; };
r.get(`${B}/designs`, storeAccess('products'), ah(async (req, res) => res.json(await db.customDesign.findMany({ where: { storeId: req.store.id }, orderBy: { createdAt: 'desc' } }))));
r.post(`${B}/designs`, storeAccess('products'), ah(async (req, res) => { const b = parse(z.object({ name: z.string().min(1).max(120), customer: z.string().min(1).max(120), spec, qty: z.number().int().min(1).max(1e6) }), req.body); res.status(201).json(await db.customDesign.create({ data: { ...b, storeId: req.store.id, unitPrice: oemPrice(b.spec, b.qty) } })); }));
r.post(`${B}/designs/:id/proof`, storeAccess('products'), ah(async (req, res) => { const d = await own('customDesign', req.store.id, req.params.id); if (d.proofStatus === 'approved') throw conflict('Already approved'); const b = parse(z.object({ proofUrl: z.string().url() }), req.body); res.json(await db.customDesign.update({ where: { id: d.id }, data: { proofUrl: b.proofUrl, proofStatus: 'proof_sent' } })); }));
r.post(`${B}/designs/:id/:decision(approve|changes)`, storeAccess('products'), ah(async (req, res) => { const d = await own('customDesign', req.store.id, req.params.id); if (d.proofStatus !== 'proof_sent') throw conflict('No proof awaiting decision'); res.json(await db.customDesign.update({ where: { id: d.id }, data: { proofStatus: req.params.decision === 'approve' ? 'approved' : 'changes_requested' } })); }));

// ---------- 5. Couriers: book (live API when keys present), track, airway bill, COD reconciliation
export const COURIERS: Record<string, { name: string; base: number; perKg: number; codBps: number; intl?: boolean }> = { tcs: { name: 'TCS', base: 25000, perKg: 12000, codBps: 200 }, leopards: { name: 'Leopards Courier', base: 22000, perKg: 10000, codBps: 200 }, mp: { name: 'M&P', base: 23000, perKg: 11000, codBps: 200 }, postex: { name: 'PostEx', base: 20000, perKg: 9000, codBps: 250 }, trax: { name: 'Trax', base: 21000, perKg: 9500, codBps: 200 }, dhl: { name: 'DHL Express', base: 650000, perKg: 250000, codBps: 0, intl: true } };
export const courierFee = (c: string, grams: number, cod: number) => { const k = COURIERS[c]; return k.base + Math.ceil(Math.max(0, grams - 500) / 500) * Math.round(k.perKg / 2) + Math.round((cod * k.codBps) / 10000); };
const trkFrom = (c: string, d: any) => String(d?.track_number || d?.dist?.trackingNumber || d?.data?.trackingNumber || d?.tracking_number || d?.consignmentNo || d?.shipmentTrackingNumber || d?.bookingReply?.consignmentNo || '') || null;
r.get(`${B}/shipments`, storeAccess('orders'), ah(async (req, res) => res.json(await db.shipment.findMany({ where: { storeId: req.store.id }, orderBy: { createdAt: 'desc' } }))));
r.post(`${B}/shipments`, storeAccess('orders'), idempotent, ah(async (req, res) => {
  const b = parse(z.object({ orderId: z.string(), courier: z.enum(['tcs', 'leopards', 'mp', 'postex', 'trax', 'dhl']), weightGrams: z.number().int().min(100).max(500000) }), req.body);
  const o = await own('order', req.store.id, b.orderId); if (o.status === 'cancelled') throw conflict('Order is cancelled');
  if (await db.shipment.findFirst({ where: { storeId: req.store.id, orderId: o.id, status: { not: 'returned' } } })) throw conflict('Order already has an active shipment');
  const cod = o.financial === 'pending' ? o.total : 0; let trackingNo: string | null = null, live = false, raw: any = null;
  if (app(b.courier) && has((await loadCreds(req.store.id, b.courier)).creds, ...app(b.courier)!.required)) {
    try { const r1 = await run(req.store.id, b.courier, 'book', await orderFor(req.store.id, o.id, { weightGrams: b.weightGrams })); trackingNo = trkFrom(b.courier, r1.data); live = true; raw = r1.data; }
    catch (e) { if (e instanceof IntegrationError) throw new HttpError(502, `${COURIERS[b.courier].name} booking failed`, { upstreamStatus: e.status, body: e.data }); throw e; }
  }
  trackingNo ||= `${b.courier.toUpperCase()}${Date.now().toString().slice(-8)}${rand(2).replace(/[^A-Z0-9]/gi, '').toUpperCase()}`;
  const s = await db.shipment.create({ data: { storeId: req.store.id, orderId: o.id, courier: b.courier, trackingNo, weightGrams: b.weightGrams, codAmount: cod, fee: courierFee(b.courier, b.weightGrams, cod), live, raw } });
  await db.order.update({ where: { id: o.id }, data: { timeline: tl(o, `Booked with ${COURIERS[b.courier].name} — ${trackingNo}`) } });
  res.status(201).json(s);
}));
r.post(`${B}/shipments/:id/status`, storeAccess('orders'), ah(async (req, res) => { const s = await own('shipment', req.store.id, req.params.id); const b = parse(z.object({ status: z.enum(['in_transit', 'delivered', 'returned']) }), req.body); if (s.status === 'cod_reconciled') throw conflict('Already reconciled'); res.json(await db.shipment.update({ where: { id: s.id }, data: { status: b.status } })); }));
r.post(`${B}/shipments/:id/track`, storeAccess('orders'), ah(async (req, res) => { const s = await own('shipment', req.store.id, req.params.id); if (!app(s.courier)?.actions.track) return res.json({ status: s.status, live: false }); res.json(await run(req.store.id, s.courier, 'track', { trackingNo: s.trackingNo })); }));
r.get(`${B}/shipments/:id/airway-bill`, storeAccess('orders'), ah(async (req, res) => {
  const s = await own('shipment', req.store.id, req.params.id); const o = await db.order.findUniqueOrThrow({ where: { id: s.orderId }, include: { lines: true } }); const st: any = o.shipTo || {};
  res.type('html').send(`<!doctype html><meta charset=utf-8><title>Airway bill ${esc(s.trackingNo)}</title><div style="font:14px system-ui;border:2px solid #000;padding:16px;width:600px"><h2>${esc(COURIERS[s.courier].name)} — Airway bill</h2><p style="font:700 28px monospace;letter-spacing:3px">${esc(s.trackingNo)}</p><p><b>From:</b> ${esc(req.store.name)}</p><p><b>To:</b> ${esc(st.name)} · ${esc(st.phone)}<br>${esc(st.address)} ${esc(st.city)}</p><p><b>Order:</b> #${o.number} · ${s.weightGrams / 1000} kg · ${o.lines.reduce((a, l) => a + l.qty, 0)} pcs</p><p style="font-size:20px"><b>COD:</b> ${(s.codAmount / 100).toFixed(2)} ${esc(o.currency)}</p></div>`);
}));
/** CSV from courier: tracking,amount (major units). Marks matched shipments reconciled. */
r.post(`${B}/shipments/reconcile`, storeAccess('orders'), ah(async (req, res) => {
  const text = typeof req.body === 'string' ? req.body : String(req.body?.csv || ''); if (!text.trim()) throw bad('Empty CSV');
  const rows = text.split(/\r?\n/).map(l => l.split(',').map(c => c.trim())).filter(r => r[0] && !/^track/i.test(r[0]));
  const out = { matched: [] as string[], mismatch: [] as any[], unknown: [] as string[] };
  for (const [trk, amt] of rows) {
    const s = await db.shipment.findFirst({ where: { storeId: req.store.id, trackingNo: trk } }); if (!s) { out.unknown.push(trk); continue; }
    const paid = Math.round(parseFloat(amt) * 100); if (!Number.isFinite(paid)) { out.mismatch.push({ trackingNo: trk, expected: s.codAmount, paid: null }); continue; }
    if (paid === s.codAmount) { await db.shipment.update({ where: { id: s.id }, data: { status: 'cod_reconciled', settled: paid } }); out.matched.push(trk); } else out.mismatch.push({ trackingNo: trk, expected: s.codAmount, paid });
  }
  res.json(out);
}));

// ---------- 6. Export documents
export const INCOTERMS = ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF'];
r.get(`${B}/export-docs`, storeAccess('orders'), ah(async (req, res) => res.json(await db.exportDoc.findMany({ where: { storeId: req.store.id }, select: { id: true, orderId: true, type: true, number: true, incoterm: true, createdAt: true }, orderBy: { createdAt: 'desc' } }))));
r.post(`${B}/export-docs`, storeAccess('orders'), ah(async (req, res) => {
  const b = parse(z.object({ orderId: z.string(), type: z.enum(['ci', 'pl']), incoterm: z.enum(INCOTERMS as [string, ...string[]]), hsCodes: z.record(z.string().regex(/^\d{4}(\.?\d{2}){0,3}$/, 'HS code must be 4–10 digits')).default({}), port: z.string().max(80).default('Sialkot / Karachi'), netKg: z.number().positive().max(1e6).optional(), grossKg: z.number().positive().max(1e6).optional() }), req.body);
  const o = await db.order.findFirst({ where: { id: b.orderId, storeId: req.store.id }, include: { lines: true } }); if (!o) throw nf();
  if (b.netKg && b.grossKg && b.netKg > b.grossKg) throw bad('Net weight cannot exceed gross weight');
  const n = `${b.type.toUpperCase()}-${o.number}-${(await db.exportDoc.count({ where: { storeId: req.store.id } })) + 1}`; const st: any = o.shipTo || {};
  const rows = o.lines.map(l => `<tr><td>${esc(l.title)}</td><td>${esc(b.hsCodes[l.productId || ''] || b.hsCodes[l.sku || ''] || '9506.99')}</td><td>${l.qty}</td>${b.type === 'ci' ? `<td>${(l.price / 100).toFixed(2)}</td><td>${(l.price * l.qty / 100).toFixed(2)}</td>` : ''}</tr>`).join('');
  const html = `<!doctype html><meta charset=utf-8><title>${n}</title><body style="font:13px system-ui"><h2>${b.type === 'ci' ? 'Commercial invoice' : 'Packing list'} ${n}</h2><p><b>Exporter:</b> ${esc(req.store.name)}, Pakistan<br><b>Consignee:</b> ${esc(st.name || o.email)}, ${esc(st.city)} ${esc(st.country)}<br><b>Incoterm:</b> ${b.incoterm} ${esc(b.port)} (Incoterms® 2020)<br><b>Currency:</b> ${esc(o.currency)}</p><table border=1 cellpadding=4 style="border-collapse:collapse"><tr><th>Description</th><th>HS code</th><th>Qty</th>${b.type === 'ci' ? '<th>Unit</th><th>Amount</th>' : ''}</tr>${rows}</table>${b.type === 'ci' ? `<p><b>Total:</b> ${(o.total / 100).toFixed(2)} ${esc(o.currency)}</p>` : `<p><b>Net:</b> ${b.netKg ?? '-'} kg · <b>Gross:</b> ${b.grossKg ?? '-'} kg</p>`}<p>Country of origin: Pakistan</p></body>`;
  res.status(201).json(await db.exportDoc.create({ data: { storeId: req.store.id, orderId: o.id, type: b.type, number: n, incoterm: b.incoterm, html } }));
}));
r.get(`${B}/export-docs/:id/html`, storeAccess('orders'), ah(async (req, res) => res.type('html').send((await own('exportDoc', req.store.id, req.params.id)).html)));

// ---------- 7. Fixed per-currency prices + rounding
crud(r, ':storeId/plus/currency-prices', 'currencyPrice', z.object({ productId: z.string(), currency: z.string().regex(/^[A-Z]{3}$/), price: money }), 'products');
export function roundPrice(minor: number, rule: string) { const v = minor / 100; let o = v; if (rule === '99') o = Math.max(0.99, Math.floor(v) + 0.99); else if (rule === 'int') o = Math.round(v); else if (['5', '10', '100'].includes(rule)) o = Math.max(+rule, Math.round(v / +rule) * +rule); return Math.round(o * 100); }
r.get(`${B}/price/:productId`, storeAccess(), ah(async (req, res) => {
  const q = parse(z.object({ currency: z.string().regex(/^[A-Z]{3}$/), rounding: z.enum(['none', '99', 'int', '5', '10', '100']).default('none') }), req.query); const p = await own('product', req.store.id, req.params.productId);
  const fixed = await db.currencyPrice.findUnique({ where: { storeId_productId_currency: { storeId: req.store.id, productId: p.id, currency: q.currency } } }); if (fixed) return res.json({ price: fixed.price, currency: q.currency, source: 'fixed' });
  const rates = await fx().rates(req.store.currency); if (!rates[q.currency]) throw bad('Unsupported currency');
  res.json({ price: roundPrice(Math.round(p.price * rates[q.currency]), q.rounding), currency: q.currency, source: 'converted', rate: rates[q.currency] });
}));

// ---------- 9. Live selling, 11. Workshops, 12. Compliance & samples, 13. Affiliates
crud(r, ':storeId/plus/live', 'liveSession', z.object({ title: z.string().min(1).max(120), startsAt: z.coerce.date(), platform: z.enum(['facebook', 'instagram', 'tiktok', 'youtube', 'store']), videoUrl: z.string().url().optional(), productIds: z.array(z.string()).max(50).default([]), status: z.enum(['scheduled', 'live', 'ended']).default('scheduled') }), 'marketing');
crud(r, ':storeId/plus/suppliers', 'supplier', z.object({ name: z.string().min(1).max(120), city: z.string().max(80).optional(), phone: z.string().max(20).optional() }), 'products');
crud(r, ':storeId/plus/materials', 'rawMaterial', z.object({ name: z.string().min(1).max(120), unit: z.string().min(1).max(20), stock: z.number().min(0).max(1e9).default(0), reorderAt: z.number().min(0).max(1e9).default(0) }), 'products');
r.get(`${B}/jobs`, storeAccess('products'), ah(async (req, res) => res.json(await db.jobWork.findMany({ where: { storeId: req.store.id }, orderBy: { createdAt: 'desc' } }))));
r.post(`${B}/jobs`, storeAccess('products'), ah(async (req, res) => {
  const b = parse(z.object({ supplierId: z.string(), productId: z.string(), qty: z.number().int().min(1).max(1e6), rate: money, materialId: z.string().optional(), materialQty: z.number().min(0).max(1e9).default(0) }), req.body);
  await own('supplier', req.store.id, b.supplierId); await own('product', req.store.id, b.productId);
  const job = await db.$transaction(async tx => { if (b.materialId) { const m = await tx.rawMaterial.findFirst({ where: { id: b.materialId, storeId: req.store.id } }); if (!m) throw nf('Material not found'); if (m.stock < b.materialQty) throw bad(`Only ${m.stock} ${m.unit} in stock`); await tx.rawMaterial.update({ where: { id: m.id }, data: { stock: { decrement: b.materialQty }, wip: { increment: b.materialQty } } }); } return tx.jobWork.create({ data: { ...b, storeId: req.store.id } }); });
  res.status(201).json(job);
}));
r.post(`${B}/jobs/:id/receive`, storeAccess('products'), ah(async (req, res) => {
  const j = await own('jobWork', req.store.id, req.params.id); const b = parse(z.object({ qty: z.number().int().min(0).max(1e6), rejected: z.number().int().min(0).max(1e6).default(0) }), req.body);
  if (b.qty + b.rejected === 0) throw bad('Nothing received'); if (j.received + j.rejected + b.qty + b.rejected > j.qty) throw bad(`Only ${j.qty - j.received - j.rejected} pieces outstanding`);
  const out = await db.$transaction(async tx => {
    const done = j.received + j.rejected + b.qty + b.rejected; const frac = (b.qty + b.rejected) / j.qty;
    if (j.materialId && j.materialQty) await tx.rawMaterial.update({ where: { id: j.materialId }, data: { wip: { decrement: +(j.materialQty * frac).toFixed(4) } } });
    const v = await tx.variant.findFirst({ where: { productId: j.productId } }); if (v && b.qty) await tx.variant.update({ where: { id: v.id }, data: { inventory: { increment: b.qty } } });
    return tx.jobWork.update({ where: { id: j.id }, data: { received: { increment: b.qty }, rejected: { increment: b.rejected }, status: done >= j.qty ? 'completed' : 'in_progress' } });
  });
  res.json({ ...out, payable: out.received * j.rate });
}));
crud(r, ':storeId/plus/badges', 'complianceBadge', z.object({ name: z.enum(['ISO 9001', 'CE', 'EN 388', 'EN 420', 'REACH', 'OEKO-TEX', 'BSCI', 'SEDEX', 'FIFA Quality', 'Fair Trade']), certNo: z.string().min(2).max(60), expiresAt: z.coerce.date().optional() }), 'products');
crud(r, ':storeId/plus/samples', 'sampleRequest', z.object({ buyer: z.string().min(1).max(120), email: z.string().email(), country: z.string().max(60).optional(), productIds: z.array(z.string()).min(1).max(10), fee: money.default(0), status: z.enum(['requested', 'approved', 'shipped', 'converted', 'declined']).default('requested') }), 'orders');
crud(r, ':storeId/plus/affiliates', 'affiliate', z.object({ name: z.string().min(1).max(120), email: z.string().email(), type: z.enum(['affiliate', 'influencer']).default('affiliate'), code: z.string().regex(/^[A-Z0-9_-]{3,20}$/i).transform(s => s.toUpperCase()), rateBps: z.number().int().min(0).max(5000) }), 'marketing');
r.post(`${B}/affiliates/:id/attribute`, storeAccess('marketing'), ah(async (req, res) => { const a = await own('affiliate', req.store.id, req.params.id); const b = parse(z.object({ orderId: z.string() }), req.body); const o = await own('order', req.store.id, b.orderId); if (((o.timeline as any[]) || []).some(t => /^ref:/.test(t.msg))) throw conflict('Order already attributed'); res.json(await db.order.update({ where: { id: o.id }, data: { timeline: tl(o, `ref:${a.code}`) } })); }));
r.get(`${B}/affiliates/:id/stats`, storeAccess('marketing'), ah(async (req, res) => {
  const a = await own('affiliate', req.store.id, req.params.id); const os = (await db.order.findMany({ where: { storeId: req.store.id, status: { not: 'cancelled' } } })).filter(o => ((o.timeline as any[]) || []).some(t => t.msg === `ref:${a.code}`));
  const sales = os.reduce((s, o) => s + o.total - o.refunded, 0); const earned = Math.round((sales * a.rateBps) / 10000); res.json({ orders: os.length, sales, earned, paid: a.paid, owed: earned - a.paid });
}));
r.post(`${B}/affiliates/:id/payout`, storeAccess('*'), idempotent, ah(async (req, res) => { const a = await own('affiliate', req.store.id, req.params.id); const b = parse(z.object({ amount: money.refine(v => v > 0) }), req.body); res.json(await db.affiliate.update({ where: { id: a.id }, data: { paid: { increment: b.amount } } })); }));

// ---------- 14. Bank transfers: reference SLR<order number>, statement matching, reminders
r.get(`${B}/bank/pending`, storeAccess('orders'), ah(async (req, res) => { const os = await db.order.findMany({ where: { storeId: req.store.id, financial: 'pending', status: 'open', draft: false } }); res.json(os.map(o => ({ id: o.id, number: o.number, reference: `SLR${o.number}`, total: o.total, ageHours: Math.floor((Date.now() - o.createdAt.getTime()) / 36e5) }))); }));
r.post(`${B}/bank/match`, storeAccess('orders'), ah(async (req, res) => {
  const text = typeof req.body === 'string' ? req.body : String(req.body?.csv || ''); if (!text.trim()) throw bad('Empty statement');
  const out = { matched: [] as any[], amountMismatch: [] as any[], unmatched: [] as string[] };
  for (const line of text.split(/\r?\n/).filter(l => l.trim())) {
    const ref = line.match(/SLR\s*-?\s*(\d{3,})/i); const am = line.match(/(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{1,2}))?\s*$/);
    if (!ref) { out.unmatched.push(line); continue; }
    const o = await db.order.findFirst({ where: { storeId: req.store.id, number: +ref[1] } }); if (!o) { out.unmatched.push(line); continue; }
    const paid = am ? Math.round(parseFloat(am[1].replace(/,/g, '') + '.' + (am[2] || '0')) * 100) : NaN;
    if (o.financial !== 'pending') { out.unmatched.push(line + ' (already paid)'); continue; }
    if (paid !== o.total) { out.amountMismatch.push({ order: o.number, expected: o.total, paid }); continue; }
    await db.order.update({ where: { id: o.id }, data: { financial: 'paid', timeline: tl(o, 'Bank transfer matched') } }); await db.bankTransfer.create({ data: { storeId: req.store.id, orderId: o.id, amount: paid, line: line.slice(0, 300) } }); out.matched.push({ order: o.number, amount: paid });
  }
  res.json(out);
}));
r.post(`${B}/bank/remind/:orderId`, storeAccess('orders'), ah(async (req, res) => { const o = await own('order', req.store.id, req.params.orderId); if (o.financial !== 'pending') throw conflict('Order is not awaiting payment'); const msg = `Reminder: please transfer ${(o.total / 100).toFixed(2)} ${o.currency} with reference SLR${o.number}.`; if (!/whatsapp\.sellora$/.test(o.email)) await notify('email', o.email, 'generic', { subject: `Payment reminder for order #${o.number}`, text: msg }).catch(() => {}); const ph = (o.shipTo as any)?.phone; const wa = ph ? await run(req.store.id, 'whatsapp', 'sendText', { to: ph, text: msg }) : null; await db.order.update({ where: { id: o.id }, data: { timeline: tl(o, 'Bank transfer reminder sent') } }); res.json({ sent: true, message: msg, whatsapp: wa ? { live: wa.live } : null }); }));

// ---------- 15. AI listings EN/UR/AR (LLM when configured, template otherwise)
const T = { en: (t: string, m: string, u: string) => ({ title: t, description: `${t} made from ${m}. Built for ${u}. Hand-finished in Sialkot, Pakistan.` }), ur: (t: string, m: string, u: string) => ({ title: t, description: `${t} — ${m} سے تیار کردہ۔ ${u} کے لیے بہترین۔ سیالکوٹ، پاکستان میں ہاتھ سے تیار۔` }), ar: (t: string, m: string, u: string) => ({ title: t, description: `${t} مصنوع من ${m}. مثالي لـ ${u}. صُنع يدويًا في سيالكوت، باكستان.` }) };
r.post(`${B}/ai/listing`, storeAccess('products'), ah(async (req, res) => {
  const b = parse(z.object({ title: z.string().min(2).max(120), material: z.string().min(1).max(80), use: z.string().min(1).max(120), price: money.default(0), langs: z.array(z.enum(['en', 'ur', 'ar'])).min(1).default(['en', 'ur', 'ar']), create: z.boolean().default(false) }), req.body);
  const out: Record<string, any> = {}; let source = 'template';
  for (const l of b.langs) { const ai = await llm(`Write a concise e-commerce product description in ${({ en: 'English', ur: 'Urdu', ar: 'Arabic' } as any)[l]}. Plain text, max 60 words.`, `${b.title}; material: ${b.material}; use: ${b.use}`); if (ai) source = 'llm'; out[l] = ai ? { title: b.title, description: ai.trim() } : T[l](b.title, b.material, b.use); }
  let product: any = null; if (b.create) { const handle = b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + rand(3).toLowerCase().replace(/[^a-z0-9]/g, ''); product = await db.product.create({ data: { storeId: req.store.id, title: b.title, handle, status: 'draft', price: b.price, description: (out.en || Object.values(out)[0]).description, tags: Object.keys(out).map(l => `i18n:${l}`), variants: { create: [{ title: 'Default', price: b.price }] } } }); }
  res.json({ source, listings: out, product });
}));
