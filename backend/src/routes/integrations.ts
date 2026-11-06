import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db';
import { ah, parse, bad, nf, HttpError } from '../lib/http';
import { storeAccess } from '../lib/auth';
import { rand } from '../lib/crypto';
import { config } from '../lib/config';
import { APPS, app } from '../integrations/apps';
import { loadCreds, saveCreds, call, log, has, IntegrationError } from '../integrations/core';
import { run, productsFor, orderFor } from '../integrations/run';
import { ingestWhatsapp } from './plus';
export const r = Router();
const wrap = (e: any) => { if (e instanceof IntegrationError) throw new HttpError(502, 'Upstream error', { upstreamStatus: e.status, body: e.data }); if (e?.status) throw new HttpError(e.status, e.message); throw e; };
const mask = (v: string) => (v.length <= 6 ? '***' : v.slice(0, 3) + '…' + v.slice(-2));
/** App catalogue with connection status (never returns secrets). */
r.get('/:storeId/integrations', storeAccess('apps'), ah(async (req, res) => {
  const ins = await db.appInstall.findMany({ where: { storeId: req.store.id } });
  res.json(await Promise.all(APPS.map(async a => { const i = ins.find(x => x.appId === a.id); const { creds } = i ? await loadCreds(req.store.id, a.id) : { creds: {} as any };
    return { id: a.id, name: a.name, category: a.category, docs: a.docs, required: a.required, optional: a.optional || [], oauth: !!a.oauth, webhook: !!a.webhook, actions: Object.keys(a.actions), installed: !!i, live: has(creds, ...a.required), keys: Object.fromEntries(Object.entries(creds).map(([k, v]) => [k, mask(String(v))])), webhookUrl: a.webhook ? `${config.publicUrl}/api/hooks/apps/${a.id}/${req.store.id}` : undefined }; })));
}));
r.put('/:storeId/integrations/:appId/credentials', storeAccess('apps'), ah(async (req, res) => {
  const a = app(req.params.appId); if (!a) throw nf('Unknown app');
  const b = parse(z.object({ credentials: z.record(z.string().max(4000)).default({}), config: z.record(z.string(), z.any()).optional() }), req.body);
  const allowed = new Set([...a.required, ...(a.optional || [])]); const bad1 = Object.keys(b.credentials).filter(k => !allowed.has(k)); if (bad1.length) throw bad('Unknown credential fields: ' + bad1.join(','));
  const c = await saveCreds(req.store.id, a.id, b.credentials, b.config);
  res.json({ appId: a.id, live: has(c, ...a.required), missing: a.required.filter(k => !c[k]) });
}));
r.post('/:storeId/integrations/:appId/test', storeAccess('apps'), ah(async (req, res) => { try { res.json(await run(req.store.id, req.params.appId, app(req.params.appId)?.actions.test ? 'test' : Object.keys(app(req.params.appId)?.actions || {})[0], req.body?.input)); } catch (e) { wrap(e); } }));
r.post('/:storeId/integrations/:appId/actions/:action', storeAccess('apps'), ah(async (req, res) => { try { res.json(await run(req.store.id, req.params.appId, req.params.action, req.body?.input)); } catch (e) { wrap(e); } }));
/** Catalogue sync: batch adapters get all products in one request, single-item adapters get one request per product. */
r.post('/:storeId/integrations/:appId/sync', storeAccess('apps'), ah(async (req, res) => {
  const a = app(req.params.appId); if (!a) throw nf('Unknown app'); const ps = await productsFor(req.store.id, req.body?.productIds);
  try {
    if (a.actions.syncProducts) { const out: any[] = []; for (let i = 0; i < ps.length; i += 500) out.push(await run(req.store.id, a.id, 'syncProducts', ps.slice(i, i + 500))); return res.json({ products: ps.length, requests: out.length, live: out.some(o => o.live), results: out.map(o => o.data) }); }
    if (a.actions.syncProduct) { const out: any[] = []; for (const p of ps) out.push(await run(req.store.id, a.id, 'syncProduct', p)); return res.json({ products: ps.length, requests: out.length, live: out.some(o => o.live), results: out.map(o => o.data) }); }
  } catch (e) { wrap(e); }
  throw bad('App has no catalogue sync');
}));
/** Order-level actions: event (pixels/CAPI), syncOrder (accounting/shipping), book (couriers). */
r.post('/:storeId/integrations/:appId/orders/:orderId/:action(event|syncOrder|book|rate)', storeAccess('apps'), ah(async (req, res) => {
  const extra = parse(z.object({ weightGrams: z.number().int().min(100).max(500000).optional(), clickId: z.string().optional(), ip: z.string().optional(), ua: z.string().optional() }).default({}), req.body || {});
  try { const o = await orderFor(req.store.id, req.params.orderId, extra); res.json(await run(req.store.id, req.params.appId, req.params.action, o)); } catch (e) { wrap(e); }
}));
r.get('/:storeId/integrations/:appId/logs', storeAccess('apps'), ah(async (req, res) => res.json(await db.integrationLog.findMany({ where: { storeId: req.store.id, appId: req.params.appId }, orderBy: { createdAt: 'desc' }, take: 100 }))));
// ---- OAuth
r.get('/:storeId/integrations/:appId/oauth/start', storeAccess('apps'), ah(async (req, res) => {
  const a = app(req.params.appId); if (!a?.oauth) throw bad('App has no OAuth flow');
  const { creds, config: cfg } = await loadCreds(req.store.id, a.id); const state = rand(18);
  await db.oAuthState.create({ data: { state, storeId: req.store.id, appId: a.id } });
  res.json({ url: a.oauth.authorize({ storeId: req.store.id, creds, config: cfg }, `${config.publicUrl}/api/integrations/oauth/callback`, state), state, live: !!(creds.clientId || creds.appId), redirectUri: `${config.publicUrl}/api/integrations/oauth/callback` });
}));
/** Public callback (provider redirects the browser here). */
export const oauthPublic = Router();
oauthPublic.get('/oauth/callback', ah(async (req, res) => {
  const st = await db.oAuthState.findUnique({ where: { state: String(req.query.state || '') } }); if (!st || Date.now() - st.createdAt.getTime() > 15 * 60e3) throw bad('Invalid or expired state');
  await db.oAuthState.delete({ where: { state: st.state } });
  if (req.query.error) throw bad('Provider denied: ' + req.query.error);
  const a = app(st.appId)!; const { creds, config: cfg } = await loadCreds(st.storeId, a.id); const ctx = { storeId: st.storeId, creds, config: cfg };
  const code = String(req.query.code || ''); if (!code) throw bad('Missing code');
  const rq = a.oauth!.token(ctx, code, `${config.publicUrl}/api/integrations/oauth/callback`);
  let tokens: Record<string, string>;
  try { tokens = a.oauth!.map((await call(rq)).data); } catch (e) { if (e instanceof IntegrationError) throw new HttpError(502, 'Token exchange failed', { upstreamStatus: e.status }); throw e; }
  const extra: Record<string, string> = {}; if (a.id === 'quickbooks' && req.query.realmId) extra.realmId = String(req.query.realmId);
  await saveCreds(st.storeId, a.id, { ...tokens, ...extra }); await log(st.storeId, a.id, 'in', 'oauth', 200, true, 'connected');
  res.type('html').send(`<p>${a.name} connected to Sellora. You can close this window.</p>`);
}));
// ---- Inbound webhooks (signature verified per provider)
export const hooks = Router();
hooks.get('/apps/:appId/:storeId', ah(async (req, res) => {
  const a = app(req.params.appId); if (!a?.webhook?.challenge) throw nf();
  const { creds, config: cfg } = await loadCreds(req.params.storeId, a.id); const c = a.webhook.challenge({ storeId: req.params.storeId, creds, config: cfg }, req.query);
  if (c == null) throw new HttpError(403, 'Verify token mismatch'); res.type('text/plain').send(c);
}));
hooks.post('/apps/:appId/:storeId', ah(async (req: any, res) => {
  const a = app(req.params.appId); if (!a?.webhook) throw nf();
  const store = await db.store.findUnique({ where: { id: req.params.storeId } }); if (!store) throw nf();
  const { creds, config: cfg } = await loadCreds(store.id, a.id); const raw = Buffer.from(req.rawBody || '');
  if (!a.webhook.verify({ storeId: store.id, creds, config: cfg }, req.headers, raw)) { await log(store.id, a.id, 'in', 'webhook', 401, true, 'bad signature'); throw new HttpError(401, 'Invalid signature'); }
  let handled: any = null; if (a.id === 'whatsapp') handled = await ingestWhatsapp(store.id, req.body);
  await log(store.id, a.id, 'in', 'webhook', 200, true, JSON.stringify(req.body).slice(0, 300));
  res.json({ received: true, handled });
}));
