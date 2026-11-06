import { config } from '../lib/config';
export interface FxProvider { rates(base: string): Promise<Record<string, number>> }
const STATIC: Record<string, number> = { USD: 1, EUR: 0.92, GBP: 0.79, PKR: 280, INR: 83, AED: 3.67, SAR: 3.75, CAD: 1.36, AUD: 1.52, JPY: 150, CNY: 7.2, TRY: 32, BDT: 110 };
export const staticFx: FxProvider = { async rates(base) { const b = STATIC[base] || 1; return Object.fromEntries(Object.entries(STATIC).map(([k, v]) => [k, v / b])); } };
/** HTTP provider: FX_API_URL must return {rates:{CUR:number}} for ?base=XXX (e.g. open.er-api.com/v6/latest/{base}). */
export const httpFx: FxProvider = { async rates(base) { const r = await fetch(config.fxUrl.replace('{base}', base)); const j: any = await r.json(); return j.rates; } };
export const fx = () => (config.fxProvider === 'http' && config.fxUrl ? httpFx : staticFx);
export const ZERO_DECIMAL = new Set(['JPY', 'KRW', 'VND', 'CLP']);
export async function convert(amountMinor: number, from: string, to: string) {
  if (from === to) return amountMinor;
  const r = await fx().rates(from); const major = amountMinor / (ZERO_DECIMAL.has(from) ? 1 : 100);
  return Math.round(major * (r[to] || 1) * (ZERO_DECIMAL.has(to) ? 1 : 100));
}
