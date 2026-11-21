import nodemailer from 'nodemailer';
import { config } from '../lib/config';
import { db } from '../lib/db';
export interface SmsProvider { send(to: string, body: string): Promise<void> }
export const mockSms: SmsProvider = { async send(to, body) { if (config.env !== 'test') console.log(`[sms:mock] ${to}: ${body}`); } };
export const twilioSms: SmsProvider = { async send(to, body) {
  const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${config.twilioSid}/Messages.json`, { method: 'POST', headers: { Authorization: 'Basic ' + Buffer.from(`${config.twilioSid}:${config.twilioToken}`).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ To: to, From: config.twilioFrom, Body: body }) });
  if (!r.ok) throw new Error('twilio ' + r.status);
} };
const sms = () => (config.smsProvider === 'twilio' ? twilioSms : mockSms);
const mailer = config.smtpUrl ? nodemailer.createTransport(config.smtpUrl) : nodemailer.createTransport({ jsonTransport: true });
export const TEMPLATES: Record<string, (p: any) => { subject: string; text: string }> = {
  otp: p => ({ subject: 'Your VendOm code', text: `Your verification code is ${p.code}. It expires in 10 minutes.` }),
  welcome_seller: p => ({ subject: 'Welcome to VendOm: your account is ready', text: `Hi, you created a VendOm account with ${p.email}. Verify your email with the code we sent, then set up ${p.store || 'your store'}: add products, pick a design and choose how you get paid. Your 4-day free trial has started.` }),
  welcome_buyer: p => ({ subject: 'Welcome to VendOm', text: `Hi, you created a VendOm buyer account with ${p.email}. Use it to track orders, confirm delivery and get refunds when VendOm Pay Protection covers your order.` }),
  password_reset: p => ({ subject: 'Reset your password', text: `Use code ${p.code} to reset your password.` }),
  order_confirmation: p => ({ subject: `Order #${p.number} confirmed`, text: `Thanks for your order #${p.number}. Total: ${(p.total / 100).toFixed(2)} ${p.currency}.` }),
  abandoned_cart: p => ({ subject: 'You left something in your cart', text: `Complete your purchase: ${p.url}` }),
  shipping_update: p => ({ subject: `Order #${p.number} shipped`, text: `Tracking: ${p.tracking || '-'} ${p.url || ''}` }),
  generic: p => ({ subject: p.subject, text: p.text }),
  payout_paid: p => ({ subject: 'Payout sent', text: `A payout of ${(p.amount / 100).toFixed(2)} ${p.currency} was sent.` }),
  ship_now: p => ({ subject: `Payment secured for order #${p.number}: ship it now`, text: `VendOm Pay is holding ${(p.total / 100).toFixed(2)} ${p.currency} for order #${p.number}. Ship the parcel by ${p.shipBy} and add the tracking number. The money is released when the buyer confirms delivery (or ${p.days} days after shipping if they don't respond).` }),
  confirm_receipt: p => ({ subject: `Did you receive order #${p.number}?`, text: `Your order #${p.number} has shipped${p.tracking ? ' (tracking ' + p.tracking + ')' : ''}. When it arrives, confirm in your account so the seller is paid. If it doesn't arrive, report it there: you get your money back minus the seller's shipping cost.` }),
  not_received: p => ({ subject: `Buyer reports order #${p.number} not received`, text: `The buyer says order #${p.number} has not arrived. Reply with proof of delivery within ${p.days} days, or mark the parcel as returned. If you don't answer, the buyer is refunded and you keep your shipping cost (${(p.shippingCost / 100).toFixed(2)} ${p.currency}).` }),
  refund_notice: p => ({ subject: `Refund for order #${p.number}`, text: `${(p.amount / 100).toFixed(2)} ${p.currency} is on its way back to you. ${p.why || ''}` }),
};
/** Writes to outbox then delivers (outbox keeps a durable record + retries via job). */
export async function notify(channel: 'email' | 'sms', to: string, template: string, payload: any) {
  const row = await db.outbox.create({ data: { channel, to, template, payload } });
  await deliver(row.id);
  return row;
}
export async function deliver(id: string) {
  const row = await db.outbox.findUnique({ where: { id } }); if (!row || row.status === 'sent') return;
  try {
    const t = (TEMPLATES[row.template] || (p => ({ subject: row.template, text: JSON.stringify(p) })))(row.payload);
    if (row.channel === 'email') await mailer.sendMail({ from: config.mailFrom, to: row.to, subject: t.subject, text: t.text });
    else await sms().send(row.to, t.text);
    await db.outbox.update({ where: { id }, data: { status: 'sent', error: null } });
  } catch (e: any) { await db.outbox.update({ where: { id }, data: { status: 'failed', error: String(e.message) } }); }
}
