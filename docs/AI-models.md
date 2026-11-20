# VendOm AI: models, plans, costs and connectors

## What the seller gets
One **VendOm AI** item in the admin menu (it replaces AI builder, SEO / AEO / GEO, Off-page SEO, AI tools and Sitemap). It is a chat that does the work itself, using the seller's real store data:

| Ask | What it does |
|---|---|
| "How are sales this month?" | Sales, orders, average order, top products |
| "Show orders to ship", "order #1004", "fulfil #1004 with TCS 12345" | Reads and fulfils orders |
| "What is low on stock?" | Stock check |
| "Audit my SEO", "fix SEO" | Full SEO audit and automatic fixes |
| "AEO FAQ for lawn suits", "GEO summary", "keywords for kurta" | Answer-engine and AI-search optimisation, keyword research |
| "Write Urdu and English descriptions for the silk scarf" | Content optimisation, saved to the product |
| "Plan 8 weeks of blog posts", "Instagram posts for Eid" | Content calendar, social posts |
| "Create a 10% discount code EID10" | Creates the discount |
| "Build a website for a Lahore lawn brand", "make the header black" | Builds or edits the store |

It uses the same API as the seller, so it has the same permissions and plan limits. It asks before big changes (publishing a new site, bulk edits, discounts).

## Which model each plan uses

| Plan | Model (default) | Credits per reply | Why |
|---|---|---|---|
| Basic | **DeepSeek** (`deepseek-flash`) | 1 | Cheapest; good for simple questions |
| Grow | **Kimi** (Moonshot, `kimi-k2.6`) | 2 | Strong at using tools, mid price |
| Advanced, Enterprise | **Claude** (`claude-opus-5-5`) | 5 | Best quality for building sites and long tasks |

- If a plan's model has no key or fails, the next **cheaper** model answers (Advanced: Claude → Kimi → DeepSeek). A plan never falls *up* to a more expensive model.
- With no keys at all, built-in answers still work for sales, orders, stock and SEO.
- Change the mapping without code: `AI_TIER_BASIC`, `AI_TIER_GROW`, `AI_TIER_ADVANCED`, `AI_TIER_ENTERPRISE` (`deepseek` | `kimi` | `claude`), and the credits with `AI_CREDITS_DEEPSEEK`, `AI_CREDITS_KIMI`, `AI_CREDITS_CLAUDE`.
- Claude is called through Anthropic's official SDK with automatic fallback if a request is declined. DeepSeek and Kimi use their OpenAI-compatible APIs.

## Setting the keys (Render → vendom-api → Environment)

| Key | Where to get it |
|---|---|
| `DEEPSEEK_API_KEY` | platform.deepseek.com → API keys (prepaid balance) |
| `KIMI_API_KEY` | platform.moonshot.ai → API keys. **Check the current model name there** and set `KIMI_MODEL` (Moonshot has been retiring older Kimi models; `kimi-k2.6` is the default here) |
| `ANTHROPIC_API_KEY` | console.anthropic.com (platform.claude.com) → API keys |

Keys stay on the server only. Never put them in the website or in a store's Integrations page.

## Cost per reply (estimate, check before launch)

A typical assistant reply reads about 12,000 tokens (instructions, tools and store data, often in two steps) and writes about 600.

| Model | Price per 1M tokens (in / out) | ≈ cost per reply | ≈ Rs (at Rs 277 = $1) |
|---|---|---|---|
| DeepSeek flash | $0.30 / $1.20 | $0.004 | Rs 1 |
| Kimi K2.6 | ~$0.95 / $4.00 (unverified, confirm on Moonshot) | $0.014 | Rs 4 |
| Claude Opus 5.5 | $4 / $20 (cached instructions are cheaper) | $0.03–0.06 | Rs 8–17 |

**Important for your pricing:** AI overage is sold at Rs 80 per 100 credits (Rs 0.80 a credit). A Claude reply at 5 credits earns Rs 4 but can cost Rs 8–17. Advanced (Rs 1,000/month, 400 credits) would give 80 Claude replies, which could cost Rs 700–1,400. Before launch, pick one:
1. Charge more credits per Claude reply (for example `AI_CREDITS_CLAUDE=15`), or raise the Advanced price / AI overage price.
2. Use a cheaper Claude model for Advanced: `ANTHROPIC_MODEL=claude-sonnet-5-5` ($2 / $10, about half) or `claude-haiku-5-5` ($0.10 / $0.50, cheaper than Kimi). Opus stays the best quality.
Every reply's tokens and estimated cost are saved in the `AiLog` table, so you can see the real numbers after a week.

## Connect any app (Apps → Connect any app)
The seller pastes a link; VendOm works out what it is:

| Link | Becomes |
|---|---|
| Zapier, Make, n8n, Pipedream, IFTTT, Slack, Discord, Microsoft Teams, Google Apps Script, any https webhook | Gets store events: new order, fulfilled, refunded, cancelled, new product (Slack/Discord/Teams get a readable message) |
| A link ending in `/mcp` (Model Context Protocol server) | Its tools become available to VendOm AI on Claude plans |
| An OpenAPI/Swagger file or an `api.` address | Saved as an API connection with an optional key |
| facebook.com, instagram.com, tiktok.com, Google Ads/Analytics/Merchant, WhatsApp, Mailchimp, Klaviyo, Xero, QuickBooks, TCS, Leopards, PostEx, Trax | Opens VendOm's built-in app for it |

Safety: links to private or local addresses are refused; keys are encrypted; tokens in links are hidden in the admin.
