import { formatPersonName } from './reports-export.helpers';
import { readGiftAmount, toCsvRow } from './reports.helpers';

export type GiftCreditEventType = 'ISSUED' | 'REDEEMED' | 'SPENT';

/** One gift-credit ledger line shared by the CSV and Excel exports. */
export type GiftCreditEvent = {
  eventType: GiftCreditEventType;
  eventAt: Date;
  userId: string;
  userEmail: string;
  userName: string;
  amountCents: number;
  currency: string;
  reference: string;
  notes: string;
};

type GiftCreditPerson = {
  id: string;
  email: string;
  name: string | null;
  lastName: string | null;
};

export type GiftCreditEventsInput = {
  issuedCards: Array<{
    code: string;
    createdAt: Date;
    amountCents?: number;
    amountAmd?: number;
    recipientEmail: string | null;
    recipientName: string | null;
    recipient: { email: string | null } | null;
    purchaser: GiftCreditPerson | null;
  }>;
  redeemedCards: Array<{
    code: string;
    updatedAt: Date;
    amountCents?: number;
    amountAmd?: number;
    recipient: GiftCreditPerson | null;
  }>;
  spendPayments: Array<{
    id: string;
    userId: string;
    amountCents: number;
    currency: string;
    createdAt: Date;
    description: string | null;
    user: Omit<GiftCreditPerson, 'id'>;
  }>;
  currency: string;
};

export function buildGiftCreditEvents(
  input: GiftCreditEventsInput,
): GiftCreditEvent[] {
  const issued = input.issuedCards.map(
    (card): GiftCreditEvent => ({
      eventType: 'ISSUED',
      eventAt: card.createdAt,
      ...personFields(card.purchaser),
      amountCents: readGiftAmount(card),
      currency: input.currency,
      reference: card.code,
      notes:
        card.recipientEmail ??
        card.recipient?.email ??
        card.recipientName ??
        '',
    }),
  );
  const redeemed = input.redeemedCards.map(
    (card): GiftCreditEvent => ({
      eventType: 'REDEEMED',
      eventAt: card.updatedAt,
      ...personFields(card.recipient),
      amountCents: readGiftAmount(card),
      currency: input.currency,
      reference: card.code,
      notes: '',
    }),
  );
  const spent = input.spendPayments.map(
    (payment): GiftCreditEvent => ({
      eventType: 'SPENT',
      eventAt: payment.createdAt,
      ...personFields({ id: payment.userId, ...payment.user }),
      amountCents: payment.amountCents,
      currency: payment.currency,
      reference: payment.id,
      notes: payment.description ?? '',
    }),
  );
  return [...issued, ...redeemed, ...spent];
}

export function giftCreditEventCsvRow(event: GiftCreditEvent): string {
  return toCsvRow([
    event.eventType,
    event.eventAt.toISOString(),
    event.userId,
    event.userEmail,
    event.userName,
    event.amountCents,
    event.currency,
    event.reference,
    event.notes,
  ]);
}

function personFields(
  person: GiftCreditPerson | null,
): Pick<GiftCreditEvent, 'userId' | 'userEmail' | 'userName'> {
  return {
    userId: person?.id ?? '',
    userEmail: person?.email ?? '',
    userName: formatPersonName(person?.name, person?.lastName),
  };
}
