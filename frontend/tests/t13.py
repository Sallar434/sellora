import os,sys,json
from playwright.sync_api import sync_playwright
F=sys.argv[1] if len(sys.argv)>1 else 'sellora.html';R=[]
def ok(n,c,d=''):R.append(bool(c));print(('PASS ' if c else 'FAIL ')+n+(' :: '+str(d) if d else ''),flush=True)
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1400,'height':860},color_scheme='dark');errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:200]))
    pg.goto('file://'+os.path.abspath(F));pg.wait_for_timeout(900);E=pg.evaluate
    E("location.hash='themes'");pg.wait_for_timeout(300);E("edit(S.live)");pg.wait_for_timeout(500)
    ids=lambda:E("E.t.pg.home.map(s=>s.id)")
    a=ids();ok('template has >=3 sections',len(a)>=3,len(a))
    ok('grip handles rendered',E("document.querySelectorAll('#edl [data-grip]').length")>=len(a))
    ok('grip visible text',E("getComputedStyle(document.querySelector('#edl [data-grip]')).color")!='rgb(255, 255, 255)')
    # mouse drag first template section below the third
    g=pg.locator('#edl [data-grip="%s"]'%a[0]).bounding_box();t=pg.locator('#edl .er[data-row="%s"]'%a[2]).bounding_box()
    pg.mouse.move(g['x']+5,g['y']+5);pg.mouse.down();pg.mouse.move(g['x']+5,g['y']+30,steps=4)
    ok('drop indicator shown',E("!!document.querySelector('.m12line')"))
    pg.mouse.move(g['x']+5,t['y']+t['height']-3,steps=8);pg.mouse.up();pg.wait_for_timeout(300)
    n=ids();ok('mouse drag reorder',n[:3]==[a[1],a[2],a[0]],(a[:3],n[:3]))
    ok('persisted to state',E("JSON.stringify(live().pg.home.map(s=>s.id))")==json.dumps(n).replace(' ',''))
    ok('preview order updated',E("[...document.querySelectorAll('#ep [data-sid]')].map(e=>e.dataset.sid).filter(x=>E.t.pg.home.some(s=>s.id===x))")[:3]==n[:3])
    # touch-type pointer drag (synthetic pointer events) back to top
    E("""(function(){var g=document.querySelector('#edl [data-grip="%s"]'),r0=document.querySelector('#edl .er[data-row="%s"]').getBoundingClientRect(),r=g.getBoundingClientRect();
    function f(t,x,y,el){(el||g).dispatchEvent(new PointerEvent(t,{bubbles:true,clientX:x,clientY:y,pointerId:7,pointerType:'touch',isPrimary:true}))}
    f('pointerdown',r.x+3,r.y+3);f('pointermove',r.x+3,r0.top+2,document);f('pointerup',r.x+3,r0.top+2,document)})()"""%(a[0],n[0]));pg.wait_for_timeout(300)
    ok('touch pointer drag reorder',ids()[:3]==a[:3],ids()[:3])
    # keyboard alt
    pg.focus('#edl [data-grip="%s"]'%a[0]);pg.keyboard.press('Alt+ArrowDown');pg.wait_for_timeout(200)
    ok('Alt+Down moves',ids()[:2]==[a[1],a[0]]);pg.focus('#edl [data-grip="%s"]'%a[0]);pg.keyboard.press('Alt+ArrowUp');pg.wait_for_timeout(200);ok('Alt+Up moves back',ids()[:2]==a[:2])
    ok('arrow buttons kept',E("!!document.querySelector('#edl [data-ed=\"up:%s\"]')"%a[1]))
    # list menu + add above
    pg.click('#edl [data-m12m="%s"]'%a[1]);pg.wait_for_timeout(200)
    labs=E("[...document.querySelectorAll('#m12menu button')].map(b=>b.innerText.trim())");ok('menu has labelled actions',all(any(k in l for l in labs) for k in ['Add section above','Add section below','Duplicate','Hide','Delete','Move up','Move down']),labs)
    pg.click('#m12menu [data-m12a="above:%s"]'%a[1]);pg.wait_for_timeout(400);ok('picker opened',E("document.querySelector('#modal').classList.contains('on')"))
    E("document.getElementById('btn-confirm-add-sec').click()");pg.wait_for_timeout(300)
    n=ids();ok('inserted above',len(n)==len(a)+1 and n[2]==a[1] and n[1] not in a,(n[:4]))
    newid=n[1]
    # preview click menu + add below
    pg.locator('#ep [data-sid="%s"]'%a[2]).click(position={'x':30,'y':10});pg.wait_for_timeout(250)
    ok('preview click opens menu',E("!!document.querySelector('#m12menu')"))
    ok('list bar shown for selected',E("!!document.querySelector('#edl .m12bar')"))
    pg.click('#m12menu [data-m12a="below:%s"]'%a[2]);pg.wait_for_timeout(300);E("document.getElementById('btn-confirm-add-sec').click()");pg.wait_for_timeout(300)
    n2=ids();i=n2.index(a[2]);ok('inserted below',len(n2)==len(n)+1 and n2[i+1] not in n,(i,n2))
    # hover +
    pg.locator('#ep [data-sid="%s"]'%a[0]).hover(position={'x':40,'y':pg.locator('#ep [data-sid="%s"]'%a[0]).bounding_box()['height']-10});pg.wait_for_timeout(150);ok('hover + button',E("!!document.querySelector('#m12plus')&&document.querySelector('#m12plus').innerText.includes('Add section')"))
    E("document.querySelector('#m12plus').click()");pg.wait_for_timeout(300);E("document.getElementById('btn-confirm-add-sec').click()");pg.wait_for_timeout(300)
    n3=ids();ok('plus inserts below',n3[n3.index(a[0])+1] not in n2)
    # dup/hide/delete via menu
    E("m12menu('%s',100,100)"%newid);pg.click('#m12menu [data-m12a="dup:%s"]'%newid);pg.wait_for_timeout(200);ok('duplicate',len(ids())==len(n3)+1)
    E("m12menu('%s',100,100)"%newid);pg.click('#m12menu [data-m12a="hide:%s"]'%newid);ok('hide',E("E.t.pg.home.find(s=>s.id=='%s').hide"%newid))
    E("m12menu('%s',100,100)"%newid);pg.click('#m12menu [data-m12a="del:%s"]'%newid);ok('delete',newid not in ids())
    ok('no page errors',not errs,errs)
    pg.click('#os');pg.wait_for_timeout(200)
print('t13: %d/%d'%(sum(R),len(R)));sys.exit(0 if all(R) else 1)
