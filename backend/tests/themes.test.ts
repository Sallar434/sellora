import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { db } from '../src/lib/db';
import { THEME_LIBRARY } from '../src/lib/themes';
const app = createApp(); const A = () => request(app);
const H = (t: string) => ({ Authorization: 'Bearer ' + t });
let s: any; const S = (p: string) => `/api/stores/${s.store.id}${p}`;
beforeAll(async () => { s = (await A().post('/api/auth/signup').send({ email: 'themes@t.io', password: 'password123', storeName: 'Theme Shop' }).expect(201)).body; });
describe('theme library', () => {
  it('only Sellora themes, each distinct, no retired or trademarked names', () => {
    const banned = ['Dawn', 'Refresh', 'Sense', 'Craft', 'Crave', 'Studio', 'Taste', 'Colorblock', 'Ride', 'Origin', 'Publisher', 'Spotlight', 'Trade', 'Shopify'];
    expect(THEME_LIBRARY.length).toBe(13);
    for (const t of THEME_LIBRARY) { expect(banned).not.toContain(t.name); expect(t.bestFor.startsWith('Best for')).toBe(true); expect(t.tag).toBeTruthy(); }
    expect(new Set(THEME_LIBRARY.map(t => t.home.join(','))).size).toBe(13);
    expect(new Set(THEME_LIBRARY.map(t => t.tag)).size).toBe(13);
  });
  it('new stores get Daybreak; stores on a retired theme are migrated to it', async () => {
    const th = (await A().get(S('/themes')).set(H(s.accessToken)).expect(200)).body; const list = th.items || th;
    expect(list[0].name).toBe('Daybreak');
    await db.theme.updateMany({ where: { storeId: s.store.id }, data: { name: 'Dawn', live: true } });
    await db.theme.create({ data: { storeId: s.store.id, name: 'Ember', live: false } as any });
    const r = (await A().get(S('/themes/library')).set(H(s.accessToken)).expect(200)).body;
    expect(r.default).toBe('s-daybreak'); expect(r.migrated).toBe(2); expect(r.themes.length).toBe(13);
    const after = await db.theme.findMany({ where: { storeId: s.store.id } });
    expect(after.map(t => t.name)).toEqual(['Daybreak']); expect(after[0].live).toBe(true);
  });
});
