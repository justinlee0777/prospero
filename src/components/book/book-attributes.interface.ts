import MediaQueryPattern from '../media-query/media-query-pattern.interface';

export default interface BookAttributes {
  /** Used by BooksComponent on initialization. */
  media?: MediaQueryPattern;
}
