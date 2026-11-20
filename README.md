> The live frontend on Vercel serves `frontend/vendom.html` (`/` rewrites to `/vendom.html`). The Express/Prisma backend is deployed separately later.

# VendOm

**Open: Extract All, then double-click VendOm.code-workspace**

Shopify-style store builder with VendOm Pay (escrow wallets), AI builder, App Store, and a Node.js backend.

## Folders
- `backend/`  Node 20 + TypeScript + Express + Prisma API (149 endpoints, docs at /docs)
- `frontend/` `vendom.html` (standalone app), `vendom-connected.html` (uses backend), `src/` source modules + `build.py`
- `docs/`     audit, Shopify parity, changelog
- `.claude/agents/` testing and engineering agents from agency-agents (see its README)

## Run
1. Open `VendOm.code-workspace` in VS Code (File > Open Workspace from File).
2. Backend:
   ```
   cd backend
   cp .env.example .env
   npm install
   npm run db:dev && npm run seed
   npm run dev
   ```
   API: http://localhost:4000  Docs: http://localhost:4000/docs
   Demo logins: admin@vendom.app / owner@example.com / buyer@example.com, password `password123`
3. Frontend: open `frontend/vendom-connected.html` with Live Server, go to Integrations, set Backend URL to `http://localhost:4000`.
4. Docker (optional): `cd backend && docker compose up --build`

See `backend/README.md` for going live (Stripe, SMTP, Twilio, LLM, S3, FX).

## Plans, trial and themes (v36)
- New sellers pick Basic, Grow or Advanced (prices in Pakistani Rupee (PKR), monthly or annual with 20% off); Enterprise is contact sales. Every plan starts with a **4-day free trial**.
- During the trial the store can be fully built, but it stays behind its password page until a plan is bought through VendOm Pay.
- After 4 days without a plan the store is closed: the storefront shows "Store unavailable" and the admin only shows the plan page. Buying any plan reopens it with all data kept.
- Products: CSV import (preview, errors, overwrite by handle, template) and export (page, all, selected or search; Excel or plain CSV).
- Themes: only VendOm's own free themes (Daybreak is the default). See `docs/Themes.md`.
- Tests: frontend `bash frontend/tests/run_all.sh` (needs Python Playwright; runs every `frontend/tests/t*.py`, including the Shopify parity suite `t17.py`); backend `cd backend && npm test`. `tconn.py` also needs the backend running on port 4000.
- Shopify coverage: see `docs/Shopify-parity.md`.

## Name change (Nov 2026)
Sellora is now **VendOm**, and Sellora Pay is now **VendOm Pay**. The app moves stores saved under the old browser key automatically, and old `/sellora.html` links redirect. The PDFs in `docs/` were made before the rename and still say Sellora; the `.md` files are current.
