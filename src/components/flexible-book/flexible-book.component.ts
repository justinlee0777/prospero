import CreateElementConfig from '../../elements/create-element.config';
import div from '../../elements/div.function';
import PageStyles from '../../page-styles.interface';
import PagesBuilder from '../../pages.builder';
import merge from '../../utils/merge.function';
import normalizePageStyles from '../../utils/normalize-page-styles.function';
import BookConfig from '../book/book-config.interface';
import BookElement from '../book/book-element.interface';
import BookComponent from '../book/book.component';
import MediaQueryListenerFactory from '../media-query/media-query-listener.factory';
import MediaQuerySizerConfig from '../media-query/media-query-sizer-config.interface';
import CreateFlexibleBookElement from './create-flexible-book-element.interface';
import FlexibleBookElement from './flexible-book-element.interface';
import FlexibleBookMediaQuery from './flexible-book-media-query.interface';
import FlexibleBookIdentifier from './flexible-book.symbol';

/**
 * A magic book that stretches to the edges of the screen. This is perfect for short articles/essays (~2500 words).
 * This component creates a Book as a child based on the screen width.
 * The element by default is the height and width of the window. To constrain the size, it is recommended to
 * use viewport units/pixels for the width/height CSS properties (ex. min-width, max-width).
 */
const FlexibleBookComponent: CreateFlexibleBookElement = (
  requiredArgs,
  { fontLocation, transformers, bookClassNames, forHTML } = {},
  elementConfig = {}
) => {
  const { pageStyles, text } = requiredArgs;

  const normalizedPageStyles = normalizePageStyles(pageStyles as PageStyles);

  let fallback: BookConfig;
  let mediaQueryList: Array<FlexibleBookMediaQuery & { matches: boolean }> = [];

  if ('mediaQueryList' in requiredArgs) {
    fallback = requiredArgs.mediaQueryList[0];
    const [, ...configs] = [...requiredArgs.mediaQueryList];
    mediaQueryList = configs
      .sort(
        (queryA, queryB) => queryB.pattern.minWidth - queryA.pattern.minWidth
      )
      .map((mediaQueryConfig) => {
        const matchesMedia = window.matchMedia(
          `(min-width: ${mediaQueryConfig.pattern.minWidth}px)`
        );

        return {
          ...mediaQueryConfig,
          get matches() {
            return matchesMedia.matches;
          },
        };
      });
  } else {
    fallback = requiredArgs.config;
  }

  const defaultElementConfig: CreateElementConfig = {
    styles: {
      width: '100vw',
      height: '100vh',
    },
  };

  const flexibleBookElement = div(
    merge(defaultElementConfig, elementConfig)
  ) as unknown as FlexibleBookElement;
  let bookElement: BookElement | undefined;

  const size: MediaQuerySizerConfig['size'] = (width, height) => {
    bookElement?.destroy();

    const bookConfig =
      mediaQueryList.find((mediaQuery) => mediaQuery.matches)?.config ??
      fallback;

    const [pages] = new PagesBuilder()
      .setFont(
        normalizedPageStyles.computedFontSize,
        normalizedPageStyles.computedFontFamily,
        fontLocation
      )
      .setLineHeight(normalizedPageStyles.lineHeight)
      .setMargin(normalizedPageStyles.margin)
      .setPadding(normalizedPageStyles.padding)
      .setBorder(normalizedPageStyles.border)
      .setTransformers(transformers)
      .setText(text)
      .addSize(width / (bookConfig.pagesShown ?? 1), height)
      .build({ html: forHTML });

    bookElement = BookComponent(pages.getData(), bookConfig, {
      classnames: bookClassNames,
    });

    flexibleBookElement.appendChild(bookElement);
  };

  const destroySizer = MediaQueryListenerFactory.createSizer(
    {
      size,
    },
    flexibleBookElement
  );

  flexibleBookElement.destroy = () => {
    flexibleBookElement.remove();

    bookElement?.destroy();
    destroySizer();
  };
  flexibleBookElement.elementTagIdentifier = FlexibleBookIdentifier;

  return flexibleBookElement;
};

export default FlexibleBookComponent;
