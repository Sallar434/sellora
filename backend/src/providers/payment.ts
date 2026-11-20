import { config } from '../lib/config';
import { rand } from '../lib/crypto';
/** PaymentProvider: charge buyers (any country/currency) and pay out to sellers. */
export interface PaymentProvider {
  name: string;
  charge(i: { amount: number; currency: string; source: string; metadata?: any }): Promise<{ id: string; status: 'succeeded' | 'failed'; error?: string }>;
  refund(i: { chargeId: string; amount: number; currency: string }): Promise<{ id: string; status: 'succeeded' | 'failed' }>;
  payout(i: { amount: number; currency: string; destination: any }): Promise<{ id: string; status: 'paid' | 'pending' | 'failed' }>;
  microDeposits(i: { bank: any }): Promise<{ amounts: number[] }>;
}
/** Working mock: source "tok_fail" fails, everything else succeeds. */
export const mockProvider: PaymentProvider = {
  name: 'mock',
  async charge(i) { return i.source === 'tok_fail' ? { id: 'ch_' + rand(8), status: 'failed', error: 'card_declined' } : { id: 'ch_' + rand(8), status: 'succeeded' }; },
  async refund() { return { id: 're_' + rand(8), status: 'succeeded' }; },
  async payout() { return { id: 'po_' + rand(8), status: 'paid' }; },
  async microDeposits() { return { amounts: [1 + Math.floor(Math.random() * 98), 1 + Math.floor(Math.random() * 98)] }; },
};
/** Stripe Connect adapter skeleton (REST, no SDK). Set PAYMENT_PROVIDER=stripe + STRIPE_SECRET_KEY. */
async function stripe(path: string, body: Record<string, any>) {
  const r = await fetch('https://api.stripe.com/v1/' + path, { method: 'POST', headers: { Authorization: `Bearer ${config.stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(Object.entries(body).map(([k, v]) => [k, String(v)])) });
  const j: any = await r.json(); if (!r.ok) throw new Error(j.error?.message || 'stripe error'); return j;
}
export const stripeProvider: PaymentProvider = {
  name: 'stripe',
  async charge(i) { const pi = await stripe('payment_intents', { amount: i.amount, currency: i.currency.toLowerCase(), payment_method: i.source, confirm: true, 'automatic_payment_methods[enabled]': true, 'automatic_payment_methods[allow_redirects]': 'never' }); return { id: pi.id, status: pi.status === 'succeeded' ? 'succeeded' : 'failed' }; },
  async refund(i) { const r = await stripe('refunds', { payment_intent: i.chargeId, amount: i.amount }); return { id: r.id, status: 'succeeded' }; },
  async payout(i) { const t = await stripe('transfers', { amount: i.amount, currency: i.currency.toLowerCase(), destination: i.destination.stripeAccount }); return { id: t.id, status: 'pending' }; },
  async microDeposits() { return { amounts: [32, 45] }; }, // Stripe handles bank verification via Financial Connections; placeholder.
};
export const payments = (): PaymentProvider => (config.paymentProvider === 'stripe' ? stripeProvider : mockProvider);

/**
 * Payment methods shown at checkout, by the buyer's country. Cards (Visa, Mastercard, Amex, UnionPay, JCB, Discover),
 * Apple Pay and Google Pay work from every country through the card processor (Stripe when PAYMENT_PROVIDER=stripe);
 * local methods are added where the processor supports them. Pakistan wallets go through a local processor (Safepay / JazzCash / Easypaisa).
 */
const LOCAL: Record<string, [string, string][]> = {
  PK: [['jazzcash', 'JazzCash'], ['easypaisa', 'Easypaisa'], ['raast', 'Raast / bank transfer']],
  IN: [['upi', 'UPI']], NL: [['ideal', 'iDEAL']], BE: [['bancontact', 'Bancontact']], AT: [['eps', 'EPS']], PL: [['blik', 'BLIK'], ['p24', 'Przelewy24']],
  DE: [['klarna', 'Klarna'], ['sepa_debit', 'SEPA Direct Debit']], FR: [['cartes_bancaires', 'Cartes Bancaires'], ['klarna', 'Klarna']], IT: [['klarna', 'Klarna']], ES: [['klarna', 'Klarna']],
  GB: [['klarna', 'Klarna'], ['bacs_debit', 'Bacs Direct Debit']], US: [['klarna', 'Klarna'], ['affirm', 'Affirm'], ['cashapp', 'Cash App Pay'], ['us_bank_account', 'US bank account (ACH)']],
  CA: [['affirm', 'Affirm']], AU: [['afterpay_clearpay', 'Afterpay'], ['au_becs_debit', 'BECS Direct Debit']], NZ: [['afterpay_clearpay', 'Afterpay']],
  CN: [['alipay', 'Alipay'], ['wechat_pay', 'WeChat Pay']], HK: [['alipay', 'Alipay'], ['wechat_pay', 'WeChat Pay']], SG: [['paynow', 'PayNow'], ['grabpay', 'GrabPay']], MY: [['fpx', 'FPX'], ['grabpay', 'GrabPay']],
  TH: [['promptpay', 'PromptPay']], JP: [['konbini', 'Konbini'], ['paypay', 'PayPay']], KR: [['kakao_pay', 'Kakao Pay'], ['naver_pay', 'Naver Pay']], BR: [['pix', 'Pix'], ['boleto', 'Boleto']], MX: [['oxxo', 'OXXO']],
  AE: [['tabby', 'Tabby']], SA: [['mada', 'mada'], ['tabby', 'Tabby']], TR: [['troy', 'Troy']],
};
export function methodsFor(country: string, currency: string) {
  const global = [{ id: 'card', label: 'Credit or debit card (Visa, Mastercard, Amex, UnionPay, JCB)', scope: 'global' }, { id: 'apple_pay', label: 'Apple Pay', scope: 'global' }, { id: 'google_pay', label: 'Google Pay', scope: 'global' }];
  if (config.paypalClientId) global.push({ id: 'paypal', label: 'PayPal', scope: 'global' });
  return { country, currency, methods: [...global, ...(LOCAL[country] || []).map(([id, label]) => ({ id, label, scope: 'local' }))], processor: country === 'PK' ? 'local (Safepay / JazzCash / Easypaisa) + card processor' : config.paymentProvider };
}
