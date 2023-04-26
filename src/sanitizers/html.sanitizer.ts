import sanitizeHtml from 'sanitize-html';

const options: sanitizeHtml.IOptions = {
  allowedTags: ['span'],
  allowedAttributes: {
    span: ['style'],
  },
  allowedStyles: {
    '*': {
      color: [
        /[a-z]+/i,
        /^#(0x)?[0-9a-f]+$/i,
        /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/,
      ],
    },
  },
};

export default function sanitize(text: string): string {
  return sanitizeHtml(text, options);
}
