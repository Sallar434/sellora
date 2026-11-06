from playwright.sync_api import sync_playwright
R=['home','orders','products','customers','growth-automations','online-store-pages','online-store-page-pg1','online-store-preferences','finance-billing','s-roles','s-markets','s-activity','products-transfers','analytics-reports']
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1366,'height':900});E=[]
    pg.on('pageerror',lambda e:E.append(str(e)[:200]))
    pg.goto('http://127.0.0.1:8777/sellora.html#home');pg.wait_for_timeout(1500)
    print('nav:',pg.evaluate("()=>[...document.querySelectorAll('#nav .nav-link, #nav a')].map(a=>a.textContent.trim()).filter(Boolean).slice(0,45).join('|')"))
    for r in R:
        pg.goto('http://127.0.0.1:8777/sellora.html#'+r);pg.wait_for_timeout(500)
        t=pg.evaluate("()=>document.querySelector('#main').innerText.slice(0,120).replace(/\\n+/g,' / ')")
        print(r,'::',pg.evaluate("()=>({bar:!!document.querySelector('.p8bar'),bk:!!document.querySelector('#p8bk'),cb:document.querySelectorAll('.p8c').length})"),t)
        pg.screenshot(path='shots3/'+r+'.png')
    pg.goto('http://127.0.0.1:8777/sellora.html#products');pg.wait_for_timeout(500)
    pg.fill('.p8q','glove');print('visible rows after search', pg.evaluate("()=>[...document.querySelectorAll('#main tbody tr')].filter(r=>r.style.display!=='none').length"))
    pg.fill('.p8q','');pg.check('.p8all');pg.screenshot(path='shots3/bulk.png');print(pg.inner_text('.p8bulk'))
    pg.click('text=Set as draft');pg.wait_for_timeout(300);print('drafts',pg.evaluate("()=>S.products.map(p=>p.status).join()"))
    pg.goto('http://127.0.0.1:8777/sellora.html#online-store-preferences');pg.wait_for_timeout(400);pg.fill('#pf2','Boxing gear');pg.wait_for_timeout(200)
    print('savebar',pg.evaluate("()=>document.querySelector('#p8save').className"));pg.screenshot(path='shots3/savebar.png');pg.click('#p8sav');pg.wait_for_timeout(300);print('saved desc',pg.evaluate("()=>S.sp.prefs.desc"))
    pg.keyboard.press('Control+k');pg.fill('#p8si','1001');pg.wait_for_timeout(200);pg.screenshot(path='shots3/search.png');print('search:',pg.inner_text('#p8sr')[:120])
    print('ERR',E)
    b.close()
