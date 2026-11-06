import { db } from '../lib/db';
import { autoReleaseDue } from '../lib/ledger';
import { deliver, notify } from '../providers/notify';
import { config } from '../lib/config';
import { defineJob, enqueue } from './queue';
import { runBilling } from '../lib/billing';
defineJob('billing-run', async () => { await runBilling(); });
defineJob('escrow-auto-release', async () => { await autoReleaseDue(); });
defineJob('outbox-retry', async () => { for (const o of await db.outbox.findMany({ where: { status: 'failed' }, take: 50 })) await deliver(o.id); });
defineJob('abandoned-carts', async () => {
  const carts = await db.cart.findMany({ where: { status: 'open', email: { not: null }, updatedAt: { lt: new Date(Date.now() - 36e5), gt: new Date(Date.now() - 864e5) } } });
  for (const c of carts) { const s = await db.store.findUnique({ where: { id: c.storeId } }); if ((s?.settings as any)?.notifications?.abandonedCart === false) continue; await notify('email', c.email!, 'abandoned_cart', { url: `${config.publicUrl}/s/${s?.handle}/cart/${c.id}` }); await db.cart.update({ where: { id: c.id }, data: { status: 'reminded' } }); }
});
export function startScheduler() { const tick = () => ['escrow-auto-release', 'outbox-retry', 'abandoned-carts', 'billing-run'].forEach(j => enqueue(j)); setInterval(tick, 15 * 60 * 1000).unref(); setTimeout(tick, 5000).unref(); }
