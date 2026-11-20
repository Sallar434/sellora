// Create (or promote) the VendOm platform admin on a live database.
// Usage: ADMIN_EMAIL=you@yourdomain.com ADMIN_PASSWORD='a long password' npx tsx scripts/create-admin.ts
// Never run `npm run seed` in production: it creates demo logins with the password "password123".
import bcrypt from 'bcryptjs';
import { db } from '../src/lib/db';
async function main() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase(), pw = process.env.ADMIN_PASSWORD || '';
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Set ADMIN_EMAIL to a valid email');
  if (pw.length < 12) throw new Error('Set ADMIN_PASSWORD to at least 12 characters');
  const passwordHash = await bcrypt.hash(pw, 12);
  const u = await db.user.upsert({ where: { email }, update: { type: 'ADMIN', passwordHash }, create: { email, type: 'ADMIN', name: 'Platform Admin', passwordHash, emailVerified: true } });
  console.log('Platform admin ready:', u.email);
}
main().then(() => db.$disconnect()).catch(async (e) => { console.error(e.message || e); await db.$disconnect(); process.exit(1); });
