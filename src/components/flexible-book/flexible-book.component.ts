import div from '../../elements/div.function';
import PagesBuilder from '../../pages.builder';
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
 * A magic book that stretches to the edges of the screen.
 */
const FlexibleBookComponent: CreateFlexibleBookElement = (
  { config, containerStyle, text },
  { fontLocation, createProcessors, margin } = {
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  },
  elementConfig
) => {
  let fallback: BookConfig;
  let mediaQueryList: Array<FlexibleBookMediaQuery & { matches: boolean }> = [];

  if (Symbol.iterator in config) {
    fallback = config[0];
    const [, ...configs] = [...config];
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
    fallback = config;
  }

  const flexibleBookElement = div({
    styles: {
      margin: `${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px`,
    },
    ...elementConfig,
  }) as unknown as FlexibleBookElement;
  let bookElement: BookElement | undefined;

  const size: MediaQuerySizerConfig['size'] = (width, height) => {
    bookElement?.destroy();
    bookElement?.remove();

    width = width - margin.right - margin.left;
    height = height - margin.top - margin.bottom;

    const bookConfig =
      mediaQueryList.find((mediaQuery) => mediaQuery.matches)?.config ??
      fallback;

    const processors = createProcessors?.() ?? [];

    const [pages] = new PagesBuilder()
      .setFont(
        containerStyle.computedFontSize,
        containerStyle.computedFontFamily,
        fontLocation
      )
      .setLineHeight(containerStyle.lineHeight)
      .setMargin(containerStyle.margin)
      .setPadding(containerStyle.padding)
      .setBorder(containerStyle.border)
      .setProcessors(processors)
      .setText(text)
      .addSize(width / (bookConfig.pagesShown ?? 1), height)
      .build();

    bookElement = BookComponent(
      {
        getPage: (pageNumber) => pages.get(pageNumber),
        containerStyles: pages.getContainerStyle(),
      },
      bookConfig
    );

    flexibleBookElement.appendChild(bookElement);
  };

  const destroySizer = MediaQueryListenerFactory.createSizer({
    size,
  });

  flexibleBookElement.destroy = () => {
    bookElement?.destroy();
    destroySizer();
  };
  flexibleBookElement.elementTagIdentifier = FlexibleBookIdentifier;

  return flexibleBookElement;
};

export default FlexibleBookComponent;
