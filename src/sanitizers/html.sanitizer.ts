import sanitizeHtml from 'sanitize-html';

const plainEnglish = /[a-z]+/i;

const options: sanitizeHtml.IOptions = {
  allowedTags: ['a', 'code', 'del', 'em', 'pre', 'span', 'strong'],
  allowedAttributes: {
    a: ['href'],
    span: ['style'],
  },
  allowedStyles: {
    '*': {
      color: [
        plainEnglish,
        /^#(0x)?[0-9a-f]+$/i,
        /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/,
      ],
      'text-align': [plainEnglish],
      'font-weight': [plainEnglish, /\d+/],
    },
  },
};

export default function sanitize(text: string): string {
  return sanitizeHtml(text, options);
}
