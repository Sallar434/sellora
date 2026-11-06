import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { config } from './config';
import { db } from './db';
import { HttpError, forbid } from './http';
import { rand, sha256 } from './crypto';
export type Claims = { sub: string; type: 'ADMIN' | 'SELLER' | 'BUYER'; email: string };
declare global { namespace Express { interface Request { user?: Claims; store?: any; role?: string; perms?: string[] } } }
export const accessToken = (c: Claims) => jwt.sign(c, config.jwtSecret, { expiresIn: '15m' });
export async function issueTokens(u: { id: string; type: string; email: string }) {
  const refresh = rand(32);
  await db.refreshToken.create({ data: { userId: u.id, tokenHash: sha256(refresh), expiresAt: new Date(Date.now() + 30 * 864e5) } });
  return { accessToken: accessToken({ sub: u.id, type: u.type as any, email: u.email }), refreshToken: refresh, expiresIn: 900 };
}
export function auth(req: Request, _res: Response, next: NextFunction) {
  const h = req.headers.authorization || '';
  const t = h.startsWith('Bearer ') ? h.slice(7) : '';
  try { req.user = jwt.verify(t, config.jwtSecret) as Claims; next(); } catch { next(new HttpError(401, 'Unauthorized')); }
}
export const requireType = (...types: Claims['type'][]) => (req: Request, _r: Response, n: NextFunction) => (req.user && types.includes(req.user.type) ? n() : n(forbid()));
// Role → permissions. Staff memberships may override with explicit permission list.
export const ROLE_PERMS: Record<string, string[]> = {
  owner: ['*'],
  admin: ['*'],
  manager: ['products', 'orders', 'customers', 'discounts', 'online_store', 'analytics', 'apps', 'marketing'],
  staff: ['products', 'orders', 'customers'],
  fulfillment: ['orders'],
};
/** Loads :storeId, checks membership and (optional) permission. Platform admins pass. */
export const storeAccess = (perm?: string) => async (req: Request, _r: Response, next: NextFunction) => {
  try {
    const store = await db.store.findUnique({ where: { id: req.params.storeId } });
    if (!store) throw new HttpError(404, 'Store not found');
    req.store = store;
    if (req.user?.type === 'ADMIN') { req.role = 'admin'; return next(); }
    // Expired trial → store is fully closed (admin + storefront) until a plan is bought. Data is kept. Only billing routes stay open.
    if (!/\/billing(\/|$)/.test(req.originalUrl.split('?')[0])) { const { getSub } = await import('./billing'); if ((await getSub(store.id)).status === 'expired') throw new HttpError(402, 'Your 4-day trial has ended and your store is closed. Buy a plan to reopen it — all your data is kept.', { code: 'trial_expired' }); }
    const m = await db.membership.findUnique({ where: { userId_storeId: { userId: req.user!.sub, storeId: store.id } } });
    if (!m) throw forbid('Not a member of this store');
    const perms = (m.permissions as string[] | null) || ROLE_PERMS[m.role] || [];
    req.role = m.role; req.perms = perms;
    if (perm && !perms.includes('*') && !perms.includes(perm)) throw forbid(`Missing permission: ${perm}`);
    next();
  } catch (e) { next(e); }
};

/** Publishing (theme publish, removing the storefront password) needs a paid plan. 402 while trialing/expired. */
export const requirePaid = async (req: Request, _r: Response, next: NextFunction) => {
  try { const { getSub } = await import('./billing'); const s = await getSub(req.store.id); if (s.status !== 'active') throw new HttpError(402, 'Buy a plan to publish your store. You can build everything during the free trial.', { code: 'plan_required', status: s.status }); next(); } catch (e) { next(e); }
};
