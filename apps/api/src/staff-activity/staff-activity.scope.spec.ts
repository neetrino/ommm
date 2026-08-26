import { Role } from '@prisma/client';
import {
  isCoachStaffActivityActor,
  isStaffActivityUnread,
  resolveSessionInboxCoachId,
  unreadWhereForScope,
  visibilityWhereForScope,
} from './staff-activity.scope';

describe('staff-activity.scope', () => {
  it('treats only COACH as a scoped actor', () => {
    expect(isCoachStaffActivityActor(Role.COACH)).toBe(true);
    expect(isCoachStaffActivityActor(Role.ADMIN)).toBe(false);
    expect(isCoachStaffActivityActor(Role.MANAGER)).toBe(false);
  });

  it('limits coach visibility to their profile rows', () => {
    expect(
      visibilityWhereForScope({ kind: 'coach', coachProfileId: 'coach-1' }),
    ).toEqual({ coachProfileId: 'coach-1' });
    expect(visibilityWhereForScope({ kind: 'studio' })).toEqual({});
    expect(visibilityWhereForScope({ kind: 'empty' })).toEqual({
      id: { in: [] },
    });
  });

  it('uses coachReadAt for coach unread and staffReadAt for the studio', () => {
    expect(
      unreadWhereForScope({ kind: 'coach', coachProfileId: 'coach-1' }),
    ).toEqual({ coachProfileId: 'coach-1', coachReadAt: null });
    expect(unreadWhereForScope({ kind: 'studio' })).toEqual({
      staffReadAt: null,
    });
  });

  it('routes inbox rows to the substitute when one is assigned', () => {
    expect(
      resolveSessionInboxCoachId({
        coachId: 'primary-1',
        substituteCoachId: 'sub-1',
      }),
    ).toBe('sub-1');
    expect(
      resolveSessionInboxCoachId({
        coachId: 'primary-1',
        substituteCoachId: null,
      }),
    ).toBe('primary-1');
  });

  it('computes unread independently for coach and studio', () => {
    const row = {
      staffReadAt: new Date('2026-08-26T10:00:00.000Z'),
      coachReadAt: null,
    };
    expect(isStaffActivityUnread(row, { kind: 'studio' })).toBe(false);
    expect(
      isStaffActivityUnread(row, { kind: 'coach', coachProfileId: 'coach-1' }),
    ).toBe(true);
  });
});
