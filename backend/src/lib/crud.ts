import { Router } from 'express';
import { ZodObject } from 'zod';
import { db } from './db';
import { ah, parse, nf } from './http';
import { storeAccess } from './auth';
import { audit } from './audit';
/** Store-scoped CRUD for simple resources: GET list, POST, GET/:id, PATCH/:id, DELETE/:id */
export function crud(r: Router, path: string, model: string, schema: ZodObject<any>, perm: string, opts: { before?: (d: any, req: any) => any; orderBy?: any } = {}) {
  const m = () => (db as any)[model];
  const own = async (req: any) => { const x = await m().findFirst({ where: { id: req.params.id, storeId: req.store.id } }); if (!x) throw nf(); return x; };
  r.get(`/${path}`, storeAccess(perm), ah(async (req, res) => res.json(await m().findMany({ where: { storeId: req.store.id }, orderBy: opts.orderBy }))));
  r.post(`/${path}`, storeAccess(perm), ah(async (req, res) => { let d = parse(schema, req.body); if (opts.before) d = await opts.before(d, req); const x = await m().create({ data: { ...d, storeId: req.store.id } }); audit(req, `${model}.create`, { id: x.id }); res.status(201).json(x); }));
  r.get(`/${path}/:id`, storeAccess(perm), ah(async (req, res) => res.json(await own(req))));
  r.patch(`/${path}/:id`, storeAccess(perm), ah(async (req, res) => { await own(req); let d = parse(schema.partial(), req.body); if (opts.before) d = await opts.before(d, req); res.json(await m().update({ where: { id: req.params.id }, data: d })); }));
  r.delete(`/${path}/:id`, storeAccess(perm), ah(async (req, res) => { await own(req); await m().delete({ where: { id: req.params.id } }); audit(req, `${model}.delete`, { id: req.params.id }); res.status(204).end(); }));
}
