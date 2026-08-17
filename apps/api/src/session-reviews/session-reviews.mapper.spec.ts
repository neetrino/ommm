import { describe, expect, it } from '@jest/globals';
import { Role, SessionReviewStatus } from '@prisma/client';
import {
  canRoleSeeAnonymousReviews,
  formatPersonName,
  toCoachInboxDto,
  toMemberSubmittedDto,
  toStaffInboxDto,
} from './session-reviews.mapper';
import type { SessionReviewWithSession } from './session-reviews.mapper';

function sampleRow(isAnonymous: boolean): SessionReviewWithSession {
  const now = new Date('2026-08-16T16:00:00.000Z');
  return {
    id: 'rev-1',
    bookingId: 'bk-1',
    authorUserId: 'user-1',
    sessionId: 'ses-1',
    coachProfileId: 'coach-1',
    isAnonymous,
    rating: 5,
    comment: 'Great class',
    status: SessionReviewStatus.SUBMITTED,
    promptedAt: now,
    submittedAt: now,
    staffReadAt: null,
    createdAt: now,
    updatedAt: now,
    session: {
      startsAt: now,
      endsAt: now,
      title: '',
      classType: { name: 'Yoga' },
      coach: { user: { name: 'Anna', lastName: 'K' } },
    },
    author: {
      id: 'user-1',
      name: 'Hidden',
      lastName: 'Member',
      email: 'm@example.com',
    },
  };
}

describe('session-reviews.mapper', () => {
  it('formats names without extra spaces', () => {
    expect(formatPersonName('Ada', 'Lovelace')).toBe('Ada Lovelace');
    expect(formatPersonName('Ada', null)).toBe('Ada');
  });

  it('staff dto redacts author when anonymous', () => {
    const dto = toStaffInboxDto(sampleRow(true));
    expect(dto.isAnonymous).toBe(true);
    expect(dto.author).toBeNull();
  });

  it('staff dto includes author when named', () => {
    const dto = toStaffInboxDto(sampleRow(false));
    expect(dto.isAnonymous).toBe(false);
    expect(dto.author).toEqual({
      id: 'user-1',
      displayName: 'Hidden Member',
    });
  });

  it('coach dto never includes author id', () => {
    const dto = toCoachInboxDto(sampleRow(false));
    expect(dto.author).toEqual({ displayName: 'Hidden Member' });
    expect('id' in dto.author).toBe(false);
  });

  it('only admin and manager see anonymous reviews', () => {
    expect(canRoleSeeAnonymousReviews(Role.ADMIN)).toBe(true);
    expect(canRoleSeeAnonymousReviews(Role.MANAGER)).toBe(true);
    expect(canRoleSeeAnonymousReviews(Role.COACH)).toBe(false);
    expect(canRoleSeeAnonymousReviews(Role.USER)).toBe(false);
  });

  it('member submitted dto includes rating and anonymity', () => {
    const dto = toMemberSubmittedDto(sampleRow(true));
    expect(dto.rating).toBe(5);
    expect(dto.isAnonymous).toBe(true);
    expect(dto.comment).toBe('Great class');
    expect(dto.classTypeName).toBe('Yoga');
  });
});
