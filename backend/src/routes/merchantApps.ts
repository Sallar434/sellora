/** Merchant integrations. Credentials are encrypted. They are never returned. Courier URLs are not invented. */
import { Router } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { db } from '../lib/db';
import { ah, parse, HttpError, forbid } from '../lib/http';
import { auth, isPlatformAdmin } from '../lib/auth';
import { config } from '../lib/config';
import { encrypt, decrypt } from '../lib/crypto';
export const r = Router();
export const hooks = Router();
export const ADAPTERS = [
  { appName: 'tcs', label: 'TCS', state: 'needs-official-docs' as const, note: 'No official booking URL was verified. The sample host api.tcs.com.pk is not used.' },
  { appName: 'leopards', label: 'Leopards', state: 'needs-official-docs' as const, note: 'No official booking URL was verified for this run.' },
  { appName: 'postex', label: 'PostEx', state: 'needs-official-docs' as const, note: 'No official booking URL was verified for this run.' },
  { appName: 'mnp', label: 'M&P', state: 'needs-official-docs' as const, note: 'No official booking URL was verified for this run.' },
  { appName: 'klaviyo', label: 'Klaviyo', state: 'needs-official-docs' as const, note: 'Not called. Confirm the current Klaviyo revision URL before a live request.' },
];
const known = new Set(ADAPTERS.map(a => a.appName));
async function own(userId: string, type: string | undefined, storeId: string) {
  if (isPlatformAdmin(type)) return db.store.findUnique({ where: { id: storeId } });
  const m = await db.membership.findUnique({ where: { userId_storeId: { userId, storeId } } });
  if (!m) throw forbid('Not a member of this store');
  return db.store.findUnique({ where: { id: storeId } });
}
function mask(row: { appName: string; isActive: boolean; credentialsEnc: string; id: string; storeId: string }) {
  const adapter = ADAPTERS.find(a => a.appName === row.appName);
  return { id: row.id, storeId: row.storeId, appName: row.appName, isActive: row.isActive, connected: row.isActive, secret: row.credentialsEnc ? '••••' : '', state: adapter?.state || 'unknown', note: adapter?.note || '' };
}

r.get('/', auth, ah(async (req, res) => {
  const storeId = String(req.query.storeId || '');
  if (!storeId) throw new HttpError(422, 'storeId is required');
  await own(req.user!.sub, req.user!.type, storeId);
  const rows = await db.integration.findMany({ where: { storeId } });
  res.json({ adapters: ADAPTERS, connections: rows.map(mask) });
}));
r.post('/connect', auth, ah(async (req, res) => {
  const b = parse(z.object({ storeId: z.string(), appName: z.string(), credentials: z.record(z.string().max(4000)) }), req.body);
  if (!known.has(b.appName)) throw new HttpError(404, 'Unknown app');
  await own(req.user!.sub, req.user!.type, b.storeId);
  const adapter = ADAPTERS.find(a => a.appName === b.appName)!;
  const credentialsEnc = encrypt(JSON.stringify(b.credentials));
  const row = await db.integration.upsert({
    where: { storeId_appName: { storeId: b.storeId, appName: b.appName } },
    create: { storeId: b.storeId, appName: b.appName, isActive: false, credentialsEnc },
    update: { credentialsEnc, isActive: false },
  });
  res.json({ ...mask(row), connected: false, message: adapter.state === 'needs-official-docs' ? adapter.note : 'Saved. Run test before treating it as connected.' });
}));
r.post('/disconnect', auth, ah(async (req, res) => {
  const b = parse(z.object({ storeId: z.string(), appName: z.string() }), req.body);
  await own(req.user!.sub, req.user!.type, b.storeId);
  await db.integration.deleteMany({ where: { storeId: b.storeId, appName: b.appName } });
  res.json({ disconnected: true, appName: b.appName });
}));
r.post('/test', auth, ah(async (req, res) => {
  const b = parse(z.object({ storeId: z.string(), appName: z.string() }), req.body);
  await own(req.user!.sub, req.user!.type, b.storeId);
  const adapter = ADAPTERS.find(a => a.appName === b.appName);
  if (!adapter) throw new HttpError(404, 'Unknown app');
  const row = await db.integration.findUnique({ where: { storeId_appName: { storeId: b.storeId, appName: b.appName } } });
  if (!row?.credentialsEnc) throw new HttpError(409, 'Not configured. Save credentials first. Nothing was called.');
  if (adapter.state === 'needs-official-docs') throw new HttpError(501, adapter.note + ' Nothing was called.');
  decrypt(row.credentialsEnc);
  res.json({ ok: false, live: 'UNVERIFIED' });
}));

export function verifyCourierSignature(raw: string, header: string, secret: string) {
  if (!secret || !header) return false;
  const mac = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  const a = Buffer.from(mac);
  const b = Buffer.from(header);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
hooks.post('/courier/:appName', ah(async (req, res) => {
  if (!config.courierWebhookSecret) throw new HttpError(503, 'COURIER_WEBHOOK_SECRET is not set. The order was not updated.');
  const raw = String((req as any).rawBody || '');
  if (!verifyCourierSignature(raw, String(req.headers['x-sellora-signature'] || ''), config.courierWebhookSecret)) {
    throw new HttpError(401, 'Webhook signature was rejected. The order was not updated.');
  }
  const body = req.body || {};
  if (body.orderId && body.financial === 'paid') await db.order.updateMany({ where: { id: String(body.orderId) }, data: { financial: 'paid' } });
  res.json({ received: true });
}));
