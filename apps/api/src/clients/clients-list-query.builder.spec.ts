import { Role } from '@prisma/client';
import {
  influencerSucceededWhere,
  revenueSucceededWhere,
} from '../payments/payment-revenue.util';
import {
  AdminClientPaymentStatusFilter,
  AdminClientTagFilter,
  type AdminListClientsQueryDto,
} from './dto/admin-list-clients-query.dto';
import { buildClientsListWhere } from './clients-list-query.builder';

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
      query({ tag: AdminClientTagFilter.INFLUENCER }),
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
      query({ paymentStatus: AdminClientPaymentStatusFilter.PAID }),
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
});
