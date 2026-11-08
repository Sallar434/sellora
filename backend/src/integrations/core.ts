import { db } from '../lib/db';
import { encrypt, decrypt, sha256 } from '../lib/crypto';
import { createHmac, createHash, timingSafeEqual } from 'crypto';
/** Injectable fetch so tests can stub HTTP (no real network in CI). */
export let httpFetch: typeof fetch = (input: any, init?: any) => fetch(input, init);
export const setFetch = (f: typeof fetch) => { httpFetch = f; };
export type Creds = Record<string, string>;
export type Ctx = { storeId: string; creds: Creds; config: any };
export type Req = { method: string; url: string; headers?: Record<string, string>; body?: any; form?: Record<string, string> };
export type Res = { status: number; data: any; live: boolean; request: Req };
export class IntegrationError extends Error { constructor(public status: number, public data: any) { super(`Upstream ${status}`); } }
/** Executes the HTTP call. JSON by default, form-encoded when `form` is set. 15 s timeout. */
export async function call(rq: Req): Promise<Res> {
  const headers: Record<string, string> = { Accept: 'application/json', ...(rq.headers || {}) };
  let body: any;
  if (rq.form) { body = new URLSearchParams(rq.form).toString(); headers['Content-Type'] = 'application/x-www-form-urlencoded'; }
  else if (rq.body !== undefined) { body = JSON.stringify(rq.body); headers['Content-Type'] ||= 'application/json'; }
  const r = await httpFetch(rq.url, { method: rq.method, headers, body, signal: AbortSignal.timeout(15000) });
  const t = await r.text(); let data: any = t; try { data = JSON.parse(t); } catch { /* text */ }
  if (r.status >= 400) throw new IntegrationError(r.status, data);
  return { status: r.status, data, live: true, request: rq };
}
/** Mock result when the merchant has not added keys: returns the exact request that WOULD be sent. */
export const mock = (rq: Req, data: any = {}): Res => ({ status: 200, data: { mock: true, ok: false, reason: 'missing credentials', ...data }, live: false, request: redact(rq) });
const SECRET = /token|secret|key|password|authorization|signature/i;
export function redact(rq: Req): Req {
  const h = Object.fromEntries(Object.entries(rq.headers || {}).map(([k, v]) => [k, SECRET.test(k) ? '***' : v]));
  return { ...rq, url: rq.url.replace(/(access_token|api_secret|api_key|api_password|key)=[^&]+/g, '$1=***'), headers: h, form: rq.form && Object.fromEntries(Object.entries(rq.form).map(([k, v]) => [k, SECRET.test(k) ? '***' : v])) };
}
export async function loadCreds(storeId: string, appId: string): Promise<{ creds: Creds; config: any; installed: boolean }> {
  const i = await db.appInstall.findUnique({ where: { storeId_appId: { storeId, appId } } });
  return { installed: !!i, config: (i?.config as any) || {}, creds: i?.credentialsEnc ? JSON.parse(decrypt(i.credentialsEnc)) : {} };
}
export async function saveCreds(storeId: string, appId: string, patch: Creds, config?: any) {
  const cur = await loadCreds(storeId, appId); const creds = { ...cur.creds, ...patch };
  const data: any = { credentialsEnc: encrypt(JSON.stringify(creds)) }; if (config) data.config = { ...cur.config, ...config };
  await db.appInstall.upsert({ where: { storeId_appId: { storeId, appId } }, update: data, create: { storeId, appId, config: data.config || {}, ...data } });
  return creds;
}
export const log = (storeId: string, appId: string, direction: 'in' | 'out', action: string, status: number, live: boolean, summary?: string) =>
  db.integrationLog.create({ data: { storeId, appId, direction, action, status, live, summary: summary?.slice(0, 500) } });
export const has = (c: Creds, ...k: string[]) => k.every(x => !!c[x]);
export const sha = (v?: string | null) => (v ? sha256(v.trim().toLowerCase()) : undefined);
export const md5 = (v: string) => createHash('md5').update(v.trim().toLowerCase()).digest('hex');
export const hmacHex = (secret: string, raw: Buffer | string) => createHmac('sha256', secret).update(raw).digest('hex');
export const hmacB64 = (secret: string, raw: Buffer | string) => createHmac('sha256', secret).update(raw).digest('base64');
export const safeEq = (a: string, b: string) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); };
export const amt = (minor: number) => +(minor / 100).toFixed(2);
