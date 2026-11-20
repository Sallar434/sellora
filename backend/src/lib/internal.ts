import crypto from 'crypto';
/** Per-process secret that marks the assistant's own calls into this API (skips the per-IP rate limit only). */
export const INTERNAL_TOKEN = crypto.randomBytes(24).toString('hex');
export const isInternal = (h: unknown) => typeof h === 'string' && h.length === INTERNAL_TOKEN.length && crypto.timingSafeEqual(Buffer.from(h), Buffer.from(INTERNAL_TOKEN));
