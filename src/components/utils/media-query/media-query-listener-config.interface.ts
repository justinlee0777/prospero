import MediaQueryListener from './media-query-listener.interface';
import MediaQueryPattern from './media-query-pattern.interface';

export default interface MediaQueryListenerConfig extends MediaQueryPattern {
  callback: MediaQueryListener;
}
