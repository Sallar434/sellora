import { db } from '../src/lib/db';
/** Makes a test store public: paid plan + password page turned off (private stores answer 401 on the storefront API). */
export async function goLive(storeId: string) {
  const now = new Date(), end = new Date(+now + 30 * 864e5);
  await db.subscription.upsert({ where: { storeId }, update: { status: 'active' }, create: { storeId, planCode: 'grow', status: 'active', periodStart: now, periodEnd: end, currency: 'PKR' } });
  const s = await db.store.findUniqueOrThrow({ where: { id: storeId } });
  await db.store.update({ where: { id: storeId }, data: { settings: { ...((s.settings as any) || {}), passwordEnabled: false } } });
}
/** Marks a buyer's email as verified (order look-ups need a verified buyer). */
export async function verifyEmail(email: string) { await db.user.updateMany({ where: { email }, data: { emailVerified: true } }); }
