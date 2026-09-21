import { ClassSessionStatus } from '@prisma/client';
import {
  CREATED_CLASS_SESSION_STATUS,
  resolveCreatedSessionStatus,
} from './classes-session-create-status';

describe('resolveCreatedSessionStatus', () => {
  it('defaults new classes to ACTIVE', () => {
    expect(resolveCreatedSessionStatus(undefined)).toBe(
      CREATED_CLASS_SESSION_STATUS,
    );
  });

  it('keeps ACTIVE and DRAFT', () => {
    expect(resolveCreatedSessionStatus(ClassSessionStatus.ACTIVE)).toBe(
      ClassSessionStatus.ACTIVE,
    );
    expect(resolveCreatedSessionStatus(ClassSessionStatus.DRAFT)).toBe(
      ClassSessionStatus.DRAFT,
    );
  });

  it('does not copy lifecycle statuses from a source class', () => {
    expect(resolveCreatedSessionStatus(ClassSessionStatus.FINISHED)).toBe(
      ClassSessionStatus.ACTIVE,
    );
    expect(resolveCreatedSessionStatus(ClassSessionStatus.FULL)).toBe(
      ClassSessionStatus.ACTIVE,
    );
    expect(resolveCreatedSessionStatus(ClassSessionStatus.CANCELLED)).toBe(
      ClassSessionStatus.ACTIVE,
    );
  });
});
