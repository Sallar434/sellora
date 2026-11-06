import { Request } from 'express';
import { db } from './db';
export const audit = (req: Request, action: string, meta?: any) => db.auditLog.create({ data: { userId: req.user?.sub, storeId: req.store?.id || req.params?.storeId, action, meta: meta ?? undefined, ip: req.ip } }).catch(() => {});
