# Markets (v51)

Built to follow Shopify's Markets workflow, as described in its Help Center (Markets › Getting started, Customizations, Catalogs and Rollouts, read 25 Nov 2026). Code: `frontend/src/m28.js`. Test: `frontend/tests/t31.py` (51 checks).

## Pages
| Page | Route | What it does |
|---|---|---|
| Markets | `#markets` | All / Active / Draft tabs with counts, search, table (market + type, status, includes, currency, catalogs, domain and language), **Graph view**, **Create market**, and the **backup region** card. |
| Market | `#market-<id>`, `#market-new` | Name + status, **Includes** (market type: Regions, Company locations, POS locations, Channels), **Customized** and **Inherited** settings, shipping check, More actions (preview store as this market, delete). Unsaved bar with Save / Discard. |
| Graph view | `#markets-graph` | Every market as a node grouped by type (includes, localization, products available + currency + catalogs, discounts, taxes and duties). **View as a customer in <country>** highlights the market that customer gets, or explains the backup region. |
| Catalogs | `#markets-catalogs`, `#catalog-<id>`, `#catalog-new` | Title + status, markets, **Set prices in** currency, **price adjustment** (increase / decrease %), include compare-at price, products table with select, **Exclude from catalog / Include**, per-product **fixed price**, CSV export, delete. |
| Rollouts | `#markets-rollouts`, `#rollout-<id>`, `#rollout-new` | Name, type (**Launch** or **Event**), changes (set catalogs active/draft, activate/deactivate discounts), audience (traffic allocation %, eligibility), scheduling (start, end). Running rollouts can be ended now. |

## Settings a market can customize
| Setting | Options | Market types |
|---|---|---|
| Currency | currency; exchange rate Automatic (store rate) or Manual; Rounding; Local currencies (multi-country) | Regions, Channels |
| Catalogs | any catalogs | all |
| Domain and language | primary domain, subfolder (`/de`), subdomain (`de.`), separate connected domain; language | Regions |
| Duties and taxes | tax display: Dynamic / Show as included / Show as line item; collect duties at checkout; duties as line item or included | Regions |

A setting that isn't customized is inherited from the store defaults. The **+** button customizes it and moves it to Customized; **×** removes the customization.

## Rules (validation)
- Name is required and unique. A region market needs at least one country; a channel market needs a channel; specific company/POS locations need at least one.
- Two **active** region markets can't have exactly the same countries (save one as a draft). A country can be in more than one market.
- A single-country market switches to that country's currency when there's a rate for it; a multi-country market turns on local currencies.
- A warning shows when a country in an active market has no shipping rates.
- The backup region must be in an active market. The market holding the backup region can't be deleted, drafted or lose that country until the backup region changes.
- A subfolder or subdomain can't be used by two markets. Manual exchange rates must be above 0.
- A catalog needs a title (unique) and at least one product. Fixed prices can't be negative. A catalog in an unfinished rollout can't be deleted.
- An Event needs an end date; so does any rollout under 100% of visitors. The end must be after the start. A discount can only be in one unfinished rollout.

## What really happens
- **Prices**: in the customer store and at checkout, a product's price comes from the active catalogs of the customer's market: fixed price if set, else store price ± adjustment; the lowest wins when several catalogs apply. Rounding rounds the converted price (e.g. 4,486 → 4,500 for large currencies, whole units for others).
- **Availability**: products excluded from every active catalog of a market are hidden from that market's store pages and blocked at checkout ("… is not available in Germany").
- **Market match**: checkout uses the shipping country. Browsing uses the currency the customer picked. Countries outside all active markets get the backup region's market.
- **Admin prices never change**: products, orders and draft orders keep store prices.
- **Rollouts**: at the start time the changes apply (catalog status, discount on/off). A Launch keeps them; an Event puts everything back at the end. Traffic allocation under 100% shows the catalog only to that share of visitors (random, per browser).

## Not built (yet)
- Experiment rollouts (control vs treatment) and theme / checkout changes in rollouts.
- Sub-region (state) markets, business entities, per-market theme customizations.
- Live exchange rates: "Automatic" uses the store's rate table (Settings › Payments).
