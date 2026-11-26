# VendOm theme library

VendOm only ships its own free themes. Each one has an original name and a clear specialty. Every theme has its own homepage sections, header, footer, product page, typography, colours and card style. The default theme for new stores is **Daybreak**. Any store still on a removed theme is moved to Daybreak automatically, and its products and settings are kept.

| Theme | Tag | Best for | Homepage sections |
|---|---|---|---|
| Daybreak | Minimal | a clean, image-first general store | large image hero, featured products, image with text, columns, email signup |
| Renew | Bold & bright | energetic brands that love bold colour | slideshow, promo, bento collections, square product cards, reviews, newsletter |
| Serene | Wellness | wellness, skincare and beauty | soft hero, benefits, product highlight, reviews, FAQ, signup |
| Hearthwork | Handmade | handmade goods with a story | maker story, text, editorial collections, products, reviews, contact form |
| Munchbox | Food & drink | playful food, snacks and drinks | bold hero, promo, collection carousel, products, image banner, newsletter |
| Gallery | Art & portfolio | artists, photographers, portfolios | full image slideshow, spotlight, image banner, editorial collections, text |
| Palate | Recipes | food sellers who share recipes | hero, recipe split, kitchen story, products, FAQ, signup |
| Block Party | Colour blocks | bold brands built on colour blocks | bold hero, collection grid, promo, products, split block, large logo |
| Throttle | Sports | action, sports and outdoor gear | tall dark hero, collection carousel, product highlight, wide cards, banner, large logo |
| Source | Artisanal | makers who lead with their story | origin story, story text, product hotspots, text collections, reviews, signup |
| Folio | Editorial | books, magazines, text-led shops | heading, editorial collections, long text, editorial features, divider, newsletter |
| Limelight | Single product | shops built around one product | featured product, hotspots, benefits, reviews, FAQ |
| Ledgerline | Wholesale | B2B and wholesale with fast re-ordering | compact hero, info columns, collection grid, dense 6-column product grid, FAQ, contact form |

Also kept, as extra library themes: Meridian, Workbench, Legacy, Seamline, Ascend, Vase, Roomly, Relish, Rite, Weave, Sprint.

## Name changes
| Removed (old VendOm themes) | Now |
|---|---|
| Dawn, Ember, Tide, Orchard, Noir, Bloom, Slate, Sunset, Mint, Ink, Aurora, Sand | removed; stores move to Daybreak |
| Sensa | Serene |
| Handmade | Hearthwork |
| Craving | Munchbox |
| Press | Folio |
| Bulk | Ledgerline |
| Tinkerer / Atelierra / Dwelling / Pitchline | Workbench / Seamline / Roomly / Sprint |

## v46: 348 more themes (468 in total)
The Theme Store now has **468 free themes**: the 120 above plus 348 new ones. That is 20 pages of 24.

The new themes were planned from a study of Shopify Theme Store pages 13–59 (348 themes, 1,107 styles). For each theme there, VendOm got one original theme that matches its *kind*:
- **Industries**: the same industry tags (a theme can have several). The Industry filter now also has Entertainment, Services, Toys, Hardware, Office, Shoes and Wellness.
- **Catalog size**: one or more of One product / Few / Some / Lots. A theme can show under more than one size.
- **Styles**: up to 6 ready-made colour styles per theme (background, text, accent, surface), sampled from that theme's style colours. The default style of every theme is unique in the library.
- **Mood** (Bold, Editorial, Luxury, Modern, Soft) and layout chosen from the theme's description, with Lookbooks and large-catalog layouts where the original had them.

Names, demo content, layouts, sections and code are VendOm's own. No Shopify theme names, images, text or code are copied. Names were checked against every Shopify Theme Store theme and style name (pages 1–59) and against the existing VendOm names.

Data lives in `ROWS2` in `frontend/src/m21.js`. Each row is `name|demo|mood|industries|sizes|layout|styles`. Test: `frontend/tests/t29.py`.
