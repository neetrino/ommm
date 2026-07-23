import { Role } from '@prisma/client';
import {
  BACKOFFICE_DELETE_ROLES,
  BACKOFFICE_READ_ROLES,
  BACKOFFICE_WRITE_ROLES,
} from './backoffice-roles';

describe('backoffice-roles', () => {
  it('includes ADMIN and MANAGER in read roles', () => {
    expect(BACKOFFICE_READ_ROLES).toContain(Role.ADMIN);
    expect(BACKOFFICE_READ_ROLES).toContain(Role.MANAGER);
  });

  it('includes MANAGER in write roles', () => {
    expect(BACKOFFICE_WRITE_ROLES).toContain(Role.MANAGER);
    expect(BACKOFFICE_WRITE_ROLES).toContain(Role.ADMIN);
  });

  it('excludes MANAGER from delete roles', () => {
    expect(BACKOFFICE_DELETE_ROLES).toContain(Role.ADMIN);
    expect(BACKOFFICE_DELETE_ROLES).not.toContain(Role.MANAGER);
  });

  it('includes ADMIN in both write and delete roles', () => {
    expect(BACKOFFICE_WRITE_ROLES).toContain(Role.ADMIN);
    expect(BACKOFFICE_DELETE_ROLES).toContain(Role.ADMIN);
  });
});
