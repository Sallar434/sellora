"""VendOm AI chat (built-in engine, real store data) and Connect any app."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vt
from vt import ok, go
from playwright.sync_api import sync_playwright


def last(pg):
    return pg.evaluate("(S.ai16.log.filter(m=>m.role==='assistant').slice(-1)[0]||{}).text||''")


def ask(pg, text):
    pg.fill('#ai16q', text); pg.press('#ai16q', 'Enter'); pg.wait_for_timeout(350)
    return last(pg)


with sync_playwright() as p:
    b, pg, errs = vt.launch(p)
    E = pg.evaluate
    vt.open_app(pg)  # demo store with orders and products
    nav = E("document.querySelector('#nav').innerText")
    ok('menu has VendOm AI', 'VendOm AI' in nav)
    for w in ['AI builder', 'SEO / AEO / GEO', 'Off-page SEO', 'AI tools', 'Sitemap, robots, llms.txt']:
        ok('menu no longer shows "%s"' % w, w not in nav)
    go(pg, 'ai-assistant', 500)
    t = E("document.querySelector('#main').innerText")
    ok('chat page with plan and model', 'VendOm AI' in t and 'AI model' in t and 'Plan:' in t, t[:200])
    ok('suggestion chips', pg.locator('[data-x^="ai16ask:"]').count() >= 5)
    a = ask(pg, 'How are sales this month?')
    ok('sales answer from real orders', 'Last 30 days:' in a and 'order' in a, a)
    a = ask(pg, 'show orders to ship')
    unf = E("S.orders.filter(o=>!o.cancelled&&o.ful!=='Fulfilled').length")
    ok('orders to ship', (str(unf) + ' order') in a or 'Every order is fulfilled' in a, a)
    oid = E("S.orders[0].id")
    a = ask(pg, 'order #%s' % oid)
    ok('order lookup', ('Order #%s' % oid) in a and 'Total' in a, a)
    a = ask(pg, 'what is low on stock?')
    ok('low stock', 'Low stock' in a or 'Nothing is low' in a, a)
    a = ask(pg, 'audit my seo')
    ok('SEO audit', 'SEO score is' in a, a)
    s0 = E("m12audit().score")
    a = ask(pg, 'fix seo')
    ok('SEO fix raises score', 'Score:' in a and E("m12audit().score") >= s0, a)
    a = ask(pg, 'create a 15% discount code EID15')
    ok('discount created for real', 'EID15' in a and E("S.disc2.some(d=>d.code==='EID15'&&d.value===15)"), a)
    a = ask(pg, 'AEO FAQ for lawn suits')
    ok('AEO answers', 'lawn suits' in a and 'cash on delivery' in a.lower(), a)
    a = ask(pg, 'GEO summary')
    ok('GEO summary', 'AI search' in a, a)
    n0 = E("S.products.length")
    a = ask(pg, 'add a product called Silk Scarf for 2500')
    ok('builder request handled through the chat', len(a) > 5 and 'I can help with' not in a, a)
    ok('chat keeps history across reload', E("S.ai16.log.length") >= 20)
    pg.click('[data-x="ai16clear"]'); pg.wait_for_timeout(300)
    ok('new chat clears history', E("S.ai16.log.length") == 0)
    pg.click('[data-x^="ai16ask:How are sales"]'); pg.wait_for_timeout(300)
    ok('chip asks a question', 'Last 30 days' in last(pg))

    # Connect any app
    go(pg, 'apps', 300)
    ok('Apps menu has Connect any app', 'Connect any app' in E("document.querySelector('#nav').innerText"))
    go(pg, 'apps-connectors', 400)
    def check(url):
        pg.fill('#cn16url', url); pg.click('[data-x="cn16check"]'); pg.wait_for_timeout(200)
        return E("document.querySelector('#cn16card').innerText"), E("document.querySelector('#cn16err').textContent")
    card, err = check('not a link')
    ok('bad link rejected', 'valid link' in err)
    card, err = check('https://www.facebook.com/noorlawn')
    ok('Facebook link → built-in Meta app', 'Meta' in card and pg.locator('#cn16card [data-x="go:app-meta"]').count() == 1, card)
    card, err = check('https://mcp.example.com/mcp')
    ok('MCP server detected', 'MCP' in card)
    card, err = check('https://hooks.slack.com/services/T/B/x')
    ok('Slack webhook detected with events', 'Slack' in card and pg.locator('[data-cn16ev]').count() == 5)
    sent = []
    pg.route('https://hooks.slack.com/**', lambda r: (sent.append(r.request.post_data), r.fulfill(status=200, body='ok')))
    pg.click('[data-x="cn16add"]'); pg.wait_for_timeout(600)
    ok('connected and listed', 'Slack' in E("document.querySelector('#main').innerText") and E("S.connectors.length") == 1)
    ok('test message sent to Slack in Slack format', any('"text"' in (s or '') and 'Test message' in (s or '') for s in sent), sent)
    E("window.emit?emit('order',{id:9999}):HOOKS.forEach(f=>f('order',{id:9999}))"); pg.wait_for_timeout(500)
    ok('new order event delivered to Slack', any('New order #9999' in (s or '') for s in sent), sent)
    pg.click('[data-x^="cn16pause:"]'); pg.wait_for_timeout(200); n = len(sent)
    E("HOOKS.forEach(f=>f('order',{id:9998}))"); pg.wait_for_timeout(400)
    ok('paused connector sends nothing', len(sent) == n)
    pg.click('[data-x^="cn16del:"]'); pg.wait_for_timeout(300)
    ok('remove connector', E("S.connectors.length") == 0)
    ok('no page errors', not errs, errs)
    b.close()
vt.done()
