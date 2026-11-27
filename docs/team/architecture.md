# VendOm architecture review (27 Nov 2026)

## Short answer
VendOm is long mostly because of how it was built: each feature was added as a new module that wraps or replaces an older one, and everything is joined into one 1.9 MB page that every visitor downloads. It works for a demo, not for 1 million users. The biggest problem is that each shop's data lives only in one browser (localStorage), so clearing the browser or changing phone loses the shop, and shoppers' orders can't reach the seller. The existing backend (`backend/`, 80 database tables) is the right base to move onto step by step, without a big rewrite.

## Measurements
| Part | Lines | Size |
|---|---|---|
| `frontend/base.html` | 6,436 | 605 KB |
| 37 modules `src/m1…m36.js` | 8,193 | 1.27 MB |
| `src/m9/` (not in the build) | – | dead |
| Built `vendom.html` | 14,662 | 1.88 MB (549 KB gzip) |
| `backend/src` | 4,851 | 13 route files |
| `backend/prisma/schema.prisma` | 974 | 80 models |
| `demo/` images | 200 files | 4.9 MB, loaded on demand |

| Patching / duplication | Count |
|---|---|
| Page definitions `V.x = function` | 35 for 16 pages |
| Pages redefined more than once | 10 (`V.home` ×5, `V.products` ×4, `V.orders` ×4) |
| Dead (replaced, never called) definitions | 12 (~10 KB) |
| Wrapper chains | 48 (`sec` wrapped 11×) |
| Duplicate helper functions | 215 of 1,131 |
| String-replace patches in `build.py` | 13 |
| Estimated superseded/duplicated JS | 25–35% (estimate) |

## Risks at 1M users
| Risk | Severity |
|---|---|
| All data in localStorage (5–10 MB limit, lost on clear/private mode/Safari purge, no backup) | Critical |
| No real multi-device accounts; storefront orders don't reach the seller | Critical |
| Plans, trial, limits and "store live" are client-side and editable; 159 `innerHTML` writes (XSS exposure) | High |
| 549 KB gzip + 1.8 MB JS parse: ~11 s on slow 3G, 2–4 s parse on budget Android | High |
| Storefront SEO: hash routes, no per-product URLs or meta | High |
| No multi-tenant hosting (per-store domains, isolation) | High |
| Maintainability: layered wrappers break silently; UI-only tests | High |

## Target architecture (recommended: option A)
- **Admin**: React (Vite or Next.js), split by route (~150–250 KB first load).
- **Storefront**: server-rendered (Next.js ISR) with real URLs per store and product, meta tags and schema.org, edge-cached; custom domains via hostname → store lookup.
- **API**: the existing Express + Prisma + Postgres backend (auth with refresh tokens, OTP, stores, orders, ledger, idempotency, outbox, audit, jobs).
- **Postgres** with `storeId` on every row and row-level security; read replicas later.
- **Images** in object storage (Cloudflare R2/S3) with signed uploads and an image CDN.
- **Jobs**: Redis/BullMQ for email, WhatsApp, webhooks, AI, payouts.
- **Payments**: JazzCash, Easypaisa, Safepay, Razorpay (India), COD; confirmed only by server webhooks.
- **Observability**: Sentry, structured logs, SLOs.

| | A. Next.js + existing backend | B. Vanilla JS + bundler + backend | C. Laravel/Django rewrite |
|---|---|---|---|
| First real accounts | 4–6 weeks | 3–4 weeks | 8–12 weeks |
| Storefront SEO | Built in | Needs extra render service | Good |
| Reuses `backend/` | Yes | Yes | No |
| Hiring in PK/IN | Very large pool | Hard | Large pool |
| Hosting at 1M users (estimate) | ~$2–5k/month | Similar | Similar |

## Migration plan (app keeps working at every step)
| Step | Work | Team of 2–3 |
|---|---|---|
| 0 | Quick wins (below) | 1 week |
| 1 | Server becomes source of truth: sync on by default, auth and plan checks on the server, localStorage only as offline cache | 3–4 weeks |
| 2 | Images to R2 with signed uploads; migrate data-URL images | 1–2 weeks |
| 3 | Next.js storefront at `*.vendom.app` with SSR and edge cache | 4–6 weeks |
| 4 | Real server checkout and payment webhooks | 3–4 weeks |
| 5 | Admin pages move to React one area at a time | 8–12 weeks |
| 6 | Delete `vendom.html`, keep critical-flow tests, add API contract tests | 1–2 weeks |

Total about 5–7 months for 2–3 engineers; safe cross-device accounts after about 1.5 months.

## Quick wins
1. Delete dead definitions and the unbuilt `src/m9/` folder; fold `build.py` patches into `base.html`.
2. Minify in `build.py` (esbuild/terser): about 1.0–1.2 MB raw, ~300 KB brotli (estimate).
3. Long-cache headers in `vercel.json` for `demo/*` and versioned assets.
4. Split JS out of the HTML into a hashed file; lazy-load rarely used modules.
5. Data-safety guard: one save function that warns near the storage limit, refuses huge data-URL images, and offers a "Download backup" export.
6. Turn backend sync on by default for new sign-ups.
