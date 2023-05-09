import { merge } from 'lodash-es';

import CreateElementConfig from '../../elements/create-element.config';
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
import normalizeContainerStyle from './normalize-container-style.function';

/**
 * A magic book that stretches to the edges of the screen. This is perfect for short articles/essays (~2500 words).
 * This component creates a Book as a child based on the screen width.
 * The element by default is the height and width of the window. To constrain the size, it is recommended to
 * use viewport units/pixels for the width/height CSS properties (ex. min-width, max-width).
 */
const FlexibleBookComponent: CreateFlexibleBookElement = (
  requiredArgs,
  { fontLocation, createProcessors } = {},
  elementConfig = {}
) => {
  const { containerStyle, text } = requiredArgs;

  const normalizedContainerStyle = normalizeContainerStyle(containerStyle);

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
    bookElement?.remove();

    const bookConfig =
      mediaQueryList.find((mediaQuery) => mediaQuery.matches)?.config ??
      fallback;

    const processors = createProcessors?.() ?? [];

    const [pages] = new PagesBuilder()
      .setFont(
        normalizedContainerStyle.computedFontSize,
        normalizedContainerStyle.computedFontFamily,
        fontLocation
      )
      .setLineHeight(normalizedContainerStyle.lineHeight)
      .setMargin(normalizedContainerStyle.margin)
      .setPadding(normalizedContainerStyle.padding)
      .setBorder(normalizedContainerStyle.border)
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

  const destroySizer = MediaQueryListenerFactory.createSizer(
    {
      size,
    },
    flexibleBookElement
  );

  flexibleBookElement.destroy = () => {
    bookElement?.destroy();
    destroySizer();
  };
  flexibleBookElement.elementTagIdentifier = FlexibleBookIdentifier;

  return flexibleBookElement;
};

export default FlexibleBookComponent;
