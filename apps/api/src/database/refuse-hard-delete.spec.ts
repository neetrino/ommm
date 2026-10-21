import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const migrationPath = join(
  __dirname,
  '../../../../packages/database/prisma/migrations/20261021120000_refuse_hard_delete/migration.sql',
);
const migrationSql = readFileSync(migrationPath, 'utf8');

describe('refuse hard delete migration', () => {
  it('rejects DELETE on client history tables and has no session bypass', () => {
    expect(migrationSql).toContain(
      'CREATE OR REPLACE FUNCTION ommm_refuse_delete()',
    );
    expect(migrationSql).not.toContain('ommm.allow_hard_delete');
    for (const table of ['User', 'Booking', 'Payment', 'UserPackage']) {
      expect(migrationSql).toContain(`'${table}'`);
    }
    expect(migrationSql).toContain("confdeltype = 'c'");
    expect(migrationSql).toContain('ON DELETE RESTRICT');
  });

  it('keeps the audit log append-only and withholds DELETE from the app role', () => {
    expect(migrationSql).toContain('BEFORE DELETE OR UPDATE ON "AuditLog"');
    expect(migrationSql).toContain('CREATE ROLE ommm_app NOLOGIN');
    expect(migrationSql).toContain(
      'REVOKE DELETE ON ALL TABLES IN SCHEMA public FROM ommm_app',
    );
    expect(migrationSql).not.toMatch(/PASSWORD\s+'/i);
  });
});
