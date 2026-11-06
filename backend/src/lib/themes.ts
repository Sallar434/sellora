import { db } from './db';
// Sellora free theme library. Only these themes are offered; each has its own specialty.
export const THEME_LIBRARY = [
  { id: 's-daybreak', name: 'Daybreak', tag: 'Minimal', bestFor: 'Best for: a clean, image-first general store.', font: 'Inter', home: ['hero', 'featured', 'imgtext', 'multicolumn', 'email_signup'] },
  { id: 's-renew', name: 'Renew', tag: 'Bold & bright', bestFor: 'Best for: energetic brands that love bold colour.', font: 'Poppins', home: ['slideF', 'promo', 'col_bento', 'featured', 'testimonials', 'newsletter'] },
  { id: 's-serene', name: 'Serene', tag: 'Wellness', bestFor: 'Best for: wellness, skincare and beauty.', font: 'Lora', home: ['heroM', 'multicolumn', 'prod_highlight', 'testimonials', 'faq', 'email_signup'] },
  { id: 's-hearthwork', name: 'Hearthwork', tag: 'Handmade', bestFor: 'Best for: handmade goods with a story behind them.', font: 'Lora', home: ['imgtext', 'text', 'col_editorial', 'featured', 'testimonials', 'contactform'] },
  { id: 's-munchbox', name: 'Munchbox', tag: 'Food & drink', bestFor: 'Best for: playful food, snacks and drinks brands.', font: 'Poppins', home: ['heroB', 'promo', 'col_carousel', 'featured', 'imgbanner', 'newsletter'] },
  { id: 's-gallery', name: 'Gallery', tag: 'Art & portfolio', bestFor: 'Best for: artists, photographers and portfolios.', font: 'Inter', home: ['slideI', 'col_spotlight', 'imgbanner', 'feat_col_editorial', 'text'] },
  { id: 's-palate', name: 'Palate', tag: 'Recipes', bestFor: 'Best for: food sellers who share recipes and stories.', font: 'Lora', home: ['heroM', 'split', 'textbox', 'featured', 'faq', 'email_signup'] },
  { id: 's-blockparty', name: 'Block Party', tag: 'Colour blocks', bestFor: 'Best for: bold brands built on blocks of colour.', font: 'Poppins', home: ['heroB', 'col_grid', 'promo', 'featured', 'split', 'largelogo'] },
  { id: 's-throttle', name: 'Throttle', tag: 'Sports', bestFor: 'Best for: action, sports and outdoor gear.', font: 'Poppins', home: ['heroB', 'col_carousel', 'prod_highlight', 'featured', 'imgbanner', 'largelogo'] },
  { id: 's-source', name: 'Source', tag: 'Artisanal', bestFor: 'Best for: artisanal makers who lead with their story.', font: 'Lora', home: ['imgtext', 'textbox', 'prod_hotspots', 'col_text', 'testimonials', 'email_signup'] },
  { id: 's-folio', name: 'Folio', tag: 'Editorial', bestFor: 'Best for: books, magazines and text-led shops.', font: 'Lora', home: ['heading', 'col_editorial', 'textbox', 'feat_col_editorial', 'divider', 'newsletter'] },
  { id: 's-limelight', name: 'Limelight', tag: 'Single product', bestFor: 'Best for: shops built around one hero product.', font: 'Inter', home: ['feat_product', 'prod_hotspots', 'multicolumn', 'testimonials', 'faq'] },
  { id: 's-ledgerline', name: 'Ledgerline', tag: 'Wholesale', bestFor: 'Best for: B2B and wholesale with fast re-ordering.', font: 'Inter', home: ['heroM', 'multicolumn', 'col_grid', 'featured', 'faq', 'contactform'] },
] as const;
export const DEFAULT_THEME = THEME_LIBRARY[0];
// Retired names (old Sellora originals and earlier names). Stores using them move to Daybreak.
export const RETIRED = ['Dawn', 'Ember', 'Tide', 'Orchard', 'Noir', 'Bloom', 'Slate', 'Sunset', 'Mint', 'Ink', 'Aurora', 'Sand'];
export function defaultThemeData(storeId: string, heading: string) {
  const t = DEFAULT_THEME;
  return { storeId, name: t.name, live: true, preset: t.id, palette: { bg: '#FFFFFF', tx: '#121212', ac: '#2E6B4F', sec: '#F2C14E' }, settings: { font: t.font, tag: t.tag, bestFor: t.bestFor }, sections: { home: t.home.map((type, i) => ({ type, settings: i === 0 ? { heading } : {} })) } };
}
export async function migrateThemes(storeId: string) {
  const themes = await db.theme.findMany({ where: { storeId } });
  let moved = 0;
  for (const th of themes) {
    if (!RETIRED.includes(th.name)) continue;
    const t = DEFAULT_THEME;
    if (th.live) await db.theme.update({ where: { id: th.id }, data: { name: t.name, preset: t.id } });
    else await db.theme.delete({ where: { id: th.id } });
    moved++;
  }
  if (!(await db.theme.findFirst({ where: { storeId, live: true } }))) {
    const any = await db.theme.findFirst({ where: { storeId } });
    if (any) await db.theme.update({ where: { id: any.id }, data: { live: true } });
    else await db.theme.create({ data: defaultThemeData(storeId, 'Welcome') as any });
  }
  return moved;
}
