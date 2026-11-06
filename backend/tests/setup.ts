import { execSync } from 'child_process';
import fs from 'fs';
export default function () {
  for (const f of ['prisma/test.db', 'prisma/test.db-journal']) fs.rmSync(f, { force: true }); // fresh throwaway DB
  execSync('npx prisma db push --skip-generate', { env: { ...process.env, DATABASE_URL: 'file:./test.db' }, stdio: 'inherit' });
}
