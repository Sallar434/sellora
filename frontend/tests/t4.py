from playwright.sync_api import sync_playwright
import os
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page()
    pg.goto('file://'+os.path.abspath('sellora.html'));pg.wait_for_timeout(800)
    pg.evaluate("document.body.insertAdjacentHTML('beforeend','<select id=zz><option>PKR</option><option selected>EUR</option></select>')");pg.wait_for_timeout(100)
    print(pg.evaluate("[...zz.options].map(o=>o.text+'='+o.value)+' sel='+zz.value"))
    for r in ['settings','markets','pay-embed','pay-buyer']:
        pg.evaluate("location.hash='#%s'"%r);pg.wait_for_timeout(500)
        print(r,pg.evaluate("[...document.querySelectorAll('option[data-cn]')].length"),'USD name' if 'US Dollar (USD)' in pg.inner_text('body') else '-')
