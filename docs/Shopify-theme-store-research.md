# Shopify Theme Store study (pages 13–59), Nov 2026

Source: the public Shopify Theme Store at themes.shopify.com/themes. Pages 13 to 59 were opened and screenshotted on 25 Nov 2026. The theme store had 59 pages (24 themes a page, 3 on the last).

## What was collected
| | Count |
|---|---|
| Listing pages | 47 (pages 13–59) |
| Theme cards (one per style) | 1,107 |
| Different themes | 348 |
| Themes with 1 / 2 / 3 / 4 / 5+ styles | 50 / 76 / 80 / 82 / 60 |

## How the Theme Store is built (and how its pages link)
1. **Browse page** `/themes?page=N`: 24 cards a page. A card is one *style* of a theme: preview image, name, price, positive-review %, optional "New" badge. Cards link to the theme page for that style.
2. **Filters** on the left: Price (Free, Paid), Industry (20), Catalog size (One product, Few 2–10, Some 11–100+, Lots 500+) and Features (about 25 shown, 58 in total). Filters add `industry[]=…`, `catalog-size[]=…`, `price[]=…` to the address; they combine (AND across groups, OR inside a group) and reset to page 1.
3. **Top menu**: All themes, Large catalogs, Small catalogs, Free themes, Trending this week, New themes, Horizon themes.
4. **Theme page** `/themes/<theme>/presets/<style>`: name, price, rating, tagline, designer; Try theme and View demo; three highlight blocks; optional app add-on; "What's included" features in 5 groups; the styles (presets) of that theme; stores using it; reviews (positive / neutral / negative); designer support, version and changelog, docs; "More themes for <industry>".
5. **Try theme** adds the theme to the store's theme library without publishing. Publishing (and paying, for paid themes) happens in the store admin under Online Store › Themes.

## Industries (themes tagged, a theme can have several)
Clothing 213, Beauty 143, Jewelry and accessories 121, Home 112, Food and drink 91, Electronics 73, Sports 72, Bags 56, Art 48, Wellness 47, Pets 42, Shoes 38, Kids 37, Toys 29, Garden 27, Office 22, Auto 21, Entertainment 19, Hardware 15, Services 15.

## Catalog sizes
Some 295, Lots 134, Few 67, One product 23.

## Feature groups and the 58 features (number of the 348 themes that have each)
Groups: Cart and checkout · Customer accounts and sign-in · Marketing and conversion · Merchandising · Product discovery.

Recommended products 315, Product videos 311, High-resolution images 311, Product filtering and sorting 311, Promo banners 310, Sticky header 310, Slideshow 308, Color swatches 305, Enhanced search 305, Product badges 303, Image galleries 303, Cart notes 301, Mega menu 301, Quick buy 300, Slide-out cart 300, FAQ page 298, Image zoom 298, Blogs 297, Quick view 294, Animation 289, Product options 287, Stock counter 286, EU translations 286, In-store pickups 285, Image rollover 284, In-menu promos 283, Breadcrumbs 282, Cross-selling 273, Size chart 272, Swatch filters 269, Usage information 266, Product tabs 264, Collection page navigation 262, Promo popups 260, Shipping/delivery information 259, Countdown timer 253, Trust badges 248, Lookbooks 245, Recently viewed 235, Customizable contact form 234, Sticky cart 229, Image hotspot 229, Back-to-top button 223, Promo tiles 213, Press coverage 212, Before/after image slider 212, Age verifier 202, Ingredients or nutritional information 200, Infinite scroll 199, Sign in with Shop 198, Combined listing 186, Right-to-left 172, Pre-order 146, Account menu 139, Gift wrapping 132, Quantity pricing 113, Back-in-stock alert 112, Quick order list 89.

## What VendOm now matches
- Browse page with 24 cards a page, live previews, Free price, New badge, count ("121–144 of 468 themes"), sort, pages.
- Filters for Price, Industry (all 20 industries), Catalog size (multi-size themes), Style and Features; they combine and reset to page 1.
- Theme page with Try theme, Publish, all of the theme's styles, desktop/mobile preview, details and features.
- Try adds to the library (max 20), Publish makes it live; the chosen style is kept.

## Not copied on purpose
Theme names, preview images, demo stores, descriptions, reviews and designer details are Shopify's or its designers'. VendOm uses its own names, demo photos and copy. Paid themes, reviews and designer pages are not part of VendOm (all VendOm themes are free).

## Shopify theme features that VendOm themes do not list yet
The VendOm Features filter only lists what VendOm theme sections really do (built from each theme's layout), so no VendOm theme claims the features below.
- **Not in VendOm yet**: mega menu, quick view, slide-out cart, image zoom and rollover, before/after slider, countdown timer, age verifier, size chart, product tabs, recently viewed, infinite scroll, back-to-top button, gift wrapping, pre-order, quantity pricing, combined listing.
- **In VendOm elsewhere, but not a theme feature in the filter yet**: color swatches, back-in-stock alerts, breadcrumbs, image hotspots, popups, quick order list.
