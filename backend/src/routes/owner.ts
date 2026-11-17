/** Platform owner view. Secrets are not included. */
import { Router } from 'express';
import { db } from '../lib/db';
import { ah, forbid } from '../lib/http';
import { auth, isPlatformAdmin } from '../lib/auth';
export const r = Router();
r.use(auth);
r.get('/overview', ah(async (req, res) => {
  if (!isPlatformAdmin(req.user!.type)) throw forbid('Platform admin only');
  const [users, stores, orders] = await Promise.all([
    db.user.count(),
    db.store.findMany({ include: { integrations: { select: { appName: true, isActive: true } }, aiUsage: true, _count: { select: { orders: true, products: true } } } }),
    db.order.count(),
  ]);
  res.json({
    users,
    orders,
    stores: stores.map(s => ({
      id: s.id, name: s.name, handle: s.handle, stripeConnected: !!s.stripeAccountId,
      products: s._count.products, orders: s._count.orders,
      aiTokens: s.aiUsage.reduce((n, u) => n + u.inputTokens + u.outputTokens, 0),
      integrations: s.integrations.map(i => ({ appName: i.appName, connected: i.isActive })),
    })),
  });
}));
