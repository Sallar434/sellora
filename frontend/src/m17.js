/* ===== v40: public landing page + sign-up onboarding (email → password → verify email → plan → payment (skippable) → goals) + welcome home ===== */
(function(){
var X=window,M13=X.authView;
function A(){return document.getElementById('auth')}
/* approved logo K1: shopping bag with a V, the handle is the O */
function logo(onDark){return '<span class="lp-logo" style="display:inline-flex;align-items:center;gap:8px"><svg viewBox="0 0 64 64" width="28" height="28" aria-hidden="true"><circle cx="32" cy="17" r="10" fill="none" stroke="'+(onDark?'#A6E37A':'#5DB346')+'" stroke-width="5"/><path d="M10 24h44l-3.2 31a5 5 0 0 1-5 4.5H18.2a5 5 0 0 1-5-4.5z" fill="'+(onDark?'#FFFFFF':'#0E3B2E')+'"/><path d="M22 32l10 18 10-18" fill="none" stroke="'+(onDark?'#0B2A21':'#FFFFFF')+'" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/></svg><b style="font-weight:800;letter-spacing:-.03em;color:'+(onDark?'#FFFFFF':'#0E3B2E')+'">Vend<span style="color:'+(onDark?'#A6E37A':'#5DB346')+'">Om</span></b></span>'}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function el(id){return document.getElementById(id)}
function shell(cls,html){var a=A();if(!a)return null;a.className=cls;a.style.display='flex';a.innerHTML=html;a.scrollTop=0;window.scrollTo(0,0);return a}
var PRICE={basic:300,grow:600,advanced:1000},PNAME={basic:'Basic',grow:'Grow',advanced:'Advanced',enterprise:'Enterprise'};
function rs(n){return 'Rs '+Math.round(n).toLocaleString('en-US')}
var ISO='AF AX AL DZ AS AD AO AI AQ AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BQ BA BW BV BR IO BN BG BF BI CV KH CM CA KY CF TD CL CN CX CC CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FK FO FJ FI FR GF PF TF GA GM GE DE GH GI GR GL GD GP GU GT GG GN GW GY HT HM VA HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI KP KR XK KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU NF MK MP NO OM PK PW PS PA PG PY PE PH PN PL PT PR QA RE RO RU RW BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA GS SS ES LK SD SR SJ SE CH SY TW TJ TZ TH TL TG TK TO TT TN TR TM TC TV UG UA AE GB US UM UY UZ VU VE VN VG VI WF EH YE ZM ZW'.split(' ');
var COUNTRIES=(function(){var dn=null;try{dn=new Intl.DisplayNames(['en'],{type:'region'})}catch(e){}var L=ISO.map(function(c){return dn?dn.of(c):c}).filter(function(n,i,a){return n&&a.indexOf(n)===i}).sort(function(a,b){return a.localeCompare(b)});var i=L.indexOf('Pakistan');if(i>0){L.splice(i,1);L.unshift('Pakistan')}return L})();window.COUNTRY_LIST=COUNTRIES;
function backendOn(){var b=X.VendOmBackend;return !!(b&&b.cfg&&b.cfg().url)}
/* Emails the browser-only version cannot send: kept in this browser so the seller can see them, and sent for real by the VendOm server once connected. */
function mail(to,subject,text){DB.mail=DB.mail||[];DB.mail.unshift({to:to,subject:subject,text:text,at:Date.now()});DB.mail=DB.mail.slice(0,50);persist()}
function newCode(e){var c=String(Math.floor(100000+Math.random()*900000));DB.ver=DB.ver||{};DB.ver[e]={code:c,at:Date.now(),ok:false,tries:0};mail(e,'Your VendOm verification code: '+c,'Enter '+c+' to verify your email. The code expires in 30 minutes.');return c}
function verified(e){return !!(DB.ver&&DB.ver[e]&&DB.ver[e].ok)}

/* ---------- landing page ---------- */
var FAQ=[['What is VendOm?','VendOm is an online store builder. You get a website, checkout, payments, shipping, marketing and an AI assistant in one place, with cash on delivery, Pakistani couriers and WhatsApp built in.'],
 ['How much does VendOm cost?','Every plan starts with a 4-day free trial, no card needed. After that, Basic is Rs 300, Grow Rs 600 and Advanced Rs 1,000 a month, or 20% less when you pay yearly.'],
 ['What is VendOm Pay Protection?','When a buyer pays with protection, VendOm holds the money until they confirm delivery. If the parcel never arrives, the buyer is refunded (the seller keeps the shipping cost once it was shipped). You can also take direct payments.'],
 ['Can I use my own domain name?','Yes. Your store gets a free yourstore.vendom.app address, and you can connect a domain you already own or buy a new one.'],
 ['Do I need to be a designer or developer?','No. Describe your shop to VendOm AI, or pick a free theme and change it with the editor. No code needed.'],
 ['Can I connect the apps I already use?','Yes. Facebook and Instagram, Google, TikTok, WhatsApp, couriers and accounting are built in, and you can paste the link of almost any other tool (Zapier, Slack, Google Sheets and more) in Apps → Connect any app.']];
var CARDS=[['<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E3B2E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16v10H9l-5 4z"/><path d="M8 10h8M8 13h5"/></svg>','Chat your store into existence','Tell VendOm AI what you sell. It builds the design, products, pages and policies in minutes.'],
 ['<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E3B2E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg>','Get paid, protected','VendOm Pay holds the buyer\'s money until delivery, so buyers trust you and sellers get paid.'],
 ['<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E3B2E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18"/></svg>','Sell where people shop','Facebook, Instagram, TikTok, WhatsApp and Google, plus any tool you paste a link to.'],
 ['<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E3B2E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7z"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/></svg>','Cash on delivery and couriers','TCS, Leopards, PostEx and Trax labels and tracking, with COD confirmation on WhatsApp.']];
function landing(){
 shell('ob-land','<header class="lp-h">'+logo(false)+'<span style="flex:1"></span><button type="button" class="lp-link" id="door-in">Sign in</button><button type="button" class="lp-cta" id="door-up">Start free trial</button></header>'
  +'<section class="lp-hero"><div class="lp-hero-in"><h1>Your business starts with VendOm</h1><p>Start free for 4 days, then from Rs 300 a month. Build your store, take payments from every country and sell everywhere.</p>'
  +'<form class="lp-mail" id="lp-f1" onsubmit="return false"><input id="land-email" type="email" autocomplete="email" placeholder="Enter your email" aria-label="Email"><button type="submit" id="land-go" aria-label="Start for free">Start for free →</button></form><small>No card needed for the trial.</small></div></section>'
  +'<section class="lp-cards">'+CARDS.map(function(c){return '<div class="lp-card"><div class="lp-ic">'+c[0]+'</div><h3>'+c[1]+'</h3><p>'+c[2]+'</p></div>'}).join('')+'</section>'
  +'<section class="lp-band"><div><h2>It pays to sell with VendOm</h2><ul><li>✓ Prices in Pakistani Rupee (PKR)</li><li>✓ Cards from every country, JazzCash and Easypaisa</li><li>✓ VendOm Pay Protection for buyers and sellers</li></ul></div><form class="lp-mail" id="lp-f2" onsubmit="return false"><input id="land-email2" type="email" autocomplete="email" placeholder="Enter your email" aria-label="Email"><button type="submit">Start free trial</button></form></section>'
  +'<section class="lp-faq"><h2>Questions?</h2>'+FAQ.map(function(f,i){return '<details'+(i===0?' open':'')+'><summary>'+f[0]+'</summary><p>'+f[1]+'</p></details>'}).join('')+'</section>'
  +'<footer class="lp-f">'+logo(false)+'<span>© '+new Date().getFullYear()+' VendOm</span></footer>');
 el('door-in').onclick=function(){authView('in')};el('door-up').onclick=function(){authView('up')};
 el('lp-f1').onsubmit=function(){authView('up',el('land-email').value.trim());return false};
 el('lp-f2').onsubmit=function(){authView('up',el('land-email2').value.trim());return false};
 document.title='VendOm: start your online store'}

/* ---------- step frame (dark) ---------- */
function step(inner,o){o=o||{};return shell('ob-dark','<div class="ob-top">'+logo(true)+'<span style="flex:1"></span>'+(o.skip?'<button type="button" class="ob-skip" id="ob-skip">Skip</button>':'')+'</div><div class="ob-mid">'+inner+'</div>'+(o.foot?'<div class="ob-foot">'+o.foot+'</div>':''))}
function err(t){var e=el('ae');if(e)e.textContent=t||''}

/* 1. email + password */
function signup(prefill){var e=(prefill||'').toLowerCase(),fixed=/^\S+@\S+\.\S+$/.test(e);
 step('<h1>Start your free trial</h1><p class="ob-sub">4 days free, then from Rs 300 a month</p><div class="ob-card">'
  +(fixed?'<div class="ob-fixed"><div><small>Email address</small><span id="ob-em">'+esc(e)+'</span></div><button type="button" class="ob-lnk" id="ob-chg">Change</button><input id="a2" type="hidden" value="'+esc(e)+'"></div>':'<label for="a2">Email address</label><input id="a2" type="email" autocomplete="username">')
  +'<label for="a3">Create a password</label><div class="ob-pw"><input id="a3" type="password" autocomplete="new-password"><button type="button" class="ob-eye" id="ob-eye" aria-label="Show password">👁</button></div>'
  +'<div class="ob-meter"><i id="ob-bar"></i></div><p class="ob-rule" id="ob-rule">Must be at least 8 characters.</p><p id="ae" class="err" role="alert"></p>'
  +'<button type="button" class="ob-btn" id="ab">Create account</button><p class="ob-alt">Already have an account? <button type="button" class="ob-lnk" id="asw">Sign in</button></p></div>'
  +'<div class="ob-country"><label for="a-country">I\'m selling from</label><select id="a-country">'+COUNTRIES.map(function(c){return '<option'+(c==='Pakistan'?' selected':'')+'>'+c+'</option>'}).join('')+'</select></div>',
  {foot:'By creating an account you agree to VendOm\'s Terms and Privacy Policy.'});
 var pw=el('a3');pw.oninput=function(){var v=pw.value,s=(v.length>=8)+(/[A-Z]/.test(v)&&/[a-z]/.test(v))+/\d/.test(v)+/[^A-Za-z0-9]/.test(v)+(v.length>=12);el('ob-bar').style.width=Math.min(100,v.length?12+s*22:0)+'%';el('ob-bar').className=s>=4?'ok':s>=2?'mid':'';el('ob-rule').textContent=v.length<8?'Must be at least 8 characters.':s>=4?'Strong password.':'Good. Add numbers or symbols to make it stronger.'};
 el('ob-eye').onclick=function(){pw.type=pw.type==='password'?'text':'password'};
 if(el('ob-chg'))el('ob-chg').onclick=function(){authView('up','')};
 el('asw').onclick=function(){authView('in')};
 var busy=false,go=function(){if(busy)return;var em=el('a2').value.trim().toLowerCase(),p=pw.value;
  if(!/^\S+@\S+\.\S+$/.test(em))return err('Enter a valid email.');if(p.length<8)return err('Password must be at least 8 characters.');
  DB.a=DB.a||{};DB.d=DB.d||{};if(DB.a[em])return err('That email already has an account. Sign in instead.');busy=true;
  hx(p).then(function(hash){busy=false;var first=!Object.keys(DB.a).length,orphan=first?unownedKey():'';DB.a[em]=hash;
   DB.obCountry=DB.obCountry||{};DB.obCountry[em]=el('a-country').value;
   mail(em,'Welcome to VendOm: your account is ready','Hi, you created a VendOm account with '+em+'. Verify your email with the code we sent, then set up your store. Your 4-day free trial starts when you finish.');
   if(orphan&&claimStore(orphan,em)){DB.ver=DB.ver||{};DB.ver[em]={ok:true};startSession(em);return}
   DB.pending=em;DB.session=null;DB.s=null;U=null;delete DB.out;newCode(em);persist();window._obPlan=null;authView('verify')})};
 el('ab').onclick=go;A().onkeydown=function(ev){if(ev.key==='Enter')go()};setTimeout(function(){var f=fixed?pw:el('a2');if(f)f.focus()},0)}

/* 2. verify email */
function verify(){var e=DB.pending;if(!e||!DB.a[e])return authView('up');var v=(DB.ver||{})[e]||{code:newCode(e)};
 step('<h1>Check your email</h1><p class="ob-sub">We sent a 6-digit code to <b>'+esc(e)+'</b></p><div class="ob-card"><label for="a-code">Verification code</label><input id="a-code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="123456" class="ob-code"><p id="ae" class="err" role="alert"></p><button type="button" class="ob-btn" id="ab">Verify email</button>'
  +'<p class="ob-alt">No email? <button type="button" class="ob-lnk" id="a-resend">Send a new code</button> · <button type="button" class="ob-lnk" id="a-other">Use another email</button></p>'
  +(backendOn()?'':'<div class="ob-demo" id="ob-demo"><b>Email sending is not connected yet.</b> Real emails go out once VendOm runs on its server. Until then, your code is <b id="ob-democode">'+esc(DB.ver[e].code)+'</b>.</div>')+'</div>');
 var go=function(){var c=(el('a-code').value||'').replace(/\D/g,''),r=DB.ver[e];if(c.length!==6)return err('Enter the 6-digit code.');if(Date.now()-r.at>30*6e4)return err('This code has expired. Send a new one.');r.tries=(r.tries||0)+1;if(r.tries>5)return err('Too many tries. Send a new code.');if(c!==r.code){persist();return err('That code is not right.')}
  r.ok=true;r.at=Date.now();delete r.code;mail(e,'Your email is verified','Thanks for verifying '+e+'. You can now finish setting up your VendOm store.');persist();authView('plan')};
 el('ab').onclick=go;A().onkeydown=function(ev){if(ev.key==='Enter')go()};
 el('a-resend').onclick=function(){newCode(e);persist();toast('A new code was sent to '+e);verify()};
 el('a-other').onclick=function(){delete DB.a[e];delete DB.ver[e];delete DB.pending;persist();authView('up','')};
 setTimeout(function(){var f=el('a-code');if(f)f.focus()},0)}

/* 4. payment (skippable during the trial) */
function pay(){var e=DB.pending;if(!e)return authView('up');var ob=X._obPlan||{plan:'grow',iv:'monthly'},pr=PRICE[ob.plan]||600,ann=ob.iv==='annual',amt=ann?pr*12*0.8:pr,d=new Date(Date.now()+4*864e5);
 step('<div class="ob-pay"><div class="ob-pay-l"><h1>Start free,<br>then '+(ann?rs(amt)+'/year':rs(amt)+'/month')+'</h1><div class="ob-tl"><div><span>Today</span><b>4 days free</b></div><div><span>'+d.toLocaleDateString('en-GB',{day:'numeric',month:'short'})+'</span><b>'+esc(PNAME[ob.plan]||'Grow')+': '+(ann?rs(amt)+' a year':rs(amt)+' a month')+'</b></div></div><p class="ob-small">Cancel anytime before the trial ends and you pay nothing. <button type="button" class="ob-lnk" id="ob-chgplan">Change plan</button></p></div>'
  +'<div class="ob-pay-r"><div class="ob-wallets"><button type="button" class="ob-w" data-w="PayPal">PayPal</button><button type="button" class="ob-w" data-w="JazzCash">JazzCash</button><button type="button" class="ob-w" data-w="Easypaisa">Easypaisa</button></div><div class="ob-or">or pay by card</div>'
  +'<input id="pc-name" placeholder="Name on card" autocomplete="cc-name"><input id="pc-num" placeholder="Card number" inputmode="numeric" autocomplete="cc-number"><div class="ob-two"><input id="pc-exp" placeholder="MM / YY" autocomplete="cc-exp"><input id="pc-cvc" placeholder="CVV" inputmode="numeric" autocomplete="cc-csc"></div><p id="ae" class="err" role="alert"></p>'
  +'<button type="button" class="ob-btn" id="pay-go">Start trial · nothing to pay today</button><p class="ob-small">Plus applicable taxes. VendOm Pay keeps your card safe; it is charged only when the trial ends.</p></div></div>',
  {skip:true,foot:'You can add a payment method later in Settings › Plan.'});
 el('ob-skip').onclick=function(){DB.obCard=DB.obCard||{};delete DB.obCard[e];persist();authView('goals')};
 el('ob-chgplan').onclick=function(){window._obPlan=null;authView('plan')};
 [].forEach.call(document.querySelectorAll('[data-w]'),function(b){b.onclick=function(){err('');toast(b.dataset.w+' is added when live payments are connected. Use a card or Skip for now.')}});
 el('pay-go').onclick=function(){var n=el('pc-num').value.replace(/\D/g,''),ex=/^(\d\d)\s*\/\s*(\d\d)$/.exec(el('pc-exp').value.trim());
  if(!el('pc-name').value.trim())return err('Enter the name on the card.');if(n.length<13||!luhn(n))return err('That card number does not look right.');if(!ex||+ex[1]<1||+ex[1]>12||new Date(2000+ +ex[2],+ex[1],1)<=new Date())return err('Check the expiry date.');if(!/^\d{3,4}$/.test(el('pc-cvc').value.trim()))return err('Enter the security code.');
  DB.obCard=DB.obCard||{};DB.obCard[e]={brand:/^4/.test(n)?'Visa':/^(5[1-5]|2[2-7])/.test(n)?'Mastercard':/^3[47]/.test(n)?'Amex':'Card',last4:n.slice(-4),exp:ex[1]+'/'+ex[2]};persist();authView('goals')}}
function luhn(n){var s=0,a=false;for(var i=n.length-1;i>=0;i--){var d=+n[i];if(a){d*=2;if(d>9)d-=9}s+=d;a=!a}return s%10===0}

/* 5. what can we help you do? */
var GOALS=[['online','Sell online'],['instore','Sell in-store'],['social','Sell on social media'],['whatsapp','WhatsApp & cash on delivery'],['dropship','Dropshipping'],['pod','Print on demand'],['digital','Sell digital products'],['wholesale','Wholesale / B2B'],['intl','Sell internationally'],['services','Services & bookings'],['move','Move an existing store']];
function goals(){var e=DB.pending;if(!e)return authView('up');var sel={online:1};
 step('<div class="ob-back-wrap"><button type="button" class="ob-back" id="ob-back" aria-label="Back">←</button></div><h1>What can we help you do?</h1><p class="ob-sub">Choose all that apply. We\'ll tailor your setup.</p><div class="ob-card ob-wide"><div class="ob-chips">'+GOALS.map(function(g){return '<button type="button" class="ob-chip'+(sel[g[0]]?' on':'')+'" data-goal="'+g[0]+'" aria-pressed="'+(!!sel[g[0]])+'">'+(sel[g[0]]?'✓ ':'+ ')+g[1]+'</button>'}).join('')+'</div><button type="button" class="ob-btn" id="ab">Continue</button></div>',{skip:true});
 [].forEach.call(document.querySelectorAll('[data-goal]'),function(b){b.onclick=function(){var k=b.dataset.goal;if(sel[k])delete sel[k];else sel[k]=1;b.classList.toggle('on',!!sel[k]);b.setAttribute('aria-pressed',!!sel[k]);b.textContent=(sel[k]?'✓ ':'+ ')+GOALS.filter(function(g){return g[0]===k})[0][1]}});
 el('ob-back').onclick=function(){authView('pay')};
 var done=function(list){finish(e,list)};el('ab').onclick=function(){done(Object.keys(sel))};el('ob-skip').onclick=function(){done([])}}
/* A real new store starts empty, like Shopify: no sample products, orders, customers, collections, discounts, apps or alerts. */
var EMPTY=['products','orders','collections','cols','draftOrders','abandonedCheckouts','checkoutsList','purchaseOrders','transfers','giftCards','customerSegments','companies','discountsList','filesList','blogPosts','catalogsList','rolloutsList','installedApps','customApps','payoutsList','disc2','gc2','osPages','alerts','cust','carts','autos'];
function emptyStore(){S.noDemo=true;EMPTY.forEach(function(k){S[k]=[]});S.pages=[];S.stats={views:0,sess:0,days:{}};S.nid=1}
X.vendomEmptyStore=emptyStore;
/* Some pages add sample objects the first time they open. For a real store, reset each one once to an honest empty / not-connected state. */
var CLEAN={
 growth:function(g){g.roas='0x';g.attributedRev=0;g.activeAutomations=0;g.channels=[];(g.autopilotRules||[]).forEach(function(r){r.on=false;r.saves=0});['campaigns','attribution','ads'].forEach(function(k){if(Array.isArray(g[k]))g[k]=[]})},
 metaPixel:function(m){m.enabled=false;m.pixelId='';m.capiToken='';m.testEventCode='';m.account={connected:false,name:'',id:'',catalogSynced:false,catalogItems:0};m.logs=[]},
 googleChannel:function(g){g.enabled=false;g.ga4Id='';g.gtmId='';g.adsConversionId='';g.adsLabel='';g.account={connected:false,email:'',merchantStatus:'Not connected'}},
 whatsapp:function(w){if(w.normal){w.normal.enabled=false;w.normal.number='';w.normal.widget=false}if(w.business){w.business={enabled:false,wabaId:'',phoneId:'',token:'',verifiedName:'',status:'Not connected',autoOrderConfirm:false,autoAbandonedRecovery:false,autoShippingUpdates:false}}},
 marketsList:function(L){var c=S.country||'Pakistan',p=L.filter(function(m){return m.isPrimary})[0]||{name:'Domestic',isPrimary:true,status:'Active'};p.name=c+' (home market)';p.countries=[c];p.salesShare='—';L.length=0;L.push(p)}
};
function cleanSamples(){if(!S||!S.noDemo)return;S._clean=S._clean||{};var ch=false;for(var k in CLEAN)if(!S._clean[k]&&S[k]){try{CLEAN[k](S[k])}catch(e){}S._clean[k]=1;ch=true}
 ['autos','alerts','installedApps','customApps'].forEach(function(k){if(!S._clean[k]&&Array.isArray(S[k])&&S[k].length){S[k]=[];S._clean[k]=1;ch=true}});if(ch)save()}
X.vendomCleanSamples=cleanSamples;
if(X.onRoute)X.onRoute(function(){var b=JSON.stringify([S.growth,S.metaPixel,S.googleChannel,S.whatsapp,S.marketsList]);cleanSamples();if(JSON.stringify([S.growth,S.metaPixel,S.googleChannel,S.whatsapp,S.marketsList])!==b&&!X._cleanRe){X._cleanRe=1;setTimeout(function(){X._cleanRe=0;route()},0)}});
function finish(e,list){if(!e||!DB.a[e])return authView('up');var card=(DB.obCard||{})[e];fresh('My Store',e);emptyStore();S.goals=list;S.obSetup=true;S.country=(DB.obCountry||{})[e]||S.country;if(card)S.billingCard=card;S.emailVerified=verified(e);
 startSession(e);X.API&&X.API.email&&X.API.email(e,'Welcome to VendOm: your account is ready','Hi, your VendOm account and store are ready. Your 4-day free trial has started.','welcome')}

/* sign in: same look, and an unverified account goes back to the code step */
function signin(){var a=A();if(a)a.className='ob-dark ob-classic';accountFormIn()}
var accountFormIn=function(){accountForm(false)};

/* router for the public pages */
var authView=X.authView=window.authView=function(m,arg){
 if(m==='up')return signup(arg);
 if(m==='in')return signin();
 if(m==='verify')return verify();
 if(m==='pay')return pay();
 if(m==='goals')return goals();
 if(m==='plan'){var e=DB.pending;if(e&&DB.a&&DB.a[e]&&!verified(e))return verify();var a=A();if(a)a.className='ob-dark';return M13('plan')}
 if(m==='store')return pay();
 return landing()};
try{authView=window.authView}catch(e){}
X.afterPlanPick=function(){X.authView('pay')};

/* ---------- welcome home: "Let's set up My Store" with an editable store name ---------- */
var SETUP={base:[['📦','Add your products','Add products one by one or import a CSV from another platform.','go:products'],['🎨','Choose your store design','Pick a free theme, then make it yours with the editor or VendOm AI.','go:themes'],['💳','Set up payments','Choose direct payments or VendOm Pay Protection, and add your payout account.','go:vendom-pay']],
 social:['📣','Connect Facebook, Instagram and TikTok','Sell where your customers scroll.','go:apps-meta'],whatsapp:['💬','Turn on WhatsApp orders and COD','Confirm cash-on-delivery orders on WhatsApp.','go:apps-whatsapp'],dropship:['🔗','Add a dropshipping app','Find suppliers in the App Store.','go:app-store'],pod:['🖨️','Add print on demand','Sell custom designs without stock.','go:app-store'],digital:['💾','Sell digital products','Upload files buyers download after paying.','go:products'],
 instore:['🏬','Add your shop location','Set up pickup and in-store selling.','go:s-locations'],wholesale:['🏢','Set up wholesale','Add companies, price lists and minimum orders.','go:customers-companies'],intl:['🌍','Sell internationally','Add markets, currencies and international shipping.','go:markets'],services:['📅','Offer services','Add services as products with booking notes.','go:products'],move:['🚚','Move your existing store','Copy products, photos and collections from Shopify, WooCommerce, Wix or any site.','go:products-import']};
function welcome(){var g=S.goals||[],extra=g.map(function(k){return SETUP[k]}).filter(Boolean).slice(0,3),cards=SETUP.base.concat(extra);
 return '<div class="ob-home"><h1>Welcome to VendOm</h1><h2>Let\'s set up <span id="home-name-wrap"><button type="button" class="ob-name" id="home-name" data-x="obname" title="Click to rename your store">'+esc(S.name||'My Store')+'</button></span></h2>'
  +(S.emailVerified===false?'<p class="ob-warn">Verify your email to keep your account safe.</p>':'')+'</div>'
  +'<h3 class="ob-h3">Start building your store</h3><div class="ob-setup">'+cards.map(function(c){return '<button type="button" class="ob-sc" data-x="'+c[3]+'"><span class="ob-sci">'+c[0]+'</span><b>'+c[1]+'</b><span>'+c[2]+'</span></button>'}).join('')+'</div><p style="text-align:right;margin:4px 0 18px"><button type="button" class="lnk" data-x="obhide">Hide setup guide</button></p>'}
var A2=X.ACT||(X.ACT={});
A2.obname=function(){var w=el('home-name-wrap');if(!w)return;w.innerHTML='<input id="home-name-in" class="ob-name-in" maxlength="40" value="'+esc(S.name||'My Store')+'" aria-label="Store name"><button type="button" class="btn pri" id="home-name-save">Save</button>';var i=el('home-name-in');i.focus();i.select();
 var save1=function(){var v=i.value.trim();if(!v){toast('Enter a store name');return}S.name=v;save();var sn=el('sn');if(sn)sn.textContent=v;var sd=el('sd');if(sd&&typeof slug==='function')sd.textContent=slug()+'.vendom.app';toast('Store name saved');route()};
 el('home-name-save').onclick=save1;i.onkeydown=function(e){if(e.key==='Enter')save1();if(e.key==='Escape')route()}};
A2.obhide=function(){S.obSetup=false;save();route()};
var HOME=V.home;V.home=function(){var out=HOME();if(S.obSetup){out=welcome()+out.replace(/<div class="hero">[\s\S]*?<\/div>/,'')}return out};

/* ---------- styles ---------- */
var css=document.createElement('style');css.textContent=[
'body.locked #auth.ob-land{display:block!important;padding:0;background:#fff!important;color:#111;align-items:stretch}#auth.ob-land *{box-sizing:border-box}#auth.ob-land h1,#auth.ob-land .lp-hero p,#auth.ob-land .lp-band h2,#auth.ob-land .lp-band li{color:#fff!important}#auth.ob-land .lp-card p{color:#555!important}#auth.ob-land .lp-faq details p{color:#444!important}',
'.lp-h{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:12px;padding:14px clamp(16px,4vw,40px);background:rgba(255,255,255,.92);backdrop-filter:blur(8px);border-bottom:1px solid #eee}.lp-logo{font-size:22px;letter-spacing:-.5px}.ob-dark .lp-logo{color:#fff}',
'.lp-link{background:none;border:0;font:inherit;font-weight:600;cursor:pointer;color:#111;padding:8px 10px}.lp-cta{background:#111;color:#fff;border:0;border-radius:999px;padding:10px 18px;font:inherit;font-weight:600;cursor:pointer}',
'.lp-hero{background:#0E3B2E;color:#fff;padding:clamp(48px,9vw,110px) 16px;display:flex;justify-content:center}.lp-hero-in{max-width:640px;text-align:center}.lp-hero h1{font-size:clamp(34px,6vw,58px);line-height:1.05;margin:0 0 16px;letter-spacing:-1.5px;color:#fff}.lp-hero p{font-size:18px;opacity:.9;margin:0 0 24px;color:#fff}.lp-hero small{display:block;margin-top:10px;opacity:.75}',
'.lp-mail{display:flex;gap:8px;background:#fff;border-radius:999px;padding:6px;max-width:520px;margin:0 auto}.lp-mail input{flex:1;border:0;outline:0;font:inherit;padding:10px 14px;border-radius:999px;min-width:0;color:#111;background:transparent}.lp-mail button{border:0;border-radius:999px;background:#A6E37A;color:#0E3B2E;font:inherit;font-weight:700;padding:10px 18px;cursor:pointer;white-space:nowrap}',
'.lp-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:18px;max-width:1100px;margin:48px auto;padding:0 16px}.lp-card{background:#fff;border-radius:14px;padding:22px;box-shadow:0 1px 0 rgba(0,0,0,.07),0 0 0 1px rgba(0,0,0,.06)}.lp-ic{width:44px;height:44px;border-radius:12px;background:#E3F3D6;display:flex;align-items:center;justify-content:center;margin-bottom:14px}.lp-card h3{margin:0 0 6px;font-size:18px}.lp-card p{margin:0;color:#555;line-height:1.5}',
'.lp-band{max-width:1000px;margin:24px auto;background:#1A1A1A;color:#fff;border-radius:22px;padding:32px;display:flex;flex-wrap:wrap;gap:24px;align-items:center;justify-content:space-between}.lp-band h2{color:#fff;margin:0 0 10px;font-size:28px}.lp-band ul{list-style:none;padding:0;margin:0;line-height:1.9}.lp-band .lp-mail{margin:0;flex:1;min-width:260px}',
'.lp-faq{max-width:820px;margin:56px auto;padding:0 16px}.lp-faq h2{font-size:30px}.lp-faq details{border-bottom:1px solid #e5e5e5;padding:16px 0}.lp-faq summary{cursor:pointer;font-weight:600;font-size:17px}.lp-faq details p{color:#444;line-height:1.6;margin:10px 0 0}.lp-f{display:flex;justify-content:space-between;padding:24px clamp(16px,4vw,40px);border-top:1px solid #eee;color:#666;font-size:14px}',
'body.locked #auth.ob-dark{display:flex!important;flex-direction:column;align-items:stretch;justify-content:flex-start;padding:0;background:#0B2A21!important;color:#fff;min-height:100%}#auth.ob-dark .ob-mid>h1,#auth.ob-dark .ob-pay-l h1,#auth.ob-dark .ob-pay-l,#auth.ob-dark .ob-tl div{color:#fff!important}#auth.ob-dark .ob-mid>.ob-sub{color:#cfd6d2!important}#auth.ob-dark .ob-card p,#auth.ob-dark .ob-card label{color:#555!important}#auth.ob-dark .ob-card .ob-fixed span{color:#111}#auth.ob-dark .ob-demo,#auth.ob-dark .ob-demo b{color:#333!important}',
'.ob-top{display:flex;align-items:center;padding:20px clamp(16px,4vw,40px)}.ob-skip{background:#2a2f2c;color:#fff;border:0;border-radius:999px;padding:10px 20px;font:inherit;font-weight:600;cursor:pointer}',
'.ob-mid{flex:1;display:flex;flex-direction:column;align-items:center;padding:20px 16px 40px;text-align:center}.ob-mid h1{color:#fff;font-size:clamp(28px,4vw,40px);margin:10px 0 6px;letter-spacing:-.8px}.ob-sub{color:#cfd6d2!important;font-size:18px;margin:0 0 26px}',
'.ob-card{background:#fff;color:#111;border-radius:22px;padding:22px;width:100%;max-width:460px;text-align:left}.ob-card label{display:block;font-size:13px;color:#555!important;margin:6px 0 4px}.ob-card input{width:100%;font:inherit;padding:13px 14px;border:1.5px solid #cfd3d1;border-radius:12px;margin:0 0 6px;background:#fff;color:#111}.ob-card input:focus{outline:0;border-color:#111}',
'.ob-fixed{display:flex;align-items:center;justify-content:space-between;background:#eef0ef;border-radius:12px;padding:12px 14px;margin-bottom:10px}.ob-fixed small{display:block;color:#555}.ob-lnk{background:none;border:0;color:inherit;font:inherit;font-weight:600;text-decoration:underline;cursor:pointer;padding:0}',
'.ob-pw{position:relative}.ob-pw input{padding-right:46px}.ob-eye{position:absolute;right:8px;top:8px;background:none;border:0;cursor:pointer;font-size:18px}.ob-meter{height:4px;background:#e5e7e6;border-radius:4px;overflow:hidden;margin:4px 0 6px}.ob-meter i{display:block;height:100%;width:0;background:#b42318;transition:width .2s}.ob-meter i.mid{background:#F2C14E}.ob-meter i.ok{background:#2E6B4F}.ob-rule{color:#555!important;font-size:14px;margin:0 0 6px}',
'.ob-btn{width:100%;border:0;border-radius:999px;background:#111;color:#fff;font:inherit;font-weight:700;padding:14px;cursor:pointer;margin-top:8px}.ob-btn:hover{background:#2E6B4F}.ob-alt{text-align:center;color:#555!important;font-size:14px;margin:14px 0 0}#auth .err{color:#b42318!important;min-height:18px;margin:4px 0;font-size:14px}',
'.ob-country{margin-top:22px;display:flex;gap:10px;align-items:center;color:#fff}.ob-country label{color:#fff!important;font-weight:600}.ob-country select{background:#1c221f;color:#fff;border:1px solid #3a423e;border-radius:999px;padding:9px 14px;font:inherit}.ob-foot{text-align:center;color:#9aa39e;font-size:13px;padding:0 16px 24px}',
'.ob-code{font-size:28px!important;letter-spacing:10px;text-align:center}.ob-demo{margin-top:14px;background:#fff7e0;border:1px solid #F2C14E;border-radius:12px;padding:10px 12px;font-size:14px;color:#333}',
'.ob-pay{display:flex;flex-wrap:wrap;background:#0f1512;border:1px solid #2a332e;border-radius:24px;overflow:hidden;max-width:960px;width:100%;text-align:left}.ob-pay-l{flex:1 1 320px;padding:32px;color:#fff}.ob-pay-l h1{text-align:left;margin-top:0}.ob-tl div{display:flex;justify-content:space-between;gap:12px;border-bottom:1px solid #2a332e;padding:16px 0;color:#e7ece9}.ob-small{font-size:13px;color:#9aa39e!important;margin-top:14px}',
'.ob-pay-r{flex:1 1 320px;background:#fff;color:#111;margin:10px;border-radius:18px;padding:22px}.ob-pay-r input{width:100%;font:inherit;padding:12px;border:1.5px solid #cfd3d1;border-radius:10px;margin:0 0 8px;color:#111;background:#fff}.ob-two{display:flex;gap:8px}.ob-wallets{display:flex;gap:8px;flex-wrap:wrap}.ob-w{flex:1;min-width:90px;border:0;border-radius:999px;padding:12px;font:inherit;font-weight:700;cursor:pointer;background:#0070ba;color:#fff}.ob-w[data-w=JazzCash]{background:#e21b22}.ob-w[data-w=Easypaisa]{background:#3bb54a}.ob-or{text-align:center;color:#777;margin:12px 0;font-size:14px}.ob-pay-r .ob-small{color:#666!important}',
'.ob-wide{max-width:640px}.ob-chips{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:12px}.ob-chip{border:0;border-radius:999px;background:#eef0ef;color:#111;font:inherit;font-weight:500;padding:11px 16px;cursor:pointer}.ob-chip.on{background:#111;color:#fff}.ob-back-wrap{width:100%;max-width:640px;text-align:left}.ob-back{width:46px;height:46px;border-radius:50%;border:0;background:#2a2f2c;color:#fff;font-size:20px;cursor:pointer}',
'#auth.ob-classic .acard{margin:auto;border-radius:22px}#auth.ob-dark>.m13pick,#auth.ob-dark>.acard{margin:40px auto!important;width:calc(100% - 32px);max-width:1060px;border-radius:22px}',
'.ob-home{text-align:center;padding:28px 0 8px}.ob-home h1{font-size:clamp(26px,3.6vw,36px);margin:0}.ob-home h2{font-size:clamp(24px,3.4vw,34px);margin:4px 0 0;font-weight:700}.ob-name{font:inherit;color:inherit;background:none;border:0;border-bottom:2px dotted currentColor;cursor:pointer;padding:0}.ob-name:hover{color:#2E6B4F}.ob-name-in{font:inherit;font-size:24px;padding:4px 10px;border:1.5px solid #111;border-radius:10px;max-width:260px;margin-right:8px}.ob-warn{color:#b42318}',
'.ob-h3{margin:22px 0 10px}.ob-setup{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}.ob-sc{text-align:left;background:var(--panel,#fff);border:1px solid var(--line,#e3e3e3);border-radius:16px;padding:18px;cursor:pointer;font:inherit;color:inherit;display:flex;flex-direction:column;gap:6px}.ob-sc:hover{border-color:#2E6B4F;box-shadow:0 2px 10px rgba(0,0,0,.06)}.ob-sci{font-size:28px}.ob-sc span:last-child{color:var(--mu,#666);font-size:14px;line-height:1.45}',
'@media(max-width:600px){.lp-mail{flex-direction:column;border-radius:18px}.lp-mail button{width:100%}.lp-band{border-radius:0}.ob-pay-l{padding:22px}}'].join('');document.head.appendChild(css);
})();
