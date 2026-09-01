import {
  isGatewayMessageSent,
  parseGatewayAccounts,
  parseGatewaySession,
  readGatewayError,
} from './whatsapp-gateway.envelope';

describe('whatsapp-gateway.envelope', () => {
  it('reads nested account lists', () => {
    expect(
      parseGatewayAccounts({
        items: [{ id: 'acc_1', status: 'CONNECTED' }],
      }),
    ).toEqual([{ id: 'acc_1', status: 'CONNECTED', phoneNumber: null }]);
  });

  it('reads a single account object', () => {
    expect(parseGatewayAccounts({ id: 'acc_2', status: 'QR' })).toEqual([
      { id: 'acc_2', status: 'QR', phoneNumber: null },
    ]);
  });

  it('parses QR session payloads', () => {
    expect(
      parseGatewaySession({
        status: 'QR',
        qrDataUrl: 'data:image/png;base64,abc',
      }),
    ).toEqual({
      status: 'QR',
      qrDataUrl: 'data:image/png;base64,abc',
      phoneNumber: null,
    });
  });

  it('treats connected=true as CONNECTED', () => {
    expect(parseGatewaySession({ connected: true, qr: 'data:image/png;a' })).toEqual({
      status: 'CONNECTED',
      qrDataUrl: 'data:image/png;a',
      phoneNumber: null,
    });
  });

  it('accepts a sent message payload', () => {
    expect(isGatewayMessageSent({ status: 'sent', messageId: 'm1' })).toBe(
      true,
    );
    expect(isGatewayMessageSent({ status: 'failed' })).toBe(false);
    expect(isGatewayMessageSent(null)).toBe(false);
  });

  it('reads a gateway error message', () => {
    expect(
      readGatewayError({ error: { code: 'AUTH', message: 'Invalid token' } }),
    ).toBe('Invalid token');
  });
});
