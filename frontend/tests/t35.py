"""Products list (v55): header like the Shopify guide (View as, Import, Export, More actions, Add product); View as shows market prices and unpublished products."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vt
from vt import ok, go
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b, pg, errs = vt.launch(p, viewport={'width': 1280, 'height': 800}); E = pg.evaluate
    vt.signup(pg, email='p35@x.pk', store='Noor Lawn')
    E("""S.rates.EUR=0.92;for(var i=0;i<3;i++)S.products.push({id:S.nid++,name:'Lawn Kurta '+i,price:40,stock:10,status:'Active',desc:'',cols:[],tags:[],imgs:[],vars:[],opts:[],seo:{},sku:'LK-0'+i});
     MK28.list();S.cat28=[{id:'c1',title:'EU',status:'Active',cur:'EUR',adj:10,excl:[S.products[1].id],prices:{}}];S.marketsList.push({id:'eu',name:'Europe',type:'region',status:'Active',countries:['Germany'],cust:{cur:{cur:'EUR',rate:'auto'},cat:['c1']}});save()""")
    go(pg, 'home', 300); go(pg, 'products', 900)
    order = E("[...document.querySelector('.p32bar').children].map(e=>(e.id==='p32va'?'View as':e.textContent.trim().split('\\n')[0]).replace(' ▾',''))")
    ok('header order: View as, Import, Export, More actions, Add product', order[0].startswith('View as') and order[1] == 'Import' and order[2] == 'Export' and order[3].startswith('More actions') and order[4] == 'Add product', order)
    pg.click('#p32more'); pg.wait_for_timeout(200)
    ok('More actions holds Bulk edit, Quick add and Move your store', all(w in pg.inner_text('#p32mp') for w in ['Bulk edit', 'Quick add', 'Move your store']))
    pg.mouse.click(700, 600)
    pg.select_option('#p32va', 'Germany'); pg.wait_for_timeout(300)
    t = pg.inner_text('#main table')
    ok('View as shows market prices', 'Price in Germany' in t and '€' in t)
    ok('excluded products show Unpublished', 'Unpublished' in t)
    ok('View as does not raise the unsaved bar', not E("(document.querySelector('#p8save')||{classList:{contains:()=>false}}).classList.contains('on')"))
    pg.select_option('#p32va', ''); pg.wait_for_timeout(300)
    ok('back to store prices', 'Unpublished' not in pg.inner_text('#main table') and '$40.00' in pg.inner_text('#main table'))
    pg.click('text=Add product'); pg.wait_for_timeout(800)
    ok('switches draw as switches', E("getComputedStyle(document.querySelector('input.tg')).appearance") == 'none' and E("document.querySelector('input.tg').getBoundingClientRect().width") == 38)
    ok('inventory table on the form has no extra table tools', E("!document.querySelector('#main .ab .p8bar')"))
    b.close()
vt.done(errs)
