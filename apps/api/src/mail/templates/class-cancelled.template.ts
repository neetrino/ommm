import { renderBrandedEmail } from './email-layout';
import {
  renderEmailCtaButton,
  renderEmailDetailCard,
  renderEmailHeading,
  renderEmailMutedNote,
  renderEmailSignoff,
  renderEmailText,
} from './email-parts';

export type ClassCancelledEmailParams = {
  className: string;
  startsAtLabel: string;
  scheduleUrl: string;
};

/** Subject when a scheduled class is cancelled. */
export function buildClassCancelledSubject(className: string): string {
  return `Your class was cancelled — ${className}`;
}

/** Member email after the studio cancels a class. */
export function renderClassCancelledEmail(
  params: ClassCancelledEmailParams,
): string {
  const className = params.className.trim() || 'your class';
  return renderBrandedEmail({
    title: 'This class was cancelled',
    preheader: `${className} has been cancelled`,
    bodyHtml: [
      renderEmailHeading('This class was cancelled'),
      renderEmailText(
        `We're sorry — ${className} has been cancelled. You can choose another time from the schedule.`,
      ),
      renderEmailDetailCard([
        { label: 'Class', value: className },
        { label: 'Was scheduled', value: params.startsAtLabel },
      ]),
      renderEmailCtaButton('Open schedule', params.scheduleUrl),
      renderEmailMutedNote(
        'If this class used a class from your package, it has been returned to your account.',
      ),
      renderEmailSignoff(),
    ].join(''),
  });
}
