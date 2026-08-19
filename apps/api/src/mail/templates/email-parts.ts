import { escapeHtml } from '../email-html.util';
import { EMAIL_BRAND } from './email-brand.constants';

export type EmailDetailRow = {
  label: string;
  value: string;
};

/** Large serif title used at the top of branded email bodies. */
export function renderEmailHeading(text: string): string {
  return `<h1 style="margin:0 0 16px;font-size:28px;line-height:1.25;font-weight:400;color:${EMAIL_BRAND.headingColor};">${escapeHtml(text)}</h1>`;
}

/** Body paragraph. Escapes the text so caller values stay safe. */
export function renderEmailText(text: string): string {
  return `<p style="margin:0 0 16px;font-family:${EMAIL_BRAND.sansFontFamily};font-size:16px;line-height:1.65;color:${EMAIL_BRAND.bodyColor};">${escapeHtml(text)}</p>`;
}

/** Greeting line (`Hi` / `Hi Name,`). */
export function renderEmailGreeting(name: string): string {
  const trimmed = name.trim();
  return renderEmailText(trimmed.length > 0 ? `Hi ${trimmed},` : 'Hi,');
}

/** Smaller supporting note under a CTA. Never used for raw URLs. */
export function renderEmailMutedNote(text: string): string {
  return `<p style="margin:0 0 24px;font-family:${EMAIL_BRAND.sansFontFamily};font-size:14px;line-height:1.55;color:${EMAIL_BRAND.mutedColor};">${escapeHtml(text)}</p>`;
}

/** Pill CTA. The destination lives only in `href`, not in visible text. */
export function renderEmailCtaButton(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
  <tr>
    <td align="center" style="border-radius:999px;background:${EMAIL_BRAND.accentColor};">
      <a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 28px;font-family:${EMAIL_BRAND.sansFontFamily};font-size:15px;font-weight:600;line-height:1.2;color:#ffffff;text-decoration:none;">
        ${escapeHtml(label)}
      </a>
    </td>
  </tr>
</table>`;
}

/** Shared closing for customer-facing emails. */
export function renderEmailSignoff(): string {
  return `<p style="margin:8px 0 0;font-family:${EMAIL_BRAND.sansFontFamily};font-size:15px;line-height:1.65;color:${EMAIL_BRAND.bodyColor};">With care,<br />The Ommm Team</p>`;
}

/** Soft card of label / value rows (amounts, class names, times). */
export function renderEmailDetailCard(rows: readonly EmailDetailRow[]): string {
  const body = rows
    .map(
      (row) => `<tr>
  <td style="padding:6px 0;font-family:${EMAIL_BRAND.sansFontFamily};font-size:13px;font-weight:600;color:${EMAIL_BRAND.mutedColor};">${escapeHtml(row.label)}</td>
  <td style="padding:6px 0 6px 16px;font-family:${EMAIL_BRAND.sansFontFamily};font-size:15px;color:${EMAIL_BRAND.headingColor};">${escapeHtml(row.value)}</td>
</tr>`,
    )
    .join('');
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:8px 0 24px;padding:20px;border-radius:14px;background:${EMAIL_BRAND.accentBackground};">${body}</table>`;
}

/** Large gift-card / booking code. This is a code, not a URL. */
export function renderEmailCodeBox(label: string, code: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:8px 0 24px;">
  <tr>
    <td align="center" style="padding:20px;border-radius:14px;background:${EMAIL_BRAND.accentBackground};">
      <p style="margin:0 0 8px;font-family:${EMAIL_BRAND.sansFontFamily};font-size:13px;font-weight:600;color:${EMAIL_BRAND.mutedColor};">${escapeHtml(label)}</p>
      <p style="margin:0;font-family:${EMAIL_BRAND.sansFontFamily};font-size:22px;letter-spacing:0.08em;font-weight:700;color:${EMAIL_BRAND.headingColor};">${escapeHtml(code)}</p>
    </td>
  </tr>
</table>`;
}
