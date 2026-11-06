import { config } from '../lib/config';
type Handler = (data: any) => Promise<void>;
const handlers: Record<string, Handler> = {};
let bull: any = null;
/** BullMQ when REDIS_URL is set, otherwise in-process (setImmediate). */
export function defineJob(name: string, h: Handler) { handlers[name] = h; }
export async function enqueue(name: string, data: any = {}) {
  if (bull) return bull.queue.add(name, data, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
  setImmediate(() => handlers[name]?.(data).catch(e => console.error('job', name, e)));
}
export function startQueue() {
  if (!config.redisUrl) return;
  try {
    const { Queue, Worker } = require('bullmq'); const IORedis = require('ioredis');
    const connection = new IORedis(config.redisUrl, { maxRetriesPerRequest: null });
    bull = { queue: new Queue('sellora', { connection }) };
    new Worker('sellora', async (j: any) => handlers[j.name]?.(j.data), { connection });
    console.log('BullMQ queue active');
  } catch (e) { console.warn('bullmq unavailable, using in-process queue'); }
}
