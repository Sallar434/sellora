/* m14: Sellora theme library — only the Sellora free themes, each with its own specialty. */
(function(){var X=window;
var OLD=['dawn','ember','tide','orchard','noir','bloom','slate','sunset','mint','ink','aurora','sand'];
// id: [name, bestFor, tag, font, lay, rad, bg, tx, ac, home[], header{}, footer{}, product{}, announce]
var L={
's-daybreak':['Daybreak','Best for: a clean, image-first general store.','Minimal','s','c',0,'#FFFFFF','#121212','#2E6B4F',
 [['heroB',{h:'New season, simply made',ht:540}],['featured',{ratio:'Portrait',cols:4}],['imgtext'],['multicolumn'],['email_signup']],
 {menu:'Shop\nCollections\nAbout\nContact',sticky:true,srch:true},{news:true},{lay:'Image left',imgw:60,hs:30},'Free shipping on your first order'],
's-renew':['Renew','Best for: energetic brands that love bold colour.','Bold & bright','d','b',24,'#EEF7F1','#14281D','#FF5D3A',
 [['slideF'],['promo'],['col_bento'],['featured',{ratio:'Square',cols:3}],['testimonials'],['newsletter']],
 {sticky:true,sz:17,pad:18},{news:true,sz:15},{lay:'Image left',imgw:55,btn:'Get it now'},'New drops every Friday'],
's-serene':['Serene','Best for: wellness, skincare and beauty.','Wellness','f','s',32,'#FDF6F0','#4A3B3F','#C98B8B',
 [['heroM',{al:'Center',ht:460}],['multicolumn',{h:'Why you will love it'}],['prod_highlight'],['testimonials'],['faq'],['email_signup']],
 {menu:'Shop\nRituals\nIngredients\nContact',sz:14},{news:true,nt:'Slow down with us'},{lay:'Image right',imgw:50,hs:28,btn:'Add to routine'},'Gentle on skin, kind to the planet'],
's-hearthwork':['Hearthwork','Best for: handmade goods with a story behind them.','Handmade','f','c',6,'#F5EFE6','#2F2A24','#8A6D3B',
 [['imgtext'],['text'],['col_editorial'],['featured',{ratio:'Square'}],['testimonials'],['contactform']],
 {menu:'Shop\nOur makers\nJournal\nContact'},{txt:'Every piece is made by hand in small batches.'},{lay:'Image left',imgw:55,btn:'Add to basket'},'Handmade in small batches'],
's-munchbox':['Munchbox','Best for: playful food, snacks and drinks brands.','Food & drink','d','b',20,'#FFE8D6','#3D2C2E','#FF6F59',
 [['heroB',{h:'Snack happy',ht:480}],['promo'],['col_carousel'],['featured',{ratio:'Square',cols:3}],['imgbanner'],['newsletter']],
 {sticky:true,cart:true,sz:16},{news:true,nt:'Get tasty deals'},{lay:'Image right',imgw:50,btn:'Grab it'},'Order by 2pm for same-day dispatch'],
's-gallery':['Gallery','Best for: artists, photographers and portfolios.','Art & portfolio','s','s',0,'#FFFFFF','#111111','#7C3AED',
 [['slideI'],['col_spotlight'],['imgbanner'],['feat_col_editorial'],['text']],
 {menu:'Work\nPrints\nAbout',acct:false,sz:13},{news:false},{lay:'Image left',imgw:70,hs:24,btn:'Buy print'},''],
's-palate':['Palate','Best for: food sellers who share recipes and stories.','Recipes','f','c',10,'#FFFDF7','#2B2B2B','#E09F3E',
 [['heroM',{ht:440}],['split'],['textbox',{h:'From our kitchen'}],['featured'],['faq'],['email_signup']],
 {menu:'Shop\nRecipes\nOur story\nContact'},{news:true,nt:'Weekly recipes'},{lay:'Image left',imgw:50,btn:'Add to pantry'},'New recipe every week'],
's-blockparty':['Block Party','Best for: bold brands built on blocks of colour.','Colour blocks','d','b',0,'#FFBE0B','#1B1B1B','#3A86FF',
 [['heroB',{ht:520}],['col_grid'],['promo'],['featured',{ratio:'Square',cols:4}],['split'],['largelogo']],
 {sz:18,pad:20},{sz:16},{lay:'Image right',imgw:50,hs:44},'Loud colours. Louder deals.'],
's-throttle':['Throttle','Best for: action, sports and outdoor gear.','Sports','d','b',2,'#111111','#F2F2F2','#FF5A1F',
 [['heroB',{eyb:'Built for speed',h:'Ride harder',ht:680}],['col_carousel'],['prod_highlight'],['featured',{ratio:'Landscape',cols:3}],['imgbanner'],['largelogo']],
 {sticky:true,srch:true,sz:15},{news:true,nt:'Join the crew'},{lay:'Image left',imgw:65,hs:40,btn:'Gear up'},'Track-tested gear'],
's-source':['Source','Best for: artisanal makers who lead with their story.','Artisanal','f','s',4,'#F4F1EA','#2A2A2A','#6B8F71',
 [['imgtext'],['textbox',{h:'Where it comes from'}],['prod_hotspots'],['col_text'],['testimonials'],['email_signup']],
 {menu:'Shop\nOrigins\nMakers\nContact'},{txt:'Sourced with care, made to last.'},{lay:'Image right',imgw:55},'Traceable from source to shelf'],
's-folio':['Folio','Best for: books, magazines and text-led shops.','Editorial','f','s',0,'#FBFBF8','#1A1A1A','#B91C1C',
 [['heading'],['col_editorial'],['textbox'],['feat_col_editorial'],['divider'],['newsletter']],
 {menu:'Books\nAuthors\nReviews\nAbout',srch:true,sz:14},{news:true,nt:'The reading list'},{lay:'Image right',imgw:35,hs:40,btn:'Add to shelf'},''],
's-limelight':['Limelight','Best for: shops built around one hero product.','Single product','s','s',12,'#FFFFFF','#222222','#2E6B4F',
 [['feat_product'],['prod_hotspots'],['multicolumn'],['testimonials'],['faq']],
 {menu:'Product\nHow it works\nFAQ',sz:15},{news:false,txt:'One product, done right.'},{lay:'Image left',imgw:60,hs:44,btn:'Buy now'},'30-day money-back promise'],
's-ledgerline':['Ledgerline','Best for: B2B and wholesale with fast re-ordering.','Wholesale','s','c',4,'#FFFFFF','#0F172A','#2E6B4F',
 [['heroM',{ht:300}],['multicolumn'],['col_grid'],['featured',{ratio:'Square',cols:6,n:16}],['faq'],['contactform']],
 {menu:'Catalog\nQuick order\nAccount\nContact',srch:true,sticky:true,sz:13,pad:8},{sz:12},{lay:'Image left',imgw:35,hs:22,btn:'Add to quote'},'Wholesale pricing on 10+ units']
};
// Older Sellora free themes kept, renamed so no names echo other platforms.
var RN2={'s-tinkerer':'Workbench','s-atelierra':'Seamline','s-dwelling':'Roomly','s-pitchline':'Sprint'};
var EXTRA={'s-meridian':['Best for: a flexible modern store.','Modern'],'s-tinkerer':['Best for: gadgets and DIY kits.','Gadgets'],'s-legacy':['Best for: classic heritage brands.','Classic'],'s-atelierra':['Best for: fashion and apparel.','Fashion'],'s-ascend':['Best for: fast-growing lifestyle brands.','Lifestyle'],'s-vase':['Best for: home decor and ceramics.','Decor'],'s-dwelling':['Best for: furniture and interiors.','Interiors'],'s-relish':['Best for: gourmet and speciality food.','Gourmet'],'s-rite':['Best for: candles and self-care.','Self-care'],'s-weave':['Best for: textiles and clothing.','Textiles'],'s-pitchline':['Best for: team and fan merchandise.','Fan merch']};
var MAP={'s-sensa':'s-serene','s-handmade':'s-hearthwork','s-craving':'s-munchbox','s-press':'s-folio','s-bulk':'s-ledgerline'};
function sec(a){return{id:uid(),type:a[0],hide:false,s:Object.assign({},a[1]||{})}}
function set(list,type,o){(list||[]).forEach(function(x){if(x.type===type)Object.assign(x.s,o)})}
function build(id){var f=L[id],t={id:id,name:f[0],desc:f[1],tag:f[2],font:f[3],lay:f[4],rad:f[5],bg:f[6],tx:f[7],ac:f[8],free:true,v14:1,c:{},
 presets:[[f[6],f[7],f[8]],['#FFFFFF','#1B1B1B',f[8]],['#111111','#F2F2F2',f[8]]]};initT(t);
 t.pg.home=f[9].filter(function(a){return typeof RN==='undefined'||RN[a[0]]}).map(sec);
 set(t.hdr,'header',f[10]);set(t.ftr,'footer',f[11]);set(t.pg.product,'prodinfo',f[12]);
 if(f[13])set(t.hdr,'announce',{msg:f[13]});else t.hdr=t.hdr.filter(function(x){return x.type!=='announce'});return t}
X.M14_LIB=L;X.m14build=build;
function mig(){if(!S||!S.themes)return;var live=S.live,changed=false;
 S.themes=S.themes.filter(function(t){var gone=OLD.indexOf(t.id)>=0||(MAP[t.id]&&t.free);if(gone)changed=true;return !gone});
 if(MAP[live])live=MAP[live];
 Object.keys(L).forEach(function(id){var i=-1;S.themes.forEach(function(t,j){if(t.id===id)i=j});
  if(i<0){S.themes.push(build(id));changed=true}else if(!S.themes[i].v14){var o=S.themes[i],n=build(id);if(id===S.live){n.pg=o.pg;n.hdr=o.hdr;n.ftr=o.ftr}S.themes[i]=n;changed=true}});
 S.themes.forEach(function(t){if(t.free){t.inspired=null;if(RN2[t.id])t.name=RN2[t.id];if(EXTRA[t.id]&&!t.tag){t.desc=EXTRA[t.id][0];t.tag=EXTRA[t.id][1]}}});
 if(!S.themes.some(function(t){return t.id===live}))live='s-daybreak';
 if(live!==S.live){S.live=live;changed=true}
 if(changed&&typeof sv==='function')try{sv()}catch(e){}}
X.m14mig=mig;
if(X.M9_FREE)X.M9_FREE.forEach(function(f){if(MAP[f[0]]){var n=L[MAP[f[0]]];f[0]=MAP[f[0]];f[1]=n[0]}if(RN2[f[0]])f[1]=RN2[f[0]];f[2]=''});
try{mig()}catch(e){console.error('m14',e)}
var _f=fresh;fresh=function(){var r=_f.apply(this,arguments);try{mig()}catch(e){}return r};
function lum(c){var m=(c||'').match(/\d+(\.\d+)?/g);if(!m||m.length<3||(m.length>3&&+m[3]===0))return null;var a=m.slice(0,3).map(function(v){v=v/255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)});return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2]}
function fixBtn(){Array.prototype.forEach.call(document.querySelectorAll('.sb'),function(e){var L=lum(getComputedStyle(e).backgroundColor);if(L===null)return;var f=lum(getComputedStyle(e).color);if(f===null)return;var cr=(Math.max(L,f)+0.05)/(Math.min(L,f)+0.05);if(cr<4.5)e.style.color=L>0.18?'#000000':'#FFFFFF'})}
X.m14fixBtn=fixBtn;var _sf=sf;sf=function(){var o=_sf.apply(this,arguments);setTimeout(fixBtn,30);return o};X.onRoute(function(){setTimeout(fixBtn,0);setTimeout(fixBtn,120)});
X.onRoute(function(r){if(r==='themes'||r==='online-store-themes')try{mig()}catch(e){}});
})();
