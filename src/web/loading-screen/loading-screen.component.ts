import cssStyles from './loading-screen.module.css';

import div from '../../elements/div.function';
import pageStylesToStyleDeclaration from '../../utils/container-style-to-style-declaration.function';
import merge from '../../utils/merge.function';
import BookIcon from '../assets/book-open-svgrepo-com.svg';
import CreateBookElement from '../book/create-book-element.interface';
import getBookStyles from '../book/initialization/get-book-styles.function';
import { DefaultBookTheme } from '../book/theming';
import LoadingScreenElement from './loading-screen-element.interface';

type CreateLoadingScreenElement = (
  requiredArgs?: Partial<Omit<Parameters<CreateBookElement>[0], 'pages'>>,
  optionalArgs?: Parameters<CreateBookElement>[1],
  elementConfig?: Parameters<CreateBookElement>[2]
) => LoadingScreenElement;

/**
 * Useful as a loading screen when the book is being loaded from the server.
 * Best used with the same theme as when the book is loaded. 'pageStyles' is also recommended to fill,
 * even if it's not the most accurate dimensions of the final book.
 * It takes in the arguments you would normally pass into the book.
 */
const LoadingScreenComponent: CreateLoadingScreenElement = (
  { pageStyles } = {},
  { theme = DefaultBookTheme, pagesShown = 1 } = {},
  elementConfig = {}
) => {
  let styles: Partial<CSSStyleDeclaration> = {
    height: '100%',
    width: '100%',
  };

  if (pageStyles) {
    const userDefinedPageStyles = pageStylesToStyleDeclaration(pageStyles);

    const [bookStyles, calculatedPageStyles] = getBookStyles(
      pageStyles,
      userDefinedPageStyles,
      pagesShown
    );

    styles = merge(bookStyles, calculatedPageStyles);
  }

  const classnames = [cssStyles.loadingScreen];

  if (theme) {
    if (theme.className) {
      classnames.push(theme.className);
    }

    if (theme.pageClassName) {
      classnames.push(theme.pageClassName);
    }
  }

  const screen = div(
    merge(
      {
        classnames,
        styles,
      },
      elementConfig
    )
  ) as unknown as LoadingScreenElement;

  const svg = document.createElement('object');
  svg.type = 'image/svg+xml';
  svg.data = BookIcon;
  svg.className = cssStyles.loadingScreenIcon;

  screen.appendChild(svg);

  screen.prospero = {
    destroy: () => {
      screen.remove();
    },
    type: 'loading-screen',
  };

  return screen;
};

export default LoadingScreenComponent;
