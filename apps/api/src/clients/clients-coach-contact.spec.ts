import {
  redactCoachClientContact,
  redactCoachClientDirectory,
} from './clients-coach-contact';

describe('redactCoachClientContact', () => {
  it('clears phone, WhatsApp, and email', () => {
    expect(
      redactCoachClientContact({
        id: 'client-1',
        name: 'Anna',
        email: 'anna@studio.test',
        phone: '+37400000000',
        whatsappPhone: '+37400000001',
      }),
    ).toEqual({
      id: 'client-1',
      name: 'Anna',
      email: '',
      phone: null,
      whatsappPhone: null,
    });
  });

  it('clears contact fields on every directory row', () => {
    const page = redactCoachClientDirectory({
      rows: [
        {
          email: 'a@studio.test',
          phone: '+37400000000',
          whatsappPhone: null,
        },
      ],
      summary: { total: 1 },
    });

    expect(page).toEqual({
      rows: [{ email: '', phone: null, whatsappPhone: null }],
      summary: { total: 1 },
    });
  });
});
