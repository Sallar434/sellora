> The live frontend on Vercel serves `frontend/sellora.html` (`/` rewrites to `/sellora.html`). The Express/Prisma backend is deployed separately later.

# Sellora

**Open: Extract All, then double-click Sellora.code-workspace**

Shopify-style store builder with Sellora Pay (escrow wallets), AI builder, App Store, and a Node.js backend.

## Folders
- `backend/`  Node 20 + TypeScript + Express + Prisma API (149 endpoints, docs at /docs)
- `frontend/` `sellora.html` (standalone app), `sellora-connected.html` (uses backend), `src/` source modules + `build.py`
- `docs/`     audit and changelog

## Run
1. Open `Sellora.code-workspace` in VS Code (File > Open Workspace from File).
2. Backend:
   ```
   cd backend
   cp .env.example .env
   npm install
   npm run db:dev && npm run seed
   npm run dev
   ```
   API: http://localhost:4000  Docs: http://localhost:4000/docs
   Demo logins: admin@sellora.app / owner@example.com / buyer@example.com, password `password123`
3. Frontend: open `frontend/sellora-connected.html` with Live Server, go to Integrations, set Backend URL to `http://localhost:4000`.
4. Docker (optional): `cd backend && docker compose up --build`

See `backend/README.md` for going live (Stripe, SMTP, Twilio, LLM, S3, FX).

## Plans, trial and themes (v36)
- New sellers pick Basic, Grow or Advanced (prices in Pakistani Rupee (PKR), monthly or annual with 20% off); Enterprise is contact sales. Every plan starts with a **4-day free trial**.
- During the trial the store can be fully built, but it stays behind its password page until a plan is bought through Sellora Pay.
- After 4 days without a plan the store is closed: the storefront shows "Store unavailable" and the admin only shows the plan page. Buying any plan reopens it with all data kept.
- Products: CSV import (preview, errors, overwrite by handle, template) and export (page, all, selected or search; Excel or plain CSV).
- Themes: only Sellora's own free themes (Daybreak is the default). See `docs/Themes.md`.
- Tests: `frontend/tests/t*.py` (run from `frontend/` with `python3 tests/tX.py` after copying, or from the source folder), `backend`: `npm test`.
