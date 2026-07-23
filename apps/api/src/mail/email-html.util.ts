const HTML_ESCAPE_MAP: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escapes user-controlled strings before embedding in HTML email bodies. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char] ?? char);
}

/** Converts plain text with newlines into safe HTML paragraphs. */
export function plainTextToHtml(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return '<p style="margin:0;color:#6b665c;">—</p>';
  }

  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => {
      const lines = paragraph
        .split('\n')
        .map((line) => escapeHtml(line.trim()))
        .filter((line) => line.length > 0)
        .join('<br />');
      return `<p style="margin:0 0 12px;color:#1d1c15;line-height:1.6;">${lines}</p>`;
    })
    .join('');
}
