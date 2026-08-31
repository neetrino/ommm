import { htmlToWhatsappText } from './whatsapp-html-text';

describe('htmlToWhatsappText', () => {
  it('strips tags and keeps line breaks', () => {
    expect(htmlToWhatsappText('<p>Hello</p><p>World</p>')).toBe('Hello\nWorld');
  });

  it('decodes common entities', () => {
    expect(htmlToWhatsappText('A &amp; B&nbsp;C')).toBe('A & B C');
  });
});
