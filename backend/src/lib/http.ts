import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodTypeAny, z } from 'zod';
export class HttpError extends Error { constructor(public status: number, msg: string, public details?: any) { super(msg); } }
export const bad = (m: string, d?: any) => new HttpError(400, m, d);
export const nf = (m = 'Not found') => new HttpError(404, m);
export const forbid = (m = 'Forbidden') => new HttpError(403, m);
export const ah = (fn: (req: Request, res: Response, next: NextFunction) => any): RequestHandler => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
export function parse<S extends ZodTypeAny>(s: S, v: unknown): z.output<S> { const r = s.safeParse(v); if (!r.success) throw new HttpError(422, 'Validation failed', r.error.flatten()); return r.data; }
export function errorHandler(err: any, _req: Request, res: Response, _n: NextFunction) {
  const status = err.status || (err.code === 'P2002' ? 409 : err.code === 'P2025' ? 404 : 500);
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'Internal error' : err.message, details: err.details });
}
export const slug = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'item';
