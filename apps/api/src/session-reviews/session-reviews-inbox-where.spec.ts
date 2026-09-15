import { Prisma, SessionReviewStatus } from '@prisma/client';
import {
  buildCoachInboxWhere,
  buildStaffInboxWhere,
} from './session-reviews-inbox-where';

describe('session-reviews-inbox-where', () => {
  it('builds staff where with search, rating, coach, package, and visibility', () => {
    const where = buildStaffInboxWhere({
      q: 'pilates',
      rating: ['5'],
      visibility: ['anonymous'],
      coachId: ['coach-1'],
      packagePlanId: ['plan-1'],
    });
    expect(where.AND).toEqual(
      expect.arrayContaining([
        { status: SessionReviewStatus.SUBMITTED },
        { rating: 5 },
        { isAnonymous: true },
        { coachProfileId: 'coach-1' },
        {
          booking: {
            consumptions: {
              some: {
                userPackage: {
                  OR: [
                    { planId: 'plan-1' },
                    { sourcePlanIdSnapshot: 'plan-1' },
                  ],
                },
              },
            },
          },
        },
        expect.objectContaining({
          OR: expect.arrayContaining([
            {
              comment: {
                contains: 'pilates',
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ]) as unknown[],
        }),
      ]),
    );
  });

  it('ORs multiple ratings and coach ids', () => {
    const where = buildStaffInboxWhere({
      rating: ['4', '5'],
      coachId: ['coach-1', 'coach-2'],
    });
    expect(where.AND).toEqual(
      expect.arrayContaining([
        { rating: { in: [4, 5] } },
        { coachProfileId: { in: ['coach-1', 'coach-2'] } },
      ]),
    );
  });

  it('builds coach where with package filter and without anonymous reviews', () => {
    const where = buildCoachInboxWhere('coach-1', {
      q: 'strong',
      rating: ['4'],
      packagePlanId: ['plan-2'],
    });
    expect(where.AND).toEqual(
      expect.arrayContaining([
        { status: SessionReviewStatus.SUBMITTED },
        { isAnonymous: false },
        { coachProfileId: 'coach-1' },
        { rating: 4 },
        {
          booking: {
            consumptions: {
              some: {
                userPackage: {
                  OR: [
                    { planId: 'plan-2' },
                    { sourcePlanIdSnapshot: 'plan-2' },
                  ],
                },
              },
            },
          },
        },
      ]),
    );
  });
});
