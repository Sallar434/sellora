/** Aggregate orders that were actually stored. Missing fields stay "unknown"; they are not treated as undelivered or unpaid. */

export type OrderLike = {
  id?: string | number;
  st?: string;
  status?: string;
  financial?: string;
  fulfillment?: string;
  delivered?: boolean | null;
  at?: number | string | null;
  createdAt?: string | Date | null;
  total?: number | null;
};

export type OrderSummary = {
  source: 'stored-records';
  count: number;
  undated: number;
  placed: number;
  cancelled: number;
  payment: { paid: number; unpaid: number; refunded: number; unknown: number };
  fulfillment: { fulfilled: number; unfulfilled: number; partial: number; unknown: number };
  delivery: { delivered: number; undelivered: number; unknown: number };
  totalKnown: number | null;
  note: string;
};

function when(o: OrderLike): number | null {
  if (typeof o.at === 'number' && isFinite(o.at)) return o.at;
  const raw = o.at || o.createdAt;
  if (!raw) return null;
  const t = new Date(raw).getTime();
  return isFinite(t) ? t : null;
}

function text(o: OrderLike) {
  return `${o.st || ''} ${o.status || ''}`.toLowerCase();
}

export function paymentOf(o: OrderLike): 'paid' | 'unpaid' | 'refunded' | 'unknown' {
  const f = (o.financial || '').toLowerCase();
  if (f === 'paid' || f === 'held') return 'paid';
  if (f === 'pending' || f === 'unpaid') return 'unpaid';
  if (f === 'refunded' || f === 'partially_refunded') return 'refunded';
  const s = text(o);
  if (/refund/.test(s)) return 'refunded';
  if (/\bpaid\b/.test(s)) return 'paid';
  if (/unpaid|awaiting payment/.test(s)) return 'unpaid';
  if (/\bfulfilled\b/.test(s)) return 'paid';
  return 'unknown';
}

export function fulfillmentOf(o: OrderLike): 'fulfilled' | 'unfulfilled' | 'partial' | 'unknown' {
  const f = (o.fulfillment || '').toLowerCase();
  if (f === 'fulfilled') return 'fulfilled';
  if (f === 'unfulfilled') return 'unfulfilled';
  if (f === 'partial' || f === 'partially_fulfilled') return 'partial';
  const s = text(o);
  if (/partial/.test(s)) return 'partial';
  if (/\bfulfilled\b|\bshipped\b/.test(s)) return 'fulfilled';
  if (/unfulfilled/.test(s)) return 'unfulfilled';
  if (/\bpaid\b/.test(s)) return 'unfulfilled';
  return 'unknown';
}

/** delivered / undelivered only when a record says so. Fulfilled is not delivered. */
export function deliveryOf(o: OrderLike): 'delivered' | 'undelivered' | 'unknown' {
  if (o.delivered === true) return 'delivered';
  if (o.delivered === false) return 'undelivered';
  const s = text(o);
  if (/\bundelivered\b|\bnot delivered\b|\bdelivery failed\b/.test(s)) return 'undelivered';
  if (/\bdelivered\b/.test(s)) return 'delivered';
  return 'unknown';
}

export function summarizeOrders(orders: OrderLike[] | null | undefined, range?: { from?: number | null; to?: number | null }): OrderSummary {
  const all = Array.isArray(orders) ? orders : [];
  let undated = 0;
  const rows = all.filter(o => {
    const t = when(o);
    if (t == null) { undated++; return range?.from == null && range?.to == null; }
    if (range?.from != null && t < range.from) return false;
    if (range?.to != null && t > range.to) return false;
    return true;
  });
  const payment = { paid: 0, unpaid: 0, refunded: 0, unknown: 0 };
  const fulfillment = { fulfilled: 0, unfulfilled: 0, partial: 0, unknown: 0 };
  const delivery = { delivered: 0, undelivered: 0, unknown: 0 };
  let cancelled = 0;
  let totalKnown = 0;
  let totalMissing = false;
  rows.forEach(o => {
    const s = text(o);
    if (/cancel/.test(s) || (o.status || '').toLowerCase() === 'cancelled') cancelled++;
    payment[paymentOf(o)]++;
    fulfillment[fulfillmentOf(o)]++;
    delivery[deliveryOf(o)]++;
    if (typeof o.total === 'number' && isFinite(o.total)) totalKnown += o.total;
    else totalMissing = true;
  });
  return {
    source: 'stored-records',
    count: rows.length,
    undated,
    placed: rows.length,
    cancelled,
    payment,
    fulfillment,
    delivery,
    totalKnown: rows.length && !totalMissing ? totalKnown : rows.length ? totalKnown : null,
    note: 'Counts use only stored orders. Delivery is unknown unless a record says delivered or undelivered. Fulfilled does not mean delivered.',
  };
}
