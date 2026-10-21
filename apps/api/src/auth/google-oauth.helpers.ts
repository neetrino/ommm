import { Prisma } from '@prisma/client';
import { timingSafeEqual } from 'node:crypto';

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function parseGoogleName(payload: {
  given_name?: string | null;
  family_name?: string | null;
  name?: string | null;
}): { name: string | null; lastName: string | null } {
  const first = payload.given_name?.trim() ?? '';
  const last = payload.family_name?.trim() ?? '';
  if (first || last) {
    return { name: first || null, lastName: last || null };
  }
  const fullName = payload.name?.trim() ?? '';
  if (!fullName) {
    return { name: null, lastName: null };
  }
  const parts = fullName.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return { name: parts[0], lastName: null };
  }
  return {
    name: parts[0] ?? null,
    lastName: parts.slice(1).join(' ') || null,
  };
}

export function isStateMatch(state: string, storedState: string): boolean {
  const stateBuffer = Buffer.from(state, 'utf8');
  const storedStateBuffer = Buffer.from(storedState, 'utf8');
  if (stateBuffer.length !== storedStateBuffer.length) {
    return false;
  }
  return timingSafeEqual(stateBuffer, storedStateBuffer);
}

export function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}
