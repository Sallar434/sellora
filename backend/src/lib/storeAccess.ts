/**
 * Online store preferences: private mode (password page), social sharing / SEO, redirection, spam protection,
 * crawler access signatures (HTTP Message Signatures, RFC 9421, "web-bot-auth") and trusted domains.
 * A store stays private until its plan is paid; if the plan stops being active, it is private again automatically.
 */
import crypto from 'crypto';
import { getSub } from './billing';

export type Prefs = {
  title?: string; desc?: string; img?: string; hreflang?: boolean; redirCountry?: boolean; redirLang?: boolean;
  capContact?: boolean; capLogin?: boolean; b2b?: boolean; trusted?: string[];
  crawlers?: { id: string; name: string; keyid: string; pub: string; created: number; expires: number; headers: Record<string, string> }[];
};
export const prefsOf = (store: any): Prefs => (((store?.settings as any) || {}).prefs as Prefs) || {};
export const passwordOf = (store: any): string => ((store?.settings as any) || {}).storePassword || '';
export const messageOf = (store: any): string => ((store?.settings as any) || {}).passwordMessage || '';
export async function paid(storeId: string) { return (await getSub(storeId)).status === 'active'; }
/** Private unless the owner turned the password off AND the plan is paid. */
export async function isPrivate(store: any) { const off = ((store?.settings as any) || {}).passwordEnabled === false; return !(off && (await paid(store.id))); }
export function newPassword() { const c = 'bcdfghjkmnpqrstvwxyz', v = 'aeiou'; let s = ''; for (let i = 0; i < 6; i++) s += (i % 2 ? v : c)[crypto.randomInt(i % 2 ? 5 : 20)]; return s; }

const HOST = /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;
export function cleanDomain(d: string) { const x = String(d || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, ''); if (!HOST.test(x)) throw new Error('Enter a domain like example.com'); return x; }

/* ---------- unlock token for visitors who typed the password ---------- */
const secret = () => process.env.JWT_SECRET || process.env.ENC_KEY || 'vendom-dev-secret';
export function unlockToken(storeId: string, password: string) { return crypto.createHmac('sha256', secret()).update(storeId + ':' + password).digest('base64url').slice(0, 32); }
export function checkPassword(store: any, given: string) { const pw = passwordOf(store); if (!pw) return false; const a = Buffer.from(String(given || '')), b = Buffer.from(pw); return a.length === b.length && crypto.timingSafeEqual(a, b); }

/* ---------- crawler access (web-bot-auth signatures) ---------- */
const sfv = (s: string) => `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
function params(created: number, expires: number, keyid: string) { return `("@authority" "signature-agent");created=${created};expires=${expires};keyid=${sfv(keyid)};alg="ed25519";tag="web-bot-auth"`; }
function base(authority: string, agent: string, p: string) { return `"@authority": ${authority}\n"signature-agent": ${agent}\n"@signature-params": ${p}`; }
export function createSignature(authority: string, name: string, days: number) {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  const jwk = publicKey.export({ format: 'jwk' }) as any;
  const keyid = crypto.createHash('sha256').update(JSON.stringify({ crv: 'Ed25519', kty: 'OKP', x: jwk.x })).digest('base64url');
  const created = Math.floor(Date.now() / 1000), expires = created + Math.round(days * 86400);
  const agent = sfv('https://vendom.app/.well-known/http-message-signatures-directory');
  const p = params(created, expires, keyid);
  const sig = crypto.sign(null, Buffer.from(base(authority, agent, p)), privateKey).toString('base64');
  return { id: 'cs_' + crypto.randomBytes(6).toString('hex'), name, keyid, pub: jwk.x as string, created: created * 1000, expires: expires * 1000,
    headers: { 'Signature-Input': `sig1=${p}`, Signature: `sig1=:${sig}:`, 'Signature-Agent': agent } };
}
/** True when the request carries a valid, unexpired signature made for this store. */
export function verifySignature(prefs: Prefs, authority: string, h: Record<string, any>) {
  const input = String(h['signature-input'] || ''), sigH = String(h['signature'] || ''), agent = String(h['signature-agent'] || '');
  const m = input.match(/^sig1=(\("@authority" "signature-agent"\);created=(\d+);expires=(\d+);keyid="([^"]+)";alg="ed25519";tag="web-bot-auth")$/);
  const s = sigH.match(/^sig1=:([A-Za-z0-9+/=]+):$/);
  if (!m || !s || !agent) return false;
  const now = Math.floor(Date.now() / 1000); if (+m[3] < now) return false;
  const c = (prefs.crawlers || []).find(x => x.keyid === m[4] && x.expires > Date.now()); if (!c) return false;
  try { const key = crypto.createPublicKey({ key: { kty: 'OKP', crv: 'Ed25519', x: c.pub }, format: 'jwk' }); return crypto.verify(null, Buffer.from(base(authority, agent, m[1])), key, Buffer.from(s[1], 'base64')); } catch { return false; }
}
