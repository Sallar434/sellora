import bcrypt from 'bcryptjs';
import { db } from '../src/lib/db';
import { createStore } from '../src/routes/auth';
async function user(email: string, type: string, name: string) { return db.user.upsert({ where: { email }, update: {}, create: { email, type, name, passwordHash: await bcrypt.hash('password123', 10), emailVerified: true } }); }
async function main() {
  const admin = await user('admin@sellora.app', 'ADMIN', 'Platform Admin');
  const seller = await user('owner@example.com', 'SELLER', 'Store Owner');
  await user('buyer@example.com', 'BUYER', 'Demo Buyer');
  let store = await db.store.findFirst({ where: { ownerId: seller.id } });
  if (!store) {
    store = await createStore(seller.id, 'Active Reality Gear', 'USD');
    await db.store.update({ where: { id: store.id }, data: { address: { address1: 'Main Boulevard', city: 'Lahore', country: 'PK' } } });
    const P = [['Racing Suit Pro', 34900, ['suit', 'racing']], ['Track Gloves', 5900, ['gloves']], ['Carbon Helmet', 49900, ['helmet']], ['Paddock Tee', 2900, ['apparel']]] as const;
    const ids: string[] = [];
    for (const [title, price, tags] of P) { const p = await db.product.create({ data: { storeId: store.id, title, handle: title.toLowerCase().replace(/\s+/g, '-'), price, tags: [...tags], description: `<p>${title} by Active Reality Gear.</p>`, options: [{ name: 'Size', values: ['S', 'M', 'L'] }], variants: { create: ['S', 'M', 'L'].map((s, i) => ({ title: s, sku: `${title.slice(0, 3).toUpperCase()}-${s}`, inventory: 20 + i, options: { Size: s } })) } } }); ids.push(p.id); }
    await db.collection.createMany({ data: [{ storeId: store.id, title: 'Track Day Gear', handle: 'track-day-gear', type: 'manual', productIds: ids.slice(0, 3) }, { storeId: store.id, title: 'Gloves', handle: 'gloves', type: 'automated', rules: [{ field: 'tag', op: 'eq', value: 'gloves' }] }] });
    await db.market.createMany({ data: [{ storeId: store.id, name: 'United States', currency: 'USD', countries: ['US'], primary: true }, { storeId: store.id, name: 'Pakistan', currency: 'PKR', countries: ['PK'] }] });
    await db.shippingZone.createMany({ data: [{ storeId: store.id, name: 'Domestic', countries: ['US'], rates: [{ name: 'Standard', price: 800, freeOver: 10000, days: '3-5' }, { name: 'Express', price: 2500, days: '1-2' }] }, { storeId: store.id, name: 'Pakistan', countries: ['PK'], rates: [{ name: 'Standard', price: 1500, days: '5-8' }] }] });
    await db.taxRate.createMany({ data: [{ storeId: store.id, country: 'US', region: 'CA', rateBps: 725 }, { storeId: store.id, country: 'PK', rateBps: 1700 }] });
    await db.discount.create({ data: { storeId: store.id, code: 'WELCOME10', kind: 'percent', value: 10 } });
  }
  // subscription plans + demo store on Grow (active, PKR, auto-pay overage with Rs 5,000 cap)
  const { ensurePlans, getSub } = await import('../src/lib/billing');
  await ensurePlans(); await getSub(store.id);
  await db.subscription.update({ where: { storeId: store.id }, data: { planCode: 'grow', status: 'active', trialEndsAt: null, currency: 'PKR', overageMode: 'auto', spendCap: 500000, periodEnd: new Date(Date.now() + 30 * 864e5) } });
  await db.store.update({ where: { id: store.id }, data: { plan: 'grow', feeBps: 375 } });
  console.log('Seeded. Logins (password123): admin@sellora.app, owner@example.com, buyer@example.com. Store:', store.handle, admin.id ? '' : '');
}
main().finally(() => db.$disconnect());
