/* ===== Sellora v35: theme editor drag-and-drop sections + section action menu + preview insert (+) ===== */
(function(){
var X=window,d=document,drag=null,menuFor=null;
function $q(s,r){return (r||d).querySelector(s)}function $a(s,r){return [].slice.call((r||d).querySelectorAll(s))}
function ok(){return typeof E!=='undefined'&&E&&E.t&&$q('#edl')}
function grpOf(arr){return arr===E.t.hdr?'h':arr===E.t.ftr?'f':'t'}
function redraw(){try{lp()}catch(e){}try{rp()}catch(e){}}
function persist(){try{save()}catch(e){}var t=E&&E.t;try{var b=X.SelloraBackend;if(t&&t.bid&&b&&b.on&&b.on())b.api('PATCH','/api/stores/'+b.cfg().storeId+'/themes/'+t.bid,{sections:{hdr:t.hdr,ftr:t.ftr,pg:t.pg}}).catch(function(){})}catch(e){}}
function moveTo(id,ni){var l=loc(id);if(!l)return;var it=l.a.splice(l.i,1)[0];if(ni>l.i)ni--;ni=Math.max(0,Math.min(l.a.length,ni));l.a.splice(ni,0,it);persist();redraw()}
X.m12move=moveTo;
X.m12ins=function(id,below){var l=loc(id);if(!l)return;X._insAt={a:l.a,i:l.i+(below?1:0)};closeMenu();addSec(grpOf(l.a))};
function act(a,id){var l=loc(id);if(!l)return;
 if(a==='above'||a==='below')return X.m12ins(id,a==='below');
 if(a==='up'&&l.i>0)moveTo(id,l.i-1);else if(a==='down'&&l.i<l.a.length-1)moveTo(id,l.i+2);
 else if(a==='dup'){var c=JSON.parse(JSON.stringify(l.a[l.i]));c.id=uid();l.a.splice(l.i+1,0,c);E.open=c.id;persist();redraw()}
 else if(a==='hide'){l.a[l.i].hide=!l.a[l.i].hide;persist();redraw()}
 else if(a==='del'){l.a.splice(l.i,1);if(E.open===id)E.open=null;persist();redraw()}
 closeMenu()}
function bar(id){var l=loc(id),s=l&&l.a[l.i];return [['above','\u2191+ Add section above'],['below','\u2193+ Add section below'],['dup','Duplicate'],['hide',s&&s.hide?'\u25cb Show':'\u25cf Hide'],['up','\u2191 Move up'],['down','\u2193 Move down'],['del','\u2715 Delete']].map(function(x){return '<button type="button" data-m12a="'+x[0]+':'+id+'">'+x[1]+'</button>'}).join('')}
function closeMenu(){var m=$q('#m12menu');if(m)m.remove();menuFor=null}
function openMenu(id,x,y){closeMenu();var m=d.createElement('div');m.id='m12menu';m.setAttribute('role','menu');m.innerHTML='<div class="m12mt">'+nm(id)+'</div>'+bar(id);d.body.appendChild(m);var w=m.offsetWidth,hh=m.offsetHeight;m.style.left=Math.max(4,Math.min(innerWidth-w-4,x))+'px';m.style.top=Math.max(4,Math.min(innerHeight-hh-4,y))+'px';menuFor=id}
X.m12menu=openMenu;
function nm(id){var e=$q('#edl [data-ed="tog:'+id+'"]');var t=e?e.textContent.replace(/^[\u25b8\u25be]\s*/,'').trim():'';try{var l=loc(id);if(l&&typeof LBL!=='undefined'&&LBL[l.a[l.i].type])t=LBL[l.a[l.i].type]}catch(_){}return (t||'Section').replace(/[<>&]/g,'')}
function decorate(){if(!ok())return;var L=$q('#edl');
 $a('.er',L).forEach(function(er){if(er.dataset.row)return;var tg=$q('[data-ed^="tog:"]',er);if(!tg)return;var id=tg.dataset.ed.slice(4);er.dataset.row=id;var h=$q('.erh',er);
  h.insertAdjacentHTML('afterbegin','<span class="egrip" data-grip="'+id+'" role="button" tabindex="0" title="Drag to reorder (or Alt+\u2191/\u2193)" aria-label="Drag to reorder section">\u22ee\u22ee</span>');
  var ri=$q('.eri',er);if(ri)ri.insertAdjacentHTML('afterbegin','<button type="button" data-m12m="'+id+'" aria-label="Section actions" title="Section actions">\u22ef</button>');
  if(E.open===id)h.insertAdjacentHTML('afterend','<div class="m12bar">'+bar(id)+'</div>')})}
new MutationObserver(function(){if(ok()&&$a('#edl .er:not([data-row])').length)decorate()}).observe(d.documentElement,{childList:true,subtree:true});
/* drag with pointer events */
d.addEventListener('pointerdown',function(e){var g=e.target.closest&&e.target.closest('[data-grip]');if(!g||!ok())return;e.preventDefault();var er=g.closest('.er'),eg=er.closest('.eg');
 var ln=d.createElement('div');ln.className='m12line';$q('#edl').appendChild(ln);er.classList.add('m12drag');drag={id:g.dataset.grip,er:er,eg:eg,ln:ln,ni:null,y:e.clientY};try{g.setPointerCapture(e.pointerId)}catch(_){}
 d.body.classList.add('m12dragging');calc(e.clientY)});
function scroller(){var e=$q('#edl');while(e&&e!==d.body){var cs=getComputedStyle(e);if(/(auto|scroll)/.test(cs.overflowY)&&e.scrollHeight>e.clientHeight)return e;e=e.parentElement}return $q('#edl')}
function calc(y){var rows=$a(':scope > .er',drag.eg),L=$q('#edl'),lr=L.getBoundingClientRect(),ni=rows.length,ref=null;
 for(var i=0;i<rows.length;i++){var r=rows[i].getBoundingClientRect();if(y<r.top+r.height/2){ni=i;ref=r;break}}
 if(!ref&&rows.length){var r2=rows[rows.length-1].getBoundingClientRect();ref={top:r2.bottom}}
 drag.ni=ni;if(ref){drag.ln.style.top=(ref.top-lr.top+L.scrollTop-1)+'px'}}
var tick=null;function auto(){if(!drag)return;var s=scroller(),r=s.getBoundingClientRect(),y=drag.y;if(y<r.top+40)s.scrollTop-=12;else if(y>r.bottom-40)s.scrollTop+=12;calc(y);tick=requestAnimationFrame(auto)}
d.addEventListener('pointermove',function(e){if(!drag)return;e.preventDefault();drag.y=e.clientY;calc(e.clientY);if(!tick)tick=requestAnimationFrame(auto)},{passive:false});
function end(){if(!drag)return;var g=drag;drag=null;cancelAnimationFrame(tick);tick=null;g.ln.remove();g.er.classList.remove('m12drag');d.body.classList.remove('m12dragging');if(g.ni!=null){var l=loc(g.id);if(l&&g.ni!==l.i&&g.ni!==l.i+1)moveTo(g.id,g.ni)}}
d.addEventListener('pointerup',end);d.addEventListener('pointercancel',end);
d.addEventListener('keydown',function(e){var g=e.target.closest&&e.target.closest('[data-grip]');if(g&&e.altKey&&(e.key==='ArrowUp'||e.key==='ArrowDown')){e.preventDefault();act(e.key==='ArrowUp'?'up':'down',g.dataset.grip);var n=$q('[data-grip="'+g.dataset.grip+'"]');if(n)n.focus()}if(e.key==='Escape')closeMenu()});
/* clicks: menu actions, menu button, preview section click, + insert */
d.addEventListener('click',function(e){var t=e.target;if(!t.closest)return;
 var a=t.closest('[data-m12a]');if(a){e.preventDefault();e.stopPropagation();var p=a.dataset.m12a.split(':');act(p[0],p.slice(1).join(':'));return}
 var mb=t.closest('[data-m12m]');if(mb){e.stopPropagation();var r=mb.getBoundingClientRect();openMenu(mb.dataset.m12m,r.left-150,r.bottom+4);return}
 var pl=t.closest('#m12plus');if(pl){e.stopPropagation();X.m12ins(pl.dataset.sid,pl.dataset.below==='1');return}
 if(ok()&&t.closest('#ep')){if(t.closest('[data-slc]')){/* slideshow arrows and dots keep working */}else{var dest=t.closest('[data-pg],[data-pid],[data-edcol],[data-edpage],[data-edpg],.pc,.atc,a.sb');if(!dest){var s=t.closest('#ep [data-sid]');if(s&&loc(s.dataset.sid)){e.preventDefault();e.stopPropagation();E.open=s.dataset.sid;redraw();openMenu(s.dataset.sid,e.clientX+8,e.clientY+8);return}}}}
 if(!t.closest('#m12menu'))closeMenu()},true);
/* hover + between sections in preview */
d.addEventListener('mousemove',function(e){if(!ok()||drag)return;var ep=$q('#ep'),p=$q('#m12plus');if(!ep||!e.target.closest)return;if(e.target.closest('#m12plus'))return;var s=e.target.closest('#ep [data-sid]');
 if(!s||!loc(s.dataset.sid)){if(p&&!ep.contains(e.target))p.remove();return}
 if(!p){p=d.createElement('button');p.id='m12plus';p.type='button';p.title='Add section here';p.setAttribute('aria-label','Add section below');p.textContent='+ Add section';ep.appendChild(p)}
 var er=ep.getBoundingClientRect(),r=s.getBoundingClientRect();var bl=e.clientY>r.top+r.height/2;p.dataset.sid=s.dataset.sid;p.dataset.below=bl?'1':'0';p.setAttribute('aria-label',bl?'Add section below':'Add section above');p.style.top=((bl?r.bottom:r.top)-er.top+ep.scrollTop-13)+'px';p.style.left=(r.left-er.left+r.width/2-55)+'px'});
var css=d.createElement('style');css.textContent=
'.egrip{cursor:grab;touch-action:none;user-select:none;color:#111;padding:4px 6px;font-weight:700;letter-spacing:-3px;border-radius:4px}.egrip:hover,.egrip:focus{background:#eee;outline:none}'+
'#edl{position:relative}.m12line{position:absolute;left:6px;right:6px;height:3px;background:#2E6B4F;border-radius:2px;pointer-events:none;z-index:5}'+
'.er.m12drag{opacity:.45;background:#EEF6F1}body.m12dragging,body.m12dragging *{cursor:grabbing!important;user-select:none}'+
'.m12bar{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0 8px 22px}.m12bar button,#m12menu button{font:12px system-ui;background:#fff!important;color:#111!important;border:1px solid #ccc!important;border-radius:6px;padding:4px 8px;cursor:pointer}.m12bar button:hover,#m12menu button:hover{background:#f1f1f1!important;border-color:#888!important}'+
'[data-m12m]{font-weight:700;color:#111!important}'+
'#m12menu{position:fixed;z-index:99999;background:#fff;color:#111;border:1px solid #ccc;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.18);padding:6px;display:flex;flex-direction:column;gap:3px;min-width:190px;color-scheme:light}#m12menu button{text-align:left;border:0!important;font-size:13px;padding:7px 10px}.m12mt{font:600 12px system-ui;color:#111;padding:4px 10px;border-bottom:1px solid #eee;margin-bottom:2px}'+
'#m12plus{position:absolute;z-index:20;width:110px;height:26px;border-radius:13px;background:#111!important;color:#fff!important;border:2px solid #fff!important;font:600 12px system-ui;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.3)}#m12plus:hover{background:#2E6B4F!important}'+
'#ep [data-sid]:hover{outline:2px dashed #2E6B4F;outline-offset:-2px;cursor:pointer}';
d.head.appendChild(css);
})();
