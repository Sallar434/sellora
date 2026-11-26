"""New admin shell (v53): dark full-height sidebar, search in the sidebar, Settings + store menu + alerts + trial box at the bottom, light page panel, VendOm AI bar."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vt
from vt import ok, go
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b, pg, errs = vt.launch(p, viewport={'width': 1280, 'height': 800}); E = pg.evaluate
    vt.signup(pg, email='shell2@x.pk', store='Noor Lawn')
    go(pg, 'markets', 800)
    ok('sidebar is full height and dark', E("getComputedStyle(document.querySelector('aside')).top") == '0px' and E("getComputedStyle(document.querySelector('aside')).backgroundColor") == 'rgb(13, 31, 26)')
    ok('no top bar strip', E("document.querySelector('#vtop').getBoundingClientRect().height") == 0)
    ok('search sits in the sidebar', E("document.querySelector('#vtop-search').getBoundingClientRect().right") <= 240)
    ok('sidebar text is readable', E("getComputedStyle(document.querySelector('aside .nav-head:not(.on) .nav-link')).color") == 'rgb(232, 239, 236)')
    ok('page sits in a rounded panel', E("getComputedStyle(document.querySelector('main')).borderTopLeftRadius") == '16px')
    ok('trial box shows days left', 'Trial ends in' in pg.inner_text('#sh30trial'))
    for sel in ['#sh30set', '#sh30trial', '.vtop-store', '#vtop-bell']:
        r = E("(function(){var e=document.querySelector(%r).getBoundingClientRect(),x=e.left+e.width/2,y=e.top+e.height/2,t=document.elementFromPoint(x,y);return !!t&&!!t.closest(%r)})()" % (sel, sel))
        ok(sel + ' is clickable (not covered)', r)
    E("document.querySelector('aside').scrollTop=300"); pg.wait_for_timeout(200)
    ok('menu scrolls under a solid top strip (logo and search stay clear)', E("(function(){var e=document.elementFromPoint(150,30);return !e.closest('aside')})()") and E("!!document.elementFromPoint(120,64).closest('#vtop-search')"))
    ok('bottom group stays clear of the menu', all(E("(function(){var e=document.querySelector(%r).getBoundingClientRect(),t=document.elementFromPoint(e.left+e.width/2,e.top+e.height/2);return !t.closest('aside')})()" % s) for s in ['#sh30set', '.vtop-store', '#sh30trial']))
    E("document.querySelector('aside').scrollTop=0")
    pg.click('#sh30set'); pg.wait_for_timeout(600)
    ok('Settings opens settings', E("location.hash") == '#s-general')
    go(pg, 'home', 600); pg.click('#sh30trial .sh30sub'); pg.wait_for_timeout(600)
    ok('Pick a plan opens the plan page', E("location.hash") == '#s-plan')
    go(pg, 'home', 600); pg.fill('#ai36q', 'go to orders'); pg.press('#ai36q', 'Enter'); pg.wait_for_timeout(700)
    ok('VendOm AI bar runs the request', E("location.hash") == '#orders')
    go(pg, 'home', 500); pg.click('#vtop-store'); pg.wait_for_timeout(300)
    ok('store menu opens upward inside the window', E("document.querySelector('#vtop-dd').getBoundingClientRect().top") > 0 and not E("document.querySelector('#vtop-dd').hidden"))
    pg.set_viewport_size({'width': 390, 'height': 844}); go(pg, 'home', 700)
    ok('phone keeps the old layout and fits', E("document.documentElement.scrollWidth<=392"))
    b.close()
vt.done(errs)
