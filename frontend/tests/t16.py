"""AI store builder: item vs category, collections, banners, featured layout, voice, suggestions, speed, editor."""
import os
from playwright.sync_api import sync_playwright

F = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'sellora.html'))
R = []

def ok(n, c, d=''):
    R.append(bool(c))
    print(('PASS ' if c else 'FAIL ') + n + ((' :: ' + str(d)[:400]) if d and not c else ''), flush=True)

def body(pg):
    return pg.inner_text('body')

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1280, 'height': 800})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.goto(F)
    pg.wait_for_timeout(700)
    t = body(pg)
    ok('door still offers Sign in and Create account', 'Sign in' in t and 'Create account' in t, t[:160])
    pg.click('#door-up')
    pg.wait_for_timeout(200)
    pg.fill('#a2', 'builder@example.com')
    pg.fill('#a3', 'password123')
    pg.click('#ab')
    pg.wait_for_timeout(400)
    ok('plan picker still appears', pg.locator('.m13pick').count() == 1, body(pg)[:160])
    pg.click('[data-m13p=grow]')
    pg.wait_for_timeout(250)
    pg.fill('#a1', 'Ring Shop')
    pg.click('#ab')
    pg.wait_for_timeout(900)
    ok('signed in to own store', pg.evaluate('S.name') == 'Ring Shop' and pg.evaluate('!!U'))
    ok('voice button next to AI input', pg.locator('#qmic').count() == 1 and pg.locator('#qmic').get_attribute('aria-label') == 'Speak to Sellora AI')
    pg.click('#qmic')
    pg.wait_for_timeout(250)
    voice = pg.locator('#qvstat').inner_text()
    ok('voice unavailable explains itself or starts listening', 'not available' in voice.lower() or 'type your request' in voice.lower() or 'listening' in voice.lower(), voice)

    before = pg.evaluate('S.products.length')
    asked = pg.evaluate("AIBuild.handle('build a website for boxing')")
    ok('asks item vs category', asked['handled'] and asked.get('pending', {}).get('kind') == 'scope' and 'category' in asked['reply'].lower(), asked)
    ok('does not build before the answer', pg.evaluate('S.products.length') == before)
    lay = pg.evaluate("AIBuild.handle('category')")
    ok('then asks carousel or grid', lay.get('pending', {}).get('kind') == 'layout' and 'grid' in lay['reply'].lower(), lay)
    built = pg.evaluate("AIBuild.handle('grid')")
    ok('category build reports products', built['handled'] and 'product' in built['reply'].lower(), built.get('reply'))
    snap = pg.evaluate("""(() => {
      var col = (S.collections||[]).find(c => c.title === 'Boxing');
      var t = live(); initT(t);
      var home = t.pg.home.filter(s => !s.hide);
      var hero = home.find(s => /hero|banner|slide|split|largelogo/.test(s.type));
      var feat = home.find(s => s.type === 'feat_col_grid' || s.type === 'featured');
      var foot = (t.ftr||[]).find(s => s.type === 'footer');
      var made = S.products.filter(p => (p.cols||[]).indexOf('Boxing') >= 0);
      return {
        products: made.length,
        pic: !!(col && col.pic && String(col.pic).indexOf('data:image/svg') === 0 && col.pic.indexOf('Boxing') > 0),
        page: (t.pg.collection||[]).some(s => (s.type === 'col_banner' || /hero/.test(s.type)) && s.s && s.s.img && String(s.s.img).indexOf('data:image') === 0),
        hero: !!(hero && hero.s && hero.s.img && String(hero.s.img).indexOf('data:image/svg') === 0),
        grid: !!(feat && feat.type === 'feat_col_grid' && feat.s.col === 'Boxing'),
        footer: !!(foot && /Sellora Pay/.test(foot.s.txt || '')),
        menu: ((S.menusList||[]).find(m => m.handle === 'main-menu') || {}).items || '',
        price: made[0] && made[0].price > 0 && made[0].desc && (made[0].imgs||[])[0]
      };
    })()""")
    ok('eight boxing products with price, copy, image', snap['products'] >= 8 and snap['price'], snap)
    ok('collection cover and collection page', snap['pic'] and snap['page'], snap)
    ok('hero, featured grid, footer, menu', snap['hero'] and snap['grid'] and snap['footer'] and 'Boxing' in snap['menu'], snap)

    one_before = pg.evaluate('S.products.length')
    pg.evaluate("AIBuild.handle('build a store for a ceramic mug')")
    pg.evaluate("AIBuild.handle('one product')")
    one = pg.evaluate("AIBuild.handle('carousel')")
    ok('one product still builds the storefront', 'product' in one['reply'].lower() and pg.evaluate('S.products.length') == one_before + 1, one.get('reply'))
    ok('single product is on the homepage hero', pg.evaluate("""(() => { var t=live(); var h=t.pg.home.find(s => /hero|banner|slide/.test(s.type)); return !!(h && /Ceramic Mug/i.test((h.s.h||'')+' '+(h.s.img||''))); })()"""))

    col = pg.evaluate("AIBuild.handle('create a collection for boxing gloves')")
    gloves = pg.evaluate("""(() => { var c=(S.collections||[]).find(x => x.title==='Boxing Gloves'); return {ok:!!(c&&c.pic&&c.pic.indexOf('data:image')===0), n:S.products.filter(p => (p.cols||[]).indexOf('Boxing Gloves')>=0).length}; })()""")
    ok('collection command makes a covered collection', 'collection' in col['reply'].lower() and gloves['ok'] and gloves['n'] >= 6, {'reply': col.get('reply'), 'gloves': gloves})

    ban = pg.evaluate("AIBuild.handle('add a sale banner for fight night')")
    ok('banner command adds designed artwork', 'banner' in ban['reply'].lower() and pg.evaluate("""t=live(), t.pg.home.some(s => !s.hide && s.s && String(s.s.img||s.s.h||'').toLowerCase().indexOf('fight')>=0)"""), ban.get('reply'))

    car = pg.evaluate("AIBuild.handle('add a featured products carousel')")
    ok('direct carousel request', 'carousel' in car['reply'].lower() and pg.evaluate("live().pg.home.some(s => !s.hide && (s.type==='feat_col_carousel'||s.type==='featured'))"), car.get('reply'))

    ideas = pg.evaluate("AIBuild.handle('what should I add next')")
    ok('suggestions name this store', ideas['handled'] and len(ideas.get('suggestions') or []) > 0 and ('Boxing' in ideas['reply'] or 'collection' in ideas['reply'].lower() or 'carousel' in ideas['reply'].lower() or 'banner' in ideas['reply'].lower()), ideas.get('reply'))

    speed = pg.evaluate("AIBuild.handle('optimize my store speed')")
    ok('speed optimize changes the theme and explains', speed['handled'] and pg.evaluate('!!(live().ts&&live().ts.lazy)') and len(speed['reply']) > 20, speed.get('reply'))

    prov = pg.evaluate('AIBuild.providers()')
    ok('local fallback is the active provider without keys', prov['active'] == 'local' and prov['order'][-1] == 'local', prov)

    schemas = pg.evaluate("""(() => { var missing=[]; Object.keys(RN).forEach(function(k){ if(typeof RN[k]!=='function')return; var f=SCH[k]; if(!f||!f.some(x=>x[0]==='bg')) missing.push(k); }); return missing; })()""")
    ok('every section schema has a background color', schemas == [], schemas)

    bg = pg.evaluate("""(() => { var t=live(); initT(t); var s=t.pg.home[0]; s.s.bg='#123456'; var html=sf(t,'home'); save(); var raw=localStorage.getItem('sellora'); return {html: html.indexOf('background-color:#123456')>=0, saved: raw.indexOf('#123456')>=0}; })()""")
    ok('section background paints and persists', bg['html'] and bg['saved'], bg)

    pg.evaluate("edit(S.live)")
    pg.wait_for_timeout(400)
    block = pg.evaluate("""(() => {
      var id = AIBuild.insertBlock(0);
      AIBuild.handle('a hero banner for kettlebells', 'block');
      var s = live().pg.home[0];
      return {id:id, same:s.id===id, type:s.type, img:!!(s.s&&s.s.img&&String(s.s.img).indexOf('data:image/svg')===0), prompt:!!(document.querySelector('[data-aimic]'))};
    })()""")
    ok('AI block becomes a real banner section', block['same'] and block['img'] and block.get('type') in ('hero', 'heroB', 'heroM', 'imgbanner', 'col_banner'), block)

    nav = pg.evaluate("""(() => {
      var el = document.querySelector('#ep [data-edcol]');
      if(!el) return {missing:true};
      el.click();
      return {pg:E.pg, col:E.preview&&E.preview.col, bar:document.body.innerText.indexOf('Collection:')>=0};
    })()""")
    ok('preview collection click opens the collection page', nav.get('pg') == 'collection' and nav.get('col'), nav)

    prod = pg.evaluate("""(() => {
      AIBuild.previewTo({pg:'home'});
      var el = document.querySelector('#ep [data-pid]');
      if(!el) return {missing:true, html: document.querySelector('#ep') ? document.querySelector('#ep').innerText.slice(0,120) : ''};
      el.click();
      return {pg:E.pg, pid:E.preview&&E.preview.pid};
    })()""")
    ok('preview product click opens the product page', prod.get('pg') == 'product' and prod.get('pid'), prod)

    lay = pg.evaluate("""(() => {
      AIBuild.previewTo({pg:'home'});
      var sec = live().pg.home.find(x => !x.hide && (x.type==='feat_col_carousel' || x.type==='feat_col_grid' || x.type==='featured'));
      if(!sec) return {missing:'section', types: live().pg.home.map(x => x.type+':'+(x.hide?'h':''))};
      E.open = sec.id; E.pg = 'home'; lp();
      var sel = document.querySelector('#edl select[data-sk="layout"]');
      if(!sel) return {missing:'select', type:sec.type, keys:(SCH[sec.type]||[]).map(f => f[0])};
      sel.value = 'Grid';
      sel.dispatchEvent(new Event('change', {bubbles:true}));
      var s = live().pg.home.find(x => x.id === sec.id);
      return {type: s && s.type, value: s && s.s.layout};
    })()""")
    ok('featured layout can switch to a grid', lay.get('type') == 'feat_col_grid' and lay.get('value') == 'Grid', lay)

    ok('catalog lists the AI block', pg.evaluate("!!(window.SECTIONS_CATALOG||[]).some(g => (g.items||[]).some(i => i.id==='aiblock'))"))
    ok('trial still running', pg.evaluate("S.sub9&&S.sub9.status==='trialing'"))
    ok('no page errors', not errs, errs[:5])
    b.close()

print('%d/%d passed' % (sum(R), len(R)))
raise SystemExit(0 if all(R) else 1)
