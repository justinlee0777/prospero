import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

import Sanitizer from '../sanitizer.interface';
import options from './dompurify.config';

export default class HTMLSanitizer implements Sanitizer {
  private purify: DOMPurify.DOMPurifyI;

  constructor() {
    const window = new JSDOM('').window;
    this.purify = DOMPurify(window);
  }

  sanitize(text: string): string {
    return this.purify.sanitize(text, options) as string;
  }
}
