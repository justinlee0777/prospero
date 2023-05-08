import { Config, sanitize as domPurifySanitize } from 'isomorphic-dompurify';

const options: Config = {
  ALLOWED_TAGS: ['a', 'code', 'del', 'em', 'pre', 'span', 'strong'],
  ALLOWED_ATTR: ['style', 'href'],
};

export default function sanitize(text: string): string {
  return domPurifySanitize(text, options) as string;
}
