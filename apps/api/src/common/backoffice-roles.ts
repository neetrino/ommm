import { Role } from '@prisma/client';

/** Roles that may read backoffice workspace data (non-finance / non-analytics). */
export const BACKOFFICE_READ_ROLES = [Role.ADMIN, Role.MANAGER] as const;

/** Roles that may create/update and perform reversible (non-destructive) actions. */
export const BACKOFFICE_WRITE_ROLES = [Role.ADMIN, Role.MANAGER] as const;

/** Roles that may permanently hard-delete resources. */
export const BACKOFFICE_DELETE_ROLES = [Role.ADMIN] as const;

export type BackofficeReadRole = (typeof BACKOFFICE_READ_ROLES)[number];
export type BackofficeWriteRole = (typeof BACKOFFICE_WRITE_ROLES)[number];
export type BackofficeDeleteRole = (typeof BACKOFFICE_DELETE_ROLES)[number];
