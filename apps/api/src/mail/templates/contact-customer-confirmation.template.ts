import { escapeHtml, plainTextToHtml } from '../email-html.util';
import { EMAIL_LOGO_CID_SRC } from '../email-logo';
import { EMAIL_BRAND } from './email-brand.constants';
import { renderBrandedEmailLayout } from './email-layout';

export type ContactCustomerConfirmationParams = {
  customerName: string;
  subject: string;
  message: string;
};

const CONFIRMATION_INTRO = `Thank you for contacting Ommm.

We have received your message and our team will review it shortly. Ommm is a wellness studio created for mindful movement, balance, and a calmer daily rhythm. Through yoga, pilates, reformer sessions, and carefully designed studio experiences, we help our community reconnect with their body, energy, and inner clarity.

We will get back to you as soon as possible.`;

/** HTML confirmation email sent to the customer after contact form submission. */
export function renderContactCustomerConfirmationEmail(
  params: ContactCustomerConfirmationParams,
): string {
  const logoSrc = EMAIL_LOGO_CID_SRC;
  const greetingName = params.customerName.trim();
  const safeSubject =
    params.subject.trim().length > 0 ? params.subject : 'Your enquiry';

  const bodyHtml = `
<h1 style="margin:0 0 16px;font-size:28px;line-height:1.25;font-weight:400;color:${EMAIL_BRAND.headingColor};">We received your message</h1>
<p style="margin:0 0 20px;font-family:${EMAIL_BRAND.sansFontFamily};font-size:16px;line-height:1.65;color:${EMAIL_BRAND.bodyColor};">
  Hi${greetingName.length > 0 ? ` ${escapeHtml(greetingName)}` : ''},
</p>
${plainTextToHtml(CONFIRMATION_INTRO)}
<h2 style="margin:28px 0 12px;font-size:17px;line-height:1.35;font-weight:600;color:${EMAIL_BRAND.headingColor};">Your message</h2>
<p style="margin:0 0 8px;font-family:${EMAIL_BRAND.sansFontFamily};font-size:13px;font-weight:600;color:${EMAIL_BRAND.mutedColor};">Subject</p>
<p style="margin:0 0 16px;font-family:${EMAIL_BRAND.sansFontFamily};font-size:15px;line-height:1.5;color:${EMAIL_BRAND.headingColor};">${escapeHtml(safeSubject)}</p>
<div style="padding:20px;border-radius:14px;background:${EMAIL_BRAND.accentBackground};">
  ${plainTextToHtml(params.message)}
</div>
<p style="margin:28px 0 0;font-family:${EMAIL_BRAND.sansFontFamily};font-size:15px;line-height:1.65;color:${EMAIL_BRAND.bodyColor};">
  Warm regards,<br />
  The Ommm Team
</p>`;

  return renderBrandedEmailLayout({
    logoSrc,
    title: 'We received your message',
    preheader: 'Thank you for contacting Ommm',
    bodyHtml,
  });
}
