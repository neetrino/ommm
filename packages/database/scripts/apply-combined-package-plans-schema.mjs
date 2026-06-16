import { config } from 'dotenv';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
config({ path: join(root, '../../.env') });

execSync(
  'npx prisma db execute --schema prisma/schema.prisma --file prisma/scripts/apply-combined-package-plans-schema.sql',
  { stdio: 'inherit', cwd: root, env: process.env },
);
