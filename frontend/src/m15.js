/* Sellora store builder: typed and spoken commands write real products, collections, and theme sections.
   DeepSeek is the default model when a key is configured. Claude is used first only if an Anthropic key is set.
   With no key, the same intents run locally so the static storefront still builds. */
(function(){
var X=window,A=X.ACT=X.ACT||{};
var VOICE_MSG='Voice input is not available in this browser. Type your request instead.';
var PAGES={home:1,catalog:1,collection:1,product:1,contact:1,signin:1};
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function attr(s){return esc(s).replace(/'/g,'&#39;')}
function xml(s){return esc(s)}
function sluggy(s){return String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'item'}
function titleCase(s){return String(s||'').replace(/\s+/g,' ').trim().replace(/\b[a-z]/g,function(c){return c.toUpperCase()})}
function stripHtml(s){return String(s||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()}
function moneyLine(n){var c=(S&&S.cur)||'USD';var bit;try{bit=money(n)}catch(e){bit=c+' '+n}var name;try{name=X.curL?X.curL(c):c}catch(e){name=c}return bit+' — '+name}
function state(){S.ai15=S.ai15||{};S.ai15.log=S.ai15.log||[];S.ai15.suggestions=S.ai15.suggestions||[];return S.ai15}
function persist(){try{save()}catch(e){}}
function theme(){var t;try{t=live()}catch(e){t=null}if(!t)return null;try{if(typeof initT==='function')initT(t)}catch(e){}t.hdr=t.hdr||[];t.ftr=t.ftr||[];t.pg=t.pg||{};['home','catalog','collection','product','contact'].forEach(function(p){t.pg[p]=t.pg[p]||[]});t.ts=t.ts||{};return t}
function mk(type,settings){return{id:(typeof uid==='function'?uid():('b'+Date.now().toString(36)+Math.random().toString(36).slice(2,6))),type:type,hide:false,s:Object.assign({},settings||{})}}
function svgUri(w,h,body){return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'">'+body+'</svg>')}
function art(title,sub,accent,w,h){
  accent=accent||'#1F2937';
  var t=xml(String(title||'').slice(0,48)),s=xml(String(sub||'').slice(0,92));
  var size=String(title||'').length>28?48:64;
  return svgUri(w,h,
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+accent+'"/><stop offset="1" stop-color="#141414"/></linearGradient></defs>'
    +'<rect width="'+w+'" height="'+h+'" fill="url(#g)"/>'
    +'<circle cx="'+(w*0.84)+'" cy="'+(h*0.22)+'" r="'+(h*0.24)+'" fill="#F2C14E"/>'
    +'<circle cx="'+(w*0.1)+'" cy="'+(h*0.85)+'" r="'+(h*0.16)+'" fill="#ffffff" opacity="0.12"/>'
    +'<rect x="'+(w*0.06)+'" y="'+(h*0.34)+'" width="'+(w*0.08)+'" height="8" fill="#F2C14E"/>'
    +'<text x="'+(w*0.06)+'" y="'+(h*0.52)+'" fill="#ffffff" font-family="Georgia,serif" font-size="'+size+'" font-weight="700">'+t+'</text>'
    +(s?'<text x="'+(w*0.06)+'" y="'+(h*0.64)+'" fill="#ffffff" font-family="Georgia,serif" font-size="26" opacity="0.92">'+s+'</text>':'')
  );
}
function banner(title,sub,accent){return art(title,sub,accent,1600,700)}
function cover(title,sub,accent){return art(title,sub,accent,1400,800)}
function productArt(name,accent,i){
  var pal=['#1F2937','#C2410C','#2E6B4F','#1F4E8C','#7A3E5D','#8A4B12','#0F766E','#6F42C1'];
  return art(name,'',accent||pal[i%pal.length],800,800);
}
var LINES={
  boxing:{words:['boxing','boxer','pugilism'],accent:'#C2410C',blurb:'Gear for training, sparring, and fight night.',
    products:[['Boxing Gloves',49,'Padded gloves for bag work and sparring.'],['Hand Wraps',12,'Elastic wraps that lock the wrist before the gloves go on.'],['Heavy Bag',89,'A hanging bag for power rounds at home or in the gym.'],['Speed Bag',34,'A small bag for timing and shoulder stamina.'],['Mouthguard',15,'A boil-and-bite guard for sparring days.'],['Jump Rope',18,'A ball-bearing rope for warm-ups.'],['Headgear',45,'Padded headgear for partner drills.'],['Boxing Shoes',64,'Light shoes with a pivot-friendly sole.']],
    gloves:[['Training Boxing Gloves',49,'Daily bag gloves with a firm wrist wrap.'],['Sparring Boxing Gloves',69,'Softer foam for partner work.'],['Bag Boxing Gloves',44,'Compact gloves that protect the knuckles on the heavy bag.'],['Competition Boxing Gloves',79,'Tight, fight-day gloves with a clean profile.'],['Kids Boxing Gloves',29,'A lighter pair sized for younger boxers.'],['Lace-Up Boxing Gloves',74,'Lace-up cuffs for a locked-in wrist.'],['Inner Gloves',16,'Thin gloves worn under hand wraps.'],['Glove Deodorizer',11,'Cedar inserts that keep gloves fresh.']]},
  shoes:{words:['shoe','shoes','sneaker','footwear','boot'],accent:'#C2410C',blurb:'Footwear for everyday miles and long days.',
    products:[['Trail Runner',79,'A grippy shoe for mixed paths.'],['Leather Sneaker',99,'A plain leather sneaker for daily wear.'],['Slip-On',59,'An easy shoe with a cushioned footbed.'],['Merino Socks',16,'A three-pack of breathable socks.'],['Canvas Court Shoe',54,'A low court shoe with a rubber toe.'],['Rain Boot',48,'A waterproof boot for wet commutes.'],['House Shoe',32,'A soft shoe for indoor days.'],['Shoe Care Kit',22,'Brush, cloth, and cream.']]},
  coffee:{words:['coffee','cafe','espresso','roast'],accent:'#6B3E26',blurb:'Fresh coffee and the tools to brew it.',
    products:[['House Espresso',16,'Chocolate and caramel, medium-dark.'],['Single-Origin Beans',18,'A rotating light roast.'],['Pour-Over Kit',42,'Dripper, filters, and a scoop.'],['Cold Brew Bags',14,'Steep-and-chill packs.'],['Ceramic Mug',19,'A wide mug for a long cup.'],['Milk Pitcher',24,'A small pitcher for home drinks.'],['Paper Filters',9,'A box of unbleached filters.'],['Coffee Subscription',36,'Two bags, delivered monthly.']]},
  beauty:{words:['beauty','skincare','serum','makeup','cosmetic'],accent:'#7A3E5D',blurb:'Simple routines with honest formulas.',
    products:[['Glow Serum',28,'A daily serum for dull skin.'],['Face Wash',14,'A gentle wash for morning and night.'],['Lip Balm',8,'A tinted balm with shea.'],['Day Cream',24,'A light moisturizer with SPF-free comfort.'],['Clay Mask',18,'A weekly mask for oily days.'],['Body Oil',22,'A fast-absorbing oil.'],['Eye Cream',26,'A small jar for the under-eye.'],['Travel Kit',32,'Wash, serum, and cream in minis.']]},
  fashion:{words:['fashion','clothing','apparel','shirt','dress','tee'],accent:'#111827',blurb:'Clothes meant to be worn often.',
    products:[['Cotton Tee',24,'A heavyweight tee with a clean neck.'],['Linen Shirt',48,'A breathable shirt for warm days.'],['Wide Trousers',62,'A straight trouser with a soft drape.'],['Canvas Tote',22,'A daily tote with an inner pocket.'],['Knit Cap',18,'A merino cap.'],['Wool Scarf',36,'A light scarf.'],['Denim Jacket',88,'A straight jacket with metal buttons.'],['Leather Belt',34,'A simple belt, punched to fit.']]},
  food:{words:['food','bakery','tea','honey','spice','snack'],accent:'#8A4B12',blurb:'Pantry goods packed to travel well.',
    products:[['Wildflower Honey',18,'A jar of raw honey.'],['Chai Blend',12,'Black tea with ginger and cardamom.'],['Sea Salt',6,'Flaky salt in a tin.'],['Olive Oil',22,'A 500 ml tin.'],['Granola',11,'Oats, nuts, and a little sugar.'],['Hot Sauce',9,'A small bottle with chile and garlic.'],['Shortbread',8,'A box of butter biscuits.'],['Gift Crate',40,'Honey, tea, and biscuits together.']]},
  home:{words:['home','decor','furniture','candle','kitchen'],accent:'#5B6B3A',blurb:'Objects for a lived-in home.',
    products:[['Ceramic Vase',32,'A hand-thrown vase.'],['Soy Candle',16,'A cotton-wick candle.'],['Linen Throw',54,'A washed linen throw.'],['Oak Spoon Set',20,'Three cooking spoons.'],['Stoneware Bowl',28,'A deep everyday bowl.'],['Wool Cushion',36,'A square cushion cover.'],['Wall Hook',14,'A solid-brass hook.'],['Table Lamp',68,'A linen shade and a ceramic base.']]}
};
function matchLine(subject){
  var s=String(subject||'').toLowerCase();
  var best=null;
  Object.keys(LINES).forEach(function(k){if(LINES[k].words.some(function(w){return s.indexOf(w)>=0}))best=LINES[k]});
  if(!best)return null;
  if(best.gloves&&/glove/.test(s))return {accent:best.accent,blurb:'A full glove wall, from bag work to fight night.',items:best.gloves};
  return {accent:best.accent,blurb:best.blurb,items:best.products};
}
function variantsOf(subject){
  var name=titleCase(subject);
  var mods=[['Training '+name,42,'A daily '+name.toLowerCase()+' for regular use.'],['Pro '+name,68,'A step-up '+name.toLowerCase()+' with a firmer build.'],['Starter '+name,29,'An entry '+name.toLowerCase()+' if you are just starting.'],['Travel '+name,36,'A compact '+name.toLowerCase()+' that packs flat.'],['Gift '+name,54,'A boxed '+name.toLowerCase()+' ready to give.'],['Kids '+name,24,'A smaller '+name.toLowerCase()+' for younger customers.'],['Everyday '+name,39,'The '+name.toLowerCase()+' most people reorder.'],['Limited '+name,74,'A small-run '+name.toLowerCase()+' with a numbered tag.']];
  return {accent:'#1F2937',blurb:name+' and the pieces that belong with it.',items:mods};
}
function catalogFor(subject){return matchLine(subject)||variantsOf(subject)}
function findCol(name){
  var n=String(name||'').toLowerCase();
  return (S.collections||[]).filter(function(c){return String(c.title||'').toLowerCase()===n||String(c.handle||'')===sluggy(name)})[0]||null;
}
function upsertPage(handle,title,html){
  S.pages=S.pages||[];
  var p=S.pages.filter(function(x){return x.h===handle})[0];
  if(p){p.t=title;p.b=html;p.html=true;p.vis=true}
  else S.pages.push({h:handle,t:title,b:html,html:true,vis:true});
}
function linkMenu(title){
  S.menusList=S.menusList||[];
  var m=S.menusList.filter(function(x){return x.handle==='main-menu'})[0];
  if(!m){m={title:'Main menu',handle:'main-menu',items:'Home, Catalog, Contact'};S.menusList.unshift(m)}
  var links=(m.links&&m.links.length)?m.links.slice():[{n:'Home',to:'home'},{n:'Catalog',to:'catalog'},{n:'Contact',to:'contact'}];
  function has(to,n){return links.some(function(l){return l.to===to||String(l.n).toLowerCase()===String(n).toLowerCase()})}
  if(title&&!has('collection:'+title,title)){var i=links.findIndex(function(l){return l.to==='catalog'||l.to==='home'});links.splice(i<0?links.length:i+1,0,{n:title,to:'collection:'+title})}
  if(!has('page:about','About'))links.push({n:'About',to:'page:about'});
  if(!has('contact','Contact'))links.push({n:'Contact',to:'contact'});
  m.links=links;m.items=links.map(function(l){return l.n}).join(', ');
  var t=theme();if(!t)return;
  var hd=(t.hdr||[]).filter(function(s){return s.type==='header'})[0];
  if(hd){var lines=String(hd.s.menu||'Home\nCatalog\nContact').split('\n').map(function(x){return x.trim()}).filter(Boolean);
    if(title&&!lines.some(function(l){return l.toLowerCase().indexOf(title.toLowerCase())===0}))lines.splice(Math.min(2,lines.length),0,title);
    if(!lines.some(function(l){return /^about/i.test(l)}))lines.push('About');
    if(!lines.some(function(l){return /^contact/i.test(l)}))lines.push('Contact');
    hd.s.menu=lines.join('\n')}
  var ft=(t.ftr||[]).filter(function(s){return s.type==='footer'})[0];
  if(ft){var fl=String(ft.s.menu||'Home\nCatalog\nContact').split('\n').map(function(x){return x.trim()}).filter(Boolean);
    if(title&&!fl.some(function(l){return l.toLowerCase().indexOf(title.toLowerCase())===0}))fl.push(title);
    if(!fl.some(function(l){return /^about/i.test(l)}))fl.push('About');
    ft.s.menu=fl.join('\n')}
}
function bindCollectionPage(t,col){
  if(!t)return;var pg=t.pg.collection;
  var banner=pg.filter(function(s){return s.type==='col_banner'||s.type==='hero'||s.type==='heroB'||s.type==='heroM'||s.type==='imgbanner'})[0];
  if(!banner){banner=mk('col_banner',{});pg.unshift(banner)}
  Object.assign(banner.s,{h:col.title,sub:col.desc||'',img:col.pic||'',ht:banner.s.ht||440,btn:'Shop '+col.title,link:'catalog',fg:banner.s.fg||'#ffffff'});
  var grid=pg.filter(function(s){return s.type==='collection'})[0];
  if(!grid){grid=mk('collection',{});pg.push(grid)}
  Object.assign(grid.s,{col:col.title,n:grid.s.n||12,cols:grid.s.cols||4,price:grid.s.price!==false,atc:true});
  var head=pg.filter(function(s){return s.type==='heading'})[0];
  if(head)Object.assign(head.s,{h:col.title,sub:col.desc||head.s.sub||''});
}
function ensureCollection(title,desc,pic){
  S.collections=S.collections||[];S.cols=S.cols||[];
  var c=findCol(title);
  if(!c){c={id:Date.now()+Math.floor(Math.random()*1000),title:title,handle:sluggy(title),desc:desc,type:'Manual',rules:[],pic:pic||'',metaTitle:(title+' | '+(S.name||'Store')).slice(0,70),metaDesc:String(desc||'').slice(0,160)};S.collections.push(c)}
  else{if(desc)c.desc=desc;if(pic)c.pic=pic;c.handle=c.handle||sluggy(title);c.type=c.type||'Manual';c.rules=c.rules||[];c.metaTitle=c.metaTitle||(title+' | '+S.name).slice(0,70);c.metaDesc=c.metaDesc||String(desc||'').slice(0,160)}
  if(S.cols.indexOf(c.title)<0)S.cols.push(c.title);
  state().focusCol=c.title;
  bindCollectionPage(theme(),c);
  linkMenu(c.title);
  return c;
}
function addProduct(spec,colTitle){
  var existing=(S.products||[]).filter(function(p){return String(p.name).toLowerCase()===spec.name.toLowerCase()})[0];
  if(existing){if(colTitle){existing.cols=existing.cols||[];if(existing.cols.indexOf(colTitle)<0)existing.cols.push(colTitle)}if(spec.img&&!(existing.imgs&&existing.imgs.length))existing.imgs=[spec.img];existing.status='Active';existing.pub=existing.pub!==false;return {p:existing,made:false}}
  var id=S.nid=(S.nid||10)+1;
  var p={id:id,name:spec.name,price:spec.price,cmp:0,stock:spec.stock||24,status:'Active',pub:true,desc:'<p>'+esc(spec.blurb)+'</p><p>Ships with tracked delivery. Payments are protected by Sellora Pay.</p>',cols:colTitle?[colTitle]:[],tags:spec.tags||[],imgs:[spec.img],opts:[],vars:[],handle:sluggy(spec.name),sku:'SL-'+id,type:spec.type||'',vendor:S.name||'',seo:{t:(spec.name+' | '+(S.name||'')).slice(0,60),d:(spec.blurb+' Pay with Sellora Pay.').slice(0,155)}};
  S.products.push(p);return {p:p,made:true};
}
function makeProducts(subject,mode){
  var cat=catalogFor(subject),accent=(theme()&&theme().ac)||cat.accent;
  if(mode==='product'){
    var one=cat.items[0];
    var name=titleCase(subject);
    var row=addProduct({name:name,price:one[1],blurb:name+' from '+(S.name||'our store')+'. '+one[2],img:productArt(name,accent,0),tags:[subject],type:titleCase(subject)},null);
    return {items:[row],accent:accent,blurb:one[2],made:row.made?1:0};
  }
  var items=cat.items.slice(0,8).map(function(row,i){return addProduct({name:row[0],price:row[1],blurb:row[2],img:productArt(row[0],accent,i),tags:[subject],type:titleCase(subject)},titleCase(subject))});
  return {items:items,accent:accent,blurb:cat.blurb,made:items.filter(function(x){return x.made}).length};
}
function heroTypes(s){return /^(hero|heroB|heroM|imgbanner|slideF|slideL|largelogo|split|col_banner)$/.test(s.type)}
function setHero(t,o){
  var home=t.pg.home,h=home.filter(heroTypes)[0];
  if(!h){h=mk('heroB',{});home.unshift(h)}
  Object.assign(h.s,{h:o.heading,sub:o.sub,img:o.img,btn:o.btn||'Shop now',link:o.link||'catalog',eyb:o.eyb||'',fg:h.s.fg||'#ffffff',ht:h.s.ht||520,ov:h.s.ov||28});
  if(h.type==='slideF'||h.type==='slideL'||h.type==='slideI'){h.s.s1i=o.img;h.s.s1h=o.heading;h.s.s1t=o.sub;h.s.s1b=o.btn||'Shop now';h.s.n=h.s.n||'1'}
  h.hide=false;return h;
}
function setFeatured(t,layout,colTitle){
  var home=t.pg.home,types={featured:1,feat_col_carousel:1,feat_col_grid:1,feat_col_editorial:1};
  var want=layout==='grid'?'feat_col_grid':'feat_col_carousel';
  var ex=home.filter(function(s){return types[s.type]&&!s.hide})[0]||home.filter(function(s){return types[s.type]})[0];
  var settings={h:colTitle?('Featured '+colTitle):'Featured products',col:colTitle||'All',n:layout==='grid'?8:6,cols:4,price:true,ratio:'Square',al:'Left',layout:layout==='grid'?'Grid':'Carousel'};
  if(ex){ex.type=want;ex.hide=false;Object.assign(ex.s,settings);home.forEach(function(s){if(s!==ex&&types[s.type])s.hide=true})}
  else{var i=home.findIndex(heroTypes);var s=mk(want,settings);home.splice(i<0?home.length:i+1,0,s);ex=s}
  return ex;
}
function ensureBody(t,o){
  var home=t.pg.home;
  var text=home.filter(function(s){return s.type==='text'||s.type==='imgtext'||s.type==='textbox'})[0];
  if(!text){var i=home.findIndex(heroTypes);text=mk('imgtext',{});home.splice(i<0?1:i+1,0,text)}
  Object.assign(text.s,{h:o.storyTitle,txt:o.story,img:o.img,btn:text.s.btn||'Contact us',link:text.s.link||'contact'});
  text.hide=false;
  var mc=home.filter(function(s){return s.type==='multicolumn'})[0];
  if(!mc){mc=mk('multicolumn',{});home.push(mc)}
  Object.assign(mc.s,{h:mc.s.h||'Why shop with us',n:mc.s.n||'3',c1t:'Fast delivery',c1x:'Tracked shipping on every order.',c2t:'Easy returns',c2x:'Send unused items back within 30 days.',c3t:'Sellora Pay',c3x:'Your payment stays protected until the order arrives.'});
  mc.hide=false;
  var an=(t.hdr||[]).filter(function(s){return s.type==='announce'})[0];
  if(!an){an=mk('announce',{});t.hdr.unshift(an)}
  an.hide=false;an.s.msg=o.announce;an.s.al=an.s.al||'Center';
  var ft=(t.ftr||[]).filter(function(s){return s.type==='footer'})[0];
  if(!ft){ft=mk('footer',{});t.ftr.unshift(ft)}
  Object.assign(ft.s,{txt:o.footer,menu:ft.s.menu||'Home\nCatalog\nContact',news:ft.s.news!==false,nt:ft.s.nt||'Join our newsletter'});
  var util=(t.ftr||[]).filter(function(s){return s.type==='utilities'})[0];
  if(util){util.s.pay=true;if(!util.s.txt)util.s.txt='Payments by Sellora Pay'}
}
function pagesFor(subject,blurb){
  var name=S.name||'Our store';
  upsertPage('about','About us','<p>'+esc(name)+' sells '+esc(subject)+'. '+esc(blurb)+'</p><p>Every order is paid with Sellora Pay, so the payment stays protected until you have the goods.</p>');
  upsertPage('contact','Contact','<p>Questions about '+esc(subject)+'? Email '+esc(S.email||'us')+' or use the form. We reply within one business day.</p>');
}
function buildSite(subject,scope,layout){
  var t=theme();if(!t)return {reply:'Open your store first, then ask again.'};
  var made=makeProducts(subject,scope);
  var col=null,names=[];
  if(scope==='category'){
    col=ensureCollection(titleCase(subject),made.blurb,cover(titleCase(subject),made.blurb,made.accent));
    names=made.items.map(function(x){return x.p.name});
  }else names=[made.items[0].p.name];
  var heading=scope==='category'?titleCase(subject):names[0];
  setHero(t,{heading:heading,sub:made.blurb,img:banner(heading,made.blurb,made.accent),btn:col?('Shop '+col.title):'Shop now',link:col?'collection':'catalog',eyb:S.name||''});
  setFeatured(t,layout,col?col.title:'All');
  ensureBody(t,{storyTitle:'About '+heading,story:made.blurb+' '+((S.name||'We')+' checks every order before it ships.'),img:made.items[0].p.imgs[0],announce:'New: '+heading+' · Pay with Sellora Pay',footer:(S.name||'This store')+' · '+made.blurb+' Returns within 30 days. Payments by Sellora Pay.'});
  pagesFor(subject,made.blurb);
  linkMenu(col?col.title:null);
  state().focusCol=col?col.title:state().focusCol;
  state().last={subject:subject,scope:scope,layout:layout,count:made.made,collection:col?col.title:''};
  var bits=[];
  bits.push(made.made+' product'+(made.made===1?'':'s'));
  if(col)bits.push('a '+col.title+' collection with a cover');
  bits.push('a hero banner');
  bits.push('a featured '+(layout==='grid'?'grid':'carousel'));
  bits.push('a footer');
  var sug=suggestions();
  var reply='Added '+bits.join(', ')+'. Prices from '+moneyLine(Math.min.apply(null,made.items.map(function(x){return +x.p.price||0})))+'.';
  if(sug.length)reply+=' Next: '+sug[0].text;
  return {reply:reply,suggestions:sug,built:true};
}
function placeOnHome(type,settings){
  var t=theme();if(!t)return null;
  if(type==='announce'){var an=(t.hdr||[]).filter(function(s){return s.type==='announce'})[0];if(!an){an=mk('announce',settings);t.hdr.unshift(an)}else Object.assign(an.s,settings);an.hide=false;return an}
  var home=t.pg.home,i=home.findIndex(heroTypes);
  if(/hero|imgbanner|col_banner|promo/.test(type)){
    var h=home.filter(heroTypes)[0];
    if(h&&type!=='promo'){Object.assign(h.s,settings);h.hide=false;return h}
    var b=mk(type,settings);home.splice(i<0?0:i,0,b);return b;
  }
  var s=mk(type,settings);home.splice(i<0?home.length:i+1,0,s);return s;
}
function replaceBlock(type,settings){
  if(typeof E==='undefined'||!E||!E.open||typeof loc!=='function')return null;
  var cur=typeof secOf==='function'?secOf(E.open):null;
  if(!cur||cur.type!=='aiblock')return null;
  var l=loc(cur.id);if(!l)return null;
  var bg=cur.s.bg;
  var n={id:cur.id,type:type,hide:false,s:Object.assign({},settings,{_from:'ai'})};
  if(bg)n.s.bg=bg;
  l.a[l.i]=n;E.open=n.id;return n;
}
function putSection(type,settings){
  if(AIBuild._source==='block'){var n=replaceBlock(type,settings);if(n)return n}
  return placeOnHome(type,settings);
}
function low(s){return String(s||'').toLowerCase().replace(/[.!?]+$/g,'').replace(/\s+/g,' ').trim()}
function flagsOf(text){
  var scope=null,layout=null;
  if(/\b(one|single|just one)\s+product\b|\bjust (this|one) item\b|\ba single item\b|\bonly one product\b/.test(text))scope='product';
  else if(/\b(categor(?:y|ies)|collection of|range of|catalog of|whole (store|line|range|category)|multiple products|a set of|several products)\b/.test(text))scope='category';
  if(/\b(carousel|slider|slideshow)\b/.test(text))layout='carousel';
  else if(/\bgrid\b/.test(text))layout='grid';
  return {scope:scope,layout:layout};
}
function subjectOf(rest){
  return titleCase(String(rest||'').replace(/\b(as a category|as one product|with a grid|with a carousel|with a slider|please)\b/ig,'').replace(/\b(one product|a category|category|carousel|slider|slideshow|grid)\b/ig,'').replace(/^[,:\-]+|[,:\-]+$/g,'').trim());
}
function isAnswer(text,kind){
  var t=low(text);
  if(/^(build|create|add|make|generate|optimi)/.test(t)||t.length>48)return null;
  if(kind==='scope'){
    if(/\b(categor(?:y|ies)|collection|catalog|range|multiple|several)\b/.test(t)||/^(a )?set$|^whole$/.test(t))return 'category';
    if(/\b(product|item)\b/.test(t)||/^(one|single|just one)$/.test(t))return 'product';
  }
  if(kind==='layout'){
    if(/\b(carousel|slider|slideshow)\b/.test(t))return 'carousel';
    if(/\bgrid\b/.test(t))return 'grid';
  }
  return null;
}
function parse(text){
  var raw=String(text||'').trim(),t=low(raw),g=state(),f=flagsOf(t);
  if(g.pending){
    var ans=isAnswer(t,g.pending.kind);
    if(ans)return {kind:'answer',pending:g.pending,value:ans};
    if(/^(yes|yeah|yep|do it|do that|add that|go ahead|ok|okay)$/.test(t)&&g.suggestions&&g.suggestions[0])return {kind:'again',text:g.suggestions[0].cmd};
    if(/^(build|create|make|add|generate|optimi[sz]e|what|suggest)/.test(t))g.pending=null;
    else return {kind:'reask',pending:g.pending};
  }
  if(/^(yes|yeah|yep|do it|do that|add that|go ahead)$/.test(t)&&g.suggestions&&g.suggestions[0])return {kind:'again',text:g.suggestions[0].cmd};
  var m;
  if((m=/^(?:please\s+)?(?:build|create|make|generate|design|set up|setup)\s+(?:me\s+)?(?:a\s+|an\s+|my\s+|the\s+)?(?:full\s+|complete\s+)?(?:website|web\s*site|site|storefront|online store|store|shop)\b(?:\s+(?:for|about|selling|of|called|named))?\s*(.*)$/.exec(t))){
    var sub=subjectOf(m[1]);if(sub.length<2)return {kind:'need',reply:'Tell me what the store is for. For example: build a website for boxing.'};
    return {kind:'site',subject:sub,scope:f.scope,layout:f.layout};
  }
  if((m=/^(?:please\s+)?(?:create|add|make|build)\s+(?:a\s+|an\s+)?collection\s+(?:for|of|called|named|about)?\s*(.+)$/.exec(t)))return {kind:'collection',subject:subjectOf(m[1])};
  if((m=/^(?:please\s+)?(?:add|create|make|generate)\s+(?:a\s+|an\s+)?(?:(hero|promo|promotional|homepage|sale|collection)\s+)?banners?(?:\s+(?:for|about|saying))?\s*(.*)$/.exec(t)))return {kind:'banner',style:m[1]||'hero',subject:subjectOf(m[2]||g.focusCol||S.name||'the store')};
  if(/\bbanners?\b/.test(t)){var style=/promo|sale/.test(t)?'sale':/collection/.test(t)?'collection':'hero';var sm=t.match(/\b(?:for|about|saying)\s+(.+)$/);return {kind:'banner',style:style,subject:subjectOf((sm&&sm[1])||g.focusCol||'New arrivals')}}
  if(/featured/.test(t)&&/(carousel|slider|slideshow|grid)/.test(t))return {kind:'featured',layout:f.layout,subject:subjectOf(t.replace(/.*featured(?:\s+products?)?/,''))||g.focusCol||''};
  if((m=/^(?:please\s+)?(?:add|create|make)\s+(?:a\s+)?featured(?:\s+products?)?(?:\s+(?:section|row))?(?:\s+(?:for|of))?\s*(.*)$/.exec(t)))return {kind:'featured',layout:f.layout,subject:subjectOf(m[1])||g.focusCol||''};
  if((m=/^(?:please\s+)?(?:add|create)\s+(?:an\s+)?announcement(?:\s+bar)?(?:\s+(?:that says|saying|with|:))?\s*(.*)$/.exec(t)))return {kind:'announce',text:m[1]?raw.replace(/^.*?announcement(?:\s+bar)?(?:\s+(?:that says|saying|with|:))?\s*/i,''):'Free shipping on your first order · Pay with Sellora Pay'};
  if((m=/^(?:please\s+)?(?:add|create|make)\s+(?:an?\s+)?(about|contact)(?:\s+us)?\s+page\b/.exec(t)))return {kind:'page',which:m[1]};
  if((m=/^(?:please\s+)?(?:add|put)\s+(.+?)\s+(?:to|in|on)\s+(?:the\s+)?(?:main\s+)?menu$/.exec(t)))return {kind:'menu',subject:subjectOf(m[1])};
  if((m=/^(?:please\s+)?(?:add|create)\s+(?:a\s+)?product\s+(?:called|named)?\s*(.+?)(?:\s+(?:for|at|priced at|price)\s+\$?(\d+(?:\.\d+)?))?$/.exec(t)))return {kind:'product',subject:subjectOf(m[1]),price:m[2]?+m[2]:39};
  if(/optimi[sz]e|speed up|make (?:the )?(?:site|store|homepage) faster|page speed|performance/.test(t))return {kind:'speed'};
  if(/what should i (?:add|do) next|suggest|what(?:'s| is) next|what(?:'s| is) missing|ideas for/.test(t))return {kind:'ideas'};
  if(/trust details|footer details/.test(t))return {kind:'trust'};
  if((m=/^(?:please\s+)?(?:add|create)\s+(?:an?\s+|another\s+)?(faq|newsletter|text|story)\s+section\b/.exec(t)))return {kind:'section',which:m[1],subject:g.focusCol||S.name||'the store'};
  if(/collection highlight|highlight (?:the )?collection/.test(t)){var sm=t.match(/(?:for|of)\s+(.+)$/);return {kind:'highlight',subject:subjectOf(sm?sm[1]:g.focusCol||'')}}
  if((m=/^(?:please\s+)?(?:add|create|make)\s+(?:a\s+|an\s+)?(?:hero|image)\s+(?:banner|section)\s+(?:for|about)?\s*(.*)$/.exec(t)))return {kind:'banner',style:'hero',subject:subjectOf(m[1]||g.focusCol||'New arrivals')};
  return {kind:'none'};
}
function askScope(subject){return 'Is “'+subject+'” one product, or a whole category?'}
function askLayout(){return 'Do you want the featured products as a carousel or a grid?'}
function finishPending(p,patch){
  var g=state();
  var next=Object.assign({},p,patch);
  if(next.intent==='site'){
    if(!next.scope){g.pending={kind:'scope',subject:next.subject,layout:next.layout||null,intent:'site'};return {handled:true,pending:g.pending,reply:askScope(next.subject)};}
    if(!next.layout){g.pending={kind:'layout',subject:next.subject,scope:next.scope,intent:'site'};return {handled:true,pending:g.pending,reply:askLayout()};}
    g.pending=null;var built=buildSite(next.subject,next.scope,next.layout);g.suggestions=built.suggestions||[];return {handled:true,built:true,reply:built.reply,suggestions:g.suggestions};
  }
  if(next.intent==='featured'){
    if(!next.layout){g.pending={kind:'layout',subject:next.subject||'',intent:'featured'};return {handled:true,pending:g.pending,reply:askLayout()};}
    g.pending=null;return runFeatured(next.subject,next.layout);
  }
  g.pending=null;return {handled:true,reply:'Done.'};
}
function runFeatured(subject,layout){
  var t=theme();if(!t)return {handled:true,reply:'Open your store first.'};
  var col=subject?findCol(subject):findCol(state().focusCol||'');
  if(subject&&!col){var made=makeProducts(subject,'category');col=ensureCollection(titleCase(subject),made.blurb,cover(titleCase(subject),made.blurb,made.accent))}
  setFeatured(t,layout,col?col.title:(state().focusCol||'All'));
  var reply='Added a featured '+(layout==='grid'?'grid':'carousel')+(col?' of '+col.title:'')+'.';
  var sug=suggestions();state().suggestions=sug;if(sug[0])reply+=' Next: '+sug[0].text;
  return {handled:true,built:true,reply:reply,suggestions:sug};
}
function runCollection(subject){
  if(!subject)return {handled:true,reply:'What should the collection be called?'};
  var made=makeProducts(subject,'category');
  var col=ensureCollection(titleCase(subject),made.blurb,cover(titleCase(subject),made.blurb,made.accent));
  var reply='Created the '+col.title+' collection with a cover and '+made.made+' products, and a collection page that shows them.';
  var sug=suggestions();state().suggestions=sug;if(sug[0])reply+=' Next: '+sug[0].text;
  return {handled:true,built:true,reply:reply,suggestions:sug};
}
function runBanner(style,subject){
  var t=theme();if(!t)return {handled:true,reply:'Open your store first.'};
  var accent=t.ac||'#1F2937',heading=titleCase(subject||'New arrivals'),sub='Shop '+heading+' · Pay with Sellora Pay';
  var img=banner(heading,sub,accent);
  if(style==='promo'||style==='sale')putSection('promo',{h:heading,sub:sub,btn:'Shop now',link:state().focusCol?'collection':'catalog',bg:accent,fg:'#ffffff'});
  else if(style==='collection'){var c=ensureCollection(heading,sub,cover(heading,sub,accent));putSection('col_banner',{h:c.title,sub:c.desc,img:c.pic,ht:420,btn:'Shop '+c.title,link:'catalog',fg:'#ffffff'})}
  else putSection(AIBuild._source==='block'?'heroB':'heroB',{h:heading,sub:sub,img:img,btn:'Shop now',link:state().focusCol?'collection':'catalog',ht:520,fg:'#ffffff'});
  return {handled:true,built:true,reply:'Added a '+heading+' banner with a headline, subcopy, and artwork.'};
}
function runProduct(subject,price){
  var accent=(theme()&&theme().ac)||'#1F2937';
  var row=addProduct({name:titleCase(subject),price:price||39,blurb:titleCase(subject)+' from '+(S.name||'our store')+'.',img:productArt(titleCase(subject),accent,0),tags:[subject],type:titleCase(subject)},state().focusCol||null);
  return {handled:true,built:true,reply:'Added '+row.p.name+' at '+moneyLine(row.p.price)+' with a picture'+(state().focusCol?' in '+state().focusCol:'')+'.'};
}
function suggestions(){
  var g=state(),out=[],t=theme(),home=(t&&t.pg&&t.pg.home)||[],types=home.filter(function(s){return !s.hide}).map(function(s){return s.type});
  var cols=S.collections||[],prods=(S.products||[]).filter(function(p){return p.status==='Active'}),pages=S.pages||[];
  var focus=g.focusCol||((cols[0]||{}).title)||'';
  if(cols.length<2)out.push({text:'Add a second collection so the menu is not a single shelf'+(focus?' next to '+focus:'')+'.',cmd:'create a collection for '+(focus?focus+' care':'new arrivals')});
  if(!pages.some(function(p){return p.h==='about'}))out.push({text:'Add an About page. Shoppers can see products but not who you are.',cmd:'add an about page'});
  if(prods.length<4)out.push({text:'The catalog only has '+prods.length+' active product'+(prods.length===1?'':'s')+'. Add a few more'+(focus?' in '+focus:'')+'.',cmd:'create a collection for '+(focus||'bestsellers')});
  var hasCar=types.indexOf('feat_col_carousel')>=0||types.indexOf('featured')>=0,hasGrid=types.indexOf('feat_col_grid')>=0;
  if(hasCar&&!hasGrid)out.push({text:'Featured products are only a carousel. A grid is easier to scan.',cmd:'add a featured products grid'});
  if(hasGrid&&!hasCar)out.push({text:'Featured products are only a grid. A carousel puts one row in motion.',cmd:'add a featured products carousel'});
  if(!home.some(function(s){return !s.hide&&(s.type==='promo'||s.type==='imgbanner'||s.type==='col_banner')}))out.push({text:'Add a sale banner'+(focus?' for '+focus:'')+' so the homepage is not only the hero.',cmd:'add a sale banner for '+(focus||'this week')});
  var ft=t&&(t.ftr||[]).filter(function(s){return s.type==='footer'})[0];
  if(ft&&!/sellora pay|returns/i.test(ft.s.txt||''))out.push({text:'The footer does not mention returns or Sellora Pay.',cmd:'add trust details to the footer'});
  if(!(t&&(t.hdr||[]).some(function(s){return s.type==='announce'&&s.s&&s.s.msg&&!s.hide})))out.push({text:'Add an announcement bar for shipping or a current offer.',cmd:'add an announcement bar'});
  var seen={},uniq=[];out.forEach(function(s){if(!seen[s.cmd]){seen[s.cmd]=1;uniq.push(s)}});return uniq.slice(0,3);
}
function optimize(){
  var t=theme();if(!t)return {handled:true,reply:'Open your store first.'};
  var notes=[];t.ts=t.ts||{};
  if(!t.ts.lazy){t.ts.lazy=true;notes.push('Turned on lazy-loading for theme images.')}
  t.ts.imgq=60;
  var home=t.pg.home||[];
  var banners=home.filter(function(s){return !s.hide&&heroTypes(s)});
  if(banners.length>1){banners.slice(1).forEach(function(s){s.hide=true});notes.push('Hid '+(banners.length-1)+' extra homepage banner'+(banners.length>2?'s':'')+' so the first screen keeps one hero.')}
  home.forEach(function(s){if(/^slide/.test(s.type)&&s.s&&+s.s.auto>0){s.s.auto=0;notes.push('Stopped the slideshow from auto-playing.')}});
  var car=home.filter(function(s){return !s.hide&&(s.type==='feat_col_carousel'||s.type==='featured')});
  var grid=home.filter(function(s){return !s.hide&&s.type==='feat_col_grid'});
  if(car.length&&grid.length){car.forEach(function(s){s.hide=true});notes.push('Hid the featured carousel and kept the grid, which paints in one pass.')}
  home.forEach(function(s){if(/feat_col_carousel|^featured$|feat_col_grid/.test(s.type)&&+s.s.n>8){s.s.n=6;notes.push('Cut the featured row to 6 products.')}});
  var seen={},dup=0;home.forEach(function(s){if(s.hide||s.type==='text'||s.type==='divider')return;if(seen[s.type]){s.hide=true;dup++}else seen[s.type]=1});
  if(dup)notes.push('Hid '+dup+' duplicate homepage section'+(dup>1?'s':'')+'.');
  var shrunk=0;(S.products||[]).forEach(function(p,i){(p.imgs||[]).forEach(function(im,k){if(typeof im==='string'&&im.indexOf('data:image')===0&&im.length>24000){p.imgs[k]=productArt(p.name,t.ac,i+k);shrunk++}})});
  if(shrunk)notes.push('Replaced '+shrunk+' oversized image'+(shrunk>1?'s':'')+' with compact artwork.');
  if(S.set&&S.set.apps&&S.set.apps.chat){S.set.apps.chat=false;notes.push('Turned off the storefront chat app so it does not load on every page.')}
  if(S.ai12){S.ai12.lazy=true;S.ai12.webp=S.ai12.webp||{at:Date.now(),q:60}}
  if(!notes.length)notes.push('Lazy-loading is on and the homepage is already lean. Nothing else was safe to remove.');
  return {handled:true,built:true,reply:'Speed pass: '+notes.join(' ')};
}
function execute(cmd){
  if(cmd.kind==='reask'){var p=cmd.pending;return {handled:true,pending:p,reply:p.kind==='scope'?askScope(p.subject):askLayout()}}
  if(cmd.kind==='again')return handle(cmd.text,AIBuild._source);
  if(cmd.kind==='answer'){var p=cmd.pending;if(p.kind==='scope')return finishPending(p,{scope:cmd.value,intent:p.intent||'site'});return finishPending(p,{layout:cmd.value})}
  if(cmd.kind==='site')return finishPending({subject:cmd.subject,scope:cmd.scope,layout:cmd.layout,intent:'site'},{});
  if(cmd.kind==='featured')return finishPending({subject:cmd.subject,layout:cmd.layout,intent:'featured'},{});
  if(cmd.kind==='collection')return runCollection(cmd.subject);
  if(cmd.kind==='banner')return runBanner(cmd.style,cmd.subject);
  if(cmd.kind==='highlight'){if(!cmd.subject)return {handled:true,reply:'Which collection should the highlight show?'};var r=runCollection(cmd.subject);putSection('col_banner',{h:titleCase(cmd.subject),sub:catalogFor(cmd.subject).blurb,img:(findCol(titleCase(cmd.subject))||{}).pic,ht:420,btn:'Shop '+titleCase(cmd.subject),link:'catalog',fg:'#ffffff'});r.reply='Added a collection highlight for '+titleCase(cmd.subject)+' with a cover image.';return r}
  if(cmd.kind==='announce'){putSection('announce',{msg:cmd.text,al:'Center'});return {handled:true,built:true,reply:'Added an announcement bar: '+cmd.text}}
  if(cmd.kind==='page'){var which=cmd.which==='contact'?'contact':'about';pagesFor(state().focusCol||S.name||'the store','We are glad you are here.');linkMenu(null);return {handled:true,built:true,reply:'Added the '+(which==='about'?'About':'Contact')+' page and linked it in the menu.'}}
  if(cmd.kind==='menu'){linkMenu(cmd.subject);if(cmd.subject)ensureCollection(cmd.subject,catalogFor(cmd.subject).blurb,cover(cmd.subject,'',(theme()&&theme().ac)||'#111'));return {handled:true,built:true,reply:'Added '+cmd.subject+' to the menu.'}}
  if(cmd.kind==='product')return runProduct(cmd.subject,cmd.price);
  if(cmd.kind==='speed')return optimize();
  if(cmd.kind==='ideas'){var s=suggestions();state().suggestions=s;return {handled:true,reply:s.length?s.map(function(x,i){return (i+1)+'. '+x.text}).join(' '):'The store already has a collection, pages, a banner, and featured products.',suggestions:s}}
  if(cmd.kind==='trust'){var t=theme();var ft=t&&(t.ftr||[]).filter(function(s){return s.type==='footer'})[0];if(ft)ft.s.txt=(S.name||'This store')+' · Easy returns within 30 days. Payments by Sellora Pay.';return {handled:true,built:true,reply:'Updated the footer with returns and Sellora Pay.'}}
  if(cmd.kind==='section'){var map={faq:['faq',{h:'Questions',items:'How long is delivery? | Most orders arrive in 2 to 5 days.\nCan I return it? | Yes, within 30 days.\nHow do I pay? | Sellora Pay protects the payment until delivery.'}],newsletter:['newsletter',{h:'Stay in the loop',sub:'New products and the occasional offer.',btn:'Subscribe'}],text:['text',{h:'Our story',txt:catalogFor(cmd.subject).blurb}],story:['imgtext',{h:'Our story',txt:catalogFor(cmd.subject).blurb}]};var pair=map[cmd.which]||map.text;putSection(pair[0],pair[1]);return {handled:true,built:true,reply:'Added a '+cmd.which+' section.'}}
  if(cmd.kind==='need')return {handled:true,reply:cmd.reply};
  return {handled:false,reply:''};
}
function handle(text,source){
  AIBuild._source=source||'chat';
  var cmd=parse(text),res=execute(cmd);
  if(res.handled){var g=state();g.log.push({role:'user',text:String(text||'').trim(),at:Date.now()});g.log.push({role:'ai',text:res.reply,at:Date.now()});g.log=g.log.slice(-40);if(res.suggestions)g.suggestions=res.suggestions;persist();if(AIBuild._source==='block'&&typeof E!=='undefined'&&E){try{lp();rp()}catch(e){}}}
  res.provider=providerState().active;return res;
}
function providerState(){
  var llm={};try{llm=(X.API&&X.API.cfg&&X.API.cfg().llm)||{}}catch(e){}
  var ep=String(llm.endpoint||''),model=String(llm.model||''),blob=ep+' '+model;
  var claude=!!(llm.claudeKey||/anthropic|claude/i.test(blob));
  var deepseek=!!(llm.key&&llm.endpoint&&!/anthropic/i.test(ep));
  var order=[];if(claude)order.push('claude');if(deepseek)order.push('deepseek');order.push('local');
  return {claude:claude,deepseek:deepseek,order:order,active:claude?'claude':deepseek?'deepseek':'local',claudeKey:llm.claudeKey||'',endpoint:ep,key:llm.key||'',model:llm.model||llm.claudeModel||''};
}
function enrich(subject){
  var st=providerState();if(st.active==='local')return;
  var names=(S.products||[]).slice(-8).map(function(p){return p.name});
  var sys='Write one-sentence product descriptions as JSON {"blurbs":[{"name":"","description":""}]}. Mention Sellora Pay. Do not mention other payment brands.';
  var user='Store '+(S.name||'')+' selling '+subject+'. Products: '+names.join(', ');
  function apply(text){var j;try{j=JSON.parse(String(text).replace(/^```(?:json)?|```$/g,''))}catch(e){return}(j.blurbs||[]).forEach(function(b){var p=(S.products||[]).filter(function(x){return x.name===b.name})[0];if(p&&b.description)p.desc='<p>'+esc(b.description)+'</p>'});persist()}
  function deepseek(){if(!st.deepseek||!X.API||!X.API.llm)return Promise.resolve();return X.API.llm(user,sys).then(function(t){if(t)apply(t)}).catch(function(){})}
  if(st.claude&&st.claudeKey){fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':st.claudeKey,'anthropic-version':'2023-06-01'},body:JSON.stringify({model:st.model||'claude-sonnet-4-5',max_tokens:700,system:sys,messages:[{role:'user',content:user}]})}).then(function(r){return r.ok?r.json():null}).then(function(j){var t=j&&j.content&&j.content.map(function(c){return c.text||''}).join('');if(t)apply(t);else return deepseek()}).catch(deepseek)}
  else deepseek();
}
var _handle=handle;
handle=function(text,source){var res=_handle(text,source);if(res&&res.built){try{enrich((state().last&&state().last.subject)||text)}catch(e){}}return res};
function legacy(text){
  var t=low(text);
  if(/product|item/.test(t)&&!/category|collection|website|store|banner|featured/.test(t)){location.hash='products';setTimeout(function(){if(typeof prodForm==='function')prodForm()},50)}
  else if(/domain/.test(t))location.hash='domains';
  else if(/pay|gateway|payout/.test(t))location.hash='payments';
  else if(/order/.test(t))location.hash='orders';
  else try{toast('Try: build a website for boxing, add a collection, or add a banner.')}catch(e){}
}
function paintChat(){
  var box=document.getElementById('aichat');if(!box)return;
  var g=state();
  box.innerHTML=(g.log||[]).slice(-8).map(function(m){return '<div class="ai-b'+(m.role==='user'?' ai-u':'')+'">'+esc(m.text)+'</div>'}).join('')
    +(g.suggestions&&g.suggestions.length?'<div class="ai-sug">'+g.suggestions.map(function(s){return '<button type="button" class="btn" data-aisug="'+attr(s.cmd)+'">'+esc(s.text)+'</button>'}).join('')+'</div>':'');
}
function listen(done){
  var SR=X.SpeechRecognition||X.webkitSpeechRecognition;
  if(!SR)return {ok:false,message:VOICE_MSG};
  try{var rec=new SR();rec.lang='en-US';rec.interimResults=false;rec.onresult=function(e){done(e.results[0][0].transcript)};rec.onerror=function(){done('',VOICE_MSG)};rec.start();return {ok:true,message:'Listening…'}}catch(e){return {ok:false,message:VOICE_MSG}}
}
function voiceInto(input,andRun,statusEl){
  var res=listen(function(said,err){if(statusEl)statusEl.textContent=said?('Heard: '+said):(err||VOICE_MSG);if(!said){try{toast(err||VOICE_MSG)}catch(e){}return}if(input)input.value=said;if(andRun)andRun(said)});
  if(statusEl)statusEl.textContent=res.message;
  if(!res.ok)try{toast(res.message)}catch(e){}
  return res;
}
function runAsk(text){
  var r=handle(text,'chat');
  var q=document.getElementById('q');if(q)q.value='';
  if(!r.handled)legacy(text);
  paintChat();
  if(r.handled&&r.reply){try{toast(r.reply.slice(0,180))}catch(e){}speak(r.reply)}
  return r;
}
function speak(t){try{if(X.speechSynthesis&&X.SpeechSynthesisUtterance){var u=new SpeechSynthesisUtterance(String(t).slice(0,280));X.speechSynthesis.cancel();X.speechSynthesis.speak(u)}}catch(e){}}
function mountAsk(){
  var ask=document.querySelector('#main .ask'),q=document.getElementById('q');if(!ask||!q||q.getAttribute('aria-label')!=='Ask Sellora AI')return;
  if(!document.getElementById('qmic')){var mic=document.createElement('button');mic.type='button';mic.id='qmic';mic.className='btn';mic.setAttribute('aria-label','Speak to Sellora AI');mic.title='Speak';mic.textContent='🎤';q.insertAdjacentElement('afterend',mic);mic.addEventListener('click',function(){voiceInto(q,runAsk,document.getElementById('qvstat'))})}
  if(!document.getElementById('qvstat')){var st=document.createElement('p');st.id='qvstat';st.className='mu';st.setAttribute('role','status');ask.insertAdjacentElement('afterend',st)}
  if(!document.getElementById('aichat')){var box=document.createElement('div');box.id='aichat';document.getElementById('qvstat').insertAdjacentElement('afterend',box)}
  paintChat();
}
function decorateBlock(){
  if(typeof E==='undefined'||!E||!E.open)return;
  var sec=typeof secOf==='function'?secOf(E.open):null;
  var body=document.querySelector('#edl .erb');
  if(!sec||sec.type!=='aiblock'||!body||body.querySelector('.aiblock-tools'))return;
  var ask=sec.s.ask?'<p class="mu" id="aib-ask">'+esc(sec.s.ask)+'</p>':'';
  body.insertAdjacentHTML('beforeend',ask+'<div class="aiblock-tools" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px"><button type="button" class="btn" data-aimic="1" aria-label="Speak to build this block">🎤 Speak</button><button type="button" class="btn pri" data-aigen="1">Generate block</button></div><p class="mu" id="aib-voice" role="status"></p>');
}
function generateBlock(){
  if(typeof E==='undefined'||!E)return;
  var sec=typeof secOf==='function'?secOf(E.open):null;if(!sec||sec.type!=='aiblock')return;
  var ta=document.querySelector('#edl textarea[data-sk="prompt"]');
  var text=(ta&&ta.value.trim())||sec.s.prompt||'';
  if(!text){var v=document.getElementById('aib-voice');if(v)v.textContent='Describe the block first.';return}
  sec.s.prompt=text;
  var r=handle(text,'block');
  var voice=document.getElementById('aib-voice');
  if(voice)voice.textContent=r.reply||'';
  var still=typeof secOf==='function'?secOf(E.open):null;
  if(still&&still.type==='aiblock'&&r.built&&typeof loc==='function'){var l=loc(still.id);if(l){l.a.splice(l.i,1);E.open=null;try{lp();rp()}catch(e){}}}
  else if(still&&still.type==='aiblock'){still.s.ask=r.reply||'';try{lp();rp()}catch(e){}}
  try{toast((r.reply||'').slice(0,160))}catch(e){}
}
function colCards(cls){
  var cols=(S.collections||[]).filter(function(c){return c&&c.title});
  if(!cols.length)cols=[{title:'Shop all',pic:'',desc:'Everything in the store'}];
  return cols.slice(0,8).map(function(c){var img=c.pic?'background-image:url('+c.pic+');background-size:cover;background-position:center':'background:linear-gradient(135deg,var(--a,#2E6B4F),#111)';return '<a data-edcol="'+attr(c.title)+'" class="'+cls+'" style="cursor:pointer;display:block;text-decoration:none;color:inherit"><div style="height:110px;border-radius:10px;'+img+'"></div><b style="display:block;margin-top:6px">'+esc(c.title)+'</b></a>'}).join('');
}
function realCollections(){
  if(typeof RN==='undefined')return;
  RN.col_grid=function(t,s){var n=+((typeof v==='function'&&v(s,'cols'))||3);return (typeof wrap==='function'?wrap:function(s,h){return '<section class="sx" data-sid="'+s.id+'">'+h+'</section>'})(s,'<h2>'+esc((typeof v==='function'&&v(s,'h'))||'Shop by collection')+'</h2><div class="col-grid-preview" style="display:grid;grid-template-columns:repeat('+n+',1fr);gap:12px">'+colCards('col-grid-cell')+'</div>')};
  RN.col_carousel=function(t,s){return (typeof wrap==='function'?wrap:function(s,h){return '<section class="sx" data-sid="'+s.id+'">'+h+'</section>'})(s,'<h2>'+esc((typeof v==='function'&&v(s,'h'))||'Shop by collection')+'</h2><div style="display:flex;gap:12px;overflow:auto">'+colCards('carousel-preview-card')+'</div>')};
  RN.col_bento=RN.col_editorial=function(t,s){return (typeof wrap==='function'?wrap:function(s,h){return '<section class="sx" data-sid="'+s.id+'">'+h+'</section>'})(s,'<h2>'+esc((typeof v==='function'&&v(s,'h'))||'Shop by collection')+'</h2><div style="display:grid;grid-template-columns:1.2fr 1fr;gap:12px">'+colCards('bento-cell')+'</div>')};
  RN.col_spotlight=RN.col_text=function(t,s){return (typeof wrap==='function'?wrap:function(s,h){return '<section class="sx" data-sid="'+s.id+'">'+h+'</section>'})(s,'<h2>'+esc((typeof v==='function'&&v(s,'h'))||'Collections')+'</h2><div style="display:grid;gap:8px;text-align:left">'+colCards('spotlight-item')+'</div>')};
}
function applyBg(html,s){
  var bg=s&&s.s&&s.s.bg;if(!bg||!html)return html;
  var safe=String(bg).replace(/[^#a-zA-Z0-9(),.%\s-]/g,'');if(!safe)return html;
  return html.replace(/<([a-z0-9]+)([^>]*\sdata-sid="[^"]*"[^>]*)>/i,function(full,tag,attrs){
    if(/style="/i.test(attrs))return '<'+tag+attrs.replace(/style="([^"]*)"/i,function(_,st){return 'style="'+st+';background-color:'+safe+'"'})+'>';
    return '<'+tag+attrs+' style="background-color:'+safe+'">';
  });
}
function tuneHtml(type,html,s){
  if(!html)return html;
  if(type==='header'||type==='footer'){
    (S.collections||[]).forEach(function(c){if(!c||!c.title)return;var name=esc(c.title),re=new RegExp('<a data-pg="[a-z]+">'+name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'</a>','g');html=html.replace(re,'<a data-pg="collection" data-edcol="'+attr(c.title)+'" style="cursor:pointer">'+name+'</a>')});
    (S.pages||[]).forEach(function(p){if(!p||p.vis===false)return;var name=esc(p.t),re=new RegExp('<a data-pg="[a-z]+">'+name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'</a>','g');html=html.replace(re,'<a data-edpage="'+attr(p.h)+'" style="cursor:pointer">'+name+'</a>')});
    [['About','about'],['About us','about'],['Contact','contact'],['Contact us','contact']].forEach(function(pair){var name=esc(pair[0]);var re=new RegExp('<a data-pg="[a-z]+">'+name+'</a>','g');html=html.replace(re,pair[1]==='contact'?'<a data-pg="contact" style="cursor:pointer">'+name+'</a>':'<a data-edpage="about" style="cursor:pointer">'+name+'</a>')});
  }
  var col=s&&s.s&&s.s.col;
  if(col&&col!=='All'&&/feat_|featured|collection/.test(type))html=html.replace(/<h2([^>]*)>/,'<h2$1 data-edcol="'+attr(col)+'" style="cursor:pointer">');
  var focus=state().focusCol;
  if(focus)html=html.replace(/data-pg="collection"(?![^>]*data-edcol)/g,'data-pg="collection" data-edcol="'+attr(focus)+'"');
  return applyBg(html,s);
}
function withPreview(type,s){
  if(!(typeof E!=='undefined'&&E&&E.pg==='collection'&&window._edPreviewCol))return s;
  var col=findCol(window._edPreviewCol);if(!col)return s;
  var s2={id:s.id,type:s.type,hide:s.hide,s:Object.assign({},s.s)};
  if(type==='col_banner'||/^hero/.test(type)||type==='imgbanner'){s2.s.h=col.title;s2.s.sub=col.desc||s2.s.sub;if(col.pic)s2.s.img=col.pic}
  if(type==='heading'){s2.s.h=col.title;s2.s.sub=col.desc||s2.s.sub}
  if(type==='collection'||/^feat_/.test(type)||type==='featured')s2.s.col=col.title;
  return s2;
}
function ensureSchemas(){
  if(typeof SCH==='undefined'||typeof RN==='undefined')return;
  LBL.aiblock='AI block';
  SCH.aiblock=[['prompt','Describe this block','a',''],['bg','Background','c','','bg']];
  RN.aiblock=function(t,s){var pr=s.s.prompt||'',ask=s.s.ask||'';return '<section class="sx" data-sid="'+s.id+'" data-aiblock="1" style="padding:28px 40px;background:'+(s.s.bg||'#f4f4f4')+';color:#111"><div style="font-size:12px;letter-spacing:.04em;text-transform:uppercase">AI block</div><h2 style="margin:8px 0">'+esc(pr||'Describe this block')+'</h2><p style="margin:0">'+(ask?esc(ask):'Use the prompt in the section options. Generate turns this into a normal section you can keep editing.')+'</p></section>'};
  Object.keys(RN).forEach(function(k){if(typeof RN[k]!=='function')return;if(!SCH[k])SCH[k]=[['bg','Background','c','','bg']];else if(!SCH[k].some(function(f){return f[0]==='bg'}))SCH[k].unshift(['bg','Background','c','','bg']);if(typeof LBL!=='undefined'&&!LBL[k])LBL[k]=k.replace(/_/g,' ')});
  ['featured','feat_col_carousel','feat_col_grid'].forEach(function(k){if(!SCH[k]||SCH[k].some(function(f){return f[0]==='layout'}))return;SCH[k].unshift(['layout','Layout','s',k==='feat_col_grid'?'Grid':'Carousel',['Carousel','Grid']])});
  var cat=X.SECTIONS_CATALOG;if(cat&&!cat.some(function(g){return (g.items||[]).some(function(i){return i.id==='aiblock'})}))cat.unshift({category:'AI',items:[{id:'aiblock',name:'AI block',icon:'bars',desc:'Describe a banner, collection, or product row. Sellora builds a real section you can keep editing.'}]});
}
function installRenderers(){
  if(typeof RN==='undefined')return;
  realCollections();
  Object.keys(RN).forEach(function(type){var prev=RN[type];if(!prev||prev._m15)return;var next=function(t,s,c){s=withPreview(type,s);var html='';try{html=prev(t,s,c)||''}catch(e){html=''}return tuneHtml(type,html,s)};next._m15=1;RN[type]=next});
  window.getStoreItems=function(colName){
    colName=String(colName||'All').trim();
    var all=(S.products||[]).filter(function(p){return p.status==='Active'&&p.pub!==false});
    if(!colName||colName.toLowerCase()==='all')return all;
    var target=colName.toLowerCase();
    return all.filter(function(p){if(X.X7inCol&&X.X7inCol(p,colName))return true;return (p.cols||[]).some(function(c){return String(c).toLowerCase()===target})||String(p.type||'').toLowerCase()===target||String(p.name||'').toLowerCase().indexOf(target)>=0});
  };
}
function destOf(node){
  if(!node||!node.closest||!node.closest('#ep'))return null;
  if(node.closest('#m12plus,#m12menu,[data-m12a],[data-m12m],[data-grip],[data-slc]'))return null;
  var page=node.closest('[data-edpage]');if(page)return {page:page.getAttribute('data-edpage')};
  var back=node.closest('[data-edpg]');if(back)return {pg:back.getAttribute('data-edpg')};
  var col=node.closest('[data-edcol]');if(col)return {pg:'collection',col:col.getAttribute('data-edcol')};
  var pid=node.closest('[data-pid]');if(pid&&pid.getAttribute('data-pid'))return {pg:'product',pid:pid.getAttribute('data-pid')};
  var pg=node.closest('[data-pg]');
  if(pg){var name=(pg.textContent||'').trim(),pageName=pg.getAttribute('data-pg');
    var match=(S.collections||[]).filter(function(c){return c.title&&c.title.toLowerCase()===name.toLowerCase()})[0];
    if(match)return {pg:'collection',col:match.title};
    if(/^about/.test(name.toLowerCase()))return {page:'about'};
    if(pageName==='collection'){var sid=pg.closest('[data-sid]');var sec=sid&&typeof loc==='function'?loc(sid.getAttribute('data-sid')):null;var colName=sec&&sec.a[sec.i].s&&sec.a[sec.i].s.col;if(colName&&colName!=='All')return {pg:'collection',col:colName};return {pg:'collection',col:state().focusCol||''}}
    if(PAGES[pageName])return {pg:pageName};
  }
  var card=node.closest('.pc');if(card&&card.getAttribute('data-pid'))return {pg:'product',pid:card.getAttribute('data-pid')};
  return null;
}
function previewTo(d){
  if(typeof E==='undefined'||!E)return {ok:false,reason:'editor-closed'};
  E.preview={col:'',pid:'',page:''};
  if(d.page){E.preview.page=d.page}
  else{var pg=d.pg||'home';if(pg==='shop')pg='catalog';if(typeof PGS==='undefined'||!PGS[pg])pg='home';E.pg=pg;E.preview.col=d.col||'';E.preview.pid=d.pid||''}
  E.open=null;
  var sel=document.getElementById('epg');if(sel&&typeof PGS!=='undefined'&&PGS[E.pg])sel.value=E.pg;
  try{lp();rp()}catch(e){console.error(e)}
  return {ok:true,pg:E.pg,col:E.preview.col,pid:E.preview.pid,page:E.preview.page};
}
function renderPageSidebar(){
  var el=document.getElementById('edl');if(!el||!E)return;
  var page=(S.pages||[]).filter(function(p){return p.h===E.preview.page})[0];
  el.innerHTML='<div class="eg"><p class="mu">Viewing <b>'+esc(page?page.t:'this page')+'</b>. Edit the words under Pages. Header and footer sections stay editable here.</p><button type="button" class="btn" data-edpg="home">Back to home page</button></div>'+(typeof grp==='function'?grp('Header','h',E.t.hdr)+grp('Footer','f',E.t.ftr):'');
}
function installEditor(){
  if(typeof lp==='function'&&!lp._m15){var lp0=lp;var next=function(){if(E&&E.preview&&E.preview.page){renderPageSidebar();decorateBlock();return}lp0();decorateBlock()};next._m15=1;lp=next;try{X.lp=lp}catch(e){}}
  if(typeof rp==='function'&&!rp._m15){var rp0=rp;var rpn=function(){
    if(!(typeof E!=='undefined'&&E))return rp0();
    var el=document.getElementById('ep');if(!el)return rp0();
    var t=E.t;if(E.preview&&E.preview.page){
      var page=(S.pages||[]).filter(function(p){return p.h===E.preview.page})[0];
      var ctx={pg:'home'},body=(t.hdr||[]).filter(function(s){return !s.hide}).map(function(s){return RN[s.type]?RN[s.type](t,s,ctx):''}).join('')+'<section class="sx" style="padding:40px"><h1>'+esc(page?page.t:'Page')+'</h1><div>'+(page&&page.html?page.b:esc(page?page.b:''))+'</div></section>'+(t.ftr||[]).filter(function(s){return !s.hide}).map(function(s){return RN[s.type]?RN[s.type](t,s,ctx):''}).join('');
      el.innerHTML='<div class="edprevbar" style="position:sticky;top:0;z-index:4;background:#111;color:#fff;padding:8px 12px;font-size:13px">Page: '+esc(page?page.t:E.preview.page)+'</div><div class="sf" style="--b:'+t.bg+';--t:'+t.tx+';--a:'+t.ac+';--r:'+(t.rad||0)+'px">'+body+'</div>';return}
    window._edPreviewCol=(E.pg==='collection'&&E.preview&&E.preview.col)||'';
    var pg=E.pg==='signin'?'home':E.pg,pid=E.preview&&E.preview.pid;
    var html='';try{html=sf(t,pg,pid||undefined)}catch(e){html=''}finally{window._edPreviewCol=''}
    var bar=E.preview&&E.preview.col?'<div class="edprevbar" style="position:sticky;top:0;z-index:4;background:#111;color:#fff;padding:8px 12px;font-size:13px">Collection: '+esc(E.preview.col)+' <button type="button" class="btn" data-edpg="home" style="margin-left:8px">Home</button></div>':'';
    el.innerHTML=bar+html+(E.pg==='signin'&&typeof popHtml==='function'?'<div class="popw">'+popHtml(t)+'</div>':'');
    var open=E.open&&E.open!=='theme'&&E.pg!=='signin'?el.querySelector('[data-sid="'+E.open+'"]'):null;
    if(open){open.style.outline='2px solid #2D8CFF';open.style.outlineOffset='-2px'}
  };rpn._m15=1;rp=rpn;try{X.rp=rp}catch(e){}}
  if(typeof edit==='function'&&!edit._m15){var ed0=edit;var edn=function(id){var r=ed0(id);if(E)E.preview={col:'',pid:'',page:''};['os','ox'].forEach(function(i){var b=document.getElementById(i);if(!b||b._m15)return;var fn=b.onclick;b.onclick=function(){if(fn)fn();persist()};b._m15=1});return r};edn._m15=1;edit=edn}
}
document.addEventListener('click',function(e){
  var t=e.target;if(!t||!t.closest)return;
  if(t.closest('#go')){var input=document.getElementById('q');if(!input)return;e.preventDefault();e.stopPropagation();runAsk(input.value);return}
  if(t.closest('#qmic'))return;
  var sug=t.closest('[data-aisug]');if(sug){e.preventDefault();runAsk(sug.getAttribute('data-aisug'));return}
  if(t.closest('[data-aigen]')){e.preventDefault();e.stopPropagation();generateBlock();return}
  if(t.closest('[data-aimic]')){e.preventDefault();e.stopPropagation();var ta=document.querySelector('#edl textarea[data-sk="prompt"]');var st=document.getElementById('aib-voice');voiceInto(ta,function(said){if(ta){ta.value=said;if(E&&E.open&&typeof secOf==='function'){var s=secOf(E.open);if(s)s.s.prompt=said}}generateBlock()},st);return}
  var back=t.closest('[data-edpg]');if(back&&typeof E!=='undefined'&&E){e.preventDefault();previewTo({pg:back.getAttribute('data-edpg')});return}
  var d=destOf(t);if(!d||typeof E==='undefined'||!E)return;
  e.preventDefault();e.stopPropagation();previewTo(d);
},true);
document.addEventListener('keydown',function(e){if(e.key!=='Enter'||!e.target||e.target.id!=='q')return;e.preventDefault();e.stopPropagation();runAsk(e.target.value)},true);
document.addEventListener('change',function(e){
  var t=e.target;if(!t||!t.dataset)return;
  if(t.id==='epg'&&typeof E!=='undefined'&&E)E.preview={col:'',pid:'',page:''};
  if(t.dataset.sk==='layout'&&typeof E!=='undefined'&&E){var s=typeof secOf==='function'?secOf(t.dataset.sid):null;if(!s)return;var lay=t.value==='Grid'?'grid':'carousel';s.type=lay==='grid'?'feat_col_grid':'feat_col_carousel';s.s.layout=t.value;s.s.col=s.s.col||state().focusCol||'All';persist();try{lp();rp()}catch(err){}e.stopPropagation()}
},true);
var css=document.createElement('style');css.textContent='#qmic{margin-left:6px}#aichat{display:flex;flex-direction:column;gap:8px;margin:12px 0 18px;max-width:760px}.ai-b{background:#f4f4f4;color:#111;border-radius:10px;padding:10px 12px;line-height:1.4}.ai-u{background:#111;color:#fff;align-self:flex-end}.ai-sug{display:flex;flex-wrap:wrap;gap:6px}#ep [data-edcol],#ep [data-pg],#ep [data-pid],#ep [data-edpage],#ep .pc{cursor:pointer}';document.head.appendChild(css);
ensureSchemas();installRenderers();installEditor();
if(X.API&&X.API.PROV&&X.API.PROV.llm){var ff=X.API.PROV.llm.f;if(ff.indexOf('claudeKey')<0)ff.push('claudeKey');X.API.PROV.llm.n='AI / LLM (DeepSeek by default, optional Claude key)'}
if(X.onRoute)X.onRoute(function(r){mountAsk();if(r==='integrations'){document.querySelectorAll('label').forEach(function(l){if((l.getAttribute('for')||'').indexOf('claudeKey')>=0)l.textContent='Claude API key (optional)'})}});
if(X.VOICE&&X.VOICE.run&&!X.VOICE.run._m15){var vr=X.VOICE.run;var vn=function(cmd){var r=handle(cmd,'voice');if(r.handled){paintChat();if(!(typeof E!=='undefined'&&E)){try{route()}catch(e){}}else{try{lp();rp()}catch(e){}}return X.VOICE.say(r.reply)}return vr(cmd)};vn._m15=1;X.VOICE.run=vn}
if(A.m12build){var b0=A.m12build;A.m12build=function(){var pr=(document.getElementById('m12prompt')||{}).value||'';var r=handle(pr,'chat');if(r.handled){var st=document.getElementById('m12vstat');if(st)st.textContent=r.reply;try{toast(r.reply.slice(0,160))}catch(e){}return}return b0()}}
if(A.m12edit){var e0=A.m12edit;A.m12edit=function(){var c=(document.getElementById('m12cmd')||{}).value||'';var r=handle(c,'chat');if(r.handled){var st=document.getElementById('m12edres');if(st)st.textContent=r.reply;try{toast(r.reply.slice(0,160))}catch(e){}return}return e0()}}
A.m12mic=function(target){var el=document.getElementById(target),st=document.getElementById('m12vstat');voiceInto(el,function(said){if(!said)return;var r=handle(said,'voice');if(r.handled){if(st)st.textContent=r.reply;try{toast(r.reply.slice(0,160))}catch(e){}return}if(target==='m12prompt'&&A.m12build)A.m12build();else if(target==='m12cmd'&&A.m12edit)A.m12edit()},st)};
var AIBuild=X.AIBuild={
  handle:function(text,source){return handle(text,source)},
  parse:parse,suggestions:suggestions,optimize:optimize,providers:providerState,
  voiceMessage:VOICE_MSG,banner:banner,cover:cover,
  insertBlock:function(index){var t=theme();if(!t)return null;var s=mk('aiblock',{prompt:''});var home=t.pg.home;var i=index==null?home.length:index;home.splice(i,0,s);if(typeof E!=='undefined'&&E){E.pg='home';E.open=s.id;E.preview={col:'',pid:'',page:''};try{lp();rp()}catch(e){}}persist();return s.id},
  previewTo:previewTo,schemas:function(){ensureSchemas();return SCH}
};
try{mountAsk()}catch(e){}
})();
