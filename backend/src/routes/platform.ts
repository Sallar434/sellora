/** Setup, translation, import, health, and insight routes. Missing provider keys stay blocked. */
import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db';
import { ah, parse } from '../lib/http';
import { storeAccess } from '../lib/auth';
import { config } from '../lib/config';
import { llmAvailability, llmChatBest } from '../providers/llm';
import { planCommand } from '../lib/actions';
import {
  LOCALES, parseLocale, resolveText, speechFor, draftTranslation, approveTranslation, revertTranslation,
  bulkDryRun, quotaDecision, meterTokens, dryRunCsv, healthCheck, salesInsights, readiness, sizeChart, convertMoney, nextStep, Translation,
} from '../lib/platform';

export const r = Router();
const bag = (s: any) => ((s.settings || {}) as any);
async function saveBag(storeId: string, settings: any, patch: any) {
  await db.store.update({ where: { id: storeId }, data: { settings: { ...settings, ...patch } } });
}

r.get('/:storeId/i18n/locales', storeAccess(), ah(async (_req, res) => {
  res.json({ locales: LOCALES, note: 'verified means these admin phrases have a dictionary. framework means the code is accepted and the words stay in English. This is not a list of every human language.' });
}));

r.get('/:storeId/i18n/text', storeAccess(), ah(async (req, res) => {
  const locale = String(req.query.locale || 'en');
  const key = String(req.query.key || '');
  const parsed = parseLocale(locale);
  if (!parsed.ok) return res.status(422).json({ error: parsed.error });
  res.json(resolveText(parsed.canonical, key));
}));

r.post('/:storeId/i18n/translate', storeAccess('online_store'), ah(async (req, res) => {
  const b = parse(z.object({
    entity: z.enum(['product', 'page', 'menu']), entityId: z.string().min(1), locale: z.string().min(2).max(32),
    original: z.string().max(8000), fields: z.record(z.string().max(8000)).default({}), brandNames: z.array(z.string().max(80)).default([]),
    manual: z.boolean().optional(),
  }), req.body);
  const availability = llmAvailability();
  let provider: 'manual' | 'deepseek' | 'claude' | 'blocked' = b.manual ? 'manual' : 'blocked';
  let providerText: string | null = null;
  if (!b.manual) {
    if (!availability.deepseek && !availability.claude && !availability.compatible) {
      return res.json({ translated: false, blocked: 'missing-provider', live: 'UNVERIFIED', availability, record: null });
    }
    const out = await llmChatBest('Translate the store text into the requested locale. Keep brand names exactly as written. Do not add rankings, reviews, or medical claims. Reply with the translation only.', `Locale: ${b.locale}\nBrand names to keep: ${b.brandNames.join(', ')}\nText:\n${b.original}`, { maxTokens: 800 });
    if (!out) return res.json({ translated: false, blocked: 'missing-provider', live: 'UNVERIFIED', availability, record: null, providerError: 'The provider did not return text. This was not saved as a translation.' });
    provider = out.usage.provider === 'claude' ? 'claude' : 'deepseek';
    providerText = out.text;
    b.fields = { body: out.text };
  }
  const draft = draftTranslation({ id: 'tr_' + Date.now().toString(36), entity: b.entity, entityId: b.entityId, locale: b.locale, original: b.original, fields: b.fields, brandNames: b.brandNames, provider: provider === 'blocked' ? 'manual' : provider, providerText });
  if (!draft.ok) return res.json({ ...draft, live: 'UNVERIFIED' });
  const settings = bag(req.store);
  const list: Translation[] = settings.translations || [];
  list.unshift(draft.record);
  await saveBag(req.store.id, settings, { translations: list.slice(0, 200) });
  res.json({ translated: provider !== 'manual', record: draft.record, live: provider === 'manual' ? 'manual' : 'UNVERIFIED', storeId: req.store.id });
}));

r.post('/:storeId/i18n/translations/:id/approve', storeAccess('online_store'), ah(async (req, res) => {
  const settings = bag(req.store);
  const list: Translation[] = settings.translations || [];
  const result = approveTranslation(list, req.params.id);
  if (!result.ok) return res.status(404).json(result);
  await saveBag(req.store.id, settings, { translations: list });
  res.json(result);
}));

r.post('/:storeId/i18n/translations/:id/revert', storeAccess('online_store'), ah(async (req, res) => {
  const settings = bag(req.store);
  const list: Translation[] = settings.translations || [];
  const result = revertTranslation(list, req.params.id);
  if (!result.ok) return res.status(404).json(result);
  await saveBag(req.store.id, settings, { translations: list });
  res.json(result);
}));

r.post('/:storeId/bulk/dry-run', storeAccess('products'), ah(async (req, res) => {
  const b = parse(z.object({ ids: z.array(z.string()).min(1), description: z.string().max(8000).optional(), alt: z.enum(['use-name']).optional(), price: z.number().optional(), sku: z.string().optional(), explicitPrice: z.boolean().optional(), explicitSku: z.boolean().optional() }), req.body);
  const products = await db.product.findMany({ where: { storeId: req.store.id, id: { in: b.ids } } });
  const shaped = products.map(p => ({ id: p.id, name: p.title, description: p.description, price: p.price, sku: '' }));
  const dry = bulkDryRun(shaped, b.ids, { description: b.description, alt: b.alt, price: b.price, sku: b.sku }, { price: b.explicitPrice, sku: b.explicitSku });
  const gate = quotaDecision(0, 100, dry.ok ? dry.diffs.length : 1, false);
  res.json({ ...dry, quota: gate, applied: false, storeId: req.store.id });
}));

r.post('/:storeId/bulk/apply', storeAccess('products'), ah(async (req, res) => {
  const b = parse(z.object({ ids: z.array(z.string()).min(1), description: z.string().max(8000).optional(), confirm: z.boolean() }), req.body);
  if (!b.confirm) return res.json({ applied: false, needsConfirm: true, message: 'Approve the preview before anything is saved.' });
  const products = await db.product.findMany({ where: { storeId: req.store.id, id: { in: b.ids } } });
  const shaped = products.map(p => ({ id: p.id, name: p.title, description: p.description }));
  const dry = bulkDryRun(shaped, products.map(p => p.id), { description: b.description });
  if (!dry.ok) return res.status(422).json(dry);
  const gate = quotaDecision(0, 100, Math.max(1, dry.diffs.length), false);
  if (!gate.allowed) return res.status(402).json({ applied: false, quota: gate });
  const undo = dry.diffs.map(d => ({ id: d.id, field: d.field, before: d.before }));
  for (const d of dry.diffs) {
    if (d.field === 'description') await db.product.updateMany({ where: { id: String(d.id), storeId: req.store.id }, data: { description: d.after } });
  }
  const settings = bag(req.store);
  const stack = settings.bulkUndo || [];
  stack.unshift({ at: Date.now(), undo });
  await saveBag(req.store.id, settings, { bulkUndo: stack.slice(0, 20) });
  res.json({ applied: true, count: dry.diffs.length, rejected: dry.rejected, storeId: req.store.id });
}));

r.post('/:storeId/bulk/undo', storeAccess('products'), ah(async (req, res) => {
  const settings = bag(req.store);
  const stack = settings.bulkUndo || [];
  const last = stack.shift();
  if (!last) return res.json({ reverted: 0, message: 'Nothing to undo.' });
  for (const d of last.undo || []) {
    if (d.field === 'description') await db.product.updateMany({ where: { id: String(d.id), storeId: req.store.id }, data: { description: d.before } });
  }
  await saveBag(req.store.id, settings, { bulkUndo: stack });
  res.json({ reverted: (last.undo || []).length, storeId: req.store.id });
}));

r.post('/:storeId/import/dry-run', storeAccess('products'), ah(async (req, res) => {
  const text = typeof req.body === 'string' ? req.body : String(req.body?.csv || '');
  const approve = typeof req.body === 'object' && req.body?.approveOverwrite === true;
  const existing = await db.product.findMany({ where: { storeId: req.store.id }, select: { handle: true } });
  const plan = dryRunCsv(text, existing.map(p => p.handle), { approveOverwrite: approve });
  res.json({ ...plan, applied: false, storeId: req.store.id });
}));

r.get('/:storeId/health', storeAccess(), ah(async (req, res) => {
  const [products, pages] = await Promise.all([
    db.product.findMany({ where: { storeId: req.store.id } }),
    db.page.findMany({ where: { storeId: req.store.id } }),
  ]);
  const settings = bag(req.store);
  const report = healthCheck({
    products: products.map(p => ({ id: p.id, name: p.title, handle: p.handle, description: p.description, price: p.price, images: (p.images as string[]) || [] })),
    pages: pages.map(p => ({ handle: p.handle })),
    menus: settings.menus || [],
  }, null);
  res.json({ ...report, storeId: req.store.id, mobile: 'possible, not measured by this request' });
}));

r.get('/:storeId/reports/insights', storeAccess('orders'), ah(async (req, res) => {
  const rows = await db.order.findMany({ where: { storeId: req.store.id, draft: false } });
  const from = req.query.from ? Date.parse(String(req.query.from)) : null;
  const to = req.query.to ? Date.parse(String(req.query.to)) : null;
  const insights = salesInsights(rows.map(o => {
    const f = o.fulfillments as any;
    return { id: o.id, currency: o.currency, total: o.total, at: o.createdAt.getTime(), status: o.status, financial: o.financial, fulfillment: o.fulfillment, delivered: f && (f.delivered === true || f.status === 'delivered') ? true : f && (f.delivered === false || f.status === 'undelivered') ? false : null };
  }), { from: Number.isFinite(from as number) ? from : null, to: Number.isFinite(to as number) ? to : null, timeZone: String(req.query.tz || 'UTC'), sourceNote: 'Prisma orders for this store. The browser store is a separate copy and is not included.' });
  res.json({ ...insights, storeId: req.store.id });
}));

r.get('/:storeId/readiness', storeAccess(), ah(async (req, res) => {
  const products = await db.product.count({ where: { storeId: req.store.id } });
  res.json({
    paymentLive: false,
    providers: readiness({ deepseek: !!config.deepseekKey, claude: !!config.anthropicKey, tracking: !!config.trackingUrl, stripe: config.paymentProvider === 'stripe' && !!config.stripeKey, paymentLive: false }),
    next: nextStep({ products: products ? [{ price: 1, desc: 'x', imgs: ['/a.png'] }] : [], sub9: { status: 'trialing' }, paymentLive: false }),
    speech: speechFor(String(req.query.locale || 'en')),
    sizes: sizeChart([]),
    currencyExample: convertMoney(10, 'USD', 'EUR', null),
  });
}));

r.post('/:storeId/usage/tokens', storeAccess(), ah(async (req, res) => {
  const b = parse(z.object({ input: z.number().int().nonnegative(), output: z.number().int().nonnegative(), cached: z.number().int().nonnegative().optional(), usedInput: z.number().int().nonnegative().default(0), usedOutput: z.number().int().nonnegative().default(0), overageOptIn: z.boolean().default(false) }), req.body);
  res.json(meterTokens(b, b));
}));

r.post('/:storeId/ai/plan', storeAccess(), ah(async (req, res) => {
  const b = parse(z.object({ command: z.string().min(1).max(500) }), req.body);
  res.json({ plan: planCommand(b.command), applied: false });
}));
