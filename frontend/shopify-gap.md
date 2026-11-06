# Sellora vs Shopify admin: gap analysis (Oct 29, 2026)

Sources: help.shopify.com "Navigating the Shopify admin" and the Shopify admin section docs. This is research only; no real store was touched.

| Feature | Shopify | Sellora before | Status after |
|---|---|---|---|
| Left nav order (Home, Orders, Products, Customers, Marketing, Discounts, Content, Markets, Finance, Analytics, Apps, Sales channels, Settings) | Yes | "Growth" in place of Marketing, placed after Customers | Renamed to **Marketing** and moved before Discounts; order now matches Shopify |
| Orders › Drafts, Abandoned checkouts | Yes | Yes | Unchanged |
| Products › Collections, Inventory, Purchase orders, Transfers, Gift cards | Yes | Yes | Unchanged; added backend Transfer + Location models |
| Customers › Segments, Companies (B2B) | Yes | Yes (frontend) | Added Company backend model and endpoints |
| Marketing › Campaigns, Automations, Attribution | Yes | Campaigns and Attribution only | **Added Automations**: abandoned checkout, welcome, win-back, review request, COD confirmation; on/off toggle; create your own. Added Campaign and Automation backend models |
| Content › Metaobjects, Files, Menus, Blog posts, Pages | Yes | Pages missing | **Added Pages**: index, detail page with right-hand cards, SEO listing, visibility, template |
| Online Store › Themes, Preferences | Yes | Themes only | **Added Preferences**: meta title/description, social image, cookie banner, captcha, password page |
| Finance › Payouts, Billing | Yes | Payouts only | **Added Billing** (bills, payment method, plan) |
| Analytics › Reports, Live View | Yes | Yes | Unchanged |
| Settings › General, Plan, Billing, Users, Roles, Payments, Checkout, Customer accounts, Shipping, Taxes, Locations, Domains, Notifications, Custom data, Languages, Privacy, Policies | Yes | Yes | Unchanged |
| Settings › Markets, Apps and sales channels, Brand, Customer events, Gift cards, Packing slip template, Store activity log | Yes | Missing | **Added** all 7 |
| Index tables: search, filter, sort | Yes | Only a few pages had tabs or a search box | **Added on every admin table**: search box, filter on a column that has few values, sort by any column |
| Bulk select + bulk actions | Yes | Bulk edit modal only | **Added** checkbox column, select-all, "N selected" bar, Export selected (CSV); products also get Set active / Set draft / Archive |
| Saved views (tabs) | Yes | Fixed tabs only | **Added** "Save view" → saved as a tab you can delete (backend SavedView model) |
| Detail page layout (main column + right-hand cards) | Yes | Some pages | New detail pages use the `.xdet` 2-column grid (main + side cards) |
| Contextual save bar (Discard / Save) | Yes | No | **Added**: appears on any edited form that has a Save button; Discard reloads, Save runs the page's save |
| Back arrow / breadcrumb | Yes | No | **Added** on all sub-pages and detail pages (Order, Customer, Report, Page) |
| Empty states | Yes | Plain empty tables | **Added** illustrated empty state with the primary action |
| Global search (Ctrl/Cmd+K) | Yes | Settings search only | **Added**: searches pages, settings, orders, products, customers |
| Alerts feed | Yes | No | **Added** bell with unread count; mark all as read |
| Staff roles | Yes | Frontend roles | Added StaffRole backend model; backend manager role now includes `marketing` |
| Metaobjects backend | Yes | Frontend only | Added Metaobject model + endpoints |
| Online store preferences backend | Yes | No | Added Preference model + endpoints |
| Payment provider | Shopify Payments | Sellora Pay escrow | Kept (Sellora Pay, escrow) |

Placeholders that are still only external integrations: email/SMS/WhatsApp sending, ad platforms (Meta/Google), payment rails (card network, JazzCash, Easypaisa, bank, PayPal etc.), courier tracking, OAuth sign-in.
