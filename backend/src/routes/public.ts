import { Router } from 'express';
import { db } from '../lib/db';
import { ah, nf } from '../lib/http';
import { sitemap, robots, llmsTxt, jsonLd } from './ai';
import { config } from '../lib/config';
import { isPrivate, prefsOf, messageOf, checkPassword, unlockToken, verifySignature } from '../lib/storeAccess';
export const r = Router();
const shop = async (h: string) => { const s = await db.store.findFirst({ where: { OR: [{ handle: h }, { id: h }] } }); if (!s) throw nf(); return s; };
const x = (s: string) => String(s ?? '').replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' } as any)[c]);
r.get('/s/:shop/sitemap.xml', ah(async (req, res) => res.type('application/xml').send(await sitemap((await shop(req.params.shop)).id))));
r.get('/s/:shop/robots.txt', ah(async (req, res) => res.type('text/plain').send(await robots((await shop(req.params.shop)).id))));
r.get('/s/:shop/llms.txt', ah(async (req, res) => res.type('text/plain').send(await llmsTxt((await shop(req.params.shop)).id))));
r.get('/s/:shop/json-ld', ah(async (req, res) => res.json(await jsonLd((await shop(req.params.shop)).id))));
/** Google Merchant Center & Meta catalog (RSS 2.0 + g: namespace) */
r.get('/feeds/:shop/:kind(google|meta).xml', ah(async (req, res) => {
  const s = await shop(req.params.shop); const ps = await db.product.findMany({ where: { storeId: s.id, status: 'active' }, include: { variants: true } });
  const items = ps.flatMap(p => p.variants.map(v => `<item><g:id>${x(v.sku || v.id)}</g:id><g:item_group_id>${p.id}</g:item_group_id><title>${x(p.title + (v.title !== 'Default' ? ' - ' + v.title : ''))}</title><description>${x(p.description.replace(/<[^>]+>/g, ''))}</description><link>${config.publicUrl}/s/${s.handle}/products/${p.handle}</link><g:image_link>${x(((p.images as string[]) || [])[v.imageIndex ?? 0] || '')}</g:image_link><g:price>${((v.price ?? p.price) / 100).toFixed(2)} ${s.currency}</g:price><g:availability>${v.inventory > 0 ? 'in_stock' : 'out_of_stock'}</g:availability><g:condition>new</g:condition><g:brand>${x(p.vendor || s.name)}</g:brand></item>`));
  res.type('application/xml').send(`<?xml version="1.0"?>\n<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel><title>${x(s.name)}</title><link>${config.publicUrl}/s/${s.handle}</link>\n${items.join('\n')}\n</channel></rss>`);
}));
/** Embeddable checkout: <script src="/embed.js" data-key="pk_..." data-link="LINK_ID"> renders a pay button. */
r.get('/embed.js', (_req, res) => res.type('application/javascript').send(`(function(){var s=document.currentScript,k=s.dataset.key,l=s.dataset.link,api=${JSON.stringify(config.publicUrl)};var box=document.getElementById('vendom-checkout')||s.parentNode;fetch(api+'/api/storefront/'+k+'/pay/'+l).then(function(r){return r.json()}).then(function(d){var b=document.createElement('button');b.textContent='Pay '+(d.amount/100).toFixed(2)+' '+d.currency+' with VendOm Pay';b.style.cssText='background:#0B6B3A;color:#fff;border:0;border-radius:8px;padding:12px 18px;font:600 15px system-ui;cursor:pointer';b.onclick=function(){var e=prompt('Email for receipt');if(!e)return;fetch(api+'/api/pay/links/'+l+'/pay',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':l+':'+e+':'+Date.now()},body:JSON.stringify({email:e,source:'tok_visa'})}).then(function(r){return r.json()}).then(function(o){b.textContent=o.number?'Paid — order #'+o.number+' (funds held in escrow)':'Payment failed'})};box.appendChild(b)})})();`));

/** Is the storefront open? Private stores show a password page; signed crawlers (Preferences › Crawler access) get in. */
r.get('/s/:shop/access', ah(async (req, res) => {
  const s = await shop(req.params.shop); const priv = await isPrivate(s); const p = prefsOf(s);
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '');
  const crawler = priv && verifySignature(p, (s as any).domain || `${s.handle}.vendom.app`, req.headers as any) || (priv && host && verifySignature(p, host, req.headers as any));
  const tok = String(req.headers['x-store-unlock'] || '');
  const unlocked = priv && !!tok && tok === unlockToken(s.id, ((s.settings as any) || {}).storePassword || '');
  res.json({ private: priv && !crawler && !unlocked, crawler: !!crawler, name: s.name, message: priv ? messageOf(s) : '', seo: { title: p.title || s.name, description: p.desc || '', image: p.img || '' },
    hreflang: p.hreflang !== false, redirect: { country: p.redirCountry !== false, language: p.redirLang !== false }, captcha: { contact: p.capContact !== false, login: p.capLogin !== false }, trusted: p.trusted || [] });
}));
r.post('/s/:shop/unlock', ah(async (req, res) => {
  const s = await shop(req.params.shop);
  if (!(await isPrivate(s))) return res.json({ ok: true, token: '' });
  if (!checkPassword(s, String((req.body || {}).password || ''))) return res.status(401).json({ ok: false, error: 'Wrong password. Try again.' });
  res.json({ ok: true, token: unlockToken(s.id, ((s.settings as any) || {}).storePassword) });
}));
