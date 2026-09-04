import { renderBilingualWhatsappMessage } from './whatsapp-notify.service';
import { renderBookingConfirmedWhatsapp } from './whatsapp-schedule-templates';

describe('renderBookingConfirmedWhatsapp', () => {
  it('renders locale-specific copy that becomes bilingual when joined', () => {
    const message = renderBilingualWhatsappMessage((locale) =>
      renderBookingConfirmedWhatsapp(locale, {
        className: 'Reformer',
        startsAtLabel:
          locale === 'hy' ? '12 սեպ, 2026 թ., 18:00' : '12 Sept 2026, 18:00',
      }),
    );
    expect(message).toContain('ամրագրված է');
    expect(message).toContain('Your Ommm. moment is booked');
    expect(message).toContain('«Reformer»');
    expect(message).toContain('12 սեպ, 2026 թ., 18:00');
    expect(message).toContain('12 Sept 2026, 18:00');
  });
});
