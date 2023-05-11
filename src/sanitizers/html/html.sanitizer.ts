import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

import Sanitizer from '../sanitizer.interface';

const options: DOMPurify.Config = {
  ALLOWED_TAGS: ['a', 'code', 'del', 'em', 'pre', 'span', 'strong'],
  ALLOWED_ATTR: ['style', 'href'],
};

export default class HTMLSanitizer implements Sanitizer {
  private purify: DOMPurify.DOMPurifyI;

  constructor() {
    const window = new JSDOM('').window;
    this.purify = DOMPurify(window);
    // this.purify.addHook('uponSanitizeElement', convertHeadings);
  }

  sanitize(text: string): string {
    return this.purify.sanitize(text, options) as string;
  }
}
