import MediaQueryPattern from '../media-query/media-query-pattern.interface';
import BookAnimation from './book-animation.interface';

export default interface BookAttributes {
  animation?: BookAnimation;
  /** Used by BooksComponent on initialization. */
  media?: MediaQueryPattern;
}
