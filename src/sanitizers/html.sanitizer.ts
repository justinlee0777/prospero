import * as sanitizeHtml from 'sanitize-html';

const options: sanitizeHtml.IOptions = {
  allowedAttributes: {
    span: ['style'],
  },
  allowedStyles: {
    '*': {
      color: [
        /[a-z]*/,
        /^#(0x)?[0-9a-f]+$/i,
        /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/,
      ],
    },
  },
};

export default function sanitize(text: string): string {
  return sanitizeHtml(text, options);
}
