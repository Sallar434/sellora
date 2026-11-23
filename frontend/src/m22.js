/* ===== v46: Online Store › Preferences (Shopify-style): private mode with password until a plan is paid, social sharing image + SEO in the store's page head,
   hreflang, automatic redirection, spam protection, crawler access signatures and trusted domains ===== */
(function(){
var X=window,q=X.SX.q,qa=X.SX.qa,h=X.SX.h,A=X.ACT;
function be(){var b=X.VendOmBackend;return b&&b.status&&b.status().status==='ok'&&b.cfg().storeId?b:null}
function paidPlan(){var s=S.sub9;return !s||s.status==='active'}
function word(){var c='bcdfghjkmnpqrstvwxyz',v='aeiou',o='',r=new Uint32Array(6);crypto.getRandomValues(r);for(var i=0;i<6;i++)o+=(i%2?v:c).charAt(r[i]%(i%2?5:20));return o}
function on(){S.online=S.online||{password:true,live:false};if(!S.online.pw)S.online.pw=word();if(S.online.msg==null)S.online.msg='';return S.online}
function P(){if(!S.prefs2){var o=(S.so&&S.so.prefs)||{};S.prefs2={title:o.title||'',desc:o.desc||'',img:o.img||'',hreflang:true,redirCountry:true,redirLang:true,capContact:o.captcha!==false,capLogin:o.captcha!==false,b2b:false,trusted:[],crawlers:[]}}return S.prefs2}
function isPrivate(){var o=on();return !(o.live&&!o.password&&paidPlan())}
/* a store without an active plan is always private */
function enforce(){if(typeof S==='undefined'||!S)return;var o=on();if(!paidPlan()&&(o.live||!o.password)){o.live=false;o.password=true;try{save()}catch(e){}}}
X.V22={isPrivate:isPrivate,prefs:P,online:on};
try{enforce()}catch(e){}
X.onRoute(function(){try{enforce()}catch(e){}});
function domain(){return (S.domain||((typeof slug==='function'?slug():'store')+'.vendom.app')).toLowerCase()}
function cnt(n,max){return '<p class="pf-cnt">'+n+' of '+max+' characters used</p>'}
function sw(id,checked,dis,label){return '<label class="pf-sw'+(dis?' dis':'')+'"><input type="checkbox" id="'+id+'"'+(checked?' checked':'')+(dis?' disabled':'')+' aria-label="'+h(label)+'"><span></span></label>'}
var IC={globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',lang:'<path d="M4 5h9M8 3v2M6 5c0 4 3 7 6 8M11 5c-1 4-4 7-7 8"/><path d="M13 21l4-9 4 9M14.5 18h5"/>',chat:'<path d="M4 5h16v11H8l-4 4z"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'};
function ic(k){return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+IC[k]+'</svg>'}
var TAB='all';

V['online-store-preferences']=function(){var o=on(),p=P(),pv=isPrivate(),paid=paidPlan(),b=be();
 var img=p.img?'<img src="'+h(p.img)+'" alt="Social sharing image">':'<div class="pf-noimg">No image yet<br><span>Recommended: 1200 × 628 px</span></div>';
 var cr=(p.crawlers||[]).filter(function(c){var act=c.expires>Date.now();return TAB==='all'||(TAB==='active'?act:!act)});
 return '<div class="pf">'
 /* store access */
 +'<h2 class="pf-h">Store access</h2><div class="pf-card"><div class="pf-in">'
  +'<div class="pf-row"><div><b>Private mode <span class="pf-i" title="When on, visitors must enter a password to see your store.">'+ic('info')+'</span></b><p>Displays a <a data-x="pfpwpage">landing page</a> that requires a password to enter your store</p></div>'+sw('pf-private',pv,!paid,'Private mode')+'</div>'
  +(paid?'':'<div class="pf-note">'+ic('info')+'<span>To let anyone access your online store, <a data-x="go:s-plan">select a plan</a> and then remove your password.</span></div>')
  +(pv?'<div class="pf-pw"><label for="pf-pw">Password</label><input id="pf-pw" class="pf-input" maxlength="100" value="'+h(o.pw)+'" autocomplete="off">'+cnt(o.pw.length,100).replace('pf-cnt"','pf-cnt" id="pf-pwc"')+'<label for="pf-msg">Message to your visitors</label><textarea id="pf-msg" class="pf-input" rows="4" maxlength="5000">'+h(o.msg)+'</textarea>'+cnt(o.msg.length,'5,000').replace('pf-cnt"','pf-cnt" id="pf-msgc"')+'</div>':'')
  +'<div class="pf-row pf-sep"><div><b>Restrict access to B2B customers only <span class="pf-i" title="Only logged-in business customers can see the store.">'+ic('info')+'</span></b><p>B2B customers will need to log in and verify their account to access your store. <a data-x="go:customers-companies">Manage companies</a></p></div>'+sw('pf-b2b',p.b2b,false,'B2B only')+'</div>'
 +'</div></div>'
 /* social sharing + SEO */
 +'<h2 class="pf-h">Social sharing image and SEO <span class="pf-i" title="How your store looks on Google and when its link is shared on WhatsApp, Facebook or X.">'+ic('info')+'</span></h2><div class="pf-card"><div class="pf-seo">'
  +'<div class="pf-share"><div class="pf-shimg" id="pf-shimg">'+img+'</div><div class="pf-shtx"><span>'+h(domain().toUpperCase())+'</span><b id="pf-sht">'+h(p.title||S.name||'')+'</b><p id="pf-shd">'+h(p.desc||'')+'</p></div><div class="pf-shbtn"><label class="btn" for="pf-file">'+(p.img?'Replace image':'Add image')+'</label><input type="file" id="pf-file" accept="image/*" hidden>'+(p.img?' <button class="btn" data-x="pfimgx">Remove</button>':'')+'</div></div>'
  +'<div class="pf-meta"><label for="pf-title">Home page title</label><input id="pf-title" class="pf-input" maxlength="70" value="'+h(p.title)+'" placeholder="'+h(S.name||'')+'">'+cnt(p.title.length,70).replace('pf-cnt"','pf-cnt" id="pf-tc"')
  +'<label for="pf-desc">Meta description</label><textarea id="pf-desc" class="pf-input" rows="4" maxlength="320" placeholder="Describe your store in one or two sentences for search results.">'+h(p.desc)+'</textarea>'+cnt(p.desc.length,320).replace('pf-cnt"','pf-cnt" id="pf-dc"')
  +'<div class="pf-g"><span class="pf-gu">'+h(domain())+'</span><span class="pf-gt" id="pf-gt">'+h(p.title||S.name||'')+'</span><span class="pf-gd" id="pf-gd">'+h(p.desc||'Add a meta description so Google shows it here.')+'</span></div><p class="pf-sm">Google preview</p></div>'
  +'</div><div class="pf-in"><div class="pf-row">'+ic('globe')+'<div><b>Automatic hreflang tags <span class="pf-i" title="Tells search engines which language or region version of a page to show.">'+ic('info')+'</span></b><p>VendOm adds hreflang tags to your store’s HTML so search engines can show buyers the right region or language version</p></div>'+sw('pf-hreflang',p.hreflang!==false,false,'Automatic hreflang tags')+'</div></div></div>'
 /* redirection */
 +'<h2 class="pf-h">Automatic redirection <span class="pf-i" title="Send visitors to the right market automatically.">'+ic('info')+'</span></h2><div class="pf-card"><div class="pf-in">'
  +'<div class="pf-row">'+ic('globe')+'<div><b>Country/region</b><p>Displays the storefront that matches a visitor’s location</p></div>'+sw('pf-rc',p.redirCountry!==false,false,'Redirect by country')+'</div>'
  +'<div class="pf-row pf-sep">'+ic('lang')+'<div><b>Language</b><p>Displays the language that matches a visitor’s browser, when available</p></div>'+sw('pf-rl',p.redirLang!==false,false,'Redirect by language')+'</div></div></div>'
 /* spam */
 +'<h2 class="pf-h">Spam protection</h2><p class="pf-sub">Turning this on protects your store from spam bots. Some customers may need to tick a quick check before sending a form.</p><div class="pf-card"><div class="pf-in">'
  +'<div class="pf-row">'+ic('chat')+'<div><b>Enable on contact and comment forms</b></div>'+sw('pf-cc',p.capContact!==false,false,'Spam protection on contact forms')+'</div>'
  +'<div class="pf-row pf-sep">'+ic('user')+'<div><b>Enable on login, create account and password recovery pages</b></div>'+sw('pf-cl',p.capLogin!==false,false,'Spam protection on login')+'</div></div></div>'
 /* crawler access */
 +'<div class="pf-hrow"><div><h2 class="pf-h">Crawler access <span class="pf-i" title="Signed requests can crawl your store even while it is private.">'+ic('info')+'</span></h2><p class="pf-sub">Authorize external tools to crawl your store. Copy the full values for Signature, Signature-Input, and Signature-Agent, then paste them into your HTTP crawler requests.</p></div><button class="btn" data-x="pfsig">Create signature</button></div>'
 +'<div class="pf-card"><div class="pf-in pf-cr"><div class="pf-tabs">'+[['all','All'],['active','Active'],['expired','Expired']].map(function(t){return '<button class="'+(TAB===t[0]?'on':'')+'" data-x="pftab:'+t[0]+'">'+t[1]+'</button>'}).join('')+'</div>'
  +(cr.length?cr.map(function(c){var act=c.expires>Date.now();return '<div class="pf-crow"><div><b>'+h(c.name)+'</b><span class="pf-pill'+(act?' ok':'')+'">'+(act?'Active':'Expired')+'</span><p>Expires '+new Date(c.expires).toLocaleDateString()+'</p></div><div class="pf-cbtn">'+['Signature','Signature-Input','Signature-Agent'].map(function(k){return '<button class="btn" data-x="pfcopy:'+c.id+'|'+k+'">Copy '+k+'</button>'}).join('')+'<button class="btn" data-x="pfsigx:'+c.id+'" aria-label="Delete '+h(c.name)+'">Delete</button></div></div>'}).join('')
  :'<div class="pf-empty"><div class="pf-doc"><span></span><i></i><i></i><i></i><i></i></div><b>Manage crawler access</b><p>Create signatures that allow trusted tools to crawl your store</p><button class="btn pri" data-x="pfsig">Create signature</button></div>')+'</div></div>'
 /* trusted domains */
 +'<h2 class="pf-h">Trusted domains <span class="pf-i" title="Links to these sites open without a warning page.">'+ic('info')+'</span></h2><p class="pf-sub">When a link to another site could be risky, customers see a confirmation page first. Trusted domains skip this check.</p>'
 +'<div class="pf-card"><div class="pf-td"><input id="pf-dom" class="pf-input" placeholder="example.com" aria-label="Trusted domain"><button class="btn" data-x="pfdom">Add</button></div><p id="pf-domerr" class="pf-err"></p>'+((p.trusted||[]).length?'<div class="pf-chips">'+p.trusted.map(function(d){return '<span>'+h(d)+'<button data-x="pfdomx:'+h(d)+'" aria-label="Remove '+h(d)+'">×</button></span>'}).join('')+'</div>':'')+'<p class="pf-sm">Your store’s domains (<b>'+h(domain())+'</b>) and their subdomains are always trusted, along with VendOm and some well-known sites.</p></div>'
 +'<div class="pf-save"><span class="pf-sm">'+(b?'Saved to your VendOm server.':'Saved in this browser. Connect the VendOm server to publish these settings to Google.')+'</span><button class="btn pri" id="pf-save" data-x="pfsave">Save</button></div><p id="pf-err" class="pf-err" role="alert"></p></div>'};

/* live counters + previews */
document.addEventListener('input',function(e){var t=e.target;if(!t||!t.id||t.id.indexOf('pf-')!==0)return;var g=function(i){return q('#'+i)};
 if(t.id==='pf-title'){g('pf-tc').textContent=t.value.length+' of 70 characters used';g('pf-sht').textContent=t.value||S.name;g('pf-gt').textContent=t.value||S.name}
 if(t.id==='pf-desc'){g('pf-dc').textContent=t.value.length+' of 320 characters used';g('pf-shd').textContent=t.value;g('pf-gd').textContent=t.value||'Add a meta description so Google shows it here.'}
 if(t.id==='pf-pw')g('pf-pwc').textContent=t.value.length+' of 100 characters used';
 if(t.id==='pf-msg')g('pf-msgc').textContent=t.value.length+' of 5,000 characters used'});
document.addEventListener('change',function(e){var t=e.target;if(!t)return;
 if(t.id==='pf-file'){var f=t.files[0];if(!f)return;if(!/^image\//.test(f.type)){toast('Choose an image file');return}if(f.size>2e6){toast('Image must be under 2 MB');return}var r=new FileReader();r.onload=function(){P().img=r.result;save();route();toast('Image added. Press Save to publish it.')};r.readAsDataURL(f)}
 if(t.id==='pf-private'&&t.checked===false&&!paidPlan()){t.checked=true;toast('Select a plan first. Your store stays private until then.')}});
A.pfimgx=function(){P().img='';save();route()};
A.pftab=function(t){TAB=t;route()};
A.pfpwpage=function(){if(X.SF){X.SF.open('password')}};
function err(m){var e=q('#pf-err');if(e)e.textContent=m||'';if(m)toast(m)}
A.pfsave=function(){var o=on(),p=P(),g=function(i){return q('#'+i)};var pw=g('pf-pw'),priv=g('pf-private');
 if(pw&&!pw.value.trim())return err('Enter a password. Visitors need it to enter your store.');
 var wantPrivate=priv?priv.checked:true;if(!wantPrivate&&!paidPlan())return err('Select a plan before removing your password. Your store stays private until then.');
 var t=g('pf-title').value,d=g('pf-desc').value;if(t.length>70||d.length>320)return err('Shorten the title (70) or description (320).');
 if(pw){o.pw=pw.value.trim();o.msg=g('pf-msg').value}
 o.password=wantPrivate;o.live=!wantPrivate;
 p.title=t;p.desc=d;p.hreflang=g('pf-hreflang').checked;p.redirCountry=g('pf-rc').checked;p.redirLang=g('pf-rl').checked;p.capContact=g('pf-cc').checked;p.capLogin=g('pf-cl').checked;p.b2b=g('pf-b2b').checked;
 save();err('');var b=be();
 if(b)b.api('PUT','/api/stores/'+b.cfg().storeId+'/online-store/preferences',{private:wantPrivate,password:o.pw,message:o.msg,prefs:{title:p.title,desc:p.desc,img:/^https?:/.test(p.img)?p.img:'',hreflang:p.hreflang,redirCountry:p.redirCountry,redirLang:p.redirLang,capContact:p.capContact,capLogin:p.capLogin,b2b:p.b2b,trusted:p.trusted}}).then(function(){toast('Preferences saved')}).catch(function(e){err(e.message)});
 else toast('Preferences saved');route()};
/* trusted domains */
var HOST=/^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;
A.pfdom=function(){var i=q('#pf-dom'),v=String(i&&i.value||'').trim().toLowerCase().replace(/^https?:\/\//,'').replace(/\/.*$/,''),e=q('#pf-domerr');if(!HOST.test(v)){if(e)e.textContent='Enter a domain like example.com';return}var p=P();if(p.trusted.indexOf(v)<0)p.trusted.push(v);save();route();toast(v+' is trusted')};
A.pfdomx=function(d){var p=P();p.trusted=p.trusted.filter(function(x){return x!==d});save();route()};
/* crawler signatures: Ed25519 (web-bot-auth); made by the server when connected, otherwise in this browser */
function b64(buf){var s='',a=new Uint8Array(buf);for(var i=0;i<a.length;i++)s+=String.fromCharCode(a[i]);return btoa(s)}
function b64u(buf){return b64(buf).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function localSig(name,days){var created=Math.floor(Date.now()/1000),expires=created+days*86400,agent='"https://vendom.app/.well-known/http-message-signatures-directory"';
 return crypto.subtle.generateKey({name:'Ed25519'},true,['sign','verify']).then(function(k){return crypto.subtle.exportKey('raw',k.publicKey).then(function(raw){var x=b64u(raw);return crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify({crv:'Ed25519',kty:'OKP',x:x}))).then(function(hh){var keyid=b64u(hh),par='("@authority" "signature-agent");created='+created+';expires='+expires+';keyid="'+keyid+'";alg="ed25519";tag="web-bot-auth"';var base='"@authority": '+domain()+'\n"signature-agent": '+agent+'\n"@signature-params": '+par;
  return crypto.subtle.sign({name:'Ed25519'},k.privateKey,new TextEncoder().encode(base)).then(function(sg){return{id:'cs'+Date.now(),name:name,keyid:keyid,pub:x,created:created*1000,expires:expires*1000,headers:{'Signature-Input':'sig1='+par,Signature:'sig1=:'+b64(sg)+':','Signature-Agent':agent}}})})})})}
A.pfsig=function(){X.xmodal('Create signature','<label for="pfs-n">Name</label><input class="xin" id="pfs-n" placeholder="e.g. SEO audit tool" maxlength="60"><label for="pfs-d" style="margin-top:8px">Expires after</label><select class="xin" id="pfs-d"><option value="7">7 days</option><option value="30" selected>30 days</option><option value="90">90 days</option><option value="365">1 year</option></select><p class="xk">Anyone with these values can crawl your store, even while it is private. Delete the signature to stop access.</p><p id="pfs-e" style="color:#b42318;min-height:16px"></p>','Create',function(){var n=(q('#pfs-n').value||'').trim(),d=+q('#pfs-d').value,b=be();if(!n){q('#pfs-e').textContent='Name the tool that will crawl your store';return false}
  var job=b?b.api('POST','/api/stores/'+b.cfg().storeId+'/crawler-signatures',{name:n,days:d}):localSig(n,d);
  job.then(function(c){var p=P();p.crawlers=(p.crawlers||[]).concat([c]);save();TAB='all';route();toast('Signature created. Copy the three values into your crawler.')}).catch(function(e){toast(e&&e.name==='NotSupportedError'?'This browser cannot create signatures. Use Chrome, Edge, Firefox or Safari (latest) or connect the VendOm server.':(e.message||'Could not create the signature'))})})};
A.pfsigx=function(id){var p=P(),b=be();p.crawlers=(p.crawlers||[]).filter(function(c){return c.id!==id});save();if(b)b.api('DELETE','/api/stores/'+b.cfg().storeId+'/crawler-signatures/'+id).catch(function(){});route();toast('Signature deleted')};
A.pfcopy=function(a){var i=a.indexOf('|'),id=a.slice(0,i),k=a.slice(i+1),c=(P().crawlers||[]).filter(function(x){return x.id===id})[0];if(!c)return;var v=c.headers[k];try{navigator.clipboard.writeText(v).then(function(){toast(k+' copied')},function(){X.xmodal(k,'<textarea class="xin" rows="4" readonly>'+h(v)+'</textarea>','Done',function(){})})}catch(e){X.xmodal(k,'<textarea class="xin" rows="4" readonly>'+h(v)+'</textarea>','Done',function(){})}};
/* load from server */
X.onRoute(function(r){if(r!=='online-store-preferences')return;var b=be();if(!b||X._pfLoaded)return;X._pfLoaded=1;b.api('GET','/api/stores/'+b.cfg().storeId+'/online-store/preferences').then(function(s){var o=on(),p=P();o.pw=s.password;o.msg=s.message;o.password=s.private;o.live=!s.private;Object.assign(p,s.prefs);save();route()}).catch(function(){})});

/* ---------- the customer store follows these settings ---------- */
var ADMIN_TITLE=document.title;
function head(){var p=P(),hd=document.head,set=function(sel,mk,attr,val){var e=hd.querySelector(sel);if(!val){if(e)e.remove();return}if(!e){e=document.createElement(mk[0]);e.setAttribute(mk[1],mk[2]);e.dataset.vsf='1';hd.appendChild(e)}e.setAttribute(attr,val)};
 document.title=p.title||S.name||ADMIN_TITLE;
 set('meta[name="description"][data-vsf]',['meta','name','description'],'content',p.desc);
 set('meta[property="og:title"]',['meta','property','og:title'],'content',p.title||S.name);
 set('meta[property="og:description"]',['meta','property','og:description'],'content',p.desc);
 set('meta[property="og:image"]',['meta','property','og:image'],'content',p.img);
 set('meta[name="robots"][data-vsf]',['meta','name','robots'],'content',isPrivate()?'noindex, nofollow':'');
 qa('link[data-vsf]').forEach(function(l){l.remove()});
 if(p.hreflang!==false){var langs=['en'];try{if(X.m9P&&X.m9P().cfg.sfLang&&langs.indexOf(X.m9P().cfg.sfLang)<0)langs.push(X.m9P().cfg.sfLang)}catch(e){}(S.marketsList||[]).forEach(function(m){if(m.lang&&langs.indexOf(m.lang)<0)langs.push(m.lang)});
  langs.concat(['x-default']).forEach(function(l){var e=document.createElement('link');e.rel='alternate';e.hreflang=l;e.href='https://'+domain()+'/'+(l==='en'||l==='x-default'?'':l+'/');e.dataset.vsf='1';hd.appendChild(e)})}}
function unhead(){document.title=ADMIN_TITLE;qa('[data-vsf]').forEach(function(e){e.remove()})}
X.onRoute(function(){if(!q('#xsf'))unhead()});
function redirect(st){if(st._redir)return;st._redir=1;var p=P(),loc=(navigator.language||'en-US');
 if(p.redirCountry!==false){var reg=(loc.split('-')[1]||'').toUpperCase(),name='';try{name=new Intl.DisplayNames(['en'],{type:'region'}).of(reg)}catch(e){}
  (S.marketsList||[]).forEach(function(m){if(m.currency&&(m.countries||[]).some(function(c){return c===name||c===reg})&&S.rates&&S.rates[m.currency])S.sfCur=m.currency})}
 if(p.redirLang!==false&&X.m9P){var l=loc.slice(0,2);if(l==='ur'||l==='ar')try{X.m9P().cfg.sfLang=l}catch(e){}}}
function pwPage(r){var t=(typeof live==='function'?live():{})||{},o=on(),bg=t.bg||'#fff',tx=t.tx||'#111',ac=t.ac||'#111',fh=t.fh||'inherit';
 r.innerHTML='<div class="pfp" style="--b:'+bg+';--t:'+tx+';--a:'+ac+';font-family:'+(t.fb?"'"+t.fb+"'":'inherit')+'"><div class="pfp-bar"><button id="xsfclose">Close</button><button class="pfp-own" id="pfp-back">Back to the store preview</button></div><div class="pfp-c"><h1 style="font-family:'+(t.fh?"'"+fh+"'":'inherit')+'">'+h(S.name||'Store')+'</h1><p class="pfp-m">'+h(o.msg||'This store will be opening soon.')+'</p><form id="pfp-f"><label for="pfp-in">Enter store using password</label><div><input id="pfp-in" type="password" autocomplete="off" placeholder="Password"><button type="submit">Enter</button></div><p id="pfp-e" role="alert"></p></form><p class="pfp-own2">Are you the store owner? <a id="pfp-adm">Log in here</a></p></div><div class="pfp-ft">Secured by VendOm</div></div>';
 q('#xsfclose',r).onclick=function(){r.remove();route()};q('#pfp-adm',r).onclick=function(){r.remove();location.hash='online-store-preferences';route()};
 q('#pfp-back',r).onclick=function(){X.SF.go('home')};
 q('#pfp-f',r).onsubmit=function(e){e.preventDefault();if(q('#pfp-in',r).value===on().pw){X.SF.state.unlocked=1;X.SF.go('home')}else q('#pfp-e',r).textContent='Wrong password. Try again.'}}
function guard(r){var p=P();
 qa('form',r).forEach(function(f){var need=(f.id==='xsfcontact'&&p.capContact!==false)||((f.id==='xsflogin'||f.id==='xsfsignup')&&p.capLogin!==false);if(!need||q('.pfc',f))return;
  var w=document.createElement('label');w.className='pfc';w.innerHTML='<input type="checkbox" class="pfc-x"> I’m not a robot<input type="text" class="pfc-hp" tabindex="-1" autocomplete="off" aria-hidden="true">';var btn=q('button[type=submit],button:last-of-type',f);f.insertBefore(w,btn||null)});
 if(!r._pfg){r._pfg=1;
  r.addEventListener('submit',function(e){var f=e.target,w=f&&q('.pfc',f);if(!w)return;var hp=q('.pfc-hp',w).value,ok=q('.pfc-x',w).checked;if(hp||!ok){e.preventDefault();e.stopImmediatePropagation();toast(hp?'Message blocked as spam.':'Tick “I’m not a robot” first.')}},true);
  r.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href^="http"]');if(!a)return;var host;try{host=new URL(a.href).hostname.toLowerCase()}catch(x){return}var tr=[domain(),'vendom.app'].concat(P().trusted||[]);if(tr.some(function(d){return host===d||host.slice(-d.length-1)==='.'+d}))return;e.preventDefault();e.stopPropagation();
   X.xmodal('You’re leaving '+h(S.name||'the store'),'<p>This link goes to <b>'+h(host)+'</b>, which is not part of this store. Only continue if you trust it.</p>','Continue',function(){window.open(a.href,'_blank','noopener')})},true)}}
X.SF_AFTER=function(r,st){try{redirect(st);head();
 if(st.pg==='password'){pwPage(r);return}
 var p=P();
 if(isPrivate()){var bar=q('#xsfclose',r);bar=bar&&bar.parentElement;if(bar&&!q('.pfp-note',r)){var n=document.createElement('div');n.className='pfp-note';n.innerHTML='🔒 Your store is private. Visitors must enter the password first. <a id="pfp-see">See the password page</a>';bar.parentNode.insertBefore(n,bar.nextSibling);q('#pfp-see',n).onclick=function(){X.SF.go('password')}}}
 if(p.b2b&&!S.sfUser&&st.pg!=='account'){var m=q('.vmain',r)||q('main',r);if(m)m.innerHTML='<div style="max-width:520px;margin:60px auto;text-align:center"><h1>Business customers only</h1><p>This store sells to approved business customers. Log in with your business account to see products and prices.</p><a class="sfb vbtn" data-sf="account" style="display:inline-block;margin-top:10px;cursor:pointer" id="pfb2b">Log in</a></div>';var lb=q('#pfb2b',r);if(lb)lb.onclick=function(){X.SF.go('account')}}
 guard(r)}catch(e){console.error('prefs storefront',e)}};

var css=document.createElement('style');css.textContent=[
'.pf{width:100%;max-width:1000px;margin:0 auto;padding:8px 8px 60px;box-sizing:border-box}.pf-h{font-size:16px;font-weight:650;margin:30px 0 12px;display:flex;align-items:center;gap:6px}.pf-sub{margin:-4px 0 14px;color:#4A4A4A;font-size:14px}.pf-hrow{display:flex;justify-content:space-between;align-items:flex-start;gap:16px}.pf-hrow .btn{margin-top:26px;white-space:nowrap}',
'.pf-card{background:#fff;border:1px solid #E3E3E3;border-radius:16px;padding:18px;box-shadow:0 1px 0 rgba(0,0,0,.04)}.pf-in{border:1px solid #EBEBEB;border-radius:12px;padding:4px 16px}.pf-i{display:inline-flex;color:#4A4A4A;cursor:help}',
'.pf-row{display:flex;align-items:center;gap:12px;padding:14px 0}.pf-row>div{flex:1}.pf-row>svg{flex:none;color:#303030}.pf-row b{font-weight:500;display:flex;align-items:center;gap:6px;font-size:14px}.pf-row p{margin:3px 0 0;color:#4A4A4A;font-size:14px}.pf-row a,.pf-note a{text-decoration:underline;cursor:pointer;color:inherit}.pf-sep{border-top:1px solid #EBEBEB}',
'.pf-sw{position:relative;width:40px;height:22px;flex:none;cursor:pointer}.pf-sw input{position:absolute;opacity:0;inset:0;margin:0;cursor:pointer}.pf-sw span{position:absolute;inset:0;background:#C9C9C9;border-radius:999px;transition:.2s}.pf-sw span:after{content:"";position:absolute;left:3px;top:3px;width:16px;height:16px;background:#fff;border-radius:50%;transition:.2s}.pf-sw input:checked+span{background:#1A1A1A}.pf-sw input:checked+span:after{left:21px}.pf-sw input:focus-visible+span{outline:2px solid #005BD3;outline-offset:2px}.pf-sw.dis{opacity:.45;cursor:not-allowed}',
'.pf-note{display:flex;gap:10px;align-items:center;background:#D8F4FC;color:#00527C;border-radius:12px;padding:14px 16px;margin:2px 0 12px;font-size:14px}.pf-note svg{color:#0094D5;flex:none}',
'.pf-pw{background:#F7F7F7;border-radius:12px;padding:16px;margin-bottom:12px}.pf-pw label,.pf-meta label{display:block;font-weight:500;font-size:14px;margin:0 0 6px}.pf-input{width:100%;box-sizing:border-box;border:1px solid #CCCCCC;border-radius:10px;padding:10px 12px;font:inherit;font-size:14px;background:#fff}.pf-input:focus{outline:2px solid #005BD3;outline-offset:0;border-color:transparent}.pf-cnt{margin:6px 0 16px;color:#616161;font-size:13px}',
'.pf-seo{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);gap:18px;margin-bottom:14px}.pf-share{border:1px solid #E3E3E3;border-radius:12px;overflow:hidden;align-self:start}.pf-shimg{aspect-ratio:1200/628;background:#F1F1F1;display:grid;place-items:center}.pf-shimg img{width:100%;height:100%;object-fit:cover;display:block}.pf-noimg{text-align:center;color:#616161;font-size:14px}.pf-noimg span{font-size:12px}.pf-shtx{padding:12px}.pf-shtx span{font-size:12px;color:#616161;letter-spacing:.02em}.pf-shtx b{display:block;font-size:16px;margin:3px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pf-shtx p{margin:0;color:#4A4A4A;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pf-shbtn{padding:0 12px 12px;display:flex;gap:6px}',
'.pf-g{border:1px solid #EBEBEB;border-radius:10px;padding:12px 14px;display:grid;gap:3px;font-family:Arial,sans-serif}.pf-gu{font-size:12px;color:#202124}.pf-gt{font-size:18px;color:#1A0DAB;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.pf-gd{font-size:13px;color:#4D5156;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.pf-sm{font-size:12px;color:#616161;margin:6px 0 0}',
'.pf-tabs{display:flex;gap:6px;padding:12px 0;border-bottom:1px solid #EBEBEB}.pf-tabs button{border:0;background:transparent;padding:6px 14px;border-radius:8px;cursor:pointer;font:inherit;font-size:14px;color:#303030}.pf-tabs button.on{background:#EBEBEB;font-weight:600}',
'.pf-empty{text-align:center;padding:40px 10px 44px;display:grid;justify-items:center;gap:6px}.pf-empty p{margin:0 0 10px;color:#303030;font-size:14px}.pf-doc{width:110px;height:140px;background:#fff;border-radius:6px;box-shadow:0 0 0 30px #F1F1F1,0 6px 16px rgba(0,0,0,.12);margin:30px 0 40px;padding:16px;box-sizing:border-box;display:grid;gap:6px;align-content:start}.pf-doc span{width:34px;height:34px;background:#E9A23B;border-radius:3px;margin-bottom:8px}.pf-doc i{height:4px;background:#DADADA;border-radius:2px}',
'.pf-crow{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:14px 0;border-bottom:1px solid #F1F1F1;flex-wrap:wrap}.pf-crow b{margin-right:8px}.pf-crow p{margin:3px 0 0;font-size:13px;color:#616161}.pf-cbtn{display:flex;gap:6px;flex-wrap:wrap}.pf-pill{font-size:12px;padding:2px 8px;border-radius:8px;background:#EBEBEB}.pf-pill.ok{background:#CDFEE1;color:#0C5132}',
'.pf-td{display:flex;gap:8px}.pf-td .pf-input{flex:1}.pf-chips{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0 0}.pf-chips span{background:#F1F1F1;border-radius:8px;padding:4px 6px 4px 10px;font-size:13px;display:inline-flex;gap:4px;align-items:center}.pf-chips button{border:0;background:transparent;cursor:pointer;font-size:16px;line-height:1}.pf-err{color:#B42318;font-size:13px;margin:6px 0 0;min-height:0}',
'.pf-save{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:26px;padding-top:18px;border-top:1px solid #E3E3E3}',
'@media (max-width:760px){.pf-seo{grid-template-columns:1fr}.pf-hrow{flex-direction:column}.pf-hrow .btn{margin-top:0}.pf-card{padding:12px}}',
/* password page + storefront helpers */
'.pfp{min-height:100%;background:var(--b);color:var(--t);display:flex;flex-direction:column}.pfp-bar{display:flex;justify-content:space-between;padding:8px 14px;background:#111}.pfp-bar button{background:#fff;border:0;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:12px}.pfp-c{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px 20px}.pfp-c h1{font-size:clamp(32px,6vw,56px);margin:0 0 10px}.pfp-m{max-width:46ch;opacity:.8;margin:0 0 30px}.pfp-c form{display:grid;gap:8px;width:min(420px,100%)}.pfp-c form label{font-size:14px}.pfp-c form div{display:flex;gap:8px}.pfp-c input{flex:1;padding:12px;border:1px solid color-mix(in srgb,var(--t) 30%,transparent);border-radius:8px;font:inherit;background:transparent;color:inherit}.pfp-c button{padding:12px 20px;border:0;border-radius:8px;background:var(--a);color:#fff;font:inherit;font-weight:600;cursor:pointer}#pfp-e{color:#D92D20;min-height:18px;margin:0;font-size:13px}.pfp-own2{font-size:13px;opacity:.7;margin-top:30px}.pfp-own2 a{text-decoration:underline;cursor:pointer}.pfp-ft{text-align:center;padding:18px;font-size:12px;opacity:.6}',
'.pfp-note{background:#FFF4D6;color:#5C4400;text-align:center;font-size:13px;padding:7px 12px}.pfp-note a{text-decoration:underline;cursor:pointer}.pfc{display:flex!important;align-items:center;gap:8px;font-size:14px;border:1px solid #D4D4D4;border-radius:8px;padding:10px 12px;width:max-content;background:#FAFAFA;color:#111}.pfc-hp{position:absolute!important;left:-9999px!important;width:1px!important;height:1px!important}'
].join('');document.head.appendChild(css);
})();
