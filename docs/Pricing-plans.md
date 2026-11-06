# Sellora seller plans: pricing, limits, overage and margins

Prices are shown in Pakistani Rupee (PKR) and US Dollar (USD), using about Rs 280 = $1. All times are Asia/Karachi (UTC+5).

**How it works.** A new seller picks a plan first (Basic, Grow or Advanced; Enterprise is "contact sales"). Every plan starts with a **4-day free trial**.

- **During the trial** the seller can build everything: products, CSV import, themes, settings. The store stays behind its password page. Publishing a theme, removing the password and going live all need a paid plan, paid through Sellora Pay.
- **When the 4 days end without a purchase**, the store closes completely. The storefront shows "Store unavailable", and the admin only shows the choose-a-plan page. Nothing is deleted: buying any plan reopens the store with all its data.
- **Free** is no longer offered to new stores. It is kept only as a hidden legacy plan for old stores.
- **When a seller goes over a monthly limit**, they choose one of two options in *Settings › Plan*:
  - **Auto-pay overage:** they keep selling, and the extra usage is added to next month's bill. They can set an optional **spending cap**.
  - **Stop at limit:** the feature pauses and they're asked to upgrade.
- **Hard limits:** Products, stores and markets can't go over. The seller has to upgrade.
- **Annual billing:** 20% off.
- **Alerts:** at 80% and 100% of each limit, by email, webhook and in-app toast.

## Plans

| | Free (legacy, hidden) | **Basic** | **Grow** | **Advanced** | Enterprise |
|---|---|---|---|---|---|
| Monthly price, Pakistani Rupee (PKR) | Rs 0 | **Rs 300** | **Rs 600** | **Rs 1,000** | from Rs 4,999 (custom) |
| Monthly price, US Dollar (USD) | $0 | $1.09 | $2.15 | $3.59 | from $17.90 |
| Annual price (20% off) | – | Rs 2,880 / $10.46 | Rs 5,760 / $20.64 | Rs 9,600 / $34.46 | custom |
| Orders / month | 20 | 150 | 400 | 1,000 | unlimited |
| Products | 15 | 500 | 2,000 | unlimited | unlimited |
| Staff accounts | 1 | 1 | 3 | 8 | 25 |
| WhatsApp messages / month | 5 | 15 | 30 | 50 | 500 |
| Emails / month | 300 | 1,500 | 3,000 | 5,000 | 50,000 |
| AI credits / month (DeepSeek Flash) | 30 | 100 | 200 | 400 | 5,000 |
| File storage | 1 GB | 2 GB | 5 GB | 10 GB | 100 GB |
| Stores / markets | 1 / 1 | 1 / 1 | 1 / 2 | 2 / 5 | 10 / unlimited |
| Extra usage | not allowed | auto-pay or stop | auto-pay or stop | auto-pay or stop | auto-pay or stop |
| Sellora Pay card fee | 4.5% + Rs 30 | 4.0% + Rs 30 | 3.75% + Rs 30 | 3.5% + Rs 30 | from 3.4% + Rs 30 |
| Sellora Pay wallet fee (JazzCash, Easypaisa) | 3% | 2.5% | 2.5% | 2.5% | 2.25% |
| Bank transfer / COD | 0% | 0% | 0% | 0% | 0% |

The fixed card fee in US Dollar (USD) is $0.11.

## Overage prices (every paid plan)

| Item | Unit | Price, Pakistani Rupee (PKR) | Price, US Dollar (USD) | Our cost | Margin |
|---|---|---|---|---|---|
| WhatsApp message | 1 | Rs 8 | $0.03 | Rs 4.2 (Meta utility rate, Pakistan) | 47% |
| Emails | 1,000 | Rs 60 | $0.25 | Rs 28 (Amazon SES at $0.10 per 1,000) | 53% |
| AI credits | 100 | Rs 80 | $0.29 | Rs 42 (DeepSeek V4.1 Flash, peak, no cache: 1k in + 1k out tokens per credit) | 48% |
| Storage | 1 GB | Rs 10 | $0.04 | Rs 4.2 (object storage plus egress) | 58% |
| Order | 1 | Rs 2 | $0.01 | Rs 0.10 (compute and database) | 95% |
| Staff seat | 1 | Rs 99 | $0.40 | about Rs 0 (covered by hosting share) | ~100% |
| Products, stores, markets | – | hard limit, upgrade instead | | | |

Overage is billed in whole blocks. For example, 120 extra AI credits counts as 2 blocks, so Rs 160.

## Worst-case margin: every limit fully used

These are the unit costs used in every row below:

| Cost item | Unit cost |
|---|---|
| Order | Rs 0.10 |
| WhatsApp message | Rs 4.2 |
| Email | Rs 0.028 |
| AI credit | Rs 0.42 (worst case: peak hours, no cache hits) |
| Storage | Rs 4.2 / GB |

The hosting and support share per store is Rs 20 on Free, Rs 30 on Basic, Rs 35 on Grow and Rs 50 on Advanced.

| Plan | Orders | WhatsApp | Email | AI | Storage | Hosting | **Total cost** | Price | **Subscription margin** |
|---|---|---|---|---|---|---|---|---|---|
| Free | 2 | 21 | 8.4 | 12.6 | 4.2 | 20 | **Rs 68** | Rs 0 | acquisition cost |
| Basic | 15 | 63 | 42 | 42 | 8.4 | 30 | **Rs 170** | Rs 300 | **Rs 130 (43%)** |
| Grow | 40 | 126 | 84 | 84 | 21 | 35 | **Rs 391** | Rs 600 | **Rs 209 (35%)** |
| Advanced | 100 | 210 | 140 | 168 | 42 | 50 | **Rs 710** | Rs 1,000 | **Rs 290 (29%)** |

WhatsApp is the biggest cost: about one-third of the worst-case cost on each plan. That's why the WhatsApp limits are small and its overage price is set about 1.9× our cost.

### Sellora Pay fee: the main revenue

This estimate assumes an average order of Rs 3,000, paid 30% by card, 20% by wallet and 50% by COD or bank transfer. Our costs are:

- **Card processing:** about 2.9% + Rs 30 = Rs 117 per order.
- **Wallet processing:** about 1.5% = Rs 45 per order.

| Plan (orders at limit) | Card margin / order | Wallet margin / order | Fee profit / month | **Total monthly profit at full use** |
|---|---|---|---|---|
| Basic (150) | Rs 33 | Rs 30 | 45 × 33 + 30 × 30 = **Rs 2,385** | Rs 155 + 2,385 = **Rs 2,540** |
| Grow (400) | Rs 25.5 | Rs 30 | 120 × 25.5 + 80 × 30 = **Rs 5,460** | Rs 251 + 5,460 = **Rs 5,711** |
| Advanced (1,000) | Rs 18 | Rs 30 | 300 × 18 + 200 × 30 = **Rs 11,400** | Rs 373 + 11,400 = **Rs 11,773** |

Card fees are above processing cost on every plan. The per-order card margin gets thinner on higher plans, the same trade-off Shopify makes, but wallet volume makes up for it.

### Is Advanced (Rs 1,000) enough for a normal seller?

A typical small or medium Pakistani seller looks like this:

- 200 to 600 orders a month
- under 1,000 products
- 2 to 4 staff
- 2,000 to 4,000 emails a month, mostly order and shipping emails
- about 100 to 300 AI credits a month for product copy
- a few GB of photos

That fits well inside Advanced. The tightest limit is WhatsApp at 50 messages. Most sellers use the free WhatsApp catalogue and customer-started chats, which cost us nothing. Paid sends are only for OTP, reminders and broadcasts. If a seller does more broadcasts, each extra message is Rs 8, or they can set a cap.

## Example bills (auto-pay overage)

| Seller | Usage | Bill |
|---|---|---|
| Basic, busy month | 200 orders (50 over, Rs 100) and 25 WhatsApp messages (10 over, Rs 80) | Rs 300 + 100 + 80 = **Rs 480** |
| Grow, AI-heavy | 400 AI credits (200 over, 2 blocks, Rs 160) | Rs 600 + 160 = **Rs 760** |
| Advanced with a Rs 300 spending cap | 120 WhatsApp messages (70 over, Rs 560), capped | Rs 1,000 + 560 − 260 cap credit = **Rs 1,300** |
| Basic, “stop at limit” | the 16th WhatsApp send is blocked with an upgrade prompt | **Rs 300** |
| Trial ends without a plan | moved to Free | **Rs 0** |

## Billing mechanics (implemented)

- **Upgrades** take effect now, prorated for the rest of the period.
- **Downgrades** take effect at period end. They're blocked if the store's products, staff or markets don't fit the smaller plan.
- **Monthly billing job** (`billing-run`, also `POST /api/admin/billing/run`) builds the bill: overage lines, a spending-cap credit, then the next plan fee.
- **Payment:** charged to the Sellora Pay wallet first, then the card on file. If both fail, the bill is marked past due.
- **Platform admin:** prices, limits and fees can be edited at `/api/admin/plans` and on the *Platform admin · Plans* page.

## AI costs with DeepSeek (updated 29 Oct 2026, Asia/Karachi, UTC+5)

DeepSeek is **not free**. It is pay-as-you-go with no free tier; you top up a balance (any promotional "granted balance" is used first). It is, however, one of the cheapest capable models. Official prices, USD per 1M tokens ([api-docs.deepseek.com/quick_start/pricing](https://api-docs.deepseek.com/quick_start/pricing)), peak / off-peak:

| Model (`DEEPSEEK_MODEL`) | Input, cache hit | Input, cache miss | Output |
|---|---|---|---|
| `deepseek-flash` (V4.1 Flash, **Sellora default**) | $0.006 / $0.003 | $0.30 / $0.15 | $1.20 / $0.60 |
| `deepseek-v4-pro` | $0.044 / $0.022 | $1.32 / $0.66 | $3.96 / $1.98 |

Off-peak (half price) is any time outside 06:00–09:00 and 11:00–15:00 Asia/Karachi (UTC+5), Monday–Friday; weekends are off-peak all day.

| Action | Credits | Tokens (approx.) | Our cost, peak | Our cost, off-peak |
|---|---|---|---|---|
| 1 AI credit (description, reply, chat answer…) | 1 | 1k in + 1k out | Rs 0.42 ($0.0015) | Rs 0.21 |
| **Full website build** (theme, 4+ products, pages, policies, menus, blog, FAQ) | 25 | 6k in + 20k out | **≈ Rs 7 ($0.026)** | **≈ Rs 3.5** |
| Edit by command | 1 (0 when matched by rules) | 0.5k + 0.3k | Rs 0.15 | Rs 0.08 |
| Description in EN + UR + AR | 3 | 3 × 1.5k | Rs 1.3 | Rs 0.6 |
| SEO keyword research / AEO FAQ / GEO / calendar | 2 each | 1–3k | Rs 0.4–0.8 | Rs 0.2–0.4 |

A 25-credit build is worth Rs 20 at the overage price (25 × Rs 0.80) against a cost of about Rs 7, so we stay above cost even at peak. Changes from the previous plan: AI credits Free 20→30, Grow 250→200, Advanced 500→400, and AI overage Rs 40→80 ($0.15→$0.29) per 100 credits. Worst-case margins remain positive on every paid plan (Basic 43%, Grow 35%, Advanced 29%); Sellora Pay fees stay the main profit.
