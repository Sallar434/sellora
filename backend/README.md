# Sellora Backend

The REST API behind the Sellora dashboard and storefront. It covers multi-tenant stores, the catalog, checkout and orders, and **Sellora Pay**, which handles escrow, a double-entry ledger, disputes, KYC and payouts. It also covers AI/SEO, apps, notifications and admin.

**Stack:** Node 20, TypeScript, Express 4, Prisma 6 (SQLite in dev, PostgreSQL in prod), Zod, JWT access + refresh tokens, bcrypt, TOTP 2FA, BullMQ (optional), Swagger, Vitest + Supertest.

## Run
```bash
cp .env.example .env
npm install
npm run db:dev && npm run seed     # SQLite dev DB plus demo data
npm run dev                        # http://localhost:4000, docs at /docs
npm test                           # 14 end-to-end API tests (separate test DB)
docker compose up --build          # api + postgres + redis
```
To run Postgres without Docker, run `npm run db:pg` once (it switches the Prisma provider), set `DATABASE_URL=postgresql://...`, then run `npx prisma db push`.

**Seed logins** (password `password123`): `admin@sellora.app` (platform admin), `owner@example.com` (seller, store `active-reality-gear`) and `buyer@example.com`.

## Layout
```
prisma/schema.prisma   all models (users, stores, catalog, orders, wallets/ledger/escrow, KYC, apps, outbox, audit)
prisma/seed.ts         demo data
src/app.ts             express app (helmet, CORS, rate limits, routers, /docs, /openapi.json)
src/server.ts          listen, queue and scheduler
src/lib/               config, auth/RBAC, ledger, commerce pricing, checkout, idempotency, webhooks, crypto
src/providers/         payment (mock|stripe), notify (SMTP/Twilio/mock), llm, fx, storage (local|s3)
src/routes/            auth, stores (+catalog, content, marketing, apps), orders, storefront, pay, admin, ai, public
src/jobs/              queue (BullMQ or in-process) and scheduler (escrow auto-release, outbox retry, abandoned carts)
tests/api.test.ts      end-to-end flows
```

## API map (the full list is at `/docs`)
- `/api/auth`: signup, login (with TOTP), refresh (rotating), logout, me, OTP send/verify (email/SMS), password forgot/reset, 2FA setup/enable/disable.
- `/api/stores/:storeId/...` (Bearer; owner/admin/staff roles with permissions):
  - Store, settings, keys, staff, domains, billing, uploads.
  - Products, variants, inventory, CSV export/import, bulk actions, collections (manual and automated), purchase orders.
  - Themes, pages, blog, menus.
  - Customers, segments, discounts, gift cards, taxes, shipping zones, markets, FX.
  - Apps, pixels, reviews, webhooks, payment links, audit log.
  - Orders: fulfil, refund, cancel, plus draft orders and abandoned checkouts.
  - Sellora Pay: `pay/*`, `kyc/*`, `payouts`.
  - AI: `ai/*`, `voice`, `analytics`.
  - AI website builder (DeepSeek, JSON mode): `GET ai/provider`, `POST ai/site/build` (25 credits), `POST ai/site/edit` (rules first, then LLM; 422 if not understood), `POST ai/stt` (501 `useBrowser` unless `STT_PROVIDER=http`).
  - Extra AI tools: `POST ai/describe` (en/ur/ar), `ai/alt-text`, `ai/campaign` (email/WhatsApp), `ai/review-reply`, `ai/social`, `ai/competitor`.
  - SEO/AEO/GEO: `GET seo/meta`, `seo/head?path=`, `seo/schema?type=`, `seo/sitemap.xml`, `seo/audit`, `seo/internal-links`, `seo/broken-links`, `seo/content-gaps`; `POST seo/fix {ids|all}`, `seo/aeo`, `seo/geo`, `seo/calendar`, `seo/images/optimize`, `seo/submit` (IndexNow/Google), `seo/rank/check`; CRUD `seo/keywords`, `seo/redirects` (loop guard).
  - Off-page: `GET/PATCH seo/citations`, `POST seo/outreach`, `seo/gbp`.
- `/api/storefront/:shop/...` (public; `:shop` = handle, id or publishable key): catalog, search, collections, pages, blog, carts, quote, checkout, order confirm, reviews, payment links, `POST chat` (AI shopping assistant, 1 credit from the store), `GET redirect?path=` (301 lookup).
- `/api/pay`: buyer wallets, disputes, payment-link pay, provider webhooks.
- `/api/admin` (ADMIN only): users, stores and fees, KYC review, dispute resolution, payout approve/reject, wallets, ledger integrity check, jobs, outbox, audit.
- Public: `/s/:shop/sitemap.xml|robots.txt|llms.txt|json-ld`, `/feeds/:shop/google.xml|meta.xml`, `/embed.js`.

## Money and Sellora Pay
- All amounts are integer **minor units** plus an ISO currency (`34900` = 349.00).
- Every movement is a balanced ledger post: the entries sum to 0, and no internal wallet can go negative.
- Escrow flow:
  1. Checkout charges the buyer and holds the money in the seller's `held` balance.
  2. Buyer confirmation, or auto-release after `ESCROW_AUTO_RELEASE_DAYS`, releases it. The net goes to the seller's `available` balance and the fee (`PLATFORM_FEE_BPS`, overridable per store) goes to the platform.
  3. An open dispute freezes auto-release. An admin then resolves it with `refund_buyer`, `release_seller` or `partial`.
- Payouts require approved KYC and a bank account verified by micro-deposits. A request reserves the funds, and an admin approves or rejects it.
- Checkout, refunds and payouts accept an `Idempotency-Key` header.
- Outgoing webhooks are signed with `Sellora-Signature: t=..,v1=HMAC-SHA256`.

## Real vs mock: going live
| Area | Default (no config) | Go live with |
|---|---|---|
| Database | SQLite file | `npm run db:pg`, `DATABASE_URL=postgresql://…` |
| Payments | Mock provider (`tok_fail` declines) | `PAYMENT_PROVIDER=stripe`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| Email | Logged JSON transport | `SMTP_URL`, `MAIL_FROM` |
| SMS / OTP | Logged | `SMS_PROVIDER=twilio`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` |
| AI copy/SEO | Built-in templates | `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL` (any OpenAI-compatible API) |
| Queue | In-process | `REDIS_URL` (+ `npm i bullmq ioredis`, already included in Docker) |
| Uploads | `./uploads` (KYC docs private) | `STORAGE_DRIVER=s3`, `S3_*` |
| FX rates | Static table | `FX_PROVIDER=http`, `FX_API_URL` with `{base}` |
| KYC identity/liveness, domain DNS, bank micro-deposits | Simulated, admin review is real | Plug a provider (Sumsub/Onfido/Veriff, DNS check, Stripe Connect / bank API) into `src/routes/pay.ts`, `stores.ts` |
| Secrets | Dev defaults | `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ENCRYPTION_KEY` (64 hex), `WEBHOOK_SIGNING_SECRET`, `CORS_ORIGINS`, `PUBLIC_URL`, `NODE_ENV=production`. Production refuses to boot with weak values. |

In dev and test, OTP codes and micro-deposit amounts come back in responses as `devCode` / `devAmounts`. That never happens in production.

## Frontend
`sellora-connected.html` is a copy of the single-file dashboard. Go to **Integrations → Sellora backend**, enter the URL, email and password, then click Connect.
- Products sync both ways over REST.
- The full app state is saved to store settings.
- Server orders and customers are pulled in.
- When it isn't connected, or the server is unreachable, it keeps working from localStorage.
