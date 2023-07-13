import DOMPurify from 'dompurify';

import Constructor from '../../utils/constructor.type';
import Sanitizer from '../sanitizer.interface';
import options from './dompurify.config';

export default function HTMLSanitizer(
  getWindow: () => Window
): Constructor<Sanitizer, []> {
  return class HTMLSanitizer implements Sanitizer {
    private purify: DOMPurify.DOMPurifyI;

    constructor() {
      this.purify = DOMPurify(getWindow());
    }

    sanitize(text: string): string {
      return this.purify.sanitize(text, options) as string;
    }
  };
}
