import BookConfig from '../book/book-config.interface';
import MediaQueryPattern from '../media-query/media-query-pattern.interface';

export default interface FlexibleBookMediaQuery {
  config: BookConfig;
  pattern: MediaQueryPattern;
}
