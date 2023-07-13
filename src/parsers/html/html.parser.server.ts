import HTMLSanitizer from '../../sanitizers/html/html.sanitizer.server';
import HTMLParser from './html.parser';

export default HTMLParser(HTMLSanitizer);
