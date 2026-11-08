/* ===== v30 App Store & sales channels ===== */
(function(){
var X=window,q=X.SX.q,qa=X.SX.qa,h=X.SX.h,D=X.SX.D,A=X.ACT,PAGE=X.PAGE,pill=X.pill,head=X.xhead,fld=X.xfld,val=X.xval,modal=X.xmodal;
X.HOOKS=X.HOOKS||[];function emit(ev,d){X.HOOKS.forEach(function(f){try{f(ev,d)}catch(e){console.error(e)}})}X.emit=emit;
['place','fulfill','refund','cancel'].forEach(function(k){var f=X.ORD[k];X.ORD[k]=function(){var r=f.apply(this,arguments);if(r)emit({place:'order_created',fulfill:'order_fulfilled',refund:'order_refunded',cancel:'order_cancelled'}[k],k==='place'?r:arguments[0]);return r}});
var CATS=['Sales channels','Marketing & pixels','Analytics','Marketplaces','Email marketing','Reviews & engagement','Customer support','Automation','Shipping & fulfilment','Print on demand'];
function a(id,name,cat,by,desc,fields,auth,feats){return{id:id,name:name,cat:cat,by:by,desc:desc,fields:fields,auth:auth,feats:feats}}
var APPS=X.APPS=[
a('meta','Facebook & Instagram Shop','Sales channels','Meta','Sync your catalog to Facebook & Instagram Shops and tag products in posts.',['Business Manager ID','Catalog ID','Page ID'],'oauth',['Product catalog feed','Instagram product tagging','Shop on Facebook Page']),
a('meta-pixel','Meta Pixel & Conversions API','Marketing & pixels','Meta','Track PageView, ViewContent, AddToCart and Purchase from the browser (Pixel) and server (CAPI).',['Pixel ID','CAPI access token','Test event code'],'key',['Pixel in storefront <head>','CAPI server events (simulated)','Event deduplication IDs']),
a('google','Google & YouTube','Sales channels','Google','Merchant Center product feed, free listings, Performance Max, YouTube shopping.',['Merchant Center ID','Google Ads customer ID'],'oauth',['Merchant Center XML feed','Free listings','Google Ads conversion']),
a('ga4','Google Analytics 4','Analytics','Google','Ecommerce events (view_item, add_to_cart, purchase) sent to GA4.',['Measurement ID (G-XXXX)','API secret'],'key',['gtag.js in <head>','Purchase events']),
a('gsc','Google Search Console','Analytics','Google','Verify your domain and submit sitemap.xml.',['Verification meta content'],'key',['Verification <meta> tag','Sitemap submit']),
a('gtm','Google Tag Manager','Analytics','Google','Load any tags through a GTM container.',['Container ID (GTM-XXXX)'],'key',['GTM container in <head>','dataLayer ecommerce events']),
a('tiktok','TikTok Shop & Pixel','Sales channels','TikTok','Sell on TikTok Shop and track conversions with TikTok Pixel + Events API.',['Pixel ID','Shop ID','Access token'],'oauth',['Catalog feed','TikTok Pixel in <head>','Events API']),
a('pinterest','Pinterest','Sales channels','Pinterest','Product Pins, catalog sync and Pinterest Tag.',['Tag ID','Ad account ID'],'oauth',['Catalog feed','Pinterest Tag']),
a('snapchat','Snapchat Ads','Marketing & pixels','Snap','Snap Pixel and catalog for dynamic ads.',['Pixel ID'],'key',['Snap Pixel','Catalog feed']),
a('x','X (Twitter)','Marketing & pixels','X Corp','X Pixel for conversion tracking.',['Pixel ID'],'key',['X Pixel','Purchase events']),
a('whatsapp','WhatsApp Business','Customer support','Meta','Chat button on the storefront and order updates over WhatsApp.',['Phone number (E.164)','Cloud API token'],'key',['WhatsApp chat button','Order notifications']),
a('amazon','Amazon Marketplace','Marketplaces','Amazon','List products and sync inventory and orders with Seller Central.',['Seller ID','Marketplace','Refresh token'],'oauth',['Listing sync','Inventory sync','Order import']),
a('ebay','eBay','Marketplaces','eBay','List and sync products on eBay.',['eBay user token'],'oauth',['Listing sync','Inventory sync']),
a('klaviyo','Klaviyo','Email marketing','Klaviyo','Sync customers & orders for flows (welcome, abandoned cart, post-purchase).',['Public API key','Private API key','List ID'],'key',['Customer sync','Order events','Abandoned cart flow']),
a('mailchimp','Mailchimp','Email marketing','Intuit','Sync subscribers and purchase data to an audience.',['API key','Audience ID'],'key',['Subscriber sync','Purchase tags']),
a('reviews','Product Reviews (Judge.me-style)','Reviews & engagement','Sellora','Star ratings and reviews on product pages, review requests after fulfilment.',['Auto-request after N days'],'none',['Stars on product cards','Review form on product page','Review request email']),
a('greviews','Google Reviews','Reviews & engagement','Google','Show your Google Business rating badge on the storefront.',['Place ID','API key'],'key',['Rating badge in footer']),
a('chat','Live Chat','Customer support','Sellora','Chat widget on the storefront with an inbox in admin.',['Welcome message','Brand colour'],'none',['Storefront chat widget','Admin inbox']),
a('zapier','Zapier & Webhooks','Automation','Zapier','Send order events to Zapier or any webhook URL.',['Webhook URL','Secret'],'key',['order_created','order_fulfilled','order_refunded','order_cancelled']),
a('shipstation','ShipStation','Shipping & fulfilment','ShipStation','Push orders to ShipStation, buy labels and sync tracking back.',['API key','API secret'],'key',['Order push','Label purchase','Tracking sync']),
a('dhl','DHL Express','Shipping & fulfilment','DHL','DHL label creation and tracking.',['Account number','API key'],'key',['Label creation','Tracking']),
a('fedex','FedEx','Shipping & fulfilment','FedEx','FedEx labels and tracking.',['Account number','API key'],'key',['Label creation','Tracking']),
a('printful','Printful-style Print on Demand','Print on demand','Printful','Create print-on-demand products; orders are forwarded for printing automatically.',['API key'],'key',['POD product templates','Automatic order forwarding']),
a('google-ads','Google Ads Conversions','Marketing & pixels','Google','Upload offline click conversions (gclid) for purchases via Google Ads API.',['Customer ID','Conversion action ID','Developer token'],'oauth',['Click conversion upload','Enhanced conversions (hashed email)']),
a('tcs','TCS Courier','Shipping & fulfilment','TCS','Book COD shipments, print airway bills and track parcels with TCS Pakistan.',['Client ID','Username','Password','Cost centre code'],'key',['COD booking','Airway bill','Tracking','COD reconciliation']),
a('leopards','Leopards Courier','Shipping & fulfilment','Leopards','Book packets, track and fetch COD payment details from Leopards Courier.',['API key','API password'],'key',['bookPacket','trackBookedPacket','COD payment details']),
a('postex','PostEx','Shipping & fulfilment','PostEx','COD order booking with upfront payment and tracking via PostEx.',['API token','Pickup address code'],'key',['COD booking','Tracking','Upfront COD payouts']),
a('trax','Trax (Sonic)','Shipping & fulfilment','Trax','Book shipments and track via Trax Sonic API.',['API key','Pickup address ID'],'key',['Shipment booking','Tracking']),
a('xero','Xero Accounting','Accounting','Xero','Push paid orders to Xero as invoices.',['Tenant ID'],'oauth',['Invoice sync','Contact mapping']),
a('quickbooks','QuickBooks Online','Accounting','Intuit','Push paid orders to QuickBooks as sales receipts.',['Realm ID'],'oauth',['Sales receipt sync','Webhook verification'])];
function st(){if(!S.apps2)S.apps2={};return S.apps2}
function ap(id){return st()[id]}function inst(id){var s=ap(id);return !!(s&&s.on)}X.appOn=inst;
function feedXML(kind){var b='https://'+slug()+'.sellora.app';return '<?xml version="1.0"?>\n<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0"><channel>\n<title>'+h(S.name)+' - '+h(kind)+' product feed</title><link>'+b+'</link>\n'+S.products.filter(function(p){return p.status==='Active'}).map(function(p){var vs=p.vars||[];var items=vs.length?vs.map(function(v,i){return{id:(v.sku||p.id+'-'+i),t:p.name+' - '+v.n,pr:+v.price||+p.price,q:+v.qty||0,g:p.id}}):[{id:p.sku||String(p.id),t:p.name,pr:+p.price,q:+p.stock||0}];return items.map(function(i){return '<item><g:id>'+h(i.id)+'</g:id>'+(i.g?'<g:item_group_id>'+i.g+'</g:item_group_id>':'')+'<g:title>'+h(i.t)+'</g:title><g:description>'+h(String(p.desc||'').replace(/<[^>]+>/g,' ').trim().slice(0,500))+'</g:description><g:link>'+b+'/products/'+(p.handle||p.id)+'</g:link>'+((p.imgs||[])[0]?'<g:image_link>'+h(p.imgs[0])+'</g:image_link>':'')+'<g:price>'+(+i.pr||0).toFixed(2)+' USD</g:price><g:availability>'+(i.q>0?'in_stock':'out_of_stock')+'</g:availability><g:brand>'+h(S.name)+'</g:brand><g:condition>new</g:condition></item>'}).join('\n')}).join('\n')+'\n</channel></rss>'}
X.feedXML=feedXML;
function lg(id,t){var s=ap(id);(s.log=s.log||[]).unshift({t:t,at:Date.now()});if(s.log.length>40)s.log.length=40}
function sync(id){var s=ap(id),x=APPS.filter(function(z){return z.id===id})[0];var msg=(x?x.name:id)+' was not synced. No server credential is configured, so nothing was sent.';lg(id,msg);save();return msg}
X.HOOKS.push(function(ev,d){if(!d)return;Object.keys(st()).forEach(function(id){var s=st()[id];if(!s.on)return;
 if(id==='zapier')lg(id,'Webhook '+ev+' #'+d.id+' was not sent. No server credential is configured.');
 if(/klaviyo|mailchimp/.test(id)&&ev==='order_created')lg(id,'Placed Order was not sent for '+d.email+'. No server credential is configured.');
 if(/^(meta-pixel|tiktok|ga4|pinterest|snapchat|x|gtm)$/.test(id)&&ev==='order_created')lg(id,'Purchase event was not sent for order '+d.id+'. No server credential is configured.');
 if(id==='printful'&&ev==='order_created')lg(id,'Order #'+d.id+' was not forwarded for printing. No server credential is configured.');
 if(/amazon|ebay/.test(id)&&(ev==='order_created'||ev==='order_refunded'))lg(id,'Inventory was not updated after #'+d.id+'. No server credential is configured.');
 if(id==='shipstation'&&ev==='order_created')lg(id,'Order #'+d.id+' was not pushed. No server credential is configured.');
 if(id==='reviews'&&ev==='order_fulfilled'&&d.email)X.API.email(d.email,'How was your order #'+d.id+'?','We would love your review: https://'+slug()+'.sellora.app/products/'+((prod((d.items[0]||{}).pid)||{}).handle||'')+'#reviews','review_request')});save()});
X._apps={st:st,ap:ap,inst:inst,sync:sync,lg:lg,CATS:CATS};
})();
