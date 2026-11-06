import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { authenticator } from 'otplib';
import { db } from '../lib/db';
import { ah, parse, HttpError, bad, slug } from '../lib/http';
import { auth, issueTokens } from '../lib/auth';
import { sha256, rand } from '../lib/crypto';
import { notify } from '../providers/notify';
import { audit } from '../lib/audit';
import { config } from '../lib/config';
import { defaultThemeData } from '../lib/themes';
export const r = Router();
const pub = (u: any) => ({ id: u.id, email: u.email, phone: u.phone, name: u.name, type: u.type, emailVerified: u.emailVerified, phoneVerified: u.phoneVerified, totpEnabled: u.totpEnabled });
export async function createStore(ownerId: string, name: string, currency = 'USD') {
  let handle = slug(name); if (await db.store.findUnique({ where: { handle } })) handle += '-' + rand(3).toLowerCase();
  const s = await db.store.create({ data: { name, handle, ownerId, currency, publishableKey: 'pk_' + rand(18), secretKey: 'sk_' + rand(24), feeBps: config.platformFeeBps, settings: { general: { name }, policies: {}, checkout: { requirePhone: false }, notifications: { orderConfirmation: true, abandonedCart: true } } } });
  await db.membership.create({ data: { userId: ownerId, storeId: s.id, role: 'owner' } });
  await db.theme.create({ data: defaultThemeData(s.id, name) as any });
  await db.page.createMany({ data: [{ storeId: s.id, title: 'About us', handle: 'about', body: `<p>About ${name}</p>` }, { storeId: s.id, title: 'Contact', handle: 'contact', body: '<p>Contact us</p>' }] });
  await db.menu.create({ data: { storeId: s.id, handle: 'main-menu', title: 'Main menu', items: [{ title: 'Home', url: '/' }, { title: 'Catalog', url: '/collections/all' }, { title: 'About us', url: '/pages/about' }] } });
  await db.kyc.create({ data: { storeId: s.id } });
  return s;
}
async function sendOtp(target: string, purpose: string, channel: 'email' | 'sms') {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  await db.otp.create({ data: { target, purpose, codeHash: sha256(code), expiresAt: new Date(Date.now() + 6e5) } });
  await notify(channel, target, purpose === 'reset' ? 'password_reset' : 'otp', { code });
  return config.env === 'production' ? undefined : code; // dev/test convenience
}
async function useOtp(target: string, purpose: string, code: string) {
  const o = await db.otp.findFirst({ where: { target, purpose, used: false, codeHash: sha256(code), expiresAt: { gt: new Date() } } });
  if (!o) throw bad('Invalid or expired code');
  await db.otp.update({ where: { id: o.id }, data: { used: true } });
}
r.post('/signup', ah(async (req, res) => {
  const b = parse(z.object({ email: z.string().email(), password: z.string().min(8), name: z.string().optional(), phone: z.string().optional(), type: z.enum(['SELLER', 'BUYER']).default('SELLER'), storeName: z.string().optional(), currency: z.string().length(3).optional() }), req.body);
  const email = b.email.toLowerCase();
  if (await db.user.findUnique({ where: { email } })) throw new HttpError(409, 'Email already registered');
  const u = await db.user.create({ data: { email, name: b.name, phone: b.phone, type: b.type, passwordHash: await bcrypt.hash(b.password, 10) } });
  const store = b.type === 'SELLER' ? await createStore(u.id, b.storeName || `${b.name || email.split('@')[0]}'s store`, b.currency) : null;
  const devCode = await sendOtp(email, 'verify_email', 'email');
  await audit(req, 'auth.signup', { userId: u.id });
  res.status(201).json({ user: pub(u), store, ...(await issueTokens(u)), devCode });
}));
r.post('/login', ah(async (req, res) => {
  const b = parse(z.object({ email: z.string().email(), password: z.string(), totp: z.string().optional() }), req.body);
  const u = await db.user.findUnique({ where: { email: b.email.toLowerCase() } });
  if (!u || !(await bcrypt.compare(b.password, u.passwordHash))) throw new HttpError(401, 'Invalid email or password');
  if (u.totpEnabled) { if (!b.totp) throw new HttpError(401, 'TOTP required', { totpRequired: true }); if (!authenticator.check(b.totp, u.totpSecret!)) throw new HttpError(401, 'Invalid TOTP'); }
  const stores = await db.membership.findMany({ where: { userId: u.id }, include: { store: true } });
  await audit(req, 'auth.login', { userId: u.id });
  res.json({ user: pub(u), stores: stores.map(m => ({ ...m.store, secretKey: undefined, role: m.role })), ...(await issueTokens(u)) });
}));
r.post('/refresh', ah(async (req, res) => {
  const t = await db.refreshToken.findUnique({ where: { tokenHash: sha256(String(req.body?.refreshToken || '')) }, include: { user: true } });
  if (!t || t.revoked || t.expiresAt < new Date()) throw new HttpError(401, 'Invalid refresh token');
  await db.refreshToken.update({ where: { id: t.id }, data: { revoked: true } }); // rotation
  res.json(await issueTokens(t.user));
}));
r.post('/logout', ah(async (req, res) => { await db.refreshToken.updateMany({ where: { tokenHash: sha256(String(req.body?.refreshToken || '')) }, data: { revoked: true } }); res.json({ ok: true }); }));
r.get('/me', auth, ah(async (req, res) => {
  const u = await db.user.findUniqueOrThrow({ where: { id: req.user!.sub } });
  const ms = await db.membership.findMany({ where: { userId: u.id }, include: { store: true } });
  res.json({ user: pub(u), stores: ms.map(m => ({ id: m.store.id, name: m.store.name, handle: m.store.handle, role: m.role, currency: m.store.currency })) });
}));
r.post('/otp/send', auth, ah(async (req, res) => {
  const { channel } = parse(z.object({ channel: z.enum(['email', 'sms']) }), req.body);
  const u = await db.user.findUniqueOrThrow({ where: { id: req.user!.sub } });
  const target = channel === 'email' ? u.email : u.phone; if (!target) throw bad('No phone on account');
  res.json({ sent: true, devCode: await sendOtp(target, 'verify_' + (channel === 'email' ? 'email' : 'phone'), channel) });
}));
r.post('/otp/verify', auth, ah(async (req, res) => {
  const { channel, code } = parse(z.object({ channel: z.enum(['email', 'sms']), code: z.string() }), req.body);
  const u = await db.user.findUniqueOrThrow({ where: { id: req.user!.sub } });
  await useOtp(channel === 'email' ? u.email : u.phone!, channel === 'email' ? 'verify_email' : 'verify_phone', code);
  const nu = await db.user.update({ where: { id: u.id }, data: channel === 'email' ? { emailVerified: true } : { phoneVerified: true } });
  res.json({ user: pub(nu) });
}));
r.post('/password/forgot', ah(async (req, res) => {
  const { email } = parse(z.object({ email: z.string().email() }), req.body);
  const u = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  const devCode = u ? await sendOtp(u.email, 'reset', 'email') : undefined;
  res.json({ ok: true, devCode }); // no account enumeration
}));
r.post('/password/reset', ah(async (req, res) => {
  const b = parse(z.object({ email: z.string().email(), code: z.string(), password: z.string().min(8) }), req.body);
  await useOtp(b.email.toLowerCase(), 'reset', b.code);
  const u = await db.user.update({ where: { email: b.email.toLowerCase() }, data: { passwordHash: await bcrypt.hash(b.password, 10) } });
  await db.refreshToken.updateMany({ where: { userId: u.id }, data: { revoked: true } });
  res.json({ ok: true });
}));
r.post('/2fa/setup', auth, ah(async (req, res) => {
  const secret = authenticator.generateSecret();
  await db.user.update({ where: { id: req.user!.sub }, data: { totpSecret: secret, totpEnabled: false } });
  res.json({ secret, otpauth: authenticator.keyuri(req.user!.email, 'Sellora', secret) });
}));
r.post('/2fa/enable', auth, ah(async (req, res) => {
  const u = await db.user.findUniqueOrThrow({ where: { id: req.user!.sub } });
  if (!u.totpSecret || !authenticator.check(String(req.body?.code), u.totpSecret)) throw bad('Invalid code');
  await db.user.update({ where: { id: u.id }, data: { totpEnabled: true } }); res.json({ ok: true });
}));
r.post('/2fa/disable', auth, ah(async (req, res) => {
  const u = await db.user.findUniqueOrThrow({ where: { id: req.user!.sub } });
  if (u.totpEnabled && !authenticator.check(String(req.body?.code), u.totpSecret!)) throw bad('Invalid code');
  await db.user.update({ where: { id: u.id }, data: { totpEnabled: false, totpSecret: null } }); res.json({ ok: true });
}));
