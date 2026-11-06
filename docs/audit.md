# Sellora audit (headless Chromium test, 2026-10-28)
Method: loaded file in Playwright, visited 60 routes, clicked up to 25 buttons per screen, ran a full storefront to cart to checkout to order flow (8 countries), and read the code for duplicate or dead handlers.

## A) Broken
1. HIGH - Purchase orders > "Mark received": JS crash "Cannot read properties of undefined (reading 'split')". Cause: line ~3146 uses `actPO.dataset.actPO`, but `data-act-po` maps to `dataset.actPo`. It also adds +25 stock to products[0] instead of the PO's items.
2. HIGH - Settings > Shipping > "Pickup in store": crash "reading 'map'". Cause: `function pickM` is defined twice (line 645 for shipping pickup, line 834 for the region picker). The second one overrides the first, so the shipping call goes to the wrong function.
3. HIGH - Duplicate function definitions (the later one silently wins): route x3, prodForm x3, sf x3, nav, persist, addSec, shop, cartAdd, maxQ, acts, clean, rz, getStoreItems, pickM. #2 is one confirmed bug from this. The others are risky patch layers and need consolidating.
4. HIGH - Orders: clicking a row only cycles the status Paid > Fulfilled > Refunded > Paid. There is no order detail page, no real fulfill/refund flow, and you can "un-refund" an order. Orders store only {id,q}, with no line price, tax or discount snapshot.
5. MED - Storefront "Catalog" nav link does nothing (stays on home). The links are `<a data-pg>` with href=null. Contact and Account links probably behave the same way.
6. MED - Storefront hero text repeats "Explore our latest products." 8 times (a default/heading text concatenation bug).
7. MED - Mojibake: "â–¾" (the ▾ arrow) on every sidebar group, plus "â†‘" and "â€”" (20 places). The text was saved as double-encoded UTF-8; replace these with the real characters.
8. MED - Customers: rows are not clickable, and there is no add customer, detail or edit.
9. MED - Buttons with no effect: Analytics > Reports "View report" (x5); Content > Menus "Edit items"; Content > Files "Copy CDN link"; Apps > Installed "Settings" (x3); Abandoned checkouts "Send email"; Settings > Checkout "Address collection"; Apps/Billing/Roles "All" filter tab.
10. MED - Checkout: no discount-code or gift-card field, so the discounts and gift cards you create are never applied. A Pakistan order also showed no tax line (total = item + shipping).
11. LOW - Dashboard numbers (sessions, conversion, ROAS, live view, payouts $8,511 vs $111 sales) are fake or random (21x Math.random), so they don't match the real orders.
12. LOW - "Copy URL" (Apps > Google) throws an unhandled Clipboard writeText rejection. It needs a try/catch fallback.
13. LOW - Unknown hashes (#store, #cart, #checkout, #settings) silently fall back to Home, so there's no 404 or deep link to the storefront.
14. LOW - Only 68 checkout countries. The per-country address forms work well (US, UK, DE, IN, AE, JP, PK tested). A full checkout as a new customer worked: the order was saved and stock went down by 1.

Worked OK: auto demo login, product form (SKU, barcode, compare-at, options, SEO, tags, rich text), collections, discounts list, gift cards, menus, blog list, markets, settings pages (general, plan, billing, users, roles, security, taxes, locations, policies, notifications), theme editor buttons, card checks (Luhn, expiry, decline card), OTP for returning customers. No other JS errors.

## B) Missing / partial Shopify features
Products: Variants PARTIAL (option builder exists; storefront has no variant picker and orders don't record the variant). Bulk edit MISSING. CSV import/export MISSING (only report/payout CSV exports). Multiple images PARTIAL.
Collections: manual OK. Automated rules (tag/price conditions) PARTIAL or not verified.
Orders: detail page, fulfill with tracking, partial refund, restock on refund, timeline, notes, edit order, cancel all MISSING. Draft orders PARTIAL (list only; no invoice or convert-to-order). Abandoned carts PARTIAL (demo data, send email does nothing).
Customers: detail, add/edit, addresses, order history, tags MISSING. Segments PARTIAL (static).
Discounts: creation PARTIAL. Not applied at checkout, and there are no rules (min spend, BOGO, automatic, usage limits).
Gift cards: issue PARTIAL; can't be redeemed at checkout.
Analytics/reports: PARTIAL (mostly fake numbers; reports don't open).
Shipping zones/rates: PARTIAL (Standard $5 / Express $12; zones not shown applying per country). Local pickup broken (#A2).
Taxes: PARTIAL (settings exist; not applied in the tested checkout).
Payments: PARTIAL, simulated only (no real gateway; fine for a demo).
Checkout: GOOD. Discount/gift code entry and order confirmation email are MISSING.
Online store: themes and section editor OK. Pages PARTIAL. Blog PARTIAL (list/add). Navigation menus PARTIAL (can't edit items). Storefront search, collection pages and product page routing MISSING or broken.
Customer accounts (storefront login, order history): MISSING or partial.
Notifications/emails: PARTIAL (templates; nothing sent; abandoned-cart email dead).
Staff/permissions: PARTIAL (users and roles UI; roles not enforced on the admin screens).
Markets/currency: PARTIAL (rates exist; the storefront showed USD only).
SEO: PARTIAL (product/collection meta). Sitemap/redirects MISSING.
Domains: PARTIAL (simulated). Apps: PARTIAL (mock integrations).
Admin global search: MISSING. Product reviews: MISSING.

## C) Recommended build order
1. Fix the crashes and duplicates: PO actPo, the pickM rename, merging duplicate functions, the UTF-8 mojibake.
2. Order detail page: line-item price snapshot, fulfill + tracking, refund/cancel with restock, status timeline.
3. Discount codes and gift cards applied at checkout, with taxes calculated into the total.
4. Storefront routing: Catalog/collection pages, product page with variant picker, search, working nav links and menus.
5. Customers: detail page, add/edit, order history, storefront customer accounts.
6. Product CSV import/export and bulk edit; variant-level inventory/SKU in orders.
7. Real analytics from actual orders (replace Math.random), with working reports.
8. Shipping zones/rates by country, local pickup, and notifications (order confirmation, abandoned-cart email) wired to events.
