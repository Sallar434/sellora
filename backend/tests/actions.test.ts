import { describe, it, expect } from 'vitest';
import { planCommand } from '../src/lib/actions';
import { summarizeOrders, paymentOf, deliveryOf } from '../src/lib/ordersReport';

describe('assistant action plans', () => {
  it('does not treat a blocked payment command as success', () => {
    const p = planCommand('refund order 1001');
    expect(p.supported).toBe(false);
    expect(p.blocked).toBe('payment');
    expect(p.message.toLowerCase()).not.toContain('succeeded');
  });
  it('asks for confirmation before a destructive command', () => {
    const p = planCommand('delete all products');
    expect(p.needsConfirm).toBe(true);
    expect(p.destructive).toBe(true);
  });
  it('says when a command is not supported', () => {
    expect(planCommand('please juggle the inventory').supported).toBe(false);
  });
  it('accepts an order question without asking a model to invent numbers', () => {
    const p = planCommand('how many orders were paid');
    expect(p.kind).toBe('orders');
    expect(p.wantsCopy).toBe(false);
  });
});

describe('order aggregation', () => {
  it('counts only stored rows and keeps delivery unknown', () => {
    const s = summarizeOrders([{ id: 1, st: 'Paid', total: 10 }, { id: 2, st: 'Fulfilled', total: 5 }]);
    expect(s.count).toBe(2);
    expect(s.payment.paid).toBe(2);
    expect(s.fulfillment.unfulfilled).toBe(1);
    expect(s.fulfillment.fulfilled).toBe(1);
    expect(s.delivery.unknown).toBe(2);
    expect(s.delivery.undelivered).toBe(0);
  });
  it('does not invent orders when the list is empty', () => {
    const s = summarizeOrders([]);
    expect(s.count).toBe(0);
    expect(s.totalKnown).toBeNull();
    expect(s.delivery.delivered).toBe(0);
  });
  it('records undelivered only when the record says so', () => {
    expect(deliveryOf({ st: 'Fulfilled' })).toBe('unknown');
    expect(deliveryOf({ delivered: false })).toBe('undelivered');
    expect(paymentOf({})).toBe('unknown');
  });
});
