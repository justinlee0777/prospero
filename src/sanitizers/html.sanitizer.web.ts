import DOMPurify from 'dompurify';

import Sanitizer from './sanitizer.interface';

const options: DOMPurify.Config = {
    ALLOWED_TAGS: ['a', 'code', 'del', 'em', 'pre', 'span', 'strong'],
    ALLOWED_ATTR: ['style', 'href'],
};

export default class HTMLSanitizer implements Sanitizer {
    purify: DOMPurify.DOMPurifyI;

    constructor() {
        this.purify = DOMPurify(window);
    }

    sanitize(text: string): string {
        return this.purify.sanitize(text, options) as string;
    }
}
