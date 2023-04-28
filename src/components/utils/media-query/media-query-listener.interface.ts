import MediaQueryPattern from './media-query-pattern.interface';

export default interface MediaQueryListener {
  /**
   * @param patternOrDefault is the matching pattern for the browser or false if none is chosen.
   */
  (patternOrDefault: MediaQueryPattern | false): void;
}
