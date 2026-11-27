/* ===== v61: VendOm Autopilot — the seller connects accounts once; on day 1 Autopilot sets up SEO/AEO/GEO, blogs, an FAQ,
   a 30-day content calendar with tracked website links, WhatsApp follow-up and ad drafts. Anything that spends money or
   goes live waits in Approvals. Monthly allowances follow the plan (Starter, Grow, Pro, Scale). Brand Builder is an opt-in
   6-month programme. Until VendOm's platform apps are approved everything runs in TEST MODE: work is prepared, nothing is
   published to other platforms. ===== */
(function(){
var X=window,A=X.ACT,V=X.V||window.V;
function h(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function q(s){return document.querySelector(s)}
function sv(){try{save()}catch(e){}}
function tst(t){try{toast(t)}catch(e){}}
function stripTags(s){return String(s||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim()}
function cut(s,n){s=String(s||'').trim();return s.length<=n?s:s.slice(0,n-1).replace(/\s+\S*$/,'')+'…'}
function slugify(s){return String(s||'').toLowerCase().replace(/[^a-z0-9؀-ۿ]+/g,'-').replace(/^-|-$/g,'')||'item'}
function dom(){return S.domain||((typeof slug==='function'?slug():'store')+'.vendom.app')}
function rs(n){return 'Rs '+Math.round(n).toLocaleString('en-US')}

/* ---------- plans and allowances ---------- */
var PLANS={
 starter:{n:'Starter',usd:25,posts:30,reels:9,blogs:4,images:50,videos:0,cap:25000,tests:1,ads:['Meta'],budget:'Rs 0–15,000'},
 grow:{n:'Grow',usd:49,posts:60,reels:17,blogs:8,images:150,videos:1,cap:100000,tests:2,ads:['Meta','Google'],budget:'Rs 15,000–40,000'},
 pro:{n:'Pro',usd:99,posts:90,reels:30,blogs:12,images:400,videos:4,cap:400000,tests:4,ads:['Meta','Google','TikTok'],budget:'Rs 40,000–120,000'},
 scale:{n:'Scale',usd:249,posts:150,reels:60,blogs:20,images:1200,videos:10,cap:Infinity,tests:8,ads:['Meta','Google','TikTok'],budget:'Rs 120,000+'}};
var ORDER=['starter','grow','pro','scale'];
var MAP={basic:'starter',starter:'starter',grow:'grow',advanced:'pro',pro:'pro',enterprise:'scale',scale:'scale'};
function tier(){var p='';try{var s=X.m13&&X.m13.sub();p=String((s&&s.plan)||'').toLowerCase()}catch(e){}return MAP[p]||'grow'}
function plan(){return PLANS[tier()]}
function atLeast(t){return ORDER.indexOf(tier())>=ORDER.indexOf(t)}

/* ---------- accounts to connect ---------- */
var CONN=[
 ['whatsapp','WhatsApp Business','Catalogue, COD order confirmation, cart reminders, buyer replies.','starter','Message templates need Meta approval. Meta charges per conversation.'],
 ['gmc','Google Merchant Center','Free product listings and the Shopping feed.','starter',''],
 ['gsc','Google Search Console','Indexing, search terms and fixes for pages that don’t rank.','starter',''],
 ['ga4','Google Analytics 4','Visits, sources, add-to-cart and sales.','starter',''],
 ['meta','Facebook & Instagram','Posts, reels, stories, the shop catalogue and the pixel.','starter','Needs Meta app review.'],
 ['metaads','Meta Ads','Sales campaigns inside your cap.','starter',''],
 ['tiktok','TikTok','Video posts and TikTok Shop where available.','grow','Needs TikTok’s app audit.'],
 ['threads','Threads','Daily text posts and replies.','grow',''],
 ['pinterest','Pinterest','Pins and the product catalogue.','grow',''],
 ['gads','Google Ads','Shopping and Performance Max campaigns.','grow','Needs a Google Ads developer token.'],
 ['tiktokads','TikTok Ads','Video ad campaigns.','pro',''],
 ['x','X (Twitter)','Posts and replies.','pro','Posting through X’s API is a paid tier.'],
 ['youtube','YouTube','Shorts from your reels.','pro',''],
 ['gbp','Google Business Profile','Local listing, weekly posts, review replies.','pro',''],
 ['courier','Couriers','TCS, Leopards, PostEx: booking and tracking messages.','starter',''],
 ['market','Marketplaces','Daraz and others: product feed and stock sync.','scale','']];

/* ---------- skills on by default ---------- */
var SKILLS=[
 ['store','Store Builder',1,'Builds or redesigns the site. Going live needs your tap.'],
 ['writer','Product Writer',0,'Title, description, meta title and meta description for every product.'],
 ['photo','Photo Studio',0,'White backgrounds, platform sizes and alt text.'],
 ['seo','SEO Fixer',0,'Missing tags, sitemap, schema and slow pages.'],
 ['aeo','AI Search Answers',0,'FAQ and clear facts that ChatGPT, Gemini and AI Overviews can quote (AEO/GEO).'],
 ['feed','Merchant Feed',0,'Keeps Google, Meta, TikTok and Pinterest catalogues in sync.'],
 ['cal','Content Calendar',0,'Plans 30 days around sales, new stock and festivals.'],
 ['post','Social Poster',0,'Posts at the best hours on every connected channel.'],
 ['reel','Reel Maker',0,'Reels from product photos with captions, music and voice-over.'],
 ['router','Traffic Router',0,'Puts a tracked website link in every bio, post, reel, pin, blog and message.'],
 ['wa','WhatsApp Sales Agent',0,'Confirms COD orders, recovers carts and answers questions.'],
 ['ads','Ads Manager',1,'New campaigns and budget increases need your tap. Losing ads pause themselves.'],
 ['reviews','Review Collector',0,'Asks happy buyers for a review after delivery.'],
 ['growth','Growth Analyst',0,'Weekly report and small design tests with undo.'],
 ['stock','Stock & Price Watch',0,'Low-stock alerts; sold-out items leave the ads.']];

var BRAND=[['Brand foundation','Logo, colours, fonts, brand voice, story page, brand-look photos, content pillars.',30000],
 ['Launch','Teaser reels, launch day, launch offer, 2–3 micro-creators.',45000],
 ['Test and learn','3 messages × 3 visuals; winners get the budget. Blogs for buying questions.',60000],
 ['Scale winners','More budget on the best product and message, remarketing, reviews.',80000],
 ['Community','Creator collaboration, a partner giveaway, loyalty offer, VIP WhatsApp list.',100000],
 ['Brand authority','Seasonal or Eid campaign, PR-style blogs, brand-search ads, next 6 months planned.',120000]];

function AP(){var a=S.ap38=S.ap38||{};a.conn=a.conn||{};a.skills=a.skills||{};a.cal=a.cal||[];a.appr=a.appr||[];a.log=a.log||[];a.faq=a.faq||[];
 a.inputs=a.inputs||{goal:'orders',cap:0,langs:'English, Urdu'};a.brand=a.brand||{on:false,start:0};a.wa=a.wa||{cart:true,cod:true};return a}
function skillOn(k){var v=AP().skills[k];return v!==false}
function log(t,undo){var a=AP();a.log.unshift({t:t,at:Date.now(),undo:undo||null});if(a.log.length>300)a.log.length=300}
function prods(){return (S.products||[]).filter(function(p){return !p.status||/^active$/i.test(p.status)})}
function link(p,src,med,camp){var hd=(p&&(p.handle||slugify(p.name)))||'';return 'https://'+dom()+(hd?'/products/'+hd:'/')+'?utm_source='+encodeURIComponent(src)+'&utm_medium='+encodeURIComponent(med)+'&utm_campaign='+encodeURIComponent(camp||'autopilot')}

/* ---------- day-1 setup ---------- */
function metaFor(p){var store=S.name||'our store',ctry=S.country||'Pakistan',d=stripTags(p.desc).split(/(?<=[.!?])\s/)[0]||'';
 var t=cut(p.name+' | '+store,60);
 var md=cut('Buy '+p.name+' online at '+store+'. '+(d?d+' ':'')+'Cash on delivery and fast delivery across '+ctry+'.',155);return {t:t,d:md}}
function setupSeo(){var n=0,prev=[];prods().forEach(function(p){p.seo=p.seo||{};var has=p.seo.t||p.seo.title;if(has)return;var m=metaFor(p);prev.push(p.id);
  p.seo.t=p.seo.title=m.t;p.seo.d=p.seo.desc=m.d;if(!p.alt)p.alt=p.name+' from '+(S.name||'our store');n++});
 if(n)log('Wrote meta titles, meta descriptions and image alt text for '+n+' product'+(n===1?'':'s'),{k:'seo',ids:prev});return n}
function setupFaq(){var a=AP();if(a.faq.length)return 0;var ctry=S.country||'Pakistan',st=S.name||'our store';
 a.faq=[['Do you offer cash on delivery?','Yes. You can pay cash when your order arrives anywhere in '+ctry+'.'],
  ['How long does delivery take?','Most orders arrive in 2–5 working days. You get a tracking message on WhatsApp.'],
  ['Can I return or exchange an item?','Yes, within 7 days if it is unused and in its original packing. Message us on WhatsApp to start.'],
  ['How do I choose the right size?','Each product page has a size guide. If you are between sizes, message us and we will help.'],
  ['Is '+st+' a real shop?','Yes. Every order gets a confirmation and tracking, and you can reach us on WhatsApp.']];
 var pg=(S.pages=S.pages||[]);if(!pg.some(function(x){return x.h==='faq'}))pg.push({id:'faq',t:'Frequently asked questions',h:'faq',b:a.faq.map(function(f){return f[0]+'\n'+f[1]}).join('\n\n'),vis:true});
 log('Added an FAQ page with 5 answers that Google and AI search can quote',{k:'faq'});return 5}
function setupBlogs(){var a=AP(),P=prods(),st=S.name||'our store',n=Math.min(4,plan().blogs),made=0;if(a.blogsMade)return 0;
 var cat=(P[0]&&((P[0].cols||[])[0]||P[0].type))||'products',top=P.slice(0,3);
 var list=[['How to choose the right '+cat,'A simple guide to picking '+cat+' that suit you, with our favourite picks.'],
  [st+' size and care guide','How to find your size and keep your order looking new for longer.'],
  ['Our top '+(top.length||3)+' picks this month','The pieces our customers love most right now.'],
  ['Why shop at '+st,'Cash on delivery, fast delivery, easy returns and help on WhatsApp.']].slice(0,n);
 S.blogPosts=S.blogPosts||[];list.forEach(function(b){var body='<p>'+h(b[1])+'</p>'+(top.length?'<ul>'+top.map(function(p){return '<li><a href="'+h(link(p,'blog','organic','starter-blog'))+'">'+h(p.name)+'</a></li>'}).join('')+'</ul>':'')+'<p>Questions? Message us on WhatsApp.</p>';
  S.blogPosts.push({id:++S.nid,title:b[0],author:'VendOm Autopilot',date:new Date().toDateString().slice(4),comments:0,status:'Draft',body:body,handle:slugify(b[0]),ap38:1});made++});
 a.blogsMade=true;if(made)log('Drafted '+made+' starter blog posts with links to your products (review and publish from Content › Blog posts)',{k:'blogs'});return made}
var TAGS=['#ShopOnline','#CashOnDelivery','#NewArrivals','#OnlineShopping','#SmallBusiness'];
function caption(p,i,kind){var st=S.name||'our store',pr=typeof money==='function'?money(p.price):(S.cur||'')+' '+p.price;
 var hooks=['New in: '+p.name+'.','Your next favourite: '+p.name+'.','Back in stock: '+p.name+'.','Made for every day: '+p.name+'.','Customers love this one: '+p.name+'.'];
 return hooks[i%hooks.length]+' '+pr+'. Cash on delivery across '+(S.country||'Pakistan')+'. Shop now at '+dom()+(kind==='reel'?' (link in bio)':'')}
function setupCalendar(){var a=AP(),P=prods(),pl=plan();if(!P.length)return 0;var start=new Date();start.setHours(0,0,0,0);
 a.cal=a.cal.filter(function(c){return c.status!=='Scheduled'});var perDay=pl.posts/30,reelsPerDay=pl.reels/30,accP=0,accR=0,k=0,times=['12:30','19:00','21:00','15:00','10:00'];
 for(var d=1;d<=30;d++){var day=new Date(+start+d*864e5).toISOString().slice(0,10);accP+=perDay;accR+=reelsPerDay;
  var np=Math.floor(accP+1e-9);accP-=np;var nr=Math.floor(accR+1e-9);accR-=nr;
  for(var i=0;i<np;i++){var p=P[k%P.length];a.cal.push({id:'c'+(++S.nid),day:day,time:times[i%times.length],kind:'post',pid:p.id,name:p.name,text:caption(p,k,'post'),tags:TAGS.slice(0,4).join(' '),link:link(p,'social','post','day1'),status:'Scheduled'});k++}
  for(var j=0;j<nr;j++){var r=P[k%P.length];a.cal.push({id:'c'+(++S.nid),day:day,time:'20:30',kind:'reel',pid:r.id,name:r.name,text:caption(r,k,'reel'),tags:TAGS.join(' '),link:link(r,'social','reel','day1'),status:'Scheduled'});k++}}
 var cnt=a.cal.filter(function(c){return c.status==='Scheduled'}).length;log('Scheduled '+cnt+' posts and reels for the next 30 days, each with a tracked link to your website',{k:'cal'});return cnt}
function addAppr(type,title,detail,extra){var a=AP();if(a.appr.some(function(x){return x.type===type&&x.title===title&&x.status==='Waiting'}))return;
 a.appr.unshift(Object.assign({id:'a'+(++S.nid),type:type,title:title,detail:detail,status:'Waiting',at:Date.now()},extra||{}))}
function setupAds(){var a=AP(),P=prods(),pl=plan(),cap=Math.min(+a.inputs.cap||0,pl.cap);if(!cap||!P.length)return 0;var best=P.slice().sort(function(x,y){return (y.sold||0)-(x.sold||0)})[0];
 addAppr('ad','Meta sales campaign: '+best.name,'Sends people to the product page on your website. Daily budget '+rs(cap/30)+' (your monthly cap '+rs(cap)+'). Pauses itself if it loses money for 3 days.',{daily:Math.round(cap/30),pid:best.id,link:link(best,'meta','paid','launch')});
 log('Drafted a Meta sales campaign for '+best.name+'. It waits for your approval',{k:'ads'});return 1}
function setupLive(){var live=!!(S.online&&S.online.live);if(!live)addAppr('live','Put your store online','Your store is ready. Approve to make it public so the posts and ads can send visitors to it.');return live}
function runSetup(){var a=AP(),r={};
 r.seo=skillOn('writer')?setupSeo():0;r.faq=skillOn('aeo')?setupFaq():0;r.blogs=skillOn('seo')?setupBlogs():0;r.cal=skillOn('cal')?setupCalendar():0;
 if(skillOn('wa')){a.wa.cart=true;a.wa.cod=true;log('Switched on WhatsApp cart reminders and COD order confirmation')}
 r.ads=skillOn('ads')?setupAds():0;r.live=setupLive();a.setup={done:true,at:Date.now(),r:r};sv();return r}
X.AP38={plans:PLANS,tier:tier,plan:plan,run:runSetup,state:AP,link:link,metaFor:metaFor};

/* ---------- UI ---------- */
var TABS=[['autopilot-home','Overview'],['autopilot-connections','Connections'],['autopilot-calendar','Calendar'],['autopilot-approvals','Approvals'],['autopilot-skills','Skills'],['autopilot-brand','Brand Builder'],['autopilot-activity','Activity']];
function shell(cur,body){var a=AP(),wait=a.appr.filter(function(x){return x.status==='Waiting'}).length;
 return '<div class="ap38"><div class="ap38h"><div><h1>Autopilot</h1><p class="ap38m">'+h(plan().n)+' plan · '+(a.setup&&a.setup.done?'Running':'Not set up yet')+'</p></div>'+
 '<div class="ap38tabs" role="tablist">'+TABS.map(function(t){return '<a href="#'+t[0]+'" role="tab" aria-selected="'+(t[0]===cur)+'" class="'+(t[0]===cur?'on':'')+'">'+t[1]+(t[0]==='autopilot-approvals'&&wait?' <b class="ap38n">'+wait+'</b>':'')+'</a>'}).join('')+'</div></div>'+
 '<div class="ap38test" role="note"><b>Test mode.</b> Autopilot prepares everything here. Posting to other platforms and running ads start once VendOm’s apps are approved by Meta, Google and TikTok.</div>'+body+'</div>'}
function meter(lbl,used,max){var pct=max?Math.min(100,Math.round(used/max*100)):0;return '<div class="ap38mt"><div><span>'+h(lbl)+'</span><b>'+used+' / '+(max===Infinity?'no limit':max)+'</b></div><i><s style="width:'+pct+'%"></s></i></div>'}
function monthCount(kind){var m=new Date().toISOString().slice(0,7),n=new Date(Date.now()+30*864e5).toISOString().slice(0,7);return AP().cal.filter(function(c){return c.kind===kind}).length}
V['autopilot-home']=function(){var a=AP(),pl=plan(),done=a.setup&&a.setup.done,conns=CONN.filter(function(c){return a.conn[c[0]]}).length;
 var steps=[['Store ready to go live',!!(S.online&&S.online.live)],['Products have meta titles and descriptions',prods().length&&prods().every(function(p){return p.seo&&(p.seo.t||p.seo.title)})],['FAQ for Google and AI search',a.faq.length>0],['Starter blog posts',!!a.blogsMade],['30-day content calendar',a.cal.length>0],['WhatsApp follow-up on',!!(a.wa.cart&&a.wa.cod)],['At least 3 accounts connected',conns>=3]];
 var left='<section class="s23c"><div class="s23ch"><h3>Day-1 setup</h3></div>'+(done?'<p>Last run '+h(new Date(a.setup.at).toLocaleString())+'.</p>':'<p>One tap sets up SEO, AEO and GEO, blogs, an FAQ, a 30-day calendar of posts and reels, WhatsApp follow-up and ad drafts. Nothing that spends money runs without your approval.</p>')+
  '<ul class="ap38chk">'+steps.map(function(s){return '<li class="'+(s[1]?'ok':'')+'"><span aria-hidden="true">'+(s[1]?'✓':'○')+'</span>'+h(s[0])+'</li>'}).join('')+'</ul>'+
  '<button class="btn pri" data-x="ap38run" id="ap38run">'+(done?'Run setup again':'Run day-1 setup')+'</button></section>';
 var right='<section class="s23c"><div class="s23ch"><h3>Planned for the next 30 days on '+h(pl.n)+'</h3><a href="#s-plan">Change plan</a></div>'+meter('Posts',monthCount('post'),pl.posts)+meter('Reels',monthCount('reel'),pl.reels)+meter('Blog posts',(S.blogPosts||[]).filter(function(b){return b.ap38}).length,pl.blogs)+meter('AI images',0,pl.images)+meter('AI video clips',0,pl.videos)+
  '<p class="ap38m">Ads Autopilot runs: '+h(pl.ads.join(', '))+' · manages up to '+(pl.cap===Infinity?'your own cap':rs(pl.cap))+' a month · suggested budget '+h(pl.budget)+'</p></section>';
 var inp=a.inputs,goals=[['orders','More orders'],['followers','More followers'],['traffic','More website visitors']];
 var setup='<section class="s23c"><div class="s23ch"><h3>Your goals</h3></div><div class="ap38g"><label>Main goal<select id="ap38goal">'+goals.map(function(g){return '<option value="'+g[0]+'"'+(inp.goal===g[0]?' selected':'')+'>'+g[1]+'</option>'}).join('')+'</select></label>'+
  '<label>Monthly ad budget cap (Rs)<input id="ap38cap" type="number" min="0" step="1000" value="'+(+inp.cap||0)+'"><small>0 means no ads run.</small></label>'+
  '<label>Languages<input id="ap38langs" value="'+h(inp.langs)+'"></label></div><button class="btn" data-x="ap38save">Save goals</button></section>';
 return shell('autopilot-home','<div class="ap38two">'+left+right+'</div>'+setup)};
V['autopilot-connections']=function(){var a=AP();return shell('autopilot-connections','<p class="ap38m">One tap each. You sign in on the platform’s own page, and VendOm never sees your password. Disconnect any time.</p><div class="ap38grid">'+CONN.map(function(c){var on=a.conn[c[0]],ok=atLeast(c[3]);
  return '<section class="s23c ap38card"><div class="s23ch"><h3>'+h(c[1])+'</h3>'+(on?'<span class="s23p ok">Connected (test)</span>':ok?'<span class="s23p">Not connected</span>':'<span class="s23p info">'+h(PLANS[c[3]].n)+' plan</span>')+'</div><p>'+h(c[2])+'</p>'+(c[4]?'<p class="ap38note">'+h(c[4])+'</p>':'')+
  (ok?'<button class="btn'+(on?'':' pri')+'" data-x="ap38conn:'+c[0]+'">'+(on?'Disconnect':'Connect')+'</button>':'<a class="btn" href="#s-plan">Upgrade</a>')+'</section>'}).join('')+'</div>')};
V['autopilot-calendar']=function(){var a=AP(),cal=a.cal.slice().sort(function(x,y){return (x.day+x.time).localeCompare(y.day+y.time)});
 if(!cal.length)return shell('autopilot-calendar','<section class="s23c"><p>No calendar yet. Run day-1 setup on the Overview tab to plan 30 days of posts and reels.</p><button class="btn pri" data-x="ap38run">Run day-1 setup</button></section>');
 var by={};cal.forEach(function(c){(by[c.day]=by[c.day]||[]).push(c)});
 return shell('autopilot-calendar','<p class="ap38m">'+cal.length+' items. Every caption links to your website with tracking, so you can see which post brings visitors and sales.</p>'+Object.keys(by).map(function(d){return '<section class="s23c ap38day"><div class="s23ch"><h3>'+h(new Date(d+'T00:00').toDateString())+'</h3></div>'+by[d].map(function(c){return '<div class="ap38it"><span class="s23p '+(c.kind==='reel'?'info':'')+'">'+(c.kind==='reel'?'Reel':'Post')+' · '+h(c.time)+'</span><div><p>'+h(c.text)+'</p><small>'+h(c.tags)+'</small><small class="ap38lnk">'+h(c.link)+'</small></div><span class="s23p '+(c.status==='Scheduled'?'warn':'ok')+'">'+h(c.status)+'</span><button class="btn ap38sm" data-x="ap38skip:'+c.id+'" aria-label="Remove this item">Remove</button></div>'}).join('')+'</section>'}).join(''))};
V['autopilot-approvals']=function(){var a=AP();if(!a.appr.length)return shell('autopilot-approvals','<section class="s23c"><p>Nothing waiting. Ad campaigns, budget increases and going live appear here for one tap.</p></section>');
 return shell('autopilot-approvals',a.appr.map(function(x){return '<section class="s23c ap38ap"><div class="s23ch"><h3>'+h(x.title)+'</h3><span class="s23p '+(x.status==='Waiting'?'warn':x.status==='Approved'?'ok':'')+'">'+h(x.status)+'</span></div><p>'+h(x.detail)+'</p>'+(x.link?'<p class="ap38lnk">'+h(x.link)+'</p>':'')+
  (x.status==='Waiting'?'<div class="ap38btns"><button class="btn pri" data-x="ap38ok:'+x.id+'">Approve</button><button class="btn" data-x="ap38no:'+x.id+'">Decline</button></div>':'')+'</section>'}).join(''))};
V['autopilot-skills']=function(){return shell('autopilot-skills','<div class="ap38grid">'+SKILLS.map(function(s){var on=skillOn(s[0]);return '<section class="s23c ap38card"><div class="s23ch"><h3>'+h(s[1])+'</h3><span class="s23p '+(s[2]?'warn':'ok')+'">'+(s[2]?'You approve':'Auto')+'</span></div><p>'+h(s[3])+'</p><label class="ap38tg"><input type="checkbox" class="tg" data-ap38skill="'+s[0]+'"'+(on?' checked':'')+'> '+(on?'On':'Paused')+'</label></section>'}).join('')+'</div>')};
V['autopilot-brand']=function(){var b=AP().brand,m=b.on?Math.min(6,Math.floor((Date.now()-b.start)/(30*864e5))+1):0,tot=BRAND.reduce(function(s,x){return s+x[2]},0);
 return shell('autopilot-brand','<section class="s23c"><div class="s23ch"><h3>Brand Builder: 6 months for new brands</h3>'+(b.on?'<span class="s23p ok">Month '+m+' of 6</span>':'')+'</div><p>For sellers building a brand with its own name, look and voice. It is the same programme on every plan. Suggested ad spend is paid to Meta, Google and TikTok, and Autopilot never spends above your cap.</p>'+
 '<div class="ap38tw"><table class="xt" data-p8="1"><tr><th>Month</th><th>Focus</th><th>What Autopilot does</th><th>Suggested ad spend</th></tr>'+BRAND.map(function(r,i){return '<tr class="'+(m===i+1?'ap38cur':'')+'"><td>'+(i+1)+'</td><td><b>'+h(r[0])+'</b></td><td>'+h(r[1])+'</td><td style="white-space:nowrap">'+rs(r[2])+'</td></tr>'}).join('')+'<tr><td></td><td><b>Total</b></td><td></td><td style="white-space:nowrap"><b>'+rs(tot)+'</b></td></tr></table></div>'+
 '<button class="btn '+(b.on?'':'pri')+'" data-x="ap38brand">'+(b.on?'Stop Brand Builder':'Start Brand Builder')+'</button></section>')};
V['autopilot-activity']=function(){var L=AP().log;return shell('autopilot-activity',L.length?'<section class="s23c"><ul class="ap38log">'+L.map(function(l,i){return '<li><span>'+h(new Date(l.at).toLocaleString())+'</span>'+h(l.t)+(l.undo&&l.undo.k==='seo'&&!l.undone?' <button class="btn ap38sm" data-x="ap38undo:'+i+'">Undo</button>':'')+'</li>'}).join('')+'</ul></section>':'<section class="s23c"><p>Nothing yet. Everything Autopilot does is listed here.</p></section>')};

function rerender(){try{route()}catch(e){}}
A.ap38run=function(){var r=runSetup();tst('Day-1 setup done: '+r.seo+' products optimised, '+r.blogs+' blog drafts, '+r.cal+' posts and reels scheduled');rerender()};
A.ap38save=function(){var a=AP();a.inputs.goal=(q('#ap38goal')||{}).value||'orders';a.inputs.cap=Math.max(0,+((q('#ap38cap')||{}).value)||0);a.inputs.langs=((q('#ap38langs')||{}).value||'').trim()||'English';log('Goals saved: '+a.inputs.goal+', ad cap '+rs(a.inputs.cap));sv();tst('Goals saved');rerender()};
A.ap38conn=function(id){var a=AP(),c=CONN.filter(function(x){return x[0]===id})[0];if(!c)return;if(a.conn[id]){delete a.conn[id];log('Disconnected '+c[1]);tst(c[1]+' disconnected')}else{a.conn[id]={at:Date.now(),mode:'test'};log('Connected '+c[1]+' in test mode');tst(c[1]+' connected in test mode')}sv();rerender()};
A.ap38skip=function(id){var a=AP();a.cal=a.cal.filter(function(c){return c.id!==id});sv();rerender()};
A.ap38ok=function(id){var a=AP(),x=a.appr.filter(function(y){return y.id===id})[0];if(!x)return;x.status='Approved';x.decided=Date.now();
 if(x.type==='live'){log('You approved going live');sv();location.hash='themes';setTimeout(function(){var b=q('[data-x="m13golive"]');if(b)b.click()},400);return}
 log('You approved: '+x.title+(x.type==='ad'?'. It starts when Meta Ads is connected':''));sv();tst('Approved');rerender()};
A.ap38no=function(id){var a=AP(),x=a.appr.filter(function(y){return y.id===id})[0];if(!x)return;x.status='Declined';log('You declined: '+x.title);sv();rerender()};
A.ap38brand=function(){var b=AP().brand;b.on=!b.on;if(b.on)b.start=Date.now();log(b.on?'Brand Builder started':'Brand Builder stopped');sv();rerender()};
A.ap38undo=function(i){var l=AP().log[+i];if(!l||!l.undo||l.undo.k!=='seo')return;(l.undo.ids||[]).forEach(function(id){var p=(S.products||[]).filter(function(x){return x.id===id})[0];if(p&&p.seo){delete p.seo.t;delete p.seo.title;delete p.seo.d;delete p.seo.desc}});l.undone=true;log('Undid the product meta tags');sv();rerender()};
document.addEventListener('change',function(e){var k=e.target&&e.target.getAttribute&&e.target.getAttribute('data-ap38skill');if(!k)return;AP().skills[k]=e.target.checked;var s=SKILLS.filter(function(x){return x[0]===k})[0];log((e.target.checked?'Turned on ':'Paused ')+s[1]);sv();rerender()});

/* nav: Autopilot under Sales channels, after VendOm AI */
try{var NC=X.NAV_CONFIG;if(NC&&!NC.some(function(n){return n.id==='autopilot-home'})){var i=NC.findIndex(function(n){return n.id==='ai-assistant'});
 NC.splice(i>-1?i+1:NC.length,0,{id:'autopilot-home',label:'Autopilot',icon:'bento',sub:[{id:'autopilot-connections',label:'Connections'},{id:'autopilot-calendar',label:'Calendar'},{id:'autopilot-approvals',label:'Approvals'},{id:'autopilot-skills',label:'Skills'},{id:'autopilot-brand',label:'Brand Builder'},{id:'autopilot-activity',label:'Activity'}]});
 var g=NC.filter(function(n){return n.id==='growth'})[0];if(g&&g.sub)g.sub.forEach(function(s){if(s.id==='growth-autopilot')s.label='Campaign Autopilot'});
 if(typeof X.renderNav==='function')X.renderNav()}}catch(e){console.error('ap38 nav',e)}

var css=document.createElement('style');css.textContent=['.ap38{max-width:1100px;margin:0 auto}.ap38h{display:flex;flex-wrap:wrap;gap:10px 24px;align-items:flex-end;justify-content:space-between;margin-bottom:12px}.ap38h h1{margin:0;font-size:22px}',
'.ap38h>div:first-child{display:flex;flex-wrap:wrap;align-items:center;gap:0 10px}.ap38h>div:first-child p{flex-basis:100%}.ap38m{color:#616161;margin:2px 0 10px;font-size:13px}.ap38tabs{display:flex;flex-wrap:wrap;gap:4px}.ap38tabs a{padding:6px 10px;border-radius:8px;text-decoration:none;color:#303030;font-weight:550;font-size:13px}.ap38tabs a.on{background:#303030;color:#fff}.ap38tabs a:hover:not(.on){background:#EBEBEB}',
'.ap38n{background:#E51C00;color:#fff;border-radius:9px;padding:0 6px;font-size:11px}.ap38test{background:#FFF4D6;border:1px solid #F1D48A;border-radius:10px;padding:8px 12px;font-size:13px;margin-bottom:12px}',
'.ap38two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}@media(max-width:800px){.ap38two{grid-template-columns:1fr}}',
'.ap38chk{list-style:none;padding:0;margin:10px 0 14px}.ap38chk li{display:flex;gap:8px;padding:4px 0;color:#616161}.ap38chk li.ok{color:#0C5132}.ap38chk span{width:16px;font-weight:700}',
'.ap38mt{margin:8px 0}.ap38mt div{display:flex;justify-content:space-between;font-size:13px}.ap38mt i{display:block;height:6px;border-radius:3px;background:#EBEBEB;margin-top:4px;overflow:hidden}.ap38mt s{display:block;height:100%;background:#303030;text-decoration:none}',
'.ap38g{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:12px}.ap38g label{display:flex;flex-direction:column;gap:4px;font-weight:550;font-size:13px}.ap38g small{color:#616161;font-weight:400}',
'.ap38grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}.ap38card p{color:#616161;font-size:13px;margin:4px 0 10px}.ap38note{color:#8E1F0B!important}',
'.ap38it{display:grid;grid-template-columns:auto minmax(0,1fr) auto auto;gap:10px;align-items:start;padding:8px 0;border-top:1px solid #EBEBEB}.ap38it p{margin:0}.ap38it small{display:block;color:#616161}.ap38lnk{color:#005BD3!important;overflow-wrap:anywhere;font-size:12px}',
'@media(max-width:640px){.ap38it{grid-template-columns:1fr}}.ap38sm{padding:2px 8px!important;font-size:12px!important}.ap38btns{display:flex;gap:8px}',
'.ap38tw{overflow-x:auto;margin:10px 0}.ap38cur{background:#F1F8F5}.ap38log{list-style:none;margin:0;padding:0}.ap38log li{padding:6px 0;border-top:1px solid #EBEBEB}.ap38log span{color:#616161;font-size:12px;margin-right:10px}.ap38tg{display:flex;gap:8px;align-items:center;font-size:13px}'].join('\n');document.head.appendChild(css);
})();
