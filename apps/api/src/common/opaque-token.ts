import { createHash, randomBytes } from 'node:crypto';

export function hashOpaqueToken(raw: string): string {
  return createHash('sha256').update(raw, 'utf8').digest('hex');
}

export function newOpaqueToken(): string {
  return randomBytes(32).toString('base64url');
}
