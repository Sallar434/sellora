# VendOm vs Shopify: feature parity (20 Nov 2026)

How this was checked: `frontend/tests/t17.py` creates a new store through the sign-up screen, checks the admin against Shopify's navigation and Settings list, and runs a real order through the storefront. Result: **118/118 checks pass**. The other frontend suites (t2–t16, tauth) and the backend suite (71 tests) also pass.

## Same as Shopify (tested)

| Area | What the test does |
|---|---|
| Admin navigation | Home, Orders, Products, Customers, Marketing, Discounts, Content, Markets, Finance, Analytics, Apps, Online Store, Settings, in Shopify's order. 23 sub-pages render with no errors |
| Settings | General, Plan, Billing, Users and roles, Payments, Checkout, Customer accounts, Shipping, Taxes, Locations, Markets, Apps, Domains, Customer events, Brand, Notifications, Custom data, Languages, Privacy, Policies, Gift cards, Packing slip, Activity log |
| Products | Product with options and variants, per-variant price, SKU and stock; editor with SEO and inventory; CSV import and export; inventory page; purchase orders (receive) |
| Storefront | Home, catalog, search, product page with a variant picker (price changes with the variant), cart |
| Checkout | Discount code, gift card (balance goes down), tax line, error and remove for a bad code, card payment, thank-you page |
| Orders | Order keeps the variant and price at the time of sale; detail page with timeline; fulfil with carrier and tracking; partial refund with restock; cancel |
| Draft orders | Complete a draft into a real order |
| Customers | Customer created from checkout; detail page with order history; add customer |
| Analytics | Figures computed from real orders; top products; reports |
| Admin | Global search (Ctrl/Cmd+K), staff and roles, themes with Customize, navigation menus |

## Different on purpose

| Shopify | VendOm |
|---|---|
| Shopify Payments | **VendOm Pay**: escrow wallets. The buyer's money is held until delivery is confirmed, then released to the seller. Disputes, KYC and payouts are built in |
| Plans in USD | Basic, Grow and Advanced in Pakistani Rupee (PKR), 4-day trial, store locked until a plan is bought |
| Apps from the Shopify App Store | Built-in apps for Pakistani couriers (TCS, Leopards, PostEx, Trax), WhatsApp ordering and COD confirmation, Meta, Google, TikTok, Xero, QuickBooks |
| Shopify Magic | AI store builder (typed or spoken, Urdu/Arabic/English) and an SEO/AEO/GEO suite |
| Admin languages | Also Urdu and Arabic with right-to-left layout |

## Not real yet (works in demo mode only)

- Money: VendOm Pay, cards, JazzCash and Easypaisa are simulated until a payment partner and keys are connected.
- Email, SMS and WhatsApp messages go to the in-app outbox, not to real people.
- Integrations call the real APIs only once merchant keys are saved; until then they use mock replies.
- The live site (`vendom.html`) stores everything in the browser. A shared database needs the backend deployed and `vendom-connected.html` served.

## Fixed while testing
- A new store got three sample orders numbered #1001–#1003 but kept its next order number at #1001, so the first real order duplicated #1001 and the admin opened the sample instead. New stores now start with no orders, and the next order number is always above the highest existing one.
