import { EMAIL_BRAND } from './email-brand.constants';

type BrandedEmailLayoutParams = {
  logoSrc: string;
  title: string;
  preheader?: string;
  bodyHtml: string;
};

/** Shared table-based HTML shell for Ommm transactional emails. */
export function renderBrandedEmailLayout(
  params: BrandedEmailLayoutParams,
): string {
  const preheader = params.preheader ?? params.title;
  const { background, cardBackground, headingColor, borderColor, fontFamily } =
    EMAIL_BRAND;

  const logoSize = EMAIL_BRAND.logoDisplaySizePx;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${params.title}</title>
</head>
<body style="margin:0;padding:0;background:${background};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${preheader}
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${background};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background:${cardBackground};border:1px solid ${borderColor};border-radius:20px;overflow:hidden;">
          <tr>
            <td align="center" style="padding:32px 32px 16px;">
              <img src="${params.logoSrc}" alt="Ommm" width="${logoSize}" height="${logoSize}" style="display:block;width:${logoSize}px;height:${logoSize}px;border:0;outline:none;" />
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 32px;font-family:${fontFamily};color:${headingColor};">
              ${params.bodyHtml}
            </td>
          </tr>
        </table>
        <p style="margin:20px 0 0;font-family:${EMAIL_BRAND.sansFontFamily};font-size:12px;line-height:1.5;color:${EMAIL_BRAND.mutedColor};text-align:center;">
          Ommm Wellness Studio
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

type InfoRow = {
  label: string;
  value: string;
};

/** Renders a labeled detail row for admin notification emails. */
export function renderInfoRows(rows: readonly InfoRow[]): string {
  return rows
    .map(
      (row) => `<tr>
  <td style="padding:10px 0;border-bottom:1px solid ${EMAIL_BRAND.borderColor};vertical-align:top;width:120px;font-family:${EMAIL_BRAND.sansFontFamily};font-size:13px;font-weight:600;color:${EMAIL_BRAND.mutedColor};">${row.label}</td>
  <td style="padding:10px 0 10px 16px;border-bottom:1px solid ${EMAIL_BRAND.borderColor};font-family:${EMAIL_BRAND.sansFontFamily};font-size:15px;line-height:1.5;color:${EMAIL_BRAND.headingColor};">${row.value}</td>
</tr>`,
    )
    .join('');
}
