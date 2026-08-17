import { Prisma, SessionReviewStatus } from '@prisma/client';
import {
  buildCoachInboxWhere,
  buildStaffInboxWhere,
} from './session-reviews-inbox-where';

describe('session-reviews-inbox-where', () => {
  it('builds staff where with search, rating, coach, package, and visibility', () => {
    const where = buildStaffInboxWhere({
      q: 'pilates',
      rating: '5',
      visibility: 'anonymous',
      coachId: 'coach-1',
      packagePlanId: 'plan-1',
    });
    expect(where.status).toBe(SessionReviewStatus.SUBMITTED);
    expect(where.rating).toBe(5);
    expect(where.isAnonymous).toBe(true);
    expect(where.coachProfileId).toBe('coach-1');
    expect(where.booking).toEqual({
      consumptions: {
        some: {
          userPackage: {
            OR: [{ planId: 'plan-1' }, { sourcePlanIdSnapshot: 'plan-1' }],
          },
        },
      },
    });
    expect(where.OR).toEqual(
      expect.arrayContaining([
        {
          comment: {
            contains: 'pilates',
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ]),
    );
  });

  it('builds coach where with package filter and without anonymous reviews', () => {
    const where = buildCoachInboxWhere('coach-1', {
      q: 'strong',
      rating: '4',
      packagePlanId: 'plan-2',
    });
    expect(where).toMatchObject({
      status: SessionReviewStatus.SUBMITTED,
      isAnonymous: false,
      coachProfileId: 'coach-1',
      rating: 4,
    });
    expect(where.booking).toEqual({
      consumptions: {
        some: {
          userPackage: {
            OR: [{ planId: 'plan-2' }, { sourcePlanIdSnapshot: 'plan-2' }],
          },
        },
      },
    });
  });
});
