import { escapeHtml } from '../email-html.util';
import { EMAIL_LOGO_PUBLIC_SRC } from '../email-logo';
import { EMAIL_BRAND } from './email-brand.constants';
import { renderBrandedEmailLayout } from './email-layout';

export type ClientInviteEmailParams = {
  recipientName: string;
  passwordSetupUrl: string;
};

/** Branded invite email for admin-created client accounts (set-password link). */
export function renderClientInviteEmail(
  params: ClientInviteEmailParams,
): string {
  const greetingName = params.recipientName.trim();
  const setupUrl = params.passwordSetupUrl.trim();

  const bodyHtml = `
<h1 style="margin:0 0 16px;font-size:28px;line-height:1.25;font-weight:400;color:${EMAIL_BRAND.headingColor};">Welcome to Ommm</h1>
<p style="margin:0 0 20px;font-family:${EMAIL_BRAND.sansFontFamily};font-size:16px;line-height:1.65;color:${EMAIL_BRAND.bodyColor};">
  Hi${greetingName.length > 0 ? ` ${escapeHtml(greetingName)}` : ''},
</p>
<p style="margin:0 0 16px;font-family:${EMAIL_BRAND.sansFontFamily};font-size:16px;line-height:1.65;color:${EMAIL_BRAND.bodyColor};">
  Your client account has been created at Ommm Wellness Studio. To get started, please create your password using the secure link below.
</p>
<p style="margin:0 0 28px;font-family:${EMAIL_BRAND.sansFontFamily};font-size:16px;line-height:1.65;color:${EMAIL_BRAND.bodyColor};">
  Once your password is set, you can sign in with your email address and begin booking sessions.
</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
  <tr>
    <td align="center" style="border-radius:999px;background:${EMAIL_BRAND.accentColor};">
      <a href="${setupUrl.replace(/"/g, '&quot;')}" style="display:inline-block;padding:14px 28px;font-family:${EMAIL_BRAND.sansFontFamily};font-size:15px;font-weight:600;line-height:1.2;color:#ffffff;text-decoration:none;">
        Create your password
      </a>
    </td>
  </tr>
</table>
<p style="margin:0 0 8px;font-family:${EMAIL_BRAND.sansFontFamily};font-size:13px;line-height:1.55;color:${EMAIL_BRAND.mutedColor};">
  If the button does not work, copy and paste this link into your browser:
</p>
<p style="margin:0 0 24px;font-family:${EMAIL_BRAND.sansFontFamily};font-size:13px;line-height:1.55;word-break:break-all;">
  <a href="${setupUrl.replace(/"/g, '&quot;')}" style="color:${EMAIL_BRAND.accentColor};text-decoration:none;">${escapeHtml(setupUrl)}</a>
</p>
<p style="margin:0 0 24px;font-family:${EMAIL_BRAND.sansFontFamily};font-size:14px;line-height:1.55;color:${EMAIL_BRAND.mutedColor};">
  This link expires for your security. If it has expired, contact the studio and we will send a new one.
</p>
<p style="margin:0;font-family:${EMAIL_BRAND.sansFontFamily};font-size:15px;line-height:1.65;color:${EMAIL_BRAND.bodyColor};">
  With care,<br />
  The Ommm Team
</p>`;

  return renderBrandedEmailLayout({
    logoSrc: EMAIL_LOGO_PUBLIC_SRC,
    title: 'Welcome to Ommm',
    preheader: 'Create your password to activate your Ommm account',
    bodyHtml,
  });
}
