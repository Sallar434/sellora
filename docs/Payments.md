# VendOm payments and VendOm Pay Protection

## Two ways to get paid (the seller chooses in VendOm Pay → "How buyers pay")

| Setting | What happens |
|---|---|
| **Buyer chooses** (default) | At checkout the buyer can turn VendOm Pay Protection on or off. Signed-in buyers start with it on; guests start with it off. |
| **Always protected** | Every payment is held by VendOm Pay. Buyers must have an account. |
| **Direct only** | Money goes straight to the seller, like Shopify. No hold. |

Direct payments are not affected by VendOm Pay Protection at all: the seller's balance goes up as soon as the buyer pays (minus the platform fee).

## VendOm Pay Protection (VendOm's own hold-and-release, no outside escrow company)

1. **Buyer pays.** The buyer needs a free buyer account (they can create it at checkout with a password), so every protected order is on record.
2. **Seller is told to ship.** Email + admin alert: "Payment secured for order #1004: ship it now". The seller must ship within **5 days** (`SHIP_BY_DAYS`), or the buyer is refunded in full automatically.
3. **Seller ships** with a tracking number and enters their **shipping cost** (defaults to what the buyer paid for shipping). The buyer is emailed to confirm delivery.
4. **Buyer confirms** in their account → money released to the seller (minus the platform fee). If the buyer does nothing, it is released **7 days after shipping** (`ESCROW_AUTO_RELEASE_DAYS`). Money is never released before the seller ships.
5. **Parcel not received:**
   - Not shipped yet → the order is cancelled and the buyer is refunded in full.
   - Shipped → the seller has **3 days** (`NOT_RECEIVED_RESPONSE_DAYS`) to show proof of delivery. If the parcel came back, the seller clicks **Parcel returned to me**. If the seller does not answer, it is settled automatically.
   - Settlement: **the seller keeps their shipping cost** (no platform fee on it) and **the rest goes back to the buyer** (to their card). The shipping cost can never be more than the order.
   - If the seller sends proof, VendOm (platform admin) decides: release to the seller, refund in full, partial refund, or "not received: refund minus shipping".
6. **Other problems** (damaged, not as described) open a normal case that VendOm decides.

Every movement is double-entry in the ledger; the tests check that the books always balance.

## International payments

| Buyer is in | Methods shown at checkout |
|---|---|
| Any country | Cards (Visa, Mastercard, Amex, UnionPay, JCB), Apple Pay, Google Pay, PayPal (when `PAYPAL_CLIENT_ID` is set) |
| Pakistan | + JazzCash, Easypaisa, Raast / bank transfer |
| India | + UPI · Netherlands: iDEAL · Belgium: Bancontact · Poland: BLIK, Przelewy24 · Germany/France/UK/US: Klarna and more · China/Hong Kong: Alipay, WeChat Pay · Singapore: PayNow, GrabPay · Malaysia: FPX · Thailand: PromptPay · Japan: Konbini, PayPay · Korea: Kakao Pay, Naver Pay · Brazil: Pix, Boleto · Mexico: OXXO · UAE/Saudi: Tabby, mada |

API: `GET /api/storefront/{shop}/payment-methods?country=XX`.

### To take real money (before launch)
1. **Card processor for international buyers: Stripe.** Stripe does not open accounts for companies registered in Pakistan, so VendOm needs a company in a Stripe country (for example a US LLC via Stripe Atlas, a UK Ltd, or a UAE company). Then set `PAYMENT_PROVIDER=stripe`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`. The code uses PaymentIntents (any currency) and transfers to sellers on release.
2. **Pakistan local methods: Safepay** (cards + wallets, works for Pakistani companies), JazzCash and Easypaisa merchant accounts. These need their merchant agreements and API keys; the adapters are the next step after the server is online.
3. **Legal:** holding buyers' money until delivery is regulated. In Pakistan that means working through a licensed partner (a bank or an SBP-licensed EMI such as Safepay's partners) or getting a licence; abroad, Stripe's platform model covers it for Stripe payments. Talk to the payment partner and a lawyer before switching protection on with real money.

Until then, payments run in test mode (card `4242 4242 4242 4242` succeeds, `4000 0000 0000 0002` is declined).
