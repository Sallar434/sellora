# Launch step 1: put the VendOm server online

What you get: the VendOm API running at an address like `https://vendom-api.onrender.com`, with a real PostgreSQL database.
Cost: Neon database free to start, Render server $7/month (Starter). Time: about 30 minutes.

Everything below was tested before writing this guide: the server builds, creates its tables on PostgreSQL, passes all 71 backend tests on PostgreSQL, starts in production mode and only accepts requests from the VendOm website.

## A. Database (Neon)

1. Go to **neon.com** → **Sign up** (use Google or GitHub).
2. Create a project:
   - Project name: `vendom`
   - Postgres version: leave the default
   - Region: **AWS Asia Pacific (Singapore)** (closest to Pakistan)
3. On the project dashboard click **Connect**.
4. Copy the **connection string**. It looks like
   `postgresql://neondb_owner:xxxx@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
5. Keep it somewhere private (it is a password). You paste it in step B5.

## B. Server (Render)

1. Go to **render.com** → **Get started** → sign up **with GitHub**, using the account that owns the `sellora` repository (Sallar434).
2. Allow Render to see the `sellora` repository when GitHub asks.
3. In Render click **New +** → **Blueprint**.
4. Pick the **sellora** repository → Render reads `render.yaml` and shows a service called **vendom-api**.
5. Render asks for two values:
   - **DATABASE_URL**: paste the Neon connection string from A4.
   - **PUBLIC_URL**: type `https://vendom-api.onrender.com` (if Render gives the service a different address, change it to that later under *Environment*).
   The secret keys (JWT, encryption, webhook) are created by Render automatically. Do not change `ENCRYPTION_KEY` later: saved app keys and bank details are locked with it.
6. Click **Apply**. The first build takes 5–10 minutes.
7. When it shows **Live**, open `https://vendom-api.onrender.com/health` in your browser. You should see `{"ok":true}`.
   The API documentation is at `https://vendom-api.onrender.com/docs`.

## C. Create your platform admin account

1. In Render open **vendom-api** → **Shell**.
2. Run (put your own email and a long password):
   ```
   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a long password of 12+ characters' npm run create-admin
   ```
3. It prints `Platform admin ready: you@example.com`.

**Never run `npm run seed` on the live server.** It creates demo logins whose password is `password123`.

## D. Tell Claude it is live

Send Claude the address (for example `https://vendom-api.onrender.com`). Claude then does step 2: connect the website to the server, so stores are saved on the server instead of only in the visitor's browser.

## Good to know

- Product images uploaded to the server are lost when Render restarts it. Step 3 moves them to Cloudflare R2 (free up to 10 GB).
- Payments stay in test mode (`PAYMENT_PROVIDER=mock`) until a payment partner such as Safepay is connected.
- Emails and WhatsApp messages are only logged until Resend / Meta keys are added.
- Running the backend tests on PostgreSQL yourself: create an empty database and run `TEST_DATABASE_URL=postgresql://... npm test` in `backend/`.
