/** Stripe Checkout in test mode. The price is read from the product row, never from the client. */
import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db';
import { ah, parse, HttpError } from '../lib/http';
import { auth } from '../lib/auth';
import { config } from '../lib/config';
export const r = Router();
export const applicationFeeCents = (priceCents: number) => {
  if (!Number.isInteger(priceCents) || priceCents < 0) throw new Error('Price must be a non-negative integer number of cents');
  return Math.round(priceCents * 2 / 100);
};
type SessionArgs = { mode: 'payment'; line_items: any[]; success_url: string; cancel_url: string; payment_intent_data: any; metadata: Record<string, string> };
type Caller = (args: SessionArgs) => Promise<{ id: string; url: string | null }>;
let createSession: Caller = async (args) => {
  const Stripe = (await import('stripe')).default;
  const stripe = new Stripe(config.stripeKey);
  const session = await stripe.checkout.sessions.create(args as any);
  return { id: session.id, url: session.url };
};
export const setCheckoutCaller = (fn: Caller) => { createSession = fn };
type Construct = (raw: string | Buffer, sig: string, secret: string) => any;
let constructEvent: Construct = (raw, sig, secret) => {
  const Stripe = require('stripe');
  return new Stripe(config.stripeKey || 'sk_test_placeholder').webhooks.constructEvent(raw, sig, secret);
};
export const setWebhookConstruct = (fn: Construct) => { constructEvent = fn };

r.post('/checkout', auth, ah(async (req, res) => {
  const b = parse(z.object({ productId: z.string().min(1), storeId: z.string().min(1) }), req.body);
  const product = await db.product.findFirst({ where: { id: b.productId, storeId: b.storeId } });
  if (!product) throw new HttpError(404, 'Product not found in that store');
  const store = await db.store.findUnique({ where: { id: b.storeId } });
  if (!store) throw new HttpError(404, 'Store not found');
  if (!store.stripeAccountId) throw new HttpError(409, 'This store has no stripeAccountId. Checkout was not created.');
  if (!config.stripeKey) throw new HttpError(503, 'STRIPE_SECRET_KEY is not set. Checkout was not created.');
  const fee = applicationFeeCents(product.price);
  const order = await db.order.create({ data: { storeId: store.id, number: Date.now() % 1000000, email: req.user!.email, currency: store.currency, subtotal: product.price, total: product.price, financial: 'pending', status: 'open', lines: { create: [{ title: product.title, price: product.price, qty: 1, productId: product.id }] } } });
  const session = await createSession({
    mode: 'payment',
    line_items: [{ quantity: 1, price_data: { currency: store.currency.toLowerCase(), unit_amount: product.price, product_data: { name: product.title } } }],
    success_url: `${config.publicUrl}/paid?order=${order.id}`,
    cancel_url: `${config.publicUrl}/cancelled?order=${order.id}`,
    payment_intent_data: { application_fee_amount: fee, transfer_data: { destination: store.stripeAccountId } },
    metadata: { orderId: order.id, storeId: store.id },
  });
  res.json({ orderId: order.id, url: session.url, sessionId: session.id, amount: product.price, applicationFeeCents: fee, live: false, mode: 'test' });
}));

export const webhook = Router();
webhook.post('/stripe', ah(async (req, res) => {
  if (!config.stripeWebhookSecret) throw new HttpError(503, 'STRIPE_WEBHOOK_SECRET is not set. The order was not updated.');
  const sig = String(req.headers['stripe-signature'] || '');
  let event: any;
  try { event = constructEvent((req as any).rawBody || '', sig, config.stripeWebhookSecret); }
  catch { throw new HttpError(400, 'Stripe signature was rejected. The order was not updated.'); }
  if (event.type === 'checkout.session.completed') {
    const orderId = event.data?.object?.metadata?.orderId;
    if (orderId) await db.order.updateMany({ where: { id: orderId }, data: { financial: 'paid', status: 'open' } });
  }
  res.json({ received: true });
}));
