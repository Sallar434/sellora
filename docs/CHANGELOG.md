# VendOm v36 changelog

## v49: 348 more themes in the Theme Store (25 Nov 2026)
- **Theme Store:** 468 free themes (was 120), 20 pages of 24. The 348 new themes come from a study of Shopify Theme Store pages 13–59 (348 themes, 1,107 styles, see `docs/Shopify-theme-store-research.md`). Each new theme has an original VendOm name, its own industries, one or more catalog sizes and up to 6 ready-made styles. Names, photos, copy and code are VendOm's own.
- **Filters:** Industry now covers all 20 industries (adds Entertainment, Services, Toys, Hardware, Office, Shoes, Wellness). A theme can be in more than one catalog size.
- **Theme page:** shows all of the theme's styles with a count; the description lists up to three industries.
- Tests: new t29 (25 checks); t15 and t25 updated for 468 themes.

## v48: Growth, Discounts and Content from the owner's second document (24 Nov 2026)
- **Growth:** overview (Run your marketing on autopilot, marketing performance chart, sessions by traffic type, recent campaigns). **Get started** asks for a plan, or you can skip and set things up. **Autopilot:** a setup warning until the store has a product, a plan and no password, and pending actions to connect channels. The configuration is editable: regions (every country, search), languages (English and Urdu by default, 20 available), target ROAS, customer acquisition cost, permissions (Always ask / Manage approved campaigns / Full autonomy) and Connect to a channel (Meta Ads, Google Ads, TikTok, Microsoft Advertising, Snapchat, Pinterest, X, LinkedIn, YouTube, Messaging). There is an activity log. **Attribution** is locked until a plan is bought; then it shows sales, orders, AOV, sessions and top channels/campaigns from real store visits.
- **Campaigns:** empty state, an "N unassigned activities" button, and Assign campaign activities (search, type filter, table) built from real visits (utm_source / referrer). The campaign page has stats, breakdowns, a name, **shareable links** (destination, short handle, UTM parameters, QR code download, copy short link / full URL / delete), **auto-match rules** (UTM fields, channel list, type) and activities. The QR code library is bundled (MIT, qrcode-generator 1.4.4).
- **Discounts:** empty state; Select discount type (Amount off products, Buy X get Y, Amount off order, Free shipping). The editor has Discount code / Automatic discount (random code, title), value (percentage / fixed), applies to collections or products with browse, once per order, BXGY buys/gets/discounted value/max uses, free-shipping countries and rate limit, eligibility (all / markets / segments / specific customers, POS for automatic), minimum requirements, maximum uses, combinations, schedule with end date, summary, sales channel access, tags and the unsaved bar. The list has title + summary, status (Active / Scheduled / Expired), method, eligibility, channels, type, combinations and used, with a filter and export. **The checkout engine** really applies all of it (best discount when they don't combine, minimums, eligibility, schedule, limits, free shipping, BXGY), with tax and totals recalculated.
- **Content:** Content opens Metaobjects (storefront / web pages / active / draft tiles, recent entries, definition filter). Two default active entries (Delivery countries, Privacy policy) that can be switched off; an entries list with status. **Add metaobject definition** has fields with a required (*) toggle, One value / List of values, field types, metaobject options (web pages with page title / meta / handle), field options and a **Manage** page (metafield definitions per resource and metaobject definitions). **Files:** empty state, upload or drag-and-drop, folders, alt text, size, references, copy and delete. **Menus:** three default menus, a menu editor with nested items, a link picker (online store, collections, products, pages, blogs, blog posts, policies, customer accounts, pasted URLs), create, duplicate and delete. **URL redirects:** empty state, create, import CSV with a template. **Blog posts:** empty state, Add blog post with a rich text editor, excerpt and search engine listing (pencil to edit), visibility with date, image, author, blog, tags and theme template; posts show on the store blog.
- Fixed: dropdowns close when another opens or on Escape.
- Tests: new t28 (89 checks); all suites pass. Secrets scan of the code and history: clean.

## v47: Fixes from the owner's document (24 Nov 2026)
- **Home:** the store card no longer says "Public" or "open for business" during the trial. It shows the domain, theme and Edit theme, with a frosted-glass "Select a plan to launch store" button (or "Private" / "Live" after paying).
- **No fake data:** sample drafts, abandoned checkouts, checkouts, purchase orders, transfers, gift cards, companies, discounts, files, blog posts and segments are no longer created for any store, and are removed from older stores.
- **Draft orders:** empty state; Create order with products, custom items, discount, shipping, estimated tax and total; customer search or create; markets, currency, tags, notes; timeline comments; Duplicate, Share, Print, Delete. **Send invoice** (To, From, Cc/Bcc, subject `Invoice {{name}}`, message, lock prices, allow discount codes, review, then send). **Collect payment:** Credit card (card + billing address form, declined cards refused) or Mark as paid, which creates a real order; "Payment due later" creates a pending order.
- **Abandoned checkouts:** only real shoppers who entered their email at checkout and did not pay (left, card declined, payment system error). The reason is saved and the shopper becomes a customer. List with Incomplete / Recovered / All, search, export; each name shows a dropdown arrow on hover, with a pop-up of the name and email plus View customer. A checkout becomes "Recovered" when that shopper later orders.
- **Customers:** list with "Describe your segment", email subscription, location, orders and amount spent; Export / Import / Add customer. The customer page has amount spent, orders, customer since, RFM group, last order, timeline comments, contact, address, marketing subscription, tax, store credit, tags and notes.
- **Segments:** five default segments; create a segment by describing it (an arrow appears while typing). The description becomes a query (orders, amount spent, subscription, country/city, tags, abandoned checkouts, new customers) with customer count, % of base, an editable WHERE line, Run, Refine and an Unsaved changes bar (Discard / Save).
- **Companies (B2B):** Advanced and Enterprise plans (locked with Upgrade on lower plans). Empty state, and the Add company form: name, company ID, main contact, location (shipping address, billing same, location ID), markets, catalogs, payment terms (No terms, Due on fulfillment, Net 7–90), checkout options, tax ID and tax settings.
- Tests: new t27 (65 checks); t17 updated; all suites pass.

## v46: Online Store › Preferences, private until paid, SEO in the store head (23 Nov 2026)
- **Private mode:** every store starts private with its own password (editable) and a message for visitors. The password can only be removed on a paid plan ("To let anyone access your online store, select a plan and then remove your password"). If the plan stops being active, the store goes private again automatically (browser and server).
- **Password page** in the theme's colours and fonts: wrong passwords are refused; the owner preview shows a "Your store is private" notice with a link to it. Server: `GET /s/:shop/access`, `POST /s/:shop/unlock`; private stores send `Disallow: /` in robots.txt and `noindex` in the page head.
- **Social sharing image and SEO:** home page title (70), meta description (320), sharing image (upload), live share card and Google preview. These go into the store's `<title>`, meta description, Open Graph tags and the server's `/seo/head`; **automatic hreflang tags** can be turned off.
- **Automatic redirection** by country (currency from Markets) and language (Urdu/Arabic). **Spam protection** on contact and login/sign-up forms ("I'm not a robot" check + hidden bot trap). **Trusted domains:** links to other sites show a confirmation page unless trusted.
- **Crawler access:** create Ed25519 "web-bot-auth" signatures (Signature, Signature-Input, Signature-Agent) with an expiry; All / Active / Expired tabs, copy and delete. The server lets signed crawlers into private stores and rejects forged or deleted ones.
- **B2B only:** visitors must log in before seeing products.
- Server: `GET/PUT /api/stores/:id/online-store/preferences`, `POST/DELETE /api/stores/:id/crawler-signatures`.
- Tests: backend 113/113 (11 new), new frontend t26 (34 checks); all suites pass.

## v45: VendOm Theme Store with 120 new free themes (23 Nov 2026)
- **All old themes removed.** Stores using an old theme move to the new default theme (Kestrel); seller-made copies are kept.
- **120 original free themes**, each with its own name, colours and design: no two share the same hero layout + header + product card + font combination. Built for clothing, menswear, beauty, jewellery, bags, home, food, drinks, electronics, sports, pets, kids, garden, auto and books, plus single-product and large-catalogue stores and six Pakistan-inspired themes (Indus, Hunza, Monsoon, Shalimar, Ajrak, Chenab).
- **Theme Store** (Online Store › Theme store): "Browse all themes" with filters (price, industry, catalogue size, style, features), counts, sort (relevance, newest, A–Z), 24 per page, and real scaled previews with demo photos.
- **Theme page:** desktop and phone preview, three colour styles, details and features, **Try theme** (adds it to the library) and **Publish**.
- **Themes page** redesigned: current theme with a live preview, Customize / Preview / Duplicate, theme library (up to 20) and popular themes.
- **New sections** that also work in the theme editor: Header, Hero banner (Full image, Centred, Split, Big type, Mosaic, Card, Colour block), Collection tiles, Product grid (with collection filter and carousel), Image with text, Scrolling text, Trust badges, Lookbook, Brand story, Newsletter, Footer. Theme settings now include heading/body font, button style, card style and uppercase headings.
- **The customer store uses the theme**: header, search, currency, account, cart, announcement and footer; it fits phones.
- Demo photos come from Unsplash (see `frontend/demo/CREDITS.md`); demo products only appear in previews, never in a real store.
- Fixed: an old migration forced a green palette onto the live theme.
- Tests: new t25 (30 checks), t15 rewritten for the new library (132 checks), t3 and t9 updated; all suites pass.

## v44: Finance like Shopify, VendOm Payments account (23 Nov 2026)
- **Finance** page redesigned like Shopify's: payout balance with currency cards, View payouts, Documents menu (payout statements, sales CSV, bills), Taxes on the right, and a "Manage your business finances in VendOm / Switch to VendOm Payments" card that opens Settings › Payments.
- **Billing** removed from the Finance menu (still in Settings › Billing).
- **VendOm Payments account** in Settings › Payments: create it (business name, owner, type, country, mobile/WhatsApp, email, terms). It unlocks the 15 VendOm Payments tools (WhatsApp ordering, COD verification, couriers, wholesale, …) shown as cards; before that they show locked. Sends a welcome email and asks the seller to verify the business for payouts.
- **VendOm+ menu group removed**; its tools are opened from Settings › Payments and link back there. "VendOm Pay" is in the menu for the platform admin only.
- Menu hover and selected items are light grey (no more black).
- Tests: new t24 (20 checks); t9, t17, t18 updated; all suites pass.

## v43: Move your store from another platform (23 Nov 2026)
- **Products › Move your store** (also the "Move an existing store" setup card): paste the link of the old store, confirm you own it, see a preview (products, collections, photos, sample cards), then **Copy to VendOm**.
- Reads **Shopify** (public products and collections), **WooCommerce** (public Store API) and, from the server, **any other site** (Wix, Squarespace, BigCommerce, custom) through its sitemap and schema.org product data.
- Copies titles, descriptions (scripts removed), prices and sale prices, options, variants, SKUs, photos, tags, vendor, type, collections and which products are in them. On the server, photos are copied into VendOm storage, and products can come in as drafts.
- Running it again skips products already there unless "Replace" is ticked. Private and local addresses are refused. Up to 2,000 products per run (CSV for the rest).
- Not copied: the theme design itself (pick a VendOm theme and add your logo and colours), customers and orders (CSV import), and the domain (Settings › Domains).
- API: `POST /api/stores/:id/migrate/scan {url, owner:true}` and `POST /api/stores/:id/migrate/import {overwrite, copyImages, status}`.
- Tests: backend 102/102 (7 new), new frontend t23 (22 checks); all earlier suites pass.

## v42: Approved admin design and VendOm logo (23 Nov 2026)
- **Logo (K1):** a shopping bag with a V, its handle is the O. Deep forest green #0E3B2E, leaf green #5DB346, mint #A6E37A on dark. Files in `frontend/brand/`: SVG logo (light/dark), mark, app icon (512/192/180 PNG), favicon (SVG + 32 PNG).
- **New admin look** (approved design): dark top bar with the logo, central search (Ctrl K), alerts and a store menu (view store, settings, plan, sign out); light grey side menu; white cards with thin borders; Inter at 13px; dark primary buttons; blue links; phone layout with a menu button in the top bar.
- Landing and sign-up use the new logo, flat colours and line icons (no emoji or gradients).
- Fixed: full-screen editors and pop-ups now sit above the top bar; pages scroll items clear of the fixed bar.

## v41: New stores start empty, all countries, VendOm AI model names (23 Nov 2026)
- **No more sample data in real stores:** new stores start with no products, orders, draft orders, checkouts, abandoned carts, customers, collections, discounts, gift cards, purchase orders, transfers, companies, blog posts, files, payouts, installed apps or alerts. Meta, Google and WhatsApp start disconnected. Invented numbers are gone (checkout funnel, ROAS/CAC trends, market sales share, "card ending 4242", autopilot counts).
- Checkouts page shows real counts; "Simulate checkout" is platform-admin only.
- Sign-up country list now has every country (Pakistan first, then A–Z).
- **VendOm AI Lite / Plus / Pro:** sellers see only VendOm's model names; the server no longer returns the AI company or model id to sellers (still logged for the platform).
- Product and other lists show search, sort and selection even with one row.
- Tests: new t22 (27 checks), backend 95/95; t14, t17, t19, t20 create their own data.

## v40: Landing page and new sign-up flow (21 Nov 2026)
- **Landing page** for visitors: hero with "Start for free" email box, four feature cards, a pricing band and FAQ. Works on phones.
- **Sign-up in steps:** email + password (8+ characters, strength meter, show/hide, country) → **verify email** (6-digit code, resend, expiry, 5 tries) → plan → payment (card, PayPal/JazzCash/Easypaisa buttons, **Skip** during the 4-day trial) → "What can we help you do?" (11 choices) → admin.
- **Welcome home:** "Welcome to VendOm / Let's set up **My Store**": click the name to rename the store (Enter saves, Esc cancels); setup cards follow the chosen goals; the guide can be hidden.
- **Emails:** welcome email and verification code at sign-up (server: `welcome_seller`, `welcome_buyer`, `otp`). In the browser-only version they are kept in this browser and the code is shown on screen until the server sends real email.
- Tests: new t21 (38 checks), backend onboarding tests (95/95 total); tauth, t3, t14, t16 updated for the new steps.

## v39: Direct or protected payments, "not received" settlement, international methods, phone layout (20 Nov 2026)
- **Payments:** each store chooses Buyer chooses (default), Always protected, or Direct only. Direct payments go straight to the seller. Protected payments need a free buyer account (created at checkout).
- **VendOm Pay Protection fixes:** money is never auto-released before the seller ships (it used to release 7 days after payment); the seller is told "payment secured, ship now" with a 5-day ship-by date; the 7-day confirm window starts at shipping; unshipped orders past the date are refunded in full.
- **Parcel not received:** before shipping → full refund; after shipping → seller has 3 days to prove delivery or mark "parcel returned", otherwise the buyer is refunded minus the seller's shipping cost (seller keeps it, no fee). Refunds go back to the buyer's card. Platform admin gets a "not received: refund minus shipping" decision.
- **International:** cards, Apple Pay, Google Pay (and PayPal when configured) for every country, plus local methods by country (JazzCash, Easypaisa, UPI, iDEAL, Klarna, Alipay, Pix, …). See `docs/Payments.md`.
- **App fixes:** the admin now works on phones (top bar, ☰ menu, pages fit the screen); the trial banner no longer overflows; sellers no longer see the fake "Create test order" button.
- Tests: backend 93/93 (10 new protection tests), new frontend t20 (28 checks); all earlier suites pass.

## v38: VendOm AI assistant, three AI models by plan, Connect any app (20 Nov 2026)
- **VendOm AI** chat replaces the AI builder, SEO / AEO / GEO, Off-page SEO, AI tools and Sitemap menu items. It reads and changes real store data through the seller's own API access: sales, orders (find, fulfil), stock, products, SEO audit and fixes, AEO/GEO, keywords, content calendar, social posts, discounts, website build and edits. Voice input; asks before big changes.
- **Models by plan:** Basic → DeepSeek, Grow → Kimi, Advanced/Enterprise → Claude (official Anthropic SDK, automatic fallback on a declined request). Falls back to cheaper models, never up; built-in answers without keys. Credits per reply 1 / 2 / 5, all configurable. Token use and cost logged per reply. See `docs/AI-models.md`.
- **Connect any app:** paste a link (Zapier, Make, n8n, Slack, Discord, Teams, Google Sheets, any webhook, MCP servers, OpenAPI/REST APIs, or Meta/Google/TikTok/courier links that open the built-in app). Webhooks get order and product events; MCP tools are given to Claude. Private addresses are refused, keys encrypted.
- Backend: `/assistant`, `/assistant/chat`, `/connectors` routes; `Connector` model; `orders/cancelled` and `products/create` events. Older Claude store-copy calls moved to the official SDK.
- Tests: backend 83/83 (12 new), frontend t19 (32 checks) plus all earlier suites.

## v37: VendOm rename, Shopify parity suite (20 Nov 2026)
- Renamed Sellora to **VendOm** and Sellora Pay to **VendOm Pay** everywhere (UI, backend, emails, domains, webhook header `VendOm-Signature`, files). Stores saved under the old browser key move over automatically; old `/sellora.html` links redirect.
- New `frontend/tests/t17.py` Shopify parity suite (118 checks) and `frontend/tests/run_all.sh`. Older suites now sign in through the door and no longer use hard-coded paths.
- Fixed: a new store's first real order reused #1001 (a sample order's number). New stores start with no orders.
- Added testing and engineering agents from agency-agents in `.claude/agents/`.

## v36: plan picker, 4-day trial, closed store on expiry, product CSV, theme library
- **Signup:** the seller picks a plan first (Basic Rs 300, Grow Rs 600, Advanced Rs 1,000 a month, prices in Pakistani Rupee (PKR), monthly or annual with 20% off; Enterprise is contact sales). Free is hidden for new stores.
- **4-day trial** (replaces the 14-day trial): build everything, but the store stays behind the password page. Publish theme, remove password and go live open a "Buy a plan to publish" box. A banner shows the days left with a Buy plan button. Buying is done through VendOm Pay.
- **Trial ended:** the store is closed. Storefront shows "Store unavailable" (backend 503). Admin shows only the choose-a-plan page; every store API except billing and sign-in returns 402. Buying any plan reopens the store with all data.
- **Product CSV:** import with file picker or drag and drop, preview with row errors, overwrite-by-handle option and a sample template; export the current page, all, selected or search results, as Excel CSV or plain CSV. Columns follow the common Shopify-style product CSV. Backend: `GET /products/export.csv`, `POST /products/import` (with `dryRun` and `overwrite`), `GET /products/import/template.csv`.
- **Themes:** the old VendOm themes (Dawn, Ember, Tide, Orchard, Noir, Bloom, Slate, Sunset, Mint, Ink, Aurora, Sand) are removed. The library now holds only VendOm free themes with original names, each with its own homepage sections, header, footer, product page, typography, colours, card style, a "Best for" line and a tag. Stores on a removed theme move to Daybreak. Backend: new stores get Daybreak; `GET /themes/library` lists the library and migrates old themes. See `Themes.md`.

## Earlier versions
Built from the original attachment, which was not changed. Output: `vendom.html`, one self-contained file that saves to localStorage under the key `vendom`. Source is in `src/m1–m6*.js`, `patch.py` turns the original into `base.html`, and `build.py` produces `vendom.html`.

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

## Phase 2: VendOm Pay escrow
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
- VendOm Pay wallets (admin/seller/buyer balances, held/available, ledger, escrow), payouts (incl. FX cell), and FX rate list now show full names.
- Embed checkout: new buyer-currency selector; button, data-currency and the payment link follow it.
- Order detail total uses the full form. Order lists and customer history use the compact form. Checkout total, "Charged in…" and the cart subtotal show Name (CODE). The pay button names the code and VendOm Pay escrow.

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
- Monthly limits, 80/100% alerts, auto-pay overage or stop-at-limit, spending cap, prorated upgrades, end-of-period downgrades, monthly billing job paid via VendOm Pay wallet/card.
- Settings › Plan, Finance › Billing (overage lines), Platform admin › Plans. Backend: Plan/PlanQuota/Subscription/UsageCounter/UsageRecord/OverageCharge/Invoice models, /billing/* and /api/admin/plans endpoints.
- Docs: Pricing-plans.md/.pdf, VendOm-plans.pdf.

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
