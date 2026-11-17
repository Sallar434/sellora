import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import {
  parseLocale, resolveText, speechFor, escapeHtml, directionFor, formatMoney, convertMoney, nextStep,
  bulkDryRun, bulkApply, bulkUndo, quotaDecision, meterTokens, providerTranslation, draftTranslation, approveTranslation, revertTranslation,
  dryRunCsv, neutralizeFormula, classifyUrl, healthCheck, salesInsights, readiness,
} from '../src/lib/platform';
import { planCommand } from '../src/lib/actions';

const app = createApp();
const A = () => request(app);
const H = (t: string) => ({ Authorization: 'Bearer ' + t });

describe('locales', () => {
  it('accepts BCP 47 language, script, and region and rejects an all-languages label', () => {
    expect(parseLocale('ur-PK').ok && (parseLocale('ur-PK') as any).canonical).toBe('ur-PK');
    expect(parseLocale('zh-hans-cn').ok && (parseLocale('zh-hans-cn') as any).canonical).toBe('zh-Hans-CN');
    expect(parseLocale('all languages').ok).toBe(false);
    expect(parseLocale('english!!').ok).toBe(false);
  });
  it('labels verified dictionaries, English fallback, and missing keys separately', () => {
    const ur = resolveText('ur', 'next.addProduct');
    expect(ur.status).toBe('translated');
    expect(ur.text).toContain('پروڈکٹ');
    const hi = resolveText('hi', 'next.addProduct');
    expect(hi.status).toBe('fallback');
    expect(hi.coverage).toBe('framework');
    expect(hi.text).toContain('first product');
    expect(resolveText('en', 'no.such.key').status).toBe('missing');
  });
  it('sets RTL for Urdu and Arabic and escapes stored text', () => {
    expect(directionFor('ur')).toBe('rtl');
    expect(directionFor('ar')).toBe('rtl');
    expect(directionFor('fa')).toBe('rtl');
    expect(escapeHtml('<b onclick="alert(1)">')).toBe('&lt;b onclick=&quot;alert(1)&quot;&gt;');
  });
  it('does not offer voice for a framework-only locale', () => {
    expect(speechFor('en').supported).toBe(true);
    const hi = speechFor('hi');
    expect(hi.supported).toBe(false);
    expect(hi.message.toLowerCase()).toContain('type');
  });
  it('formats money with a name and code and refuses an unsourced conversion', () => {
    expect(formatMoney(12.5, 'PKR', 'ur').text).toContain('Pakistani Rupee (PKR)');
    expect(formatMoney(12.5, 'PKR', 'ur').converted).toBe(false);
    expect(convertMoney(10, 'USD', 'EUR', null).ok).toBe(false);
    const ok = convertMoney(10, 'USD', 'EUR', { from: 'USD', to: 'EUR', value: 0.9, source: 'ECB', asOf: '2026-11-01' });
    expect(ok.ok && ok.converted && ok.amount).toBe(9);
  });
});

describe('setup, bulk, import, health, insights', () => {
  it('names one next step and keeps publish and payment blocked on a trial', () => {
    expect(nextStep({ products: [] }).id).toBe('addProduct');
    expect(nextStep({ products: [{ price: null, desc: '', imgs: [] }], sub9: { status: 'trialing' } }).id).toBe('finishListing');
    const launch = nextStep({ products: [{ price: 5, desc: 'Cotton', imgs: ['/a.png'] }], sub9: { status: 'trialing' }, paymentLive: false });
    expect(launch.id).toBe('launch');
    expect(launch.blocked).toContain('publish');
  });
  it('previews, applies, and undoes a bulk description without touching price or SKU', () => {
    const rows = [{ id: 'p1', name: 'Classic tee', description: 'Soft cotton', price: 25, sku: 'TEE' }];
    const blocked = bulkDryRun(rows, ['p1'], { price: 1 });
    expect(blocked.ok).toBe(false);
    const claim = bulkDryRun(rows, ['p1'], { description: 'The #1 clinically proven tee' });
    expect(claim.ok && claim.rejected.length).toBe(1);
    const dry = bulkDryRun(rows, ['p1'], { alt: 'use-name', description: 'Soft cotton tee' });
    expect(dry.ok && dry.diffs.map(d => d.field).sort()).toEqual(['alt', 'description']);
    const applied = bulkApply(rows, dry);
    expect(applied.ok && rows[0].description).toBe('Soft cotton tee');
    expect(rows[0].price).toBe(25);
    expect(rows[0].sku).toBe('TEE');
    if (applied.ok) bulkUndo(rows, applied.undo);
    expect(rows[0].description).toBe('Soft cotton');
    expect(quotaDecision(10, 10, 1, false).allowed).toBe(false);
    expect(meterTokens({ input: 100, output: 50, cached: 40 }, { usedInput: 0, usedOutput: 0 }).cacheMiss).toBe(60);
    expect(meterTokens({ input: 1, output: 2_000_001 }, { usedInput: 0, usedOutput: 0 }).allowed).toBe(false);
  });
  it('does not call a missing translation provider a success', () => {
    expect(providerTranslation(false, null).translated).toBe(false);
    const blocked = draftTranslation({ id: '1', entity: 'product', entityId: 'p', locale: 'ar', original: 'Sellora tee', fields: {}, brandNames: ['Sellora'], provider: 'deepseek', providerText: null });
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.blocked).toBe('missing-provider');
    const changed = draftTranslation({ id: '2', entity: 'product', entityId: 'p', locale: 'ar', original: 'Sellora tee', fields: { body: 'قميص' }, brandNames: ['Sellora'], provider: 'manual', providerText: null });
    expect(changed.ok).toBe(false);
    const kept = draftTranslation({ id: '3', entity: 'product', entityId: 'p', locale: 'ar', original: 'Sellora tee', fields: { body: 'قميص Sellora' }, brandNames: ['Sellora'], provider: 'manual', providerText: null });
    expect(kept.ok).toBe(true);
    if (kept.ok) {
      const list = [kept.record];
      expect(approveTranslation(list, '3').ok).toBe(true);
      expect(list[0].status).toBe('approved');
      expect(revertTranslation(list, '3').ok).toBe(true);
      expect(list).toHaveLength(0);
    }
  });
  it('neutralizes formula cells, skips duplicates, and does not overwrite without approval', () => {
    expect(neutralizeFormula('=cmd|calc').neutralized).toBe(true);
    expect(neutralizeFormula('=cmd|calc').value.startsWith("'")).toBe(true);
    const csv = 'Handle,Title,Body (HTML)\ntee,Classic tee,<p>Soft</p>\ntee,Other,=1+1\nnew,=HYPERLINK("http://evil"),ok\n';
    const dry = dryRunCsv(csv, ['tee']);
    expect(dry.ok).toBe(true);
    if (dry.ok) {
      expect(dry.rows.find(r => r.handle === 'tee' && r.action === 'skip')).toBeTruthy();
      expect(dry.rows.some(r => r.action === 'update')).toBe(false);
      expect(dry.rows.some(r => r.action === 'error')).toBe(true);
      const created = dry.rows.find(r => r.action === 'create');
      expect(created.title.startsWith("'=")).toBe(true);
      expect(dry.deleted).toBe(0);
    }
    const approved = dryRunCsv(csv, ['tee'], { approveOverwrite: true });
    expect(approved.ok && approved.rows.some(r => r.action === 'update')).toBe(true);
  });
  it('reports structural findings and does not treat an unmeasured phone as a mobile error', () => {
    expect(classifyUrl('http://169.254.169.254/latest').class).toBe('blocked');
    expect(classifyUrl('http://127.0.0.1/admin').class).toBe('blocked');
    expect(classifyUrl('https://example.com/a.jpg').class).toBe('external-unverified');
    const report = healthCheck({ products: [{ id: 1, name: 'Mug', price: 5, desc: '', imgs: [] }], menus: [{ items: [{ url: '/products/missing' }] }] }, null);
    expect(report.findings.some(f => f.code === 'missing-image' && f.verified === 'structural')).toBe(true);
    expect(report.findings.some(f => f.code === 'broken-link')).toBe(true);
    expect(report.findings.some(f => f.code === 'mobile-unverified' && f.verified === 'possible')).toBe(true);
    expect(report.findings.some(f => f.verified === 'browser')).toBe(false);
  });
  it('keeps currencies apart and refuses a trend from demo or too few orders', () => {
    const report = salesInsights([
      { id: 1, demo: true, currency: 'USD', total: 999, at: 1, financial: 'paid' },
      { id: 2, currency: 'USD', total: 10, at: 1, financial: 'paid', fulfillment: 'unfulfilled' },
      { id: 3, currency: 'PKR', total: 20, at: 1, financial: 'pending', fulfillment: 'fulfilled' },
    ], { timeZone: 'Asia/Karachi', sourceNote: 'browser' });
    expect(report.count).toBe(2);
    expect(report.currencies.USD.total).toBe(10);
    expect(report.currencies.PKR.total).toBe(20);
    expect(report.summedAcrossCurrencies).toBe(false);
    expect(report.suggestions.some(s => s.code === 'few')).toBe(true);
    expect(report.suggestions.some(s => /growing|forecast/i.test(s.text))).toBe(false);
    expect(report.synchronizedWithServer).toBe(false);
  });
  it('plans the new commands without claiming a provider call', () => {
    expect(planCommand('translate the about page').kind).toBe('translate');
    expect(planCommand('bulk edit descriptions').needsConfirm).toBe(true);
    expect(planCommand('how are sales').kind).toBe('insights');
    expect(readiness({}).every(r => r.state !== 'connected')).toBe(true);
  });
});

describe('platform routes', () => {
  let a: any; let b: any;
  beforeAll(async () => {
    a = (await A().post('/api/auth/signup').send({ email: 'platform-a@t.io', password: 'password123', storeName: 'Platform A' }).expect(201)).body;
    b = (await A().post('/api/auth/signup').send({ email: 'platform-b@t.io', password: 'password123', storeName: 'Platform B' }).expect(201)).body;
  });
  const path = (s: any, p: string) => `/api/stores/${s.store.id}${p}`;
  it('blocks provider translation when no key is configured', async () => {
    const res = await A().post(path(a, '/i18n/translate')).set(H(a.accessToken)).send({ entity: 'product', entityId: 'p1', locale: 'ar', original: 'Sellora mug', fields: {}, brandNames: ['Sellora'] }).expect(200);
    expect(res.body.translated).toBe(false);
    expect(res.body.blocked).toBe('missing-provider');
    expect(res.body.record).toBeNull();
  });
  it('refuses another store and keeps a manual translation on the owner store', async () => {
    await A().post(path(a, '/i18n/translate')).set(H(b.accessToken)).send({ entity: 'product', entityId: 'p1', locale: 'ar', original: 'Sellora mug', manual: true, fields: { body: 'Sellora كوب' }, brandNames: ['Sellora'] }).expect(403);
    const saved = await A().post(path(a, '/i18n/translate')).set(H(a.accessToken)).send({ entity: 'product', entityId: 'p1', locale: 'ar', original: 'Sellora mug', manual: true, fields: { body: 'Sellora كوب' }, brandNames: ['Sellora'] }).expect(200);
    expect(saved.body.record.status).toBe('draft');
    expect(saved.body.translated).toBe(false);
    const id = saved.body.record.id;
    await A().post(path(a, '/i18n/translations/' + id + '/approve')).set(H(a.accessToken)).expect(200);
    const gone = await A().post(path(a, '/i18n/translations/' + id + '/revert')).set(H(a.accessToken)).expect(200);
    expect(gone.body.reverted.id).toBe(id);
  });
  it('dry-runs a formula CSV without writing and reports insights from this store only', async () => {
    const csv = 'Handle,Title\nsafe,Safe mug\nsafe,Second\n=bad,=1+1\n';
    const dry = await A().post(path(a, '/import/dry-run')).set(H(a.accessToken)).send({ csv, approveOverwrite: false }).expect(200);
    expect(dry.body.applied).toBe(false);
    expect(dry.body.deleted).toBe(0);
    expect(dry.body.neutralized).toBeGreaterThan(0);
    const insights = await A().get(path(a, '/reports/insights?tz=Asia/Karachi')).set(H(a.accessToken)).expect(200);
    expect(insights.body.storeId).toBe(a.store.id);
    expect(insights.body.synchronizedWithServer).toBe(false);
    expect(insights.body.count).toBe(0);
    const health = await A().get(path(a, '/health')).set(H(a.accessToken)).expect(200);
    expect(health.body.mobile).toContain('not measured');
  });
});
