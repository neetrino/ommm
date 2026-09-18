import {
  isWhatsappSelfChat,
  resolveWhatsappRecipientPhone,
  toWhatsappChatId,
} from './whatsapp-chat-id';

describe('toWhatsappChatId', () => {
  it('builds a Gateway chat id from an Armenian E.164 phone', () => {
    expect(toWhatsappChatId('+37441881822')).toBe('37441881822@c.us');
  });

  it('strips spaces and plus from formatted phones', () => {
    expect(toWhatsappChatId('+374 41 881822')).toBe('37441881822@c.us');
  });

  it('returns null for empty or too-short values', () => {
    expect(toWhatsappChatId(null)).toBeNull();
    expect(toWhatsappChatId('')).toBeNull();
    expect(toWhatsappChatId('123')).toBeNull();
  });
});

describe('resolveWhatsappRecipientPhone', () => {
  it('prefers the dedicated WhatsApp number', () => {
    expect(
      resolveWhatsappRecipientPhone({
        whatsappPhone: '+37499111222',
        phone: '+37441881822',
      }),
    ).toBe('+37499111222');
  });

  it('falls back to the regular phone when WhatsApp is empty', () => {
    expect(
      resolveWhatsappRecipientPhone({
        whatsappPhone: '  ',
        phone: '+37441881822',
      }),
    ).toBe('+37441881822');
    expect(
      resolveWhatsappRecipientPhone({
        whatsappPhone: null,
        phone: null,
      }),
    ).toBeNull();
  });
});

describe('isWhatsappSelfChat', () => {
  it('matches a recipient to the masked paired phone', () => {
    expect(isWhatsappSelfChat('37444343000@c.us', '•••••••3000')).toBe(true);
    expect(isWhatsappSelfChat('37441881822@c.us', '•••••••3000')).toBe(false);
    expect(isWhatsappSelfChat('37444343000@c.us', null)).toBe(false);
  });
});
