import { renderBrandedEmail } from './email-layout';
import {
  renderEmailCtaButton,
  renderEmailDetailCard,
  renderEmailHeading,
  renderEmailSignoff,
  renderEmailText,
} from './email-parts';

export type ClassReminderEmailParams = {
  className: string;
  hoursBefore: number;
  startsAtLabel: string;
  bookingsUrl: string;
};

/** Subject for an upcoming-class reminder. */
export function buildClassReminderSubject(className: string): string {
  return `Your class is coming up — ${className}`;
}

/** Reminder sent a few hours before a booked class. */
export function renderClassReminderEmail(
  params: ClassReminderEmailParams,
): string {
  const className = params.className.trim() || 'your class';
  return renderBrandedEmail({
    title: 'Your class is coming up',
    preheader: `${className} starts in about ${params.hoursBefore} hours`,
    bodyHtml: [
      renderEmailHeading('Your class is coming up'),
      renderEmailText(
        `${className} starts in about ${params.hoursBefore} hours.`,
      ),
      renderEmailDetailCard([
        { label: 'Class', value: className },
        { label: 'Starts', value: params.startsAtLabel },
      ]),
      renderEmailCtaButton('View my bookings', params.bookingsUrl),
      renderEmailSignoff(),
    ].join(''),
  });
}
