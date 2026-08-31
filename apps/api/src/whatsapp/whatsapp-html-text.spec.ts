import { htmlToWhatsappText } from './whatsapp-html-text';

describe('htmlToWhatsappText', () => {
  it('strips tags and keeps line breaks', () => {
    expect(htmlToWhatsappText('<p>Hello</p><p>World</p>')).toBe('Hello\nWorld');
  });

  it('decodes common entities', () => {
    expect(htmlToWhatsappText('A &amp; B&nbsp;C')).toBe('A & B C');
  });

  it('does not revive encoded tags after decode', () => {
    expect(
      htmlToWhatsappText('&lt;script&gt;alert(1)&lt;/script&gt;Safe'),
    ).toBe('alert(1)Safe');
  });
});
