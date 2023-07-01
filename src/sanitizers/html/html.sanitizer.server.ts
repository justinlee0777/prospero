import { JSDOM } from 'jsdom';

import HTMLSanitizer from './html.sanitizer';

export default HTMLSanitizer(() => new JSDOM('').window as unknown as Window);
