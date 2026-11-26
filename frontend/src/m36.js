/* ===== v59: one VendOm AI bar for everything — type, speak (voice typing), record a voice message, or talk
   (hands-free conversation: VendOm AI answers out loud and listens again). Conversation panel above the bar.
   Replaces the Home "Ask VendOm AI" box and the old floating mic button. ===== */
(function(){
var X=window;
function q(s){return document.querySelector(s)}
function h(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function st(){S.ai15=S.ai15||{};S.ai15.log=S.ai15.log||[];return S.ai15}
function sv(){try{save()}catch(e){}}
var SR=X.SpeechRecognition||X.webkitSpeechRecognition,canRec=!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&X.MediaRecorder);
var B={talk:false,listening:false,rec:null,clips:{}};
var NOVOICE='Voice typing is not available in this browser (use Chrome, Edge or Safari). You can still type your request or record a voice message.';

function speak(t,then){try{if(X.speechSynthesis&&X.SpeechSynthesisUtterance){var u=new SpeechSynthesisUtterance(String(t).slice(0,400));u.onend=function(){if(then)then()};X.speechSynthesis.cancel();X.speechSynthesis.speak(u);return}}catch(e){}if(then)setTimeout(then,300)}
function log(role,text,clip){var g=st();var m={role:role,text:String(text||'').slice(0,600),at:Date.now()};if(clip)m.clip=clip;g.log.push(m);if(g.log.length>60)g.log=g.log.slice(-60);sv();paint()}
/* run a request through VendOm AI (builder + store commands) and return its reply */
function ask(text){text=String(text||'').trim();if(!text)return '';var reply='';
 var before=st().log.length;
 try{if(X.AIBuild&&X.AIBuild.handle){var r=X.AIBuild.handle(text,'chat');if(r&&r.handled){reply=r.reply||'Done.';if(st().log.length===before)log('user',text);if(st().log.length<=before+1)log('ai',reply);afterRun();return reply}}}catch(e){console.error(e)}
 log('user',text);
 var s0=X.VOICE&&X.VOICE.say;if(X.VOICE&&X.VOICE.run){X.VOICE.say=function(t){reply=String(t||'')};try{X.VOICE.run(text)}catch(e){reply='Sorry, something went wrong.'}X.VOICE.say=s0}
 if(!reply)reply='Try: "add a product called Lawn Kurta for 40", "build a website for boxing gear", "go to orders" or "change the theme colour to green".';
 log('ai',reply);afterRun();return reply}
function afterRun(){try{if(typeof route==='function')route()}catch(e){}paint();open(true)}
function open(on){var p=q('#ai36p');if(!p)return;p.hidden=!on;var b=q('#ai36x');if(b)b.hidden=!on}
function paint(){var p=q('#ai36log');if(!p)return;var L=st().log.slice(-12);p.innerHTML=L.length?L.map(function(m){var c=m.clip&&B.clips[m.clip];return '<div class="ai36m '+(m.role==='user'?'u':'a')+'">'+(c?'<audio controls src="'+c+'" aria-label="Voice message"></audio>':'')+(m.text?'<span>'+h(m.text)+'</span>':'')+'</div>'}).join(''):'<p class="ai36hint">Ask VendOm AI to do anything in your store: <b>add a product</b>, <b>build a website</b>, <b>add a banner</b>, <b>go to orders</b>, <b>change the theme colour</b>. You can type, speak, record a voice message or talk.</p>';p.scrollTop=p.scrollHeight}
function status(t){var s=q('#ai36s');if(s){s.textContent=t||'';s.hidden=!t}}
function setBtn(id,on){var b=q(id);if(b){b.classList.toggle('on',!!on);b.setAttribute('aria-pressed',String(!!on))}}

/* voice typing: listen once, then send */
function listenOnce(done){if(!SR){status(NOVOICE);return false}try{var r=new SR();r.lang=(navigator.language||'en-US');r.interimResults=true;r.continuous=false;var fin='';B.listening=true;setBtn('#ai36mic',true);status('Listening…');
 r.onresult=function(e){var t='';for(var i=0;i<e.results.length;i++)t+=e.results[i][0].transcript;fin=t;var inp=q('#ai36q');if(inp)inp.value=t};
 r.onerror=function(e){B.listening=false;setBtn('#ai36mic',false);status(e.error==='not-allowed'?'Allow the microphone to use voice.':e.error==='no-speech'?'I didn\'t hear anything.':'Voice stopped.');if(done)done('')};
 r.onend=function(){B.listening=false;setBtn('#ai36mic',false);if(fin)status('');if(done)done(fin)};r.start();B.sr=r;return true}catch(e){status(NOVOICE);return false}}
function mic(){if(B.listening&&B.sr){try{B.sr.stop()}catch(e){}return}open(true);listenOnce(function(t){if(t){var i=q('#ai36q');if(i)i.value='';ask(t)}})}
/* talk mode: answer out loud, then listen again */
function talkLoop(){if(!B.talk)return;listenOnce(function(t){if(!B.talk)return;if(!t){status('Talk mode is on. Say something, or press 🗣 to stop.');setTimeout(talkLoop,600);return}var i=q('#ai36q');if(i)i.value='';var r=ask(t);status('Speaking…');speak(r,function(){status('');setTimeout(talkLoop,250)})})}
function talk(){if(!SR){status(NOVOICE);open(true);return}B.talk=!B.talk;setBtn('#ai36talk',B.talk);open(true);if(B.talk){status('Talk mode on. Speak your request.');talkLoop()}else{try{B.sr&&B.sr.stop()}catch(e){}try{X.speechSynthesis&&X.speechSynthesis.cancel()}catch(e){}status('Talk mode off.')}}
/* voice message: record audio (kept in the chat) and send what was said */
function record(){open(true);if(B.rec){B.rec.stop();return}if(!canRec){status('This browser can\'t record audio.');return}
 navigator.mediaDevices.getUserMedia({audio:true}).then(function(stream){var chunks=[],mr=new MediaRecorder(stream),said='',sr=null;B.rec=mr;setBtn('#ai36rec',true);status('Recording… press ⏺ again to send.');
  if(SR){try{sr=new SR();sr.lang=(navigator.language||'en-US');sr.continuous=true;sr.interimResults=false;sr.onresult=function(e){for(var i=e.resultIndex;i<e.results.length;i++)if(e.results[i].isFinal)said+=e.results[i][0].transcript+' '};sr.start()}catch(e){sr=null}}
  mr.ondataavailable=function(e){if(e.data&&e.data.size)chunks.push(e.data)};
  mr.onstop=function(){stream.getTracks().forEach(function(t){t.stop()});B.rec=null;setBtn('#ai36rec',false);try{sr&&sr.stop()}catch(e){}
   setTimeout(function(){var id='c'+Date.now();B.clips[id]=URL.createObjectURL(new Blob(chunks,{type:mr.mimeType||'audio/webm'}));said=said.trim();
    if(said){log('user','',id);var txt=said;status('');var g=st();g.log[g.log.length-1].text='🎙 '+txt;sv();paint();var r=ask(txt)}else{log('user','🎙 Voice message',id);status(SR?'I couldn\'t make out the words. Try again closer to the mic, or type.':NOVOICE)}},SR?500:0)};
  mr.start()}).catch(function(){status('Allow the microphone to record a voice message.')})}

function mount(){var old=q('#sh30ai');if(old&&!old.closest('#ai36'))old.remove();if(q('#ai36'))return;var d=document.createElement('div');d.id='ai36';d.className='ai36';
 d.innerHTML='<div class="ai36p" id="ai36p" hidden role="log" aria-live="polite" aria-label="VendOm AI conversation"><div class="ai36ph"><b>VendOm AI</b><button type="button" id="ai36clr" class="ai36lnk">Clear</button><button type="button" id="ai36x" aria-label="Close conversation">×</button></div><div class="ai36log" id="ai36log"></div><p class="ai36s" id="ai36s" role="status" hidden></p></div>'
  +'<form class="ai36bar" id="sh30ai" role="search"><span class="sh30aidot" aria-hidden="true"></span><input id="ai36q" placeholder="Work with VendOm AI" aria-label="Ask VendOm AI" autocomplete="off">'
  +'<button type="button" id="ai36mic" class="ai36b" aria-label="Speak your request" title="Speak (voice typing)" aria-pressed="false">🎤</button>'
  +'<button type="button" id="ai36rec" class="ai36b" aria-label="Record a voice message" title="Record a voice message" aria-pressed="false">⏺</button>'
  +'<button type="button" id="ai36talk" class="ai36b" aria-label="Talk with VendOm AI" title="Talk (hands-free)" aria-pressed="false">🗣</button>'
  +'<button type="submit" class="ai36go" aria-label="Send">↵</button></form>';
 document.body.appendChild(d);paint();
 q('#sh30ai').onsubmit=function(e){e.preventDefault();var i=q('#ai36q'),v=i.value.trim();if(!v){open(true);i.focus();return}i.value='';ask(v)};
 q('#ai36q').onfocus=function(){open(true)};q('#ai36mic').onclick=mic;q('#ai36rec').onclick=record;q('#ai36talk').onclick=talk;
 q('#ai36x').onclick=function(){open(false)};q('#ai36clr').onclick=function(){st().log=[];sv();paint()}}
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&q('#ai36p')&&!q('#ai36p').hidden)open(false)});
function inEditor(){var o=q('#ov');return !!(o&&o.style.display&&o.style.display!=='none')}
function sync(){if(document.body.classList.contains('locked'))return;mount();var hide=/^#(ai-assistant)/.test(location.hash)||document.body.classList.contains('st')||inEditor();if(hide&&B.talk)talk();var d=q('#ai36');if(d)d.style.display=hide?'none':''}
if(X.onRoute)X.onRoute(function(){setTimeout(function(){try{sync()}catch(e){console.error('ai36',e)}},0)});
(function watchOv(){var o=q('#ov');if(!o)return setTimeout(watchOv,500);new MutationObserver(function(){try{sync()}catch(e){}}).observe(o,{attributes:true,attributeFilter:['style']})})();setTimeout(sync,0);setInterval(sync,4000);

var css=document.createElement('style');css.textContent=['#main .ask,#main #qvstat,#main #aichat,#vmic{display:none!important}',
'.ai36{position:fixed;left:calc(50% + 120px);transform:translateX(-50%);bottom:14px;z-index:70;width:min(520px,calc(100vw - 300px))}',
'.ai36bar{display:flex;align-items:center;gap:6px;background:#fff;border:1px solid #E3E3E3;border-radius:999px;box-shadow:0 6px 18px rgba(0,0,0,.12);padding:6px 6px 6px 14px}',
'.ai36bar input{flex:1;min-width:0;border:0!important;outline:0;background:transparent;font:inherit;font-size:13px;padding:6px 0;box-shadow:none!important}',
'.ai36b{border:0;background:transparent;width:32px;height:32px;border-radius:999px;cursor:pointer;font-size:15px;line-height:1}.ai36b:hover{background:#F1F1F1}.ai36b.on{background:#FDE7E9;box-shadow:0 0 0 2px #E22C38 inset}',
'.ai36go{border:0;background:#303030;color:#fff;border-radius:999px;width:32px;height:32px;cursor:pointer}',
'.ai36p{background:#fff;border:1px solid #E3E3E3;border-radius:14px;box-shadow:0 8px 24px rgba(0,0,0,.14);margin-bottom:8px;overflow:hidden}.ai36p[hidden]{display:none}',
'.ai36ph{display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid #EBEBEB}.ai36ph b{flex:1}.ai36ph button{border:0;background:none;cursor:pointer;font:inherit}.ai36lnk{color:#005BD3}#ai36x{font-size:18px;line-height:1}',
'.ai36log{max-height:min(44vh,360px);overflow:auto;padding:10px 12px;display:flex;flex-direction:column;gap:6px}',
'.ai36m{max-width:85%;display:flex;flex-direction:column;gap:4px}.ai36m span{padding:7px 10px;border-radius:12px;font-size:13px;line-height:1.4}.ai36m.u{align-self:flex-end}.ai36m.u span{background:#303030;color:#fff}.ai36m.a span{background:#F1F1F1;color:#303030}.ai36m audio{max-width:240px;height:34px}',
'.ai36hint{margin:0;color:#616161;font-size:13px}.ai36s{margin:0;padding:6px 12px 10px;color:#616161;font-size:12px}.ai36s[hidden]{display:none}',
'@media(max-width:900px){.ai36{left:50%;width:calc(100vw - 24px);bottom:10px}#ai36 .ai36bar{display:flex!important}main{padding-bottom:90px!important}}'].join('\n');document.head.appendChild(css);
X.AI36={ask:ask,open:open};
})();
