# Sellora QA report

Run on 29 Oct 2026 (Asia/Karachi, UTC+5).

## Summary
**All suites are green.** The live Shopify store "activereality-store" was not touched and nothing was sent externally.

| Suite | Scope | Result |
|---|---|---|
| Backend vitest + supertest (`npm test`) | Auth, stores, products, orders, plus features (15), integrations with mock fallback, hooks, rate limit (429), OpenAPI contains new paths | **38/38 pass** |
| TypeScript (`tsc --noEmit`) | backend | **0 errors** |
| ESLint (`npm run lint`, eslint 9 + typescript-eslint) | backend `src` + `tests` | **0 errors**, 8 warnings (unused vars, empty catch) |
| t1 | Frontend smoke / JS errors | 0 errors |
| t2 | Navigation of every admin page | ERRORS [] |
| t3 | CRUD, save bar, two-column detail pages | 35/35 |
| t5 | Storefront + checkout | ERR [] |
| t9 | 15 beyond-Shopify features, RTL Urdu/Arabic, theme library, console-error check | 60/60 |
| t10 (new) | New apps (TCS, Leopards, PostEx, Trax, Xero, QuickBooks, Google Ads), connection and validation, masked secrets, persistence (`sellora` key), TCS label, product deep link, 1000-product performance, console errors | 28/28 |

## Performance (1000 products)
- Product list render: 207 ms
- Re-navigation: 189 ms
- Save: 5 ms
- Search: 0.3 ms
- localStorage size: 344 KB

## API / Swagger
- `/openapi.json` and `/docs` expose 228 paths, including 51 `/plus/*`, 9 integrations and 4 hooks.
- A test asserts that `/plus/whatsapp`, `/integrations/{appId}/sync` and `/api/hooks/apps` are present.

## Dependencies and audit
- nodemailer upgraded to **10.3.1**.
- deepmerge-ts and effect advisories fixed with `overrides`.
- **Known issue:** zod 4 migration was tried and reverted. It caused 6 test failures plus type errors from error-shape and `z.record` API changes. zod stays on 3.25.76. `npm audit` still flags zod <4.6.6, a high-severity advisory. Plan: migrate to zod ≥4.6.6 in a dedicated pass. Code was already made forward-compatible with `z.record(z.string(), …)`.

## Bugs found and fixed in this pass
1. `st is not defined`: the APPS array was closed early when the new apps were added. Fixed.
2. Console `ERR_CONNECTION_CLOSED`: the seed file pointed at an external CDN image. Replaced with an inline SVG data URI.
3. The AI-listings "open product" link returned 404. Added a `#product-<id>` hashchange deep link to the two-column editor.
4. App settings showed API secrets in plain text. Token, secret, key and password fields are now masked.
5. The label panel lacked the Pakistani couriers. Added TCS, Leopards, PostEx and Trax with airway-bill prefixes.
6. The eslint and @eslint/js 10 peer conflict was fixed by pinning @eslint/js to 9.

## Coverage checklist
- 15 features, each with a backend endpoint (Prisma model) and an admin UI.
- Two-column detail pages with a save bar.
- Theme library with Sellora equivalents of all Shopify free themes.
- Real API code for every app, with mock fallback when no keys are saved and credentials encrypted at rest.
- Urdu/Arabic RTL.
- Sellora Pay as the only escrow brand.
- Currency labels such as "Pakistani Rupee (PKR)".

## Known issues and limitations
- zod advisory (above).
- Live API calls are untested without real merchant keys. The mocks match the documented request and response shapes.
- 8 lint warnings, none blocking.

## Plans & billing QA (2026-10-29, Asia/Karachi UTC+5)
- Backend vitest: 48/48 (billing.test.ts 10 tests: catalogue, trial, admin plan edit, card-paid invoice, stop-mode 402 + alerts, hard cap, auto overage + spend cap + billing run, proration/downgrade, trial→Free, Swagger paths).
- Frontend: t11 plans 43/43; t3 35/35, t9 60/60, t10 28/28, t1/t2/t5 pass with 0 console errors.

## AI & SEO QA (2026-10-29, Asia/Karachi UTC+5)
- Backend `tests/growth.test.ts`: 15 tests covering the DeepSeek request shape (mocked fetch), template fallback, cost maths, builder apply + 25-credit metering, edit commands, STT 501, audit/fix, schema/head/sitemap, AEO/GEO/keywords/calendar, redirects (loop guard, storefront lookup), IndexNow/rank, off-page, extra tools, chatbot and 402 when credits run out. Full suite 63/63, `tsc` clean, lint 0 errors.
- Frontend `t12.py`: 53/53 — voice input (mocked Web Speech) fills the prompt, unsupported-browser message, website generation applies drafts, credits metered, spoken reply, 5 edit commands, audit → fix-all raises score, broken link redirected, JSON-LD types, sitemap hreflang, robots/llms/head tags, AEO/GEO, keywords/gaps/calendar, redirect loop blocked, IndexNow/rank, citations, outreach, GBP, social, EN/UR/AR (RTL) descriptions, alt text, review reply, WhatsApp campaign, competitor placeholder, chatbot, quota block, mobile 390 px with no overflow, no console errors. Earlier suites t1–t11 re-run with 0 failures.
- Placeholders (work in demo mode, need keys to go live): Google Search Console OAuth, rank API, server STT, competitor live fetch, IndexNow key, PageSpeed key.
