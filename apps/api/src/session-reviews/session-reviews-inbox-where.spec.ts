import { Prisma, SessionReviewStatus } from '@prisma/client';
import {
  buildCoachInboxWhere,
  buildStaffInboxWhere,
} from './session-reviews-inbox-where';

describe('session-reviews-inbox-where', () => {
  it('builds staff where with search, rating, and anonymous visibility', () => {
    const where = buildStaffInboxWhere({
      q: 'pilates',
      rating: '5',
      visibility: 'anonymous',
    });
    expect(where.status).toBe(SessionReviewStatus.SUBMITTED);
    expect(where.rating).toBe(5);
    expect(where.isAnonymous).toBe(true);
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

  it('builds coach where without anonymous reviews', () => {
    const where = buildCoachInboxWhere('coach-1', { q: 'strong', rating: '4' });
    expect(where).toMatchObject({
      status: SessionReviewStatus.SUBMITTED,
      isAnonymous: false,
      coachProfileId: 'coach-1',
      rating: 4,
    });
    expect(where).not.toHaveProperty('visibility');
  });
});
