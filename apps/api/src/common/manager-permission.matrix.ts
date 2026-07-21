import { Role } from '@prisma/client';
import {
  BACKOFFICE_DELETE_ROLES,
  BACKOFFICE_READ_ROLES,
  BACKOFFICE_WRITE_ROLES,
} from './backoffice-roles';

/**
 * Expected Manager workspace parity for critical backoffice capabilities.
 * Controllers enforce these via `@Roles`; this matrix documents the policy.
 */
export const MANAGER_PERMISSION_MATRIX = {
  packages: {
    listAdmin: BACKOFFICE_READ_ROLES,
    createUpdate: BACKOFFICE_WRITE_ROLES,
    hardDelete: BACKOFFICE_DELETE_ROLES,
  },
  classes: {
    adminSessions: BACKOFFICE_WRITE_ROLES,
    sessionWrite: BACKOFFICE_WRITE_ROLES,
    hardDelete: BACKOFFICE_DELETE_ROLES,
  },
  clients: {
    create: BACKOFFICE_WRITE_ROLES,
    purchasePackage: BACKOFFICE_WRITE_ROLES,
    hardDelete: BACKOFFICE_DELETE_ROLES,
  },
  coaches: {
    create: BACKOFFICE_WRITE_ROLES,
    update: [Role.ADMIN, Role.MANAGER, Role.COACH] as const,
    photoUpload: BACKOFFICE_WRITE_ROLES,
    salarySummaries: BACKOFFICE_DELETE_ROLES,
    hardDelete: BACKOFFICE_DELETE_ROLES,
  },
  giftCards: {
    write: BACKOFFICE_WRITE_ROLES,
    hardDelete: BACKOFFICE_DELETE_ROLES,
  },
  notifications: {
    broadcastAndOps: BACKOFFICE_WRITE_ROLES,
    softCancelScheduled: BACKOFFICE_WRITE_ROLES,
    analytics: BACKOFFICE_DELETE_ROLES,
  },
  content: {
    write: [Role.ADMIN, Role.MANAGER, Role.CONTENT_ADMIN] as const,
    hardDelete: [Role.ADMIN, Role.CONTENT_ADMIN] as const,
  },
  studio: {
    patch: BACKOFFICE_WRITE_ROLES,
  },
  reports: {
    dashboard: BACKOFFICE_READ_ROLES,
    financeSummary: BACKOFFICE_DELETE_ROLES,
  },
  payments: {
    adminFinance: BACKOFFICE_DELETE_ROLES,
  },
  schedule: {
    write: BACKOFFICE_WRITE_ROLES,
    hardDelete: BACKOFFICE_DELETE_ROLES,
  },
} as const;

export function roleAllows(allowed: readonly Role[], role: Role): boolean {
  return allowed.includes(role);
}
