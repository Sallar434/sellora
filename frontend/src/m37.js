/* ===== v60: Settings › Sales channels (from the owner's Shopify guide): the channels the store sells on,
   each with a status and a switch. Online Store is always on. ===== */
(function(){
var X=window,SXS=X.SXS,h=X.SX.h;
if(typeof SO!=='undefined'&&SO.indexOf('channels')<0){var at=SO.indexOf('apps');SO.splice(at>-1?at+1:SO.indexOf('locations')+1,0,'channels')}
if(typeof SEC!=='undefined'&&!SEC.channels)SEC.channels=['Sales channels','Choose where you sell.',[]];
var CH=[['online','Online Store','Your own website at your VendOm address or domain.','Always on'],
 ['whatsapp','WhatsApp','Share your catalogue and take orders in WhatsApp chats.',''],
 ['meta','Facebook & Instagram','Sync products to your Meta shop and tag them in posts and reels.',''],
 ['tiktok','TikTok Shop','Show products in TikTok videos and lives.',''],
 ['google','Google & YouTube','List products free on Google Shopping and YouTube.',''],
 ['daraz','Marketplace feed','Send a product feed to marketplaces such as Daraz.',''],
 ['pos','Point of sale','Sell in person and keep one stock count.','']];
function st(){var o=S.ch37=S.ch37||{};o.online=true;return o}
SXS.channels=function(){var o=st(),n=CH.filter(function(c){return o[c[0]]}).length;
 return '<h2>Sales channels</h2><p class="mu">'+n+' of '+CH.length+' channels on. Products marked Active are sold on every channel that is on.</p><div class="panel ch37">'+CH.map(function(c){var on=!!o[c[0]];
  return '<div class="ch37r"><div><b>'+h(c[1])+'</b> <span class="ch37p'+(on?' on':'')+'">'+(on?'On':'Off')+'</span><small>'+h(c[2])+'</small></div>'+(c[3]?'<span class="mu">'+h(c[3])+'</span>':'<input type="checkbox" class="tg" data-ch37="'+c[0]+'" aria-label="Sell on '+h(c[1])+'"'+(on?' checked':'')+'>')+'</div>'}).join('')+'</div>'};
document.addEventListener('change',function(e){var k=e.target&&e.target.getAttribute&&e.target.getAttribute('data-ch37');if(!k)return;st()[k]=e.target.checked;try{save()}catch(x){}
 var nm=(CH.filter(function(c){return c[0]===k})[0]||[])[1];try{toast(nm+(e.target.checked?' turned on':' turned off'))}catch(x){}
 var stc=document.querySelector('.stc');if(stc)stc.innerHTML=SXS.channels()});
var css=document.createElement('style');css.textContent='.ch37{padding:0!important}.ch37r{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-top:1px solid #EBEBEB}.ch37r:first-child{border-top:0}.ch37r small{display:block;color:#616161;margin-top:2px}.ch37p{display:inline-block;font-size:12px;border-radius:8px;padding:1px 8px;background:#E3E3E3;color:#303030;margin-left:6px}.ch37p.on{background:#CDFEE1;color:#0C5132}';document.head.appendChild(css);
})();
