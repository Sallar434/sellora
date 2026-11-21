import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { db } from '../src/lib/db';
const app = createApp(); const A = () => request(app);

describe('sign-up emails', () => {
  it('a new seller gets a welcome email and an email verification code; the store starts as "My Store"', async () => {
    const r = (await A().post('/api/auth/signup').send({ email: 'Hina@Shop.pk', password: 'password123' }).expect(201)).body;
    expect(r.store.name).toBe('My Store'); expect(r.user.emailVerified).toBe(false);
    const mails = await db.outbox.findMany({ where: { to: 'hina@shop.pk' } });
    expect(mails.map(m => m.template).sort()).toEqual(['otp', 'welcome_seller']);
    expect(mails.find(m => m.template === 'welcome_seller')!.status).toBe('sent');
  });
  it('a new buyer gets the buyer welcome email', async () => {
    await A().post('/api/auth/signup').send({ email: 'ali@buyer.pk', password: 'password123', type: 'BUYER' }).expect(201);
    expect(await db.outbox.count({ where: { to: 'ali@buyer.pk', template: 'welcome_buyer' } })).toBe(1);
  });
});
