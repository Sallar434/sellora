import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { db } from '../lib/db';
import { ah, parse, bad, nf, forbid } from '../lib/http';
import { auth, storeAccess, requireType } from '../lib/auth';
import { wallet, post, externalWallet, holdEscrow } from '../lib/ledger';
import { idempotent } from '../lib/idem';
import { payments } from '../providers/payment';
import { put } from '../providers/storage';
import { notify } from '../providers/notify';
import { nextOrderNumber, tl } from '../lib/commerce';
import { verifySig } from '../lib/crypto';
import { config } from '../lib/config';
import { audit } from '../lib/audit';
/** Seller-side Sellora Pay, mounted under /api/stores */
export const seller = Router();
seller.get('/:storeId/pay/wallets', storeAccess('orders'), ah(async (req, res) => res.json(await db.wallet.findMany({ where: { ownerType: 'SELLER', ownerId: req.store.id } }))));
seller.get('/:storeId/pay/ledger', storeAccess('orders'), ah(async (req, res) => { const ws = await db.wallet.findMany({ where: { ownerType: 'SELLER', ownerId: req.store.id } }); res.json(await db.ledgerEntry.findMany({ where: { walletId: { in: ws.map(w => w.id) } }, orderBy: { createdAt: 'desc' }, take: 500 })); }));
seller.get('/:storeId/pay/escrows', storeAccess('orders'), ah(async (req, res) => res.json(await db.escrow.findMany({ where: { storeId: req.store.id }, orderBy: { createdAt: 'desc' } }))));
seller.get('/:storeId/pay/disputes', storeAccess('orders'), ah(async (req, res) => { const es = await db.escrow.findMany({ where: { storeId: req.store.id }, select: { id: true } }); res.json(await db.dispute.findMany({ where: { escrowId: { in: es.map(e => e.id) } } })); }));
seller.post('/:storeId/pay/disputes/:id/respond', storeAccess('orders'), ah(async (req, res) => { const d = await db.dispute.findUnique({ where: { id: req.params.id } }); if (!d) throw nf(); res.json(await db.dispute.update({ where: { id: d.id }, data: { resolution: `seller: ${String(req.body?.message || '').slice(0, 2000)}`, status: d.status === 'open' ? 'under_review' : d.status } })); }));
// KYC
seller.get('/:storeId/kyc', storeAccess('*'), ah(async (req, res) => res.json(await db.kyc.upsert({ where: { storeId: req.store.id }, update: {}, create: { storeId: req.store.id } }))));
seller.patch('/:storeId/kyc', storeAccess('*'), ah(async (req, res) => {
  const b = parse(z.object({ business: z.object({ legalName: z.string(), type: z.enum(['individual', 'company', 'nonprofit']), country: z.string().length(2), address: z.string(), website: z.string().optional(), dob: z.string().optional() }).partial(), taxId: z.string(), bank: z.object({ holder: z.string(), iban: z.string().optional(), accountNumber: z.string().optional(), routing: z.string().optional(), bankName: z.string().optional(), country: z.string().length(2), currency: z.string().length(3), stripeAccount: z.string().optional() }) }).partial(), req.body);
  const k = await db.kyc.findUniqueOrThrow({ where: { storeId: req.store.id } }); if (k.status === 'approved' && b.bank === undefined) throw bad('Approved KYC is locked; contact support');
  res.json(await db.kyc.update({ where: { id: k.id }, data: { ...b, ...(b.bank ? { bankVerified: false, microDeposits: undefined } : {}), status: k.status === 'approved' ? 'approved' : 'draft' } }));
}));
const up = multer({ limits: { fileSize: 10 * 1024 * 1024 } });
seller.post('/:storeId/kyc/documents', storeAccess('*'), up.single('file'), ah(async (req, res) => {
  const f = (req as any).file; if (!f) throw bad('file required'); const kind = String(req.body?.kind || 'id_front');
  const o = await put(req.store.id, `kyc-${kind}-${f.originalname}`, f.buffer, f.mimetype, true);
  const k = await db.kyc.findUniqueOrThrow({ where: { storeId: req.store.id } });
  res.status(201).json(await db.kyc.update({ where: { id: k.id }, data: { documents: [...((k.documents as any[]) || []), { kind, key: o.key, mime: f.mimetype, at: new Date().toISOString() }] } }));
}));
seller.post('/:storeId/kyc/liveness', storeAccess('*'), ah(async (req, res) => { const k = await db.kyc.findUniqueOrThrow({ where: { storeId: req.store.id } }); res.json(await db.kyc.update({ where: { id: k.id }, data: { liveness: req.body?.sessionId ? 'passed' : 'pending' } })); })); // placeholder: integrate Persona/Onfido/Stripe Identity
seller.post('/:storeId/kyc/bank/micro-deposits', storeAccess('*'), ah(async (req, res) => { const k = await db.kyc.findUniqueOrThrow({ where: { storeId: req.store.id } }); if (!k.bank) throw bad('Add bank first'); const { amounts } = await payments().microDeposits({ bank: k.bank }); await db.kyc.update({ where: { id: k.id }, data: { microDeposits: { amounts, tries: 0 } } }); res.json({ sent: true, ...(config.env !== 'production' ? { devAmounts: amounts } : {}) }); }));
seller.post('/:storeId/kyc/bank/verify', storeAccess('*'), ah(async (req, res) => {
  const k = await db.kyc.findUniqueOrThrow({ where: { storeId: req.store.id } }); const md: any = k.microDeposits; if (!md) throw bad('No micro-deposits sent');
  if (md.tries >= 3) throw bad('Too many attempts'); const a = [...(req.body?.amounts || [])].map(Number).sort(); const ok = JSON.stringify(a) === JSON.stringify([...md.amounts].sort());
  await db.kyc.update({ where: { id: k.id }, data: ok ? { bankVerified: true } : { microDeposits: { ...md, tries: md.tries + 1 } } }); if (!ok) throw bad('Amounts do not match'); res.json({ bankVerified: true });
}));
seller.post('/:storeId/kyc/submit', storeAccess('*'), ah(async (req, res) => {
  const k = await db.kyc.findUniqueOrThrow({ where: { storeId: req.store.id } }); const miss = [!k.business && 'business', !k.taxId && 'taxId', !((k.documents as any[]) || []).length && 'documents', !k.bank && 'bank'].filter(Boolean);
  if (miss.length) throw bad('Incomplete KYC', { missing: miss }); res.json(await db.kyc.update({ where: { id: k.id }, data: { status: 'submitted' } }));
}));
// payouts (need approved KYC + verified bank); admin approves
seller.get('/:storeId/payouts', storeAccess('*'), ah(async (req, res) => res.json(await db.payout.findMany({ where: { storeId: req.store.id }, orderBy: { createdAt: 'desc' } }))));
seller.post('/:storeId/payouts', storeAccess('*'), idempotent, ah(async (req, res) => {
  const b = parse(z.object({ amount: z.number().int().positive(), currency: z.string().length(3), destination: z.any().optional() }), req.body);
  const k = await db.kyc.findUnique({ where: { storeId: req.store.id } }); if (k?.status !== 'approved' || !k.bankVerified) throw forbid('KYC approval and a verified bank account are required');
  const w = await wallet('SELLER', req.store.id, b.currency);
  // reserve: available -> held (payout pending)
  await post(`payout reserve`, b.currency, [{ walletId: w.id, bucket: 'available', amount: -b.amount }, { walletId: w.id, bucket: 'held', amount: b.amount }]);
  const p = await db.payout.create({ data: { storeId: req.store.id, walletId: w.id, amount: b.amount, currency: b.currency, destination: b.destination || k.bank } });
  audit(req, 'payout.request', { id: p.id }); res.status(201).json(p);
}));
seller.get('/:storeId/pay/embed', storeAccess(), ah(async (req, res) => res.json({ publishableKey: req.store.publishableKey, snippet: `<div id="sellora-checkout"></div>\n<script src="${config.publicUrl}/embed.js" data-key="${req.store.publishableKey}" data-link="LINK_ID"></script>` })));

/** Buyer wallet & disputes, mounted under /api/pay */
export const buyer = Router();
buyer.get('/wallets', auth, ah(async (req, res) => res.json(await db.wallet.findMany({ where: { ownerType: req.user!.type, ownerId: req.user!.type === 'ADMIN' ? 'platform' : req.user!.sub } }))));
buyer.post('/disputes', auth, requireType('BUYER'), ah(async (req, res) => {
  const b = parse(z.object({ orderId: z.string(), reason: z.string().min(3) }), req.body);
  const o = await db.order.findUnique({ where: { id: b.orderId } }); if (!o || o.email !== req.user!.email) throw forbid('Not your order');
  const e = await db.escrow.findUnique({ where: { orderId: o.id } }); if (!e || e.status !== 'held') throw bad('Funds already released; contact seller');
  const d = await db.dispute.create({ data: { escrowId: e.id, reason: b.reason } }); await db.order.update({ where: { id: o.id }, data: { timeline: tl(o, 'Buyer opened dispute: ' + b.reason) } }); res.status(201).json(d);
}));
// payment links: public pay
buyer.post('/links/:linkId/pay', idempotent, ah(async (req, res) => {
  const l = await db.paymentLink.findFirst({ where: { id: req.params.linkId, active: true } }); if (!l) throw nf();
  const email = String(req.body?.email || '').toLowerCase(); if (!email.includes('@')) throw bad('Email required');
  const ch = await payments().charge({ amount: l.amount, currency: l.currency, source: req.body?.source || 'tok_visa' }); if (ch.status !== 'succeeded') throw bad('Payment failed');
  const store = await db.store.findUniqueOrThrow({ where: { id: l.storeId } });
  const o = await db.order.create({ data: { storeId: l.storeId, number: await nextOrderNumber(l.storeId), email, currency: l.currency, subtotal: l.amount, total: l.amount, financial: 'held', timeline: tl(null, 'Paid via payment link ' + l.id), lines: { create: [{ title: l.title, price: l.amount, qty: 1 }] } } });
  const e = await holdEscrow(o, 'guest:' + email, store.feeBps); res.status(201).json({ orderId: o.id, escrowId: e.id, number: o.number });
}));
/** Incoming provider webhooks (signature verified). */
buyer.post('/webhooks/:provider', ah(async (req, res) => {
  const raw = (req as any).rawBody || JSON.stringify(req.body);
  const secret = req.params.provider === 'stripe' ? config.stripeWebhookSecret : config.outWebhookSecret;
  const hdr = req.header('Sellora-Signature') || '';
  if (req.params.provider === 'stripe') { /* Stripe-Signature uses t=,v1= with same HMAC scheme */ if (!verifySig(raw, (req.header('Stripe-Signature') || '').replace(/,v0=.*/, ''), secret)) throw bad('Bad signature'); }
  else if (!verifySig(raw, hdr, secret)) throw bad('Bad signature');
  await db.auditLog.create({ data: { action: `webhook.${req.params.provider}.${req.body?.type || req.body?.event || 'event'}`, meta: req.body } });
  res.json({ received: true });
}));
