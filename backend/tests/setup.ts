import { execSync } from 'child_process';
import fs from 'fs';
// Default: a throwaway SQLite file. Set TEST_DATABASE_URL to an EMPTY Postgres database to run the same suite on Postgres.
export default function () {
  const url = process.env.TEST_DATABASE_URL;
  if (url) { execSync('npx prisma db push --skip-generate', { env: { ...process.env, DATABASE_URL: url }, stdio: 'inherit' }); return; }
  for (const f of ['prisma/test.db', 'prisma/test.db-journal']) fs.rmSync(f, { force: true }); // fresh throwaway DB
  execSync('npx prisma db push --skip-generate', { env: { ...process.env, DATABASE_URL: 'file:./test.db' }, stdio: 'inherit' });
}
