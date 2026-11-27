/* ===== v53: new admin shell (layout from the owner's Shopify admin guides, VendOm's own colours):
   full-height dark sidebar with search at the top and Settings, store menu, alerts and the trial box at the bottom;
   the page sits in a light rounded panel; a "Work with VendOm AI" bar floats at the bottom. Desktop only (>900px). ===== */
(function(){
var X=window;
function q(s){return document.querySelector(s)}
function h(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
var C={side:'#0D1F1A',sideHi:'#1E3A32',sideOn:'#27463D',ink:'#E8EFEC',mute:'#9DB3AB',canvas:'#F4F5F4',accent:'#A6E37A'};

function trialBox(){var a=q('aside');if(!a)return;var b=q('#sh30trial');var m=X.m13,txt='',show=false;
 try{var s=m&&m.sub();if(s&&!m.paid()){show=true;var l=m.left();txt=m.dead()?'Your trial has ended':'Trial ends in '+l+' day'+(l===1?'':'s')}}catch(e){}
 if(!show){if(b)b.remove();return}
 if(!b){b=document.createElement('div');b.id='sh30trial';document.body.appendChild(b)}
 b.innerHTML='<b>'+h(txt)+'</b><a href="#s-plan" class="sh30sub">Pick a plan</a>'}
function settingsLink(){var a=q('aside');if(!a||q('#sh30set'))return;var l=document.createElement('a');l.id='sh30set';l.href='#s-general';l.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg><span>Settings</span>';document.body.appendChild(l)}
function aiBar(){if(q('#sh30ai'))return;var d=document.createElement('form');d.id='sh30ai';d.setAttribute('role','search');d.innerHTML='<span class="sh30aidot" aria-hidden="true"></span><input id="sh30aiq" placeholder="Work with VendOm AI" aria-label="Ask VendOm AI" autocomplete="off"><button type="submit" aria-label="Send">↵</button>';document.body.appendChild(d);
 d.onsubmit=function(e){e.preventDefault();var v=q('#sh30aiq').value.trim();X._sh30ask=v;location.hash='ai-assistant';setTimeout(function(){var i=q('#main textarea,#main input[type=text],#main input:not([type])');if(i&&v){i.value=v;i.dispatchEvent(new Event('input',{bubbles:true}));i.focus()}},300);q('#sh30aiq').value=''}}
function foot(){if(!q('#sh30foot')){var f=document.createElement('div');f.id='sh30foot';document.body.appendChild(f)}if(!q('#sh30head')){var hd=document.createElement('div');hd.id='sh30head';document.body.appendChild(hd)}
 Array.prototype.forEach.call(document.querySelectorAll('aside .nav-section,aside .nav-label,aside #nav > div'),function(e){if(/^\s*Configuration\s*$/.test(e.textContent))e.style.display='none'})}
function sync(){if(document.body.classList.contains('locked'))return;foot();settingsLink();trialBox();aiBar();
 var on=/^#s-/.test(location.hash);var s=q('#sh30set');if(s)s.classList.toggle('on',on);document.body.classList.toggle('sh30s',on);
 var ai=q('#sh30ai');if(ai)ai.style.display=(/^#(ai-assistant|theme-editor|editor)/.test(location.hash)||document.body.classList.contains('st'))?'none':''}
if(X.onRoute)X.onRoute(function(){try{sync()}catch(e){console.error('sh30',e)}});setTimeout(sync,0);setInterval(sync,5000);

var css=document.createElement('style');css.id='sh30css';css.textContent=['@media(min-width:901px){',
'html body:not(.locked){background:'+C.side+'!important;padding-top:0!important}',
'html body:not(.locked) #vtop{background:transparent!important;height:0!important;padding:0!important;pointer-events:none;z-index:80}',
'html body:not(.locked) #vtop>*{pointer-events:auto}',
'html body:not(.locked) #vtop .vtop-logo{position:fixed;left:16px;top:12px;width:auto}',
'html body:not(.locked) #vtop-search{position:fixed;left:10px;top:48px;width:220px;margin:0;background:#1A332C;border-color:#2C4A41;color:'+C.mute+'}',
'html body:not(.locked) #vtop-search:hover{border-color:#41665B}',
'html body:not(.locked) .vtop-store{position:fixed;left:8px;bottom:104px;width:186px}',
'html body:not(.locked) #vtop-store{width:100%;justify-content:flex-start;background:transparent!important;color:'+C.ink+'!important}',
'html body:not(.locked) #vtop-store:hover{background:'+C.sideHi+'!important}',
'html body:not(.locked) #vtop-dd{top:auto!important;bottom:calc(100% + 6px)!important;left:0!important;right:auto!important}',
'html body:not(.locked) #vtop-bell{position:fixed;left:198px;bottom:106px;background:transparent!important;color:'+C.ink+'!important}',
'html body:not(.locked) #vtop-bell:hover{background:'+C.sideHi+'!important}',
'html body:not(.locked) aside{background:'+C.side+'!important;color:'+C.ink+'!important;border-right:0!important;top:0!important;height:100vh!important;width:240px!important;padding:92px 8px 190px!important;overflow-y:auto;overscroll-behavior:contain}',
'html body:not(.locked) aside .nav-sub a,html body:not(.locked) aside a{color:'+C.ink+'!important}',
'html body:not(.locked) aside .nav-icon{color:'+C.mute+'!important}',
'html body:not(.locked) aside .nav-head .nav-link,html body:not(.locked) aside .nav-head .nav-link *,html body:not(.locked) aside .nav-sub a{color:'+C.ink+'!important;-webkit-text-fill-color:'+C.ink+'!important;opacity:1!important}',
'html body:not(.locked) aside .nav-head .nav-icon,html body:not(.locked) aside .nav-head .nav-icon *{color:'+C.mute+'!important;-webkit-text-fill-color:currentColor!important}',
'html body:not(.locked) aside .nav-head:hover{background:'+C.sideHi+'!important}',
'html body:not(.locked) aside .nav-head.on,html body:not(.locked) aside .nav-head.sub-on{background:'+C.sideOn+'!important;box-shadow:none!important}',
'html body:not(.locked) aside .nav-head.sub-on .nav-link *,html body:not(.locked) aside .nav-head.on .nav-link *{color:#FFFFFF!important}',
'html body:not(.locked) aside .nav-sub a.on,html body:not(.locked) aside .nav-sub a:hover{background:'+C.sideHi+'!important;color:#fff!important}',
'html body:not(.locked) aside .nav-section,html body:not(.locked) aside .nav-label,html body:not(.locked) aside small{color:'+C.mute+'!important}',
'html body:not(.locked) aside .nav-arrow{color:'+C.mute+'!important}',
'html body:not(.locked) aside .store{display:none!important}',
'html body:not(.locked) aside [data-r="s-general"]{display:none!important}',
'#sh30head{position:fixed;left:0;top:0;width:240px;height:88px;background:'+C.side+';z-index:79;box-shadow:0 8px 10px '+C.side+'}',
'#sh30foot{position:fixed;left:0;bottom:0;width:240px;height:184px;background:'+C.side+';z-index:60;box-shadow:0 -8px 12px '+C.side+'}',
'#sh30set,#sh30trial{z-index:61}html body:not(.locked) .vtop-store,html body:not(.locked) #vtop-bell{z-index:81}',
'#sh30set{position:fixed;left:8px;bottom:144px;width:224px;display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:8px;text-decoration:none;color:'+C.ink+'!important;font-weight:550;font-size:13px}',
'#sh30set:hover,#sh30set.on{background:'+C.sideHi+'}#sh30set svg{color:'+C.mute+'}',
'#sh30trial{position:fixed;left:8px;bottom:12px;width:224px;box-sizing:border-box;padding:10px 12px;border-radius:12px;background:linear-gradient(135deg,#17352D,#21483C);color:#fff;display:flex;flex-direction:column;gap:8px;font-size:13px}',
'#sh30trial .sh30sub{display:block;text-align:center;background:#fff;color:#111!important;border-radius:999px;padding:6px 10px;font-weight:650;text-decoration:none}#sh30trial .sh30sub:hover{background:'+C.accent+'}',
'html body:not(.locked) main{background:'+C.canvas+'!important;margin:8px 8px 8px 0!important;border-radius:16px;min-height:calc(100vh - 16px);box-sizing:border-box;max-width:none!important;padding:20px clamp(16px,3vw,40px) 96px!important}',
'html body:not(.locked) main .m13ban{padding:8px 12px!important;margin-bottom:14px!important}',
'#sh30ai{position:fixed;left:calc(50% + 120px);transform:translateX(-50%);bottom:14px;z-index:70;display:flex;align-items:center;gap:8px;width:min(440px,calc(100vw - 300px));background:#fff;border:1px solid #E3E3E3;border-radius:999px;box-shadow:0 6px 18px rgba(0,0,0,.12);padding:6px 6px 6px 14px}',
'#sh30ai input{flex:1;border:0!important;outline:0;background:transparent;font:inherit;font-size:13px;padding:6px 0;box-shadow:none!important}',
'#sh30ai button{border:0;background:#303030;color:#fff;border-radius:999px;width:30px;height:30px;cursor:pointer}',
'.sh30aidot{width:18px;height:18px;border-radius:50%;background:conic-gradient(#A6E37A,#2E6B4F,#A6E37A);flex:none}',
'#toast{bottom:76px!important}','body.sh30s #sh30head,body.sh30s #sh30foot,body.sh30s #sh30set,body.sh30s #sh30trial,body.sh30s #vtop,body.sh30s #vtop .vtop-logo,body.sh30s #vtop-search,body.sh30s .vtop-store,body.sh30s #vtop-bell{display:none!important}','html body.sh30s:not(.locked) main{margin:8px!important;padding-top:0!important}','body.sh30s .stb{margin:0 calc(-1 * clamp(16px,3vw,40px)) 16px!important;border-radius:16px 16px 0 0}',
'}',
'.stb .btn[data-r="home"]{color:#111!important;-webkit-text-fill-color:#111!important;background:#fff!important;font-size:15px;min-width:36px}',
'html body input.tg{appearance:none!important;-webkit-appearance:none!important;width:38px!important;height:22px!important;min-width:38px;padding:0!important;margin:0!important;border-radius:99px!important;background:#D4D4D4!important;border:0!important;position:relative;cursor:pointer;box-shadow:none!important}',
'html body input.tg::after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25)}',
'html body input.tg:checked{background:#303030!important}html body input.tg:checked::after{left:19px}',
'@media(max-width:900px){#sh30ai,#sh30set,#sh30trial,#sh30foot,#sh30head{display:none!important}}',
'body.locked #sh30ai,body.locked #sh30set,body.locked #sh30trial,body.locked #sh30foot,body.locked #sh30head{display:none!important}'
].join('\n');document.head.appendChild(css);
})();
