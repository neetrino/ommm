import { Role, UserPackageStatus } from '@prisma/client';
import {
  influencerSucceededWhere,
  revenueSucceededWhere,
} from '../payments/payment-revenue.util';
import {
  AdminClientPackageFilter,
  AdminClientPaymentStatusFilter,
  AdminClientStatusFilter,
  AdminClientTagFilter,
  type AdminListClientsQueryDto,
} from './dto/admin-list-clients-query.dto';
import {
  buildClientsListWhere,
  scopeClientsListWhere,
} from './clients-list-query.builder';

function query(
  overrides: Partial<AdminListClientsQueryDto> = {},
): AdminListClientsQueryDto {
  return overrides;
}

function andClauses(where: ReturnType<typeof buildClientsListWhere>) {
  const and = where.AND;
  if (!Array.isArray(and)) {
    throw new Error('expected AND list');
  }
  return and;
}

describe('buildClientsListWhere', () => {
  it('scopes influencer badge to succeeded influencer payments', () => {
    const where = buildClientsListWhere(
      query({ tag: [AdminClientTagFilter.INFLUENCER] }),
    );

    expect(andClauses(where)).toEqual(
      expect.arrayContaining([
        { role: Role.USER },
        {
          payments: {
            some: influencerSucceededWhere,
          },
        },
      ]),
    );
  });

  it('does not treat influencer-only clients as paid', () => {
    const where = buildClientsListWhere(
      query({ paymentStatus: [AdminClientPaymentStatusFilter.PAID] }),
    );

    expect(andClauses(where)).toEqual(
      expect.arrayContaining([
        {
          payments: {
            some: revenueSucceededWhere,
          },
        },
      ]),
    );
  });

  it('selects sign-ups with no package rows when package is never', () => {
    const where = buildClientsListWhere(
      query({ package: [AdminClientPackageFilter.NEVER] }),
    );

    expect(andClauses(where)).toEqual(
      expect.arrayContaining([{ userPackages: { none: {} } }]),
    );
  });

  it('hides archived clients unless search or the deleted filter asks for them', () => {
    expect(andClauses(buildClientsListWhere(query()))).toEqual(
      expect.arrayContaining([{ role: Role.USER }, { deletedAt: null }]),
    );

    const searched = andClauses(
      buildClientsListWhere(query({ search: 'liza' })),
    );
    expect(searched).not.toEqual(expect.arrayContaining([{ deletedAt: null }]));

    expect(
      andClauses(
        buildClientsListWhere(
          query({ status: [AdminClientStatusFilter.DELETED] }),
        ),
      ),
    ).toEqual(expect.arrayContaining([{ deletedAt: { not: null } }]));
  });

  it('keeps past buyers in the inactive package filter', () => {
    const where = buildClientsListWhere(
      query({ package: [AdminClientPackageFilter.INACTIVE] }),
    );

    expect(andClauses(where)).toEqual(
      expect.arrayContaining([
        {
          userPackages: { none: { status: UserPackageStatus.ACTIVE } },
        },
      ]),
    );
  });
});

describe('scopeClientsListWhere', () => {
  it('keeps the admin filters and requires a booking with this coach', () => {
    const where = scopeClientsListWhere(
      buildClientsListWhere(query()),
      'coach-1',
    );
    expect(where).toEqual({
      AND: [
        buildClientsListWhere(query()),
        { bookings: { some: { session: { coachId: 'coach-1' } } } },
      ],
    });
  });
});
