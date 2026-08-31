import {
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
    ).toEqual([{ id: 'acc_1', status: 'CONNECTED' }]);
  });

  it('reads a single account object', () => {
    expect(parseGatewayAccounts({ id: 'acc_2', status: 'QR' })).toEqual([
      { id: 'acc_2', status: 'QR' },
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
    });
  });

  it('reads a gateway error message', () => {
    expect(
      readGatewayError({ error: { code: 'AUTH', message: 'Invalid token' } }),
    ).toBe('Invalid token');
  });
});
