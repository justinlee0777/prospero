import PageStyles from '../../../models/page-styles.interface';
import pageStylesToStyleDeclaration from '../../../utils/container-style-to-style-declaration.function';
import toPixelUnits from '../../../utils/to-pixel-units.function';

/**
 * @params pagesShown is used to double the book width (so as to fit the pages)
 * @returns tuple. First element is the book styling, the second is the page styling
 */
export default function getBookStyles(
  pageStyles: PageStyles,
  userDefinedPageStyles: Partial<CSSStyleDeclaration>,
  pagesShown: number
): [Partial<CSSStyleDeclaration>, Partial<CSSStyleDeclaration>] {
  let bookStyles: Partial<CSSStyleDeclaration>;
  let calculatedPageStyles: Partial<CSSStyleDeclaration>;

  if (pageStyles) {
    const styles = pageStylesToStyleDeclaration(pageStyles);

    const bookWidth = `${toPixelUnits(styles.width) * pagesShown}px`;
    const pageWidth = styles.width;

    bookStyles = {
      width: bookWidth,
      height: styles.height,
      fontSize: styles.fontSize,
      fontFamily: styles.fontFamily,
      lineHeight: styles.lineHeight,
      borderTopWidth: styles.borderTopWidth,
      borderRightWidth: styles.borderRightWidth,
      borderBottomWidth: styles.borderBottomWidth,
      borderLeftWidth: styles.borderLeftWidth,
    };

    console.log({
      bookStyles,
    })

    calculatedPageStyles = {
      ...userDefinedPageStyles,
      width: pageWidth,
      paddingTop: styles.paddingTop,
      paddingRight: styles.paddingRight,
      paddingBottom: styles.paddingBottom,
      paddingLeft: styles.paddingLeft,
      marginTop: styles.marginTop,
      marginRight: styles.marginRight,
      marginBottom: styles.marginBottom,
      marginLeft: styles.marginLeft,
    };
  }

  return [bookStyles, calculatedPageStyles];
}
