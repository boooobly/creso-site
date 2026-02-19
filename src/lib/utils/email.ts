function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function buildEmailHtmlFromText(text: string): string {
  return `<div style="font-family:Arial,sans-serif;white-space:pre-wrap;line-height:1.5;">${escapeHtml(text)}</div>`;
}
