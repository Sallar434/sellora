import { Request, Response, NextFunction } from 'express';
import { db } from './db';
/** Idempotency-Key on money endpoints: replays stored response for the same key+scope. */
export async function idempotent(req: Request, res: Response, next: NextFunction) {
  const key = req.header('Idempotency-Key'); if (!key) return next();
  const scope = `${req.method} ${req.baseUrl}${req.path} ${req.user?.sub || 'anon'}`;
  const id = `${scope}|${key}`;
  const hit = await db.idempotency.findUnique({ where: { key: id } });
  if (hit) { const r: any = hit.response; return res.status(r.status).set('Idempotent-Replay', 'true').json(r.body); }
  const json = res.json.bind(res);
  res.json = (body: any) => { if (res.statusCode < 500) db.idempotency.create({ data: { key: id, scope, response: { status: res.statusCode, body } } }).catch(() => {}); return json(body); };
  next();
}
