import { db } from './db';
import { sign } from './crypto';
import { enqueue, defineJob } from '../jobs/queue';
/** Outgoing signed webhooks: header Sellora-Signature: t=..,v1=HMAC_SHA256(secret, `${t}.${body}`) */
export async function emit(storeId: string, event: string, data: any) {
  const eps = await db.webhookEndpoint.findMany({ where: { storeId } });
  for (const e of eps) if ((e.events as string[]).includes(event) || (e.events as string[]).includes('*')) await enqueue('webhook', { url: e.url, secret: e.secret, body: JSON.stringify({ event, data, at: new Date().toISOString() }) });
}
defineJob('webhook', async ({ url, secret, body }) => {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Sellora-Signature': sign(body, secret) }, body });
  if (!r.ok) throw new Error('webhook ' + r.status);
});
