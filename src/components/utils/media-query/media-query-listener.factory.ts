import debounce from '../../../utils/debounce.function';
import NullaryFn from '../../../utils/nullary-fn.type';
import MediaQueryListenerConfig from './media-query-listener-config.interface';
import MediaQueryListener from './media-query-listener.interface';

/**
 * Platform for getting certain pieces of data depending on the media query.
 * The intent is for media queries to not intersect each other.
 * Therefore only min-width, and only in pixels, is supported for now.
 */
export default class MediaQueryListenerFactory {
  /**
   * @returns a function that destroys the listeners.
   */
  static create(
    fallback: MediaQueryListener,
    ...configs: Array<MediaQueryListenerConfig>
  ): NullaryFn {
    const media = configs
      .sort((configA, configB) => configB.minWidth - configA.minWidth)
      .map((config) => {
        const queryList = window.matchMedia(
          `(min-width: ${config.minWidth}px)`
        );
        return {
          ...config,
          get matches() {
            return queryList.matches;
          },
        };
      });

    let lastCallback: MediaQueryListener;

    const resize = () => {
      const matchingMedia = media.find(({ matches }) => matches);
      const callback = matchingMedia?.callback ?? fallback;

      if (callback !== lastCallback) {
        callback(matchingMedia ?? false);
        lastCallback = callback;
      }
    };

    const debouncedResize = debounce(resize);

    window.addEventListener('resize', debouncedResize, {
      passive: true,
    });

    resize();

    return () => window.removeEventListener('resize', debouncedResize);
  }
}
