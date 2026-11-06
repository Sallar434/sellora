# Sellora v36 changelog

## v36: plan picker, 4-day trial, closed store on expiry, product CSV, theme library
- **Signup:** the seller picks a plan first (Basic Rs 300, Grow Rs 600, Advanced Rs 1,000 a month, prices in Pakistani Rupee (PKR), monthly or annual with 20% off; Enterprise is contact sales). Free is hidden for new stores.
- **4-day trial** (replaces the 14-day trial): build everything, but the store stays behind the password page. Publish theme, remove password and go live open a "Buy a plan to publish" box. A banner shows the days left with a Buy plan button. Buying is done through Sellora Pay.
- **Trial ended:** the store is closed. Storefront shows "Store unavailable" (backend 503). Admin shows only the choose-a-plan page; every store API except billing and sign-in returns 402. Buying any plan reopens the store with all data.
- **Product CSV:** import with file picker or drag and drop, preview with row errors, overwrite-by-handle option and a sample template; export the current page, all, selected or search results, as Excel CSV or plain CSV. Columns follow the common Shopify-style product CSV. Backend: `GET /products/export.csv`, `POST /products/import` (with `dryRun` and `overwrite`), `GET /products/import/template.csv`.
- **Themes:** the old Sellora themes (Dawn, Ember, Tide, Orchard, Noir, Bloom, Slate, Sunset, Mint, Ink, Aurora, Sand) are removed. The library now holds only Sellora free themes with original names, each with its own homepage sections, header, footer, product page, typography, colours, card style, a "Best for" line and a tag. Stores on a removed theme move to Daybreak. Backend: new stores get Daybreak; `GET /themes/library` lists the library and migrates old themes. See `Themes.md`.

## Earlier versions
Built from the original attachment, which was not changed. Output: `sellora.html`, one self-contained file that saves to localStorage under the key `sellora`. Source is in `src/m1–m6*.js`, `patch.py` turns the original into `base.html`, and `build.py` produces `sellora.html`.

## Phase 1: fixes and core commerce
- Fixed the actPO and pickM crashes, merged the duplicate functions, fixed the mojibake, and hooked up the dead buttons. Also fixed the clipboard fallback and added a 404 page. The country list is now complete. The hero marquee text repeats 4 times instead of 8.
- Orders: a detail page with line items that keep the price and variant at order time. You can fulfil with tracking, refund part or all of an order with restocking, cancel, edit, print, and add comments, notes and tags. There is a timeline, a list with tabs and search, and CSV export.
- Discounts: minimum spend, BOGO, automatic discounts, usage limits, expiry dates and market rules. Gift cards and regional tax.
- Storefront (`#xsf` overlay): home, catalog, collections, product pages with variants and a gallery, search, menus, pages, blog, contact, shopper accounts, cart, checkout and a thank-you page. Prices show in several currencies.
- Customers: a detail page, add and edit, addresses, order history and tags.
- Products: CSV import and export, bulk edit, and stock and SKU for each variant.
- Analytics are calculated from real orders. There are 8 reports you can open, each with CSV export.
- Shipping zones and rates, local pickup, and taxes. Confirmation, shipping and abandoned-cart emails go to the outbox through the API stub.
- Staff roles really restrict access. Use the "Viewing as" switch to test them.

## Phase 2: Sellora Pay escrow
- A double-entry ledger with Admin, Escrow, Seller and Buyer wallets. Each wallet shows pending, held and available amounts, plus history.
- Buyer onboarding with email and phone codes (OTP).
- Seller KYC: business details, ID and proof-of-address uploads, a liveness check and a tax ID. Payout options are IBAN/SWIFT, local bank, PayPal, Payoneer and Wise, with micro-deposit checks. Status goes Pending → Under review → Approved or Rejected, and admins work from a queue.
- Escrow holds funds until the buyer confirms or the auto-release period (N days) ends. Buyers can open disputes and an admin decides: buyer, seller or a split. The platform fee goes to the Admin wallet. Payouts need admin approval.
- Embeddable checkout: a JS snippet, payment links and a buy button. Currency conversion runs through the stub.

## Phase 3: AI builder and voice
- AI generates the theme, sections and copy, store setup by niche, and product descriptions and tags.
- SEO: meta tags, an SEO score, and one-click fixes.
- AEO: an FAQ and JSON-LD structured data, added to the storefront head.
- GEO: llms.txt and an entity description.
- Also generates sitemap.xml and robots.txt, plus an off-page SEO checklist.
- Uses an LLM through the API when one is set up, and falls back to templates offline.
- Voice uses the browser's Web Speech API with a global mic button, and falls back to a typed prompt. Commands include "add product…", "change theme color to…", "write SEO for all products", "go to …" and "generate store for a … shop".

## Phase 4: App Store and sales channels
- 23 apps in 10 categories, with search, detail pages, install and uninstall, per-app settings, connection status, an activity log and "Sync now".
- Apps include Meta Shop, Meta Pixel + CAPI, Google/YouTube with a Merchant feed, GA4, Search Console, GTM, TikTok, Pinterest, Snapchat, X, WhatsApp, Amazon, eBay, Klaviyo, Mailchimp, Reviews, Google Reviews, Live Chat, Zapier/webhooks, ShipStation, DHL, FedEx and Printful-style print on demand.
- What the apps change in the store:
  - Pixel and tag snippets are added to the storefront `<head>`.
  - A product feed XML is generated and can be downloaded.
  - Reviews appear on product pages, with stars on product cards.
  - Chat and WhatsApp widgets appear on the storefront.
  - Webhooks fire on order events.
  - You can create a shipping label and fulfil the order from the app.
  - Print-on-demand product templates, with orders forwarded automatically.
- The old "app-store" and "apps" routes now open the new App Store.

## Tests (`t1.py`, `t2.py`)
- `t1.py click` visits every admin route (106) and clicks up to 30 action buttons on each. Result: 0 page errors. The only console message is a blocked external image in the sandbox.
- `t2.py` runs end to end with 21 checks, all passing:
  - Apps: install, OAuth, feed and search.
  - Storefront app effects.
  - Checkout through the storefront UI: a declined card, then success.
  - Escrow held, webhook and pixel events, a label-based fulfilment, buyer confirms and funds are released, and the admin fee.
  - Dispute resolved in the buyer's favour.
  - KYC → micro-deposits → approval → payout paid.
  - Voice commands.

## Currency display: full names (follow-up)
- New helpers in m1.js: curName/curL (Intl.DisplayNames + fallback map of ~36 currencies), mF (amount — Name (CODE)), mC (compact amount + code, full name in tooltip).
- A MutationObserver relabels every currency <option> as "Name (CODE)" and keeps the code as its value. This covers markets, store defaults, checkout/storefront, embed and FX selectors.
- Sellora Pay wallets (admin/seller/buyer balances, held/available, ledger, escrow), payouts (incl. FX cell), and FX rate list now show full names.
- Embed checkout: new buyer-currency selector; button, data-currency and the payment link follow it.
- Order detail total uses the full form. Order lists and customer history use the compact form. Checkout total, "Charged in…" and the cart subtotal show Name (CODE). The pay button names the code and Sellora Pay escrow.

## Visual QA pass
- Home preview hero: marquee replaced in thumbnails/mobile with a wrapped, balanced headline (no clipping).
- No first-load flash: sidebar store name/domain set inline from saved data (default Vellacorsa); main shows "Loading your store…" instead of blank.
- "Viewing as" pill moved to sidebar bottom-left (no longer covers buttons/mic); main gets bottom padding.
- Storefront header: nav links inline (were stacked by admin nav CSS), compact currency select, mobile wrapping; checkout stacks to one column under 700px; checkbox alignment fixed.
- Wallet cards: amount + "Name (CODE)" on its own line (no awkward wrap).
- Removed third-party processor names from the Integrations label; staff text updated.

## Phase 5 — fixes (2026-10-28)
- Migration `S._m7` (no wipe): pickup follows store address, collections typed Manual with live counts, Green & Gold palette applied to the live theme, About/Contact pages seeded, market countries inferred, extra rates.
- Address saves on input; sign out works (`DB.out`), login lists stores on this device + create a new store.
- Products: base price flows to variants, "Save and add another", per-variant image switches the storefront image.
- Collections: real counts, Manual/Automated rules respected, product picker, synced to product form, storefront featured/collection filtering, mojibake icons fixed.
- Theme editor: debounced typing (no scramble), hero image + all home sections render on storefront, editable marquee, new sections (Image with text, Promo, Slideshow, Image banner, Testimonials, FAQ, Newsletter), color swatches + hex, full palette with 5 presets.
- Pages manager (rich text, SEO, handle, visibility, menu link); storefront renders pages.
- Markets: full currency names, all currencies incl. PKR, duplicate-currency merge; shipping rates shown in the zone market currency; table rate editor.
- Tests: new `t3.py` (35 checks); `t1.py click`, `t2.py` still pass. Screenshots in `shots2/`.

## v33 — Seller plans & usage billing (2026-10-29)
- Plans: Free (after 14-day trial), Basic Rs 300, Grow Rs 600, Advanced Rs 1,000, Enterprise custom; USD equivalents; 20% annual discount.
- Monthly limits, 80/100% alerts, auto-pay overage or stop-at-limit, spending cap, prorated upgrades, end-of-period downgrades, monthly billing job paid via Sellora Pay wallet/card.
- Settings › Plan, Finance › Billing (overage lines), Platform admin › Plans. Backend: Plan/PlanQuota/Subscription/UsageCounter/UsageRecord/OverageCharge/Invoice models, /billing/* and /api/admin/plans endpoints.
- Docs: Pricing-plans.md/.pdf, Sellora-plans.pdf.

## v34: DeepSeek AI, AI website builder (text + voice), SEO / AEO / GEO suite (29 Oct 2026, Asia/Karachi UTC+5)
- **DeepSeek is the default LLM** (`deepseek-flash`, OpenAI-compatible API, JSON mode, thinking off). Falls back to built-in templates with no key. Token usage and estimated USD cost are logged per call (`AiLog`). DeepSeek is paid (no free tier) but cheap: ≈ Rs 0.42 per AI credit worst case.
- **AI website builder**: describe the store by typing or speaking (browser Web Speech API; Urdu/Arabic/English). Generates theme palette, home sections, menus, 4+ products with variants and SEO, collections, About/Contact/FAQ pages, refund/shipping/privacy/terms policies, blog posts and FAQ, applied as drafts. Spoken replies via speechSynthesis. **Edit by command** (“make header black”, “add FAQ section”, “change headline to …”, “dark mode”).
- **SEO suite**: audit score with one-click fixes (meta titles/descriptions, thin copy, alt text, duplicate titles, broken links → 301, FAQ, lazy-loading, WebP), Core Web Vitals hints, JSON-LD (Product/Offer/AggregateRating/FAQPage/Organization/WebSite/BreadcrumbList/LocalBusiness), canonical/hreflang/Open Graph/Twitter tags, sitemap with hreflang, robots.txt allowing AI crawlers, llms.txt.
- **AEO / GEO**: answer-first FAQ blocks, entity summaries and quotable lines for AI assistants.
- **Keywords**: research and clustering, content gaps, 8-week blog calendar, internal-link suggestions, rank tracker (simulated unless a rank API is set), IndexNow submission (real with `INDEXNOW_KEY`), Google Search Console placeholder, 301 redirect manager with loop guard and storefront lookup.
- **Off-page**: Pakistan + international citation checklist, backlink outreach ideas and email, Google Business Profile writer, social posts for Facebook/Instagram/X/TikTok.
- **More AI tools**: EN/UR/AR descriptions, image alt text and captions, email/WhatsApp campaign writer, review replies, competitor check, storefront chatbot.
- Every AI action uses plan AI credits. New quotas: Free 30, Basic 100, Grow 200, Advanced 400; AI overage Rs 80 / $0.29 per 100.
- Tests: backend 63/63 (15 new), frontend t12 53/53.
