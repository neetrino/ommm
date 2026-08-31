import { toWhatsappChatId } from './whatsapp-chat-id';

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
