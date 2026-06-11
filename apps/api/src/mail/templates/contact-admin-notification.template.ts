import { escapeHtml, plainTextToHtml } from '../email-html.util';
import { EMAIL_LOGO_CID_SRC } from '../email-logo';
import { EMAIL_BRAND } from './email-brand.constants';
import { renderBrandedEmailLayout, renderInfoRows } from './email-layout';

export type ContactAdminNotificationParams = {
  submittedAt: Date;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

function formatSubmittedAt(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(date);
}

/** HTML email sent to the studio owner when a visitor submits the contact form. */
export function renderContactAdminNotificationEmail(
  params: ContactAdminNotificationParams,
): string {
  const logoSrc = EMAIL_LOGO_CID_SRC;
  const submittedAt = formatSubmittedAt(params.submittedAt);
  const safeSubject =
    params.subject.trim().length > 0 ? params.subject : 'General enquiry';

  const bodyHtml = `
<h1 style="margin:0 0 8px;font-size:28px;line-height:1.25;font-weight:400;color:${EMAIL_BRAND.headingColor};">New Contact Message</h1>
<p style="margin:0 0 24px;font-family:${EMAIL_BRAND.sansFontFamily};font-size:14px;line-height:1.5;color:${EMAIL_BRAND.mutedColor};">Submitted ${escapeHtml(submittedAt)} (UTC)</p>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 24px;">
  ${renderInfoRows([
    { label: 'Name', value: escapeHtml(params.name) },
    { label: 'Phone', value: escapeHtml(params.phone) },
    {
      label: 'Email',
      value: `<a href="mailto:${escapeHtml(params.email)}" style="color:${EMAIL_BRAND.accentColor};text-decoration:none;">${escapeHtml(params.email)}</a>`,
    },
    { label: 'Subject', value: escapeHtml(safeSubject) },
  ])}
</table>
<h2 style="margin:0 0 12px;font-size:18px;line-height:1.35;font-weight:600;color:${EMAIL_BRAND.headingColor};">Message</h2>
<div style="padding:20px;border-radius:14px;background:${EMAIL_BRAND.accentBackground};">
  ${plainTextToHtml(params.message)}
</div>
<p style="margin:24px 0 0;padding:16px;border-radius:12px;background:${EMAIL_BRAND.background};font-family:${EMAIL_BRAND.sansFontFamily};font-size:14px;line-height:1.6;color:${EMAIL_BRAND.bodyColor};">
  You can reply directly to this email to respond to the customer.
</p>`;

  return renderBrandedEmailLayout({
    logoSrc,
    title: 'New Contact Message',
    preheader: `New message from ${params.name}`,
    bodyHtml,
  });
}
