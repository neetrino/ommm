import { Role } from '@prisma/client';
import {
  MANAGER_PERMISSION_MATRIX,
  roleAllows,
} from './manager-permission.matrix';

describe('manager-permission.matrix', () => {
  it('allows Manager write but not hard-delete on packages', () => {
    expect(
      roleAllows(MANAGER_PERMISSION_MATRIX.packages.createUpdate, Role.MANAGER),
    ).toBe(true);
    expect(
      roleAllows(MANAGER_PERMISSION_MATRIX.packages.hardDelete, Role.MANAGER),
    ).toBe(false);
    expect(
      roleAllows(MANAGER_PERMISSION_MATRIX.packages.hardDelete, Role.ADMIN),
    ).toBe(true);
  });

  it('allows Manager class session ops but not hard-delete', () => {
    expect(
      roleAllows(MANAGER_PERMISSION_MATRIX.classes.sessionWrite, Role.MANAGER),
    ).toBe(true);
    expect(
      roleAllows(MANAGER_PERMISSION_MATRIX.classes.hardDelete, Role.MANAGER),
    ).toBe(false);
  });

  it('keeps Finance and Analytics Admin-only', () => {
    expect(
      roleAllows(
        MANAGER_PERMISSION_MATRIX.reports.financeSummary,
        Role.MANAGER,
      ),
    ).toBe(false);
    expect(
      roleAllows(MANAGER_PERMISSION_MATRIX.payments.adminFinance, Role.MANAGER),
    ).toBe(false);
    expect(
      roleAllows(
        MANAGER_PERMISSION_MATRIX.notifications.analytics,
        Role.MANAGER,
      ),
    ).toBe(false);
    expect(
      roleAllows(
        MANAGER_PERMISSION_MATRIX.coaches.salarySummaries,
        Role.MANAGER,
      ),
    ).toBe(false);
    expect(
      roleAllows(MANAGER_PERMISSION_MATRIX.coaches.salaryPayout, Role.MANAGER),
    ).toBe(false);
  });

  it('preserves CONTENT_ADMIN on content write and delete', () => {
    expect(
      roleAllows(MANAGER_PERMISSION_MATRIX.content.write, Role.CONTENT_ADMIN),
    ).toBe(true);
    expect(
      roleAllows(MANAGER_PERMISSION_MATRIX.content.write, Role.MANAGER),
    ).toBe(true);
    expect(
      roleAllows(MANAGER_PERMISSION_MATRIX.content.hardDelete, Role.MANAGER),
    ).toBe(false);
    expect(
      roleAllows(
        MANAGER_PERMISSION_MATRIX.content.hardDelete,
        Role.CONTENT_ADMIN,
      ),
    ).toBe(true);
  });

  it('preserves COACH on coaches update', () => {
    expect(
      roleAllows(MANAGER_PERMISSION_MATRIX.coaches.update, Role.COACH),
    ).toBe(true);
    expect(
      roleAllows(MANAGER_PERMISSION_MATRIX.coaches.update, Role.MANAGER),
    ).toBe(true);
  });

  it('treats scheduled notification cancel as soft (Manager allowed)', () => {
    expect(
      roleAllows(
        MANAGER_PERMISSION_MATRIX.notifications.softCancelScheduled,
        Role.MANAGER,
      ),
    ).toBe(true);
  });

  it('allows Manager write on call tasks', () => {
    expect(
      roleAllows(MANAGER_PERMISSION_MATRIX.callTasks.write, Role.MANAGER),
    ).toBe(true);
    expect(
      roleAllows(MANAGER_PERMISSION_MATRIX.callTasks.write, Role.ADMIN),
    ).toBe(true);
  });

  it('keeps manager staff directory Admin-only', () => {
    expect(
      roleAllows(MANAGER_PERMISSION_MATRIX.managers.manage, Role.MANAGER),
    ).toBe(false);
    expect(
      roleAllows(MANAGER_PERMISSION_MATRIX.managers.manage, Role.ADMIN),
    ).toBe(true);
  });
});
