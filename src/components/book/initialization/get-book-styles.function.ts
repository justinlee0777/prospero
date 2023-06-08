import ContainerStyle from '../../../container-style.interface';
import containerStyleToStyleDeclaration from '../../../utils/container-style-to-style-declaration.function';
import toPixelUnits from '../../../utils/to-pixel-units.function';

/**
 * @params pagesShown is used to double the book width (so as to fit the pages)
 * @returns tuple. First element is the book styling, the second is the page styling
 */
export default function getBookStyles(
  containerStyles: ContainerStyle,
  userDefinedPageStyles: Partial<CSSStyleDeclaration>,
  pagesShown: number
): [Partial<CSSStyleDeclaration>, Partial<CSSStyleDeclaration>] {
  let bookStyles: Partial<CSSStyleDeclaration>;
  let pageStyles: Partial<CSSStyleDeclaration>;

  if (containerStyles) {
    const styles = containerStyleToStyleDeclaration(containerStyles);

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

    pageStyles = {
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

  return [bookStyles, pageStyles];
}
