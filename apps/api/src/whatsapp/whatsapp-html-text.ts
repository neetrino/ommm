const BLOCK_BREAK_TAGS = /<\/(?:p|div|h[1-6]|li|tr)>/gi;
const LINE_BREAK_TAGS = /<br\s*\/?>/gi;
const TAGS = /<[^>]+>/g;
const HTML_ENTITIES: ReadonlyArray<readonly [RegExp, string]> = [
  [/&nbsp;/gi, ' '],
  [/&amp;/gi, '&'],
  [/&lt;/gi, '<'],
  [/&gt;/gi, '>'],
  [/&quot;/gi, '"'],
  [/&#39;/gi, "'"],
];

/** Turns branded broadcast HTML into a short WhatsApp body. */
export function htmlToWhatsappText(html: string): string {
  let text = html
    .replace(LINE_BREAK_TAGS, '\n')
    .replace(BLOCK_BREAK_TAGS, '\n');
  text = text.replace(TAGS, '');
  for (const [pattern, replacement] of HTML_ENTITIES) {
    text = text.replace(pattern, replacement);
  }
  return text
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
