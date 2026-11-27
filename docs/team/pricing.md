# VendOm plans and AI cost (27 Nov 2026)

## Short answer
Four plans: **Starter $25, Grow $49, Pro $99, Scale $249** a month. Each includes a fixed number of AI replies. Most replies go to a cheap model (Claude Haiku 5.5 or DeepSeek V4.1 Flash), and only hard jobs, like building a whole store, go to a stronger model (Claude Sonnet 5.5 or Kimi K2.6). With that split, AI costs about **$2 per 1,000 replies**. Each plan keeps about **70–80% gross margin** (the share of the price left after AI, payment fees and hosting).

Never let customers use the top model (Claude Opus 5.5) without a limit. On the Scale plan alone it would cost about $410 a month, more than the $249 price.

## 1. What one AI reply costs us
A typical reply in VendOm reads about 3,000 tokens and writes about 600. The 3,000 are 2,000 cached tokens (the instructions and store details, which repeat every time) plus 1,000 new tokens (the user's message). One token is roughly ¾ of an English word.

| Model | Input $/1M (cached) | Output $/1M | Cost per reply | Per 1,000 replies | Build a whole store (20k in, 8k out) |
|---|---|---|---|---|---|
| Claude Haiku 5.5 | $0.10 ($0.01) | $0.50 | $0.0004 | **$0.42** | $0.006 |
| DeepSeek V4.1 Flash (peak hours) | $0.30 ($0.006) | $1.20 | $0.0010 | $1.03 | $0.016 |
| Kimi K2.6 | $0.95 ($0.16) | $4.00 | $0.0037 | $3.67 | $0.051 |
| DeepSeek V4 Pro (peak hours) | $1.32 ($0.044) | $3.96 | $0.0038 | $3.78 | $0.058 |
| Claude Sonnet 5.5 | $2.00 ($0.10) | $10.00 | $0.0082 | $8.20 | $0.12 |
| Claude Opus 5.5 | $4.00 ($0.20) | $20.00 | $0.0164 | $16.40 | $0.24 |

Notes:
- Claude prices are Anthropic's list prices. DeepSeek and Kimi prices come from public price trackers in November 2026, and those trackers disagree a little. Check the providers' own pricing pages before launch.
- DeepSeek charges half price off-peak (Chinese night hours), so background jobs like bulk product descriptions can run then.

**Recommended routing:** 80% of replies on Claude Haiku 5.5 (chat, descriptions, translations, order answers) and 20% on Claude Sonnet 5.5 (store building, marketing plans, reports). Blended cost: **about $1.98 per 1,000 replies**. A DeepSeek Flash plus Kimi K2.6 mix costs about $1.56 per 1,000. That is similar, so pick on quality and data-location rules, not price.

## 2. The four plans
| | Starter | Grow | Pro | Scale |
|---|---|---|---|---|
| Price / month | **$25** | **$49** | **$99** | **$249** |
| Yearly (2 months free) | $250 | $490 | $990 | $2,490 |
| Who it is for | New seller, first sales | Selling every day | Growing brand, small team | Big shop, several brands |
| AI replies / month | 1,000 | 3,000 | 8,000 | 25,000 |
| AI tokens / month (about) | 3.6M | 10.8M | 28.8M | 90M |
| AI store builds / month | 2 | 5 | 15 | 40 |
| Products | 500 | 5,000 | Unlimited | Unlimited |
| Staff accounts | 1 | 3 | 10 | 25 |
| VendOm Pay fee per order | 2.5% | 2.0% | 1.5% | 1.0% |
| Markets / currencies | 2 | 5 | 20 | Unlimited |
| WhatsApp order messages | 200 | 1,000 | 3,000 | 10,000 |
| Extra AI | $5 per 1,000 replies (our cost about $2) | same | same | same |

## 3. What each plan costs us and what we keep
Our cost per customer each month:
- **AI:** replies × $0.00198, plus store builds at $0.12 each.
- **Payment fee on the subscription:** about 5% + $0.50 (a merchant-of-record service such as Paddle, which also handles tax).
- **Hosting, database, image storage and email:** about $1–8, an estimate that grows with plan size.

| Plan | Price | AI | Payment fee | Hosting | **Total cost** | **Profit / month** | Margin |
|---|---|---|---|---|---|---|---|
| Starter | $25 | $2.22 | $1.75 | $1.00 | $4.97 | **$20.03** | 80% |
| Grow | $49 | $6.53 | $2.95 | $2.00 | $11.48 | **$37.52** | 77% |
| Pro | $99 | $17.61 | $5.45 | $4.00 | $27.06 | **$71.94** | 73% |
| Scale | $249 | $54.20 | $12.95 | $8.00 | $75.15 | **$173.85** | 70% |

These numbers assume every customer uses their whole AI allowance. Most use 20–40% of it, so the real AI cost is usually much lower.

WhatsApp message costs are not in this table, because Meta's prices change by country and message type. Budget about $0.005–0.03 per message and check Meta's current rate card. If needed, bill WhatsApp messages past the included amount.

## 4. Example: profit at 1,000 and 10,000 paying stores
Assumed mix of paying stores: 55% Starter, 30% Grow, 12% Pro, 3% Scale.

| Paying stores | Revenue / month | Our costs / month | Gross profit / month |
|---|---|---|---|
| 1,000 | $47,800 | $11,680 | **$36,120** |
| 10,000 | $478,000 | $116,800 | **$361,200** |

Gross profit here is before salaries, marketing and support. VendOm Pay fees on sales come on top. For example, 10,000 stores each selling $1,000 a month at a 2% average fee add about $200,000 a month, before the payment partner's own cut.

## 5. Suggestions
1. **Start at $25, as you asked, but keep a free trial of 14 days** with 100 AI replies. The UX review found that sellers want to make a first sale before paying.
2. **Regional prices for Pakistan, India, Bangladesh and Sri Lanka.** $25 is a lot for a new seller there, about Rs 7,000. Offer the same plans at local prices with the same profit share, for example Starter Rs 2,500 / ₹999 / ৳1,500 / LKR 4,500. Our AI cost is the same in every country, so margins stay above 60%.
3. **Use the cheap model by default** and only send hard jobs to the strong one. That single choice moves AI cost from about $16 to about $2 per 1,000 replies.
4. **Cache the instructions and store details** (the 2,000 repeated tokens). Caching cuts the input cost by about 90%.
5. **Hard monthly AI limits per plan**, a warning at 80% and a one-tap "Buy 1,000 more replies for $5". Never offer unlimited AI.
6. **Yearly plans** at 2 months free, to improve cash flow.
7. **Make VendOm Pay fees the second income stream.** A lower fee on bigger plans pushes upgrades.
