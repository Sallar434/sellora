"""Editor templates, honest local actions, order totals, SEO, reload."""
import os
from playwright.sync_api import sync_playwright

F = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'sellora.html'))
R = []

def ok(n, c, d=''):
    R.append(bool(c))
    print(('PASS ' if c else 'FAIL ') + n + ((' :: ' + str(d)[:360]) if d and not c else ''), flush=True)

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1280, 'height': 900})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:240]))
    pg.goto(F)
    pg.wait_for_timeout(600)
    pg.click('#door-up')
    pg.fill('#a2', 'platform@example.com')
    pg.fill('#a3', 'password123')
    pg.click('#ab')
    pg.wait_for_timeout(300)
    pg.click('[data-m13p=grow]')
    pg.wait_for_timeout(200)
    pg.fill('#a1', 'Platform Shop')
    pg.click('#ab')
    pg.wait_for_timeout(800)

    said = pg.evaluate("AIBuild.handle('add an announcement bar: Hello from the bench')")
    ok('local action is not labeled as a provider', said.get('source') == 'local' and 'No AI provider was called' in said.get('reply', ''), said.get('reply'))
    ok('announcement persisted in the theme', pg.evaluate("live().hdr.some(s => s.type==='announce' && /Hello from the bench/.test(s.s.msg||''))"))

    blocked = pg.evaluate("AIBuild.handle('refund order 12')")
    ok('refund is refused and not reported as success', blocked.get('applied') == False and 'not run' in blocked.get('reply', '').lower(), blocked.get('reply'))

    gone = pg.evaluate("AIBuild.handle('delete all products')")
    ok('destructive command waits for confirmation', gone.get('needsConfirm') == True and pg.evaluate('S.products.length') > 0, gone.get('reply'))

    voice = pg.evaluate("new Promise(res => AIBuild.voiceListen(r => res(r)))")
    ok('voice fallback state is explicit', voice.get('state') in ('unsupported', 'denied', 'error', 'heard') and 'type your request' in (voice.get('message') or '').lower() or voice.get('state') == 'heard', voice)

    empty = pg.evaluate('AIBuild.orders([])')
    ok('empty order list is not a fake total', empty['count'] == 0 and empty['delivery']['unknown'] == 0 and empty['source'] == 'stored-records', empty)
    one = pg.evaluate("AIBuild.orders([{id:9,st:'Paid',total:20,at:1},{id:10,st:'Fulfilled',total:5,at:2},{id:11,delivered:false,st:'Paid',total:3,at:3}])")
    ok('paid and fulfilled stay distinct from delivery', one['payment']['paid'] == 3 and one['fulfillment']['fulfilled'] == 1 and one['delivery']['unknown'] == 2 and one['delivery']['undelivered'] == 1, one)

    seo = pg.evaluate("""(() => { var p=S.products.find(x => x.status==='Active'); return AIBuild.seo('product', p.id); })()""")
    ok('product SEO has a canonical and does not invent an FAQ', '/products/' in seo['canonical'] and seo['jsonld']['@type'] != 'FAQPage', seo)

    pg.evaluate("""(() => { var t=live(); var s=t.pg.home[0]; s.s.pad=44; s.s.fg='#123456'; save(); })()""")
    pg.reload()
    pg.wait_for_timeout(900)
    kept = pg.evaluate("""(() => { var t=live(); var s=t.pg.home[0]; return {pad:s.s.pad, fg:s.s.fg, user:U, name:S.name}; })()""")
    ok('section padding and text color survive reload', kept.get('pad') == 44 and kept.get('fg') == '#123456' and kept.get('name') == 'Platform Shop', kept)

    opts = pg.evaluate("""(() => { edit(S.live); return Array.from(document.querySelectorAll('#epg option')).map(o => o.value); })()""")
    ok('editor templates include page, blog, search, and cart', all(k in opts for k in ['page', 'blog', 'search', 'cart']), opts)
    pg.evaluate("AIBuild.previewTo({pg:'cart'})")
    pg.wait_for_timeout(200)
    ok('cart template renders an empty preview', 'preview cart is empty' in pg.inner_text('#ep').lower())
    added = pg.evaluate("""(() => { AIBuild.previewTo({pg:'home'}); var el=document.querySelector('#ep .atc'); if(!el) return {missing:true}; el.click(); AIBuild.previewTo({pg:'cart'}); var text=document.querySelector('#ep').innerText; return {n:(E.previewCart||[]).length, text:text.replace(/\\s+/g,' ').slice(0,180)}; })()""")
    ok('add to cart in the preview fills the cart template', added.get('n') == 1 and '×' in added.get('text', '') and 'New season' not in added.get('text', ''), added)

    os.makedirs('/opt/cursor/artifacts', exist_ok=True)
    pg.screenshot(path='/opt/cursor/artifacts/editor-cart.png', full_page=False)
    pg.evaluate("var ov=document.getElementById('ov'); if(ov){ov.style.display='none'; ov.innerHTML='';} if(window.E) E=null;")
    pg.evaluate("location.hash='orders'")
    pg.wait_for_timeout(400)
    pg.screenshot(path='/opt/cursor/artifacts/orders-summary.png', full_page=False)
    pg.evaluate("location.hash='integrations'")
    pg.wait_for_timeout(400)
    pg.screenshot(path='/opt/cursor/artifacts/integrations-unverified.png', full_page=False)
    ok('integrations page does not ask for a browser key', 'localStorage' not in pg.inner_text('#main') and pg.query_selector('#main input[type=password]') is None)
    pg.evaluate("S.products[0].name='Tenant Marker Product'; save();")
    pg.click('#so')
    pg.wait_for_timeout(400)
    pg.click('#door-up')
    pg.fill('#a2', 'other-platform@example.com')
    pg.fill('#a3', 'password123')
    pg.click('#ab')
    pg.wait_for_timeout(300)
    pg.click('[data-m13p=basic]')
    pg.wait_for_timeout(200)
    pg.fill('#a1', 'Other Platform')
    pg.click('#ab')
    pg.wait_for_timeout(800)
    ok('second store does not see the first store product', pg.evaluate("S.name")=='Other Platform' and not pg.evaluate("S.products.some(p => p.name==='Tenant Marker Product')"))
    ok('no page errors', not errs, errs[:4])
    b.close()

print('%d/%d passed' % (sum(R), len(R)))
raise SystemExit(0 if all(R) else 1)
