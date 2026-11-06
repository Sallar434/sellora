# Sellora: external services and API needs

Prices were checked on **29 Oct 2026 (Asia/Karachi, UTC+5)** against the linked official pages. Third-party summaries were used only where noted. Prices are in US Dollar (USD) unless stated otherwise. Pakistani Rupee (PKR) amounts are converted at roughly Rs 277 = $1.

Every external service sits behind a provider interface in `sellora-backend/src/providers/*` and `src/integrations/*`. If no key is configured, Sellora uses a **mock** with the same request/response shape, so the whole app works end to end without any of these services. Merchant keys are stored encrypted with AES-256-GCM (`AppInstall.credentialsEnc`).

Legend: **NOW** = needed for a public launch in Pakistan. **LATER** = optional, or needed only at scale or for exports.

## 1. Platform services

| Service | Purpose in Sellora | Providers (✓ = works in Pakistan) | Price (official) | Free tier | When |
|---|---|---|---|---|---|
| Payment/escrow partner (Sellora Pay) | Card and wallet collection into escrow; release to seller | **Safepay ✓** (PSO/EMI partner), PayFast ✓, Stripe ✗ (not available for PK entities) | Safepay: domestic cards 2.9% + Rs 30, international 3.2% + Rs 30, wallets 1.5%, Raast up to 1.5%, instant payouts 1.5%, dispute Rs 3,000; no setup or monthly fee. [safepay.com.pk/pricing](https://safepay.com.pk/pricing) | No fixed fee | NOW |
| JazzCash | Mobile-wallet and card checkout | JazzCash ✓ | 2% per transaction (mobile account, cards, OTC), tax included; no setup or monthly fee. [corporateonboarding.jazzcash.com.pk/online-payment](https://corporateonboarding.jazzcash.com.pk/online-payment) | — | NOW |
| Easypaisa | Mobile-wallet checkout | Easypaisa ✓ | 1% mobile account, 2% OTC/token, tax included; no setup or annual fee. [easypaisa.com.pk/online-payment-gateway](https://easypaisa.com.pk/online-payment-gateway/) | — | NOW |
| Bank payouts / IBFT / Raast | Seller payouts, bank-transfer matching | Safepay payouts ✓, bank APIs (HBL, Meezan) ✓ via agreement | Safepay instant payouts 1.5% (above link); bank APIs negotiated | — | NOW (Safepay) |
| Wise / Payoneer | Export sellers receiving USD/EUR | Payoneer ✓, Wise (receiving only for PK; send to PK ✓) | Payoneer: local-currency receiving free, other currencies 1% (min $1), cards up to 3.99% + $0.49, withdrawal to PK bank up to ~1–4% shown at withdrawal [payoneer.com/pricing](https://www.payoneer.com/pricing/). Wise: USD ACH receive free, USD wire $6.11, USD→PKR ≈ 0.55% + fixed fee [wise.com/pk/pricing/business](https://wise.com/pk/pricing/business) | — | LATER (exports) |
| WhatsApp Cloud API | Ordering, order updates, COD OTP, catalogue | Meta Cloud API ✓ (direct), or BSPs (Twilio, 360dialog) | Pakistan, effective 1 Oct 2026: marketing $0.0473, utility $0.015, authentication $0.015, service $0.015 after 1,000 free per number per month; user-initiated messages free. [developers.facebook.com … whatsapp/pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing) | 1,000 service msgs per month; utility messages free inside the 24 h window | NOW |
| SMS (fallback OTP) | COD OTP when WhatsApp is not available | Twilio ✓ (expensive), local aggregators (e.g. Eocean, Telenor) ✓ | Twilio to Pakistan $0.4734 per segment. [twilio.com/en-us/sms/pricing/pk](https://www.twilio.com/en-us/sms/pricing/pk) | — | LATER (prefer WhatsApp OTP) |
| Transactional email | Receipts, reminders, password reset | **Resend ✓**, Amazon SES ✓ | Resend: Free 3,000/month (100/day); Pro $20 for 50k. [resend.com/pricing](https://resend.com/pricing). SES: $0.10/1k à la carte or $0.16/1k Essentials (new accounts; SES free tier retired). [aws.amazon.com/ses/pricing](https://aws.amazon.com/ses/pricing/) | Resend 3,000 per month | NOW (Resend free) |
| LLM (AI website builder, listings EN/UR/AR, SEO/AEO/GEO, chatbot) | Site generation, copy, translations, FAQ, keywords | **DeepSeek ✓ (default)**, OpenAI-compatible ✓ | **Not free** — pay-as-you-go. `deepseek-flash` (V4.1 Flash): $0.30 per 1M input (cache miss; $0.006 cache hit) / $1.20 per 1M output at peak, half price off-peak. `deepseek-v4-pro`: $1.32 / $3.96. Search/Fetch tools $0.75 per 1,000 calls from 1 Nov 2026. [api-docs.deepseek.com/quick_start/pricing](https://api-docs.deepseek.com/quick_start/pricing). Sellora cost ≈ Rs 0.42 per AI credit, ≈ Rs 7 per full website build (peak). | None (granted promo balance only) | NOW (template fallback built in) |
| STT (voice builder, voice add-product) | Urdu/English voice to text | **Browser Web Speech API (free, default)**; server option: any Whisper-compatible endpoint (`STT_PROVIDER=http`) e.g. OpenAI Whisper / gpt-4o-mini-transcribe | Whisper $0.006/min; mini-transcribe ≈ $0.003/min (same page) | — | LATER |
| SEO: indexing & ranks | Sitemap ping, rank tracking, Core Web Vitals | IndexNow ✓ (Bing, Yandex, Naver), Google Search Console ✓, PageSpeed Insights ✓, rank APIs (DataForSEO, SerpApi) | IndexNow free; Search Console free (OAuth, placeholder); PageSpeed Insights free with key; DataForSEO SERP ≈ $0.0006 per check (standard queue) — verify before enabling | IndexNow / GSC / PSI free | NOW (IndexNow), LATER (rank API) |
| Image AI | Background removal, lifestyle shots | OpenAI image models, Gemini image | gpt-image-1 was retired on 23 Oct 2026; its last listed price was $0.011 / $0.042 / $0.167 per 1024² image (low/medium/high), and successor pricing is similar [developers.openai.com … gpt-image-1](https://developers.openai.com/api/docs/models/gpt-image-1). Re-check the successor model before enabling. | — | LATER |
| Object storage (S3-compatible) | Product images, airway-bill PDFs, export docs | **Cloudflare R2 ✓**, AWS S3 ✓ | R2 $0.015 per GB-month, Class A $4.50 per million, Class B $0.36 per million, egress free. [developers.cloudflare.com/r2/pricing](https://developers.cloudflare.com/r2/pricing/) | 10 GB plus 1M A / 10M B operations per month | NOW (free tier) |
| FX rates | Per-currency fixed pricing suggestions | open.er-api.com ✓ (free), Open Exchange Rates ✓ | Free tiers are enough (daily refresh) | Yes | NOW (free) |
| Google sign-in | Merchant and buyer login | Google Identity ✓ | Free | Yes | NOW |
| Maps / address autocomplete | Checkout address, courier zone | Google Maps Platform ✓ | Essentials SKUs: 10,000 free events per SKU per month, then pay-as-you-go. [developers.google.com/maps/billing-and-pricing/pricing](https://developers.google.com/maps/billing-and-pricing/pricing) | 10k per SKU | LATER |
| Captcha | Signup, checkout, RFQ spam | **Cloudflare Turnstile ✓**, reCAPTCHA ✓ | Turnstile free, unlimited. [developers.cloudflare.com/turnstile/plans](https://developers.cloudflare.com/turnstile/plans/). reCAPTCHA free up to 10k assessments per month. | Yes | NOW (free) |
| Hosting (API + worker) | Node/Express backend | **Render ✓**, Railway, Fly | Render Starter $7/month per service (0.5 CPU, 512 MB, always on). [render.com/pricing](https://render.com/pricing) | Free tier sleeps | NOW |
| Postgres | Main DB (Prisma) | **Neon ✓**, Supabase, Render PG | Neon Free: 0.5–1 GB per project, 100 CU-h. Launch: $0.106 per CU-hour plus $0.35 per GB-month, no minimum. [neon.com/pricing](https://neon.com/pricing) | Yes | NOW |
| Redis | Rate limits, queues, sessions | **Upstash ✓** | Free 256 MB and 500k commands per month; pay-as-you-go $0.20 per 100k commands. [upstash.com/pricing/redis](https://upstash.com/pricing/redis) | Yes | LATER (in-memory now) |

## 2. Couriers (Pakistan and international)

Courier APIs are free to call. You pay per-parcel tariffs and COD fees under your merchant contract, so there is no published flat API price.

| Courier | Code / endpoints | Cost model | When |
|---|---|---|---|
| TCS ✓ | `api.tcscourier.com/production/v1/cod/create-order`, tracking | Contracted per-kg tariff plus COD handling; API free with account | NOW |
| Leopards ✓ | `bookPacket`, `trackBookedPacket`, `getPaymentDetails` | Contracted tariff; API key free | NOW |
| PostEx ✓ | `order/v3/create-order`, tracking; upfront COD payout | Per-parcel plus COD fee (contract) | NOW |
| Trax (Sonic) ✓ | `sonic.pk/api/shipment/book`, tracking | Contracted tariff | NOW |
| DHL Express ✓ | MyDHL API rates and shipments (sandbox when `sandbox=true`) | Account rates; API free | LATER (exports) |
| FedEx ✓ | OAuth token and track | Account rates; API free | LATER |

## 3. App-store integrations (code implemented, mocked when no keys)

| App | Real API used in code | Merchant cost (official) | When |
|---|---|---|---|
| Meta Shop (Facebook & Instagram) | Graph v21 `items_batch`, OAuth, `x-hub-signature-256` webhooks | API free; ads spend separate | NOW |
| Meta Pixel + Conversions API | `/{pixel}/events` | Free | NOW |
| Google Merchant Center | Merchant API `productInputs:insert`, Google OAuth | Free (free listings) | NOW |
| Google Ads conversions | `uploadClickConversions` | API free; developer token approval; ads spend separate | LATER |
| GA4 | Measurement Protocol | Free | NOW |
| Search Console | sitemaps, searchAnalytics | Free | NOW |
| TikTok Shop / Pixel | Events API v1.3, catalog, OAuth | Free | LATER |
| Pinterest | v5 events and catalogs | Free | LATER |
| Snapchat | CAPI v3 | Free | LATER |
| X (Twitter) | Ads conversions | Free (ads spend separate) | LATER |
| WhatsApp Business | Cloud API messages | See WhatsApp row above | NOW |
| Mailchimp | Members PUT (md5), OAuth | Free 250 contacts / 500 sends; Essentials from $13/month. [mailchimp.com/help/about-mailchimp-pricing-plans](https://mailchimp.com/help/about-mailchimp-pricing-plans/) | LATER |
| Klaviyo | Events and profile-import (revision header) | Free 250 profiles / 500 sends; Email from $20/month. [klaviyo.com/pricing](https://www.klaviyo.com/pricing) | LATER |
| Google Reviews | Places API v1 Place Details | 10k free per SKU (Maps pricing above) | LATER |
| On-site reviews, Live chat, GTM | Run in the storefront | Free | NOW |
| Zapier / webhooks | Hook URL POST | Zapier free plan; paid optional | LATER |
| ShipStation, Printful, eBay, Amazon SP-API | Endpoints and OAuth/LWA implemented | Subscription or marketplace fees on the provider side | LATER |
| Xero | Invoices, OAuth | Starter US$29/month (local PK price shown on page). [xero.com/pricing-plans](https://www.xero.com/pricing-plans/) | LATER |
| QuickBooks Online | Sales receipt, OAuth, intuit-signature | Simple Start from US$38/month (US list). [quickbooks.intuit.com/pricing](https://quickbooks.intuit.com/pricing/) | LATER |

## 4. Launch monthly estimate (small store)

Assumptions: 500 orders per month (60% COD), 1,500 WhatsApp utility messages (half inside the free 24 h window), 300 WhatsApp OTPs, 2,000 emails, 100 AI listings, 2 GB images, PKR 1.5M GMV of which 40% is prepaid.

| Item | Monthly |
|---|---|
| Render API service (Starter) | $7.00 |
| Render background worker (Starter) | $7.00 |
| Neon Postgres (Launch, light use ≈ 30 CU-h + 1 GB) | ≈ $3.50 |
| Upstash Redis / Cloudflare R2 / Turnstile / FX / Google sign-in | $0 (free tiers) |
| Resend email (≤ 3,000) | $0 |
| WhatsApp utility, 750 billable × $0.015 | $11.25 |
| WhatsApp OTP, 300 × $0.015 | $4.50 |
| LLM listings and translations (gpt-4o-mini) | ≈ $1 |
| Domain (annual cost / 12) | ≈ $1.50 |
| **Fixed platform total** | **≈ $36 / month (≈ Rs 10,000)** |
| Payment fees (variable): PKR 600k prepaid, mix of Safepay cards 2.9% + Rs 30 and wallets 1–2% | ≈ Rs 12,000–18,000 (≈ $45–65) |
| Courier tariffs | per contract (charged to the buyer or absorbed) |

**Needed now:** Safepay (Sellora Pay escrow), JazzCash, Easypaisa, WhatsApp Cloud API, Resend, R2, Render, Neon, Turnstile, Google sign-in, FX feed, the TCS/Leopards/PostEx/Trax accounts, and the free Meta/Google catalogue and pixel apps.
**Later:** Wise/Payoneer, DHL/FedEx, SMS fallback, STT, image AI, Maps, Upstash, Klaviyo/Mailchimp, Google Ads, TikTok/Pinterest/Snap/X, marketplaces, Xero/QuickBooks.

## AI & SEO environment variables (backend `.env`)

| Variable | Default | Purpose |
|---|---|---|
| `LLM_PROVIDER` | auto (`deepseek` if `DEEPSEEK_API_KEY` set, `openai` if `LLM_API_KEY`, else `mock`) | Which LLM to call |
| `DEEPSEEK_API_KEY` | – | DeepSeek key (platform.deepseek.com, top up balance first) |
| `DEEPSEEK_BASE_URL` | `https://api.deepseek.com` | OpenAI-compatible endpoint |
| `DEEPSEEK_MODEL` | `deepseek-flash` | or `deepseek-v4-pro` |
| `DEEPSEEK_THINKING` | `disabled` | `enabled` turns on reasoning (more output tokens, higher cost) |
| `STT_PROVIDER` / `STT_URL` / `STT_KEY` | `browser` | `http` = Whisper-compatible server transcription |
| `INDEXNOW_KEY` | – | Real IndexNow submissions (otherwise simulated) |
| `RANK_API_URL` / `RANK_API_KEY` | – | Real rank checks (otherwise simulated positions) |
| `COMPETITOR_FETCH` | `0` | `1` lets the competitor tool fetch public pages |
| `PAGESPEED_API_KEY` | – | Real Core Web Vitals field data |

Without any key, every AI and SEO feature still works using built-in templates, so stores can be demoed offline.
