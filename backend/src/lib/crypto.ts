import crypto from 'crypto';
import { config } from './config';
const key = () => Buffer.from(config.encKey, 'hex');
export function encrypt(plain: string) { const iv = crypto.randomBytes(12); const c = crypto.createCipheriv('aes-256-gcm', key(), iv); const ct = Buffer.concat([c.update(plain, 'utf8'), c.final()]); return [iv, c.getAuthTag(), ct].map(b => b.toString('base64')).join('.'); }
export function decrypt(blob: string) { const [iv, tag, ct] = blob.split('.').map(s => Buffer.from(s, 'base64')); const d = crypto.createDecipheriv('aes-256-gcm', key(), iv); d.setAuthTag(tag); return Buffer.concat([d.update(ct), d.final()]).toString('utf8'); }
export const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');
export const rand = (n = 24) => crypto.randomBytes(n).toString('base64url');
export const sign = (body: string, secret: string, t = Math.floor(Date.now() / 1000)) => `t=${t},v1=${crypto.createHmac('sha256', secret).update(`${t}.${body}`).digest('hex')}`;
export function verifySig(body: string, header: string, secret: string, tolerance = 300) {
  const m = /t=(\d+),v1=([a-f0-9]+)/.exec(header || ''); if (!m) return false;
  if (Math.abs(Date.now() / 1000 - +m[1]) > tolerance) return false;
  const exp = sign(body, secret, +m[1]).split('v1=')[1];
  return crypto.timingSafeEqual(Buffer.from(exp), Buffer.from(m[2].padEnd(exp.length, '0').slice(0, exp.length)));
}
