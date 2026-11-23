"""Move your store: paste the link of a Shopify or WooCommerce store, see what VendOm found, copy products, variants, photos and collections."""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vt
from vt import ok, go
from playwright.sync_api import sync_playwright

SHOP = {
  '/meta.json': {'name': 'Old Lawn Shop', 'currency': 'PKR'},
  '/products.json?limit=1': {'products': [{}]},
  '/products.json?limit=250&page=1': {'products': [
    {'handle': 'lawn-kurta', 'title': 'Lawn Kurta', 'body_html': '<p>Soft lawn</p><script>alert(1)</script>', 'vendor': 'Noor', 'product_type': 'Kurta', 'tags': 'summer, lawn',
     'options': [{'name': 'Size', 'values': ['S', 'M']}], 'images': [{'src': 'https://oldshop.example/k.png'}],
     'variants': [{'title': 'S', 'sku': 'K-S', 'price': '3500.00', 'compare_at_price': '4000.00'}, {'title': 'M', 'sku': 'K-M', 'price': '3600.00'}]},
    {'handle': 'silk-shawl', 'title': 'Silk Shawl', 'body_html': '', 'options': [{'name': 'Title', 'values': ['Default Title']}], 'images': [],
     'variants': [{'title': 'Default Title', 'price': '1200', 'sku': 'SH1'}]}]},
  '/collections.json?limit=250': {'collections': [{'handle': 'summer', 'title': 'Summer', 'description': 'Hot days'}, {'handle': 'all', 'title': 'All'}]},
  '/collections/summer/products.json?limit=250': {'products': [{'handle': 'lawn-kurta'}]},
}
PNG = bytes.fromhex('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c63000100000500010d0a2db40000000049454e44ae426082')
WOO = {'/wp-json/wc/store/v1/products?per_page=1': [{}],
       '/wp-json/wc/store/v1/products?per_page=100&page=1': [{'name': 'Clay Mug', 'slug': 'clay-mug', 'sku': 'M1', 'description': '<p>Clay</p>', 'prices': {'price': '150000', 'regular_price': '200000', 'currency_minor_unit': 2}, 'images': [], 'categories': [{'slug': 'kitchen', 'name': 'Kitchen'}], 'attributes': []}]}

def serve(table):
    def handler(route):
        u = route.request.url; path = u.split('.example', 1)[1]
        if path.endswith('.png'): return route.fulfill(status=200, body=PNG, headers={'Content-Type': 'image/png', 'Access-Control-Allow-Origin': '*'})
        if path in table: return route.fulfill(status=200, body=json.dumps(table[path]), headers={'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'})
        route.fulfill(status=404, body='no', headers={'Access-Control-Allow-Origin': '*'})
    return handler

with sync_playwright() as p:
    b, pg, errs = vt.launch(p); E = pg.evaluate
    pg.route('https://oldshop.example/**', serve(SHOP)); pg.route('https://oldwoo.example/**', serve(WOO))
    vt.signup(pg, email='mover@x.pk', store='Noor Lawn', plan='basic')
    go(pg, 'products', 400)
    ok('Products has a "Move your store" button', pg.locator('#xpmove').count() == 1)
    pg.click('#xpmove'); pg.wait_for_timeout(300)
    ok('opens the Move your store page', E("location.hash") == '#products-import' and 'Move your store' in E("document.querySelector('#main h1').textContent"))
    ok('menu lists it under Products', E("NAV_CONFIG.find(n=>n.id==='products').sub.some(s=>s.id==='products-import')"))
    ok('explains what is and is not copied', all(t in E("document.querySelector('#main').innerText") for t in ['Product photos', 'Collections', 'Theme design', 'Domain']))
    pg.click('#mv-scan'); pg.wait_for_timeout(150)
    ok('asks for a link first', 'Paste the link' in pg.inner_text('#mv-err'))
    pg.fill('#mv-url', 'oldshop.example'); pg.click('#mv-scan'); pg.wait_for_timeout(150)
    ok('asks to confirm ownership', 'permission' in pg.inner_text('#mv-err'))
    pg.check('#mv-own'); pg.click('#mv-scan'); pg.wait_for_selector('#mv-prev', timeout=5000)
    ok('detects Shopify and counts what it found', 'Shopify' in pg.inner_text('#mv-prev') and pg.inner_text('#mv-np') == '2' and pg.inner_text('#mv-nc') == '1', pg.inner_text('#mv-prev')[:200])
    ok('preview shows product photos', pg.locator('#mv-prev img').count() == 1)
    pg.click('#mv-go'); pg.wait_for_selector('#mv-done', timeout=5000)
    ok('reports the result', '2 products added' in pg.inner_text('#mv-done') and '1 collections' in pg.inner_text('#mv-done'), pg.inner_text('#mv-done'))
    k = E("JSON.parse(JSON.stringify(S.products.find(p=>p.handle==='lawn-kurta')))")
    ok('product title, price and sale price copied', k['name'] == 'Lawn Kurta' and k['price'] == 3500 and k['cmp'] == 4000, k)
    ok('variants and SKUs copied', [v['sku'] for v in k['vars']] == ['K-S', 'K-M'] and k['opts'][0] == {'name': 'Size', 'vals': 'S, M'})
    ok('photos, tags and vendor copied', k['imgs'] == ['https://oldshop.example/k.png'] and k['tags'] == ['summer', 'lawn'] and k['vendor'] == 'Noor')
    ok('scripts removed from descriptions', 'script' not in k['desc'] and 'Soft lawn' in k['desc'])
    sh = E("JSON.parse(JSON.stringify(S.products.find(p=>p.handle==='silk-shawl')))")
    ok('single-variant product keeps its SKU, no fake "Default Title" option', sh['vars'] == [] and sh['opts'] == [] and sh['sku'] == 'SH1')
    ok('collection made and products put in it', E("S.collections.some(c=>c.handle==='summer'&&c.title==='Summer')") and k['cols'] == ['Summer'] and 'all' not in E("S.collections.map(c=>c.handle)"))
    go(pg, 'products', 400)
    ok('imported products show in Products', 'Lawn Kurta' in E("document.querySelector('#main').innerText") and 'Silk Shawl' in E("document.querySelector('#main').innerText"))
    go(pg, 'products-import', 300)
    pg.fill('#mv-url', 'https://oldshop.example/'); pg.check('#mv-own'); pg.click('#mv-scan'); pg.wait_for_selector('#mv-prev', timeout=5000)
    pg.click('#mv-go'); pg.wait_for_selector('#mv-done', timeout=5000)
    ok('scanning again skips what is already here', '2 already here' in pg.inner_text('#mv-done') and E("S.products.filter(p=>p.handle==='lawn-kurta').length") == 1)
    pg.fill('#mv-url', 'oldwoo.example'); pg.check('#mv-own'); pg.click('#mv-scan'); pg.wait_for_selector('#mv-prev', timeout=5000)
    ok('detects WooCommerce', 'WooCommerce' in pg.inner_text('#mv-prev'))
    pg.click('#mv-go'); pg.wait_for_selector('#mv-done', timeout=5000)
    ok('WooCommerce product and category copied', E("(p=>p&&p.price===1500&&p.cmp===2000&&p.cols[0]==='Kitchen')(S.products.find(p=>p.handle==='clay-mug'))") and E("S.collections.some(c=>c.title==='Kitchen')"))
    pg.route('https://nothing.example/**', lambda r: r.fulfill(status=404, body='x'))
    pg.fill('#mv-url', 'nothing.example'); pg.check('#mv-own'); pg.click('#mv-scan'); pg.wait_for_timeout(1200)
    ok('unknown site explains the server and CSV options', 'CSV' in pg.inner_text('#mv-err') and 'server' in pg.inner_text('#mv-err'), pg.inner_text('#mv-err'))
    ok('private addresses refused', (pg.fill('#mv-url', 'http://192.168.1.5'), pg.click('#mv-scan'), pg.wait_for_timeout(150), 'public link' in pg.inner_text('#mv-err'))[-1])
    pg.reload(); pg.wait_for_timeout(900)
    ok('imported products survive a reload', E("S.products.length") == 3)
    go(pg, 'home', 300)
    b.close()
vt.done(errs)
