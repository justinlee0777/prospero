import PageStyles from '../models/page-styles.interface';
import toPixelUnits from './to-pixel-units.function';

export default function pageStylesToStyleDeclaration(
  pageStyles: PageStyles
): Partial<CSSStyleDeclaration> {
  const {
    width,
    height,
    computedFontSize,
    computedFontFamily,
    lineHeight,
    padding,
    margin,
    border,
  } = pageStyles;

  const fontSizeInPixels = toPixelUnits(computedFontSize);
  const unitlessLineHeight = lineHeight / fontSizeInPixels;

  return {
    width: `${width}px`,
    height: `${height}px`,
    fontSize: computedFontSize,
    fontFamily: computedFontFamily,
    lineHeight: unitlessLineHeight.toString(),
    paddingTop: `${padding?.top ?? 0}px`,
    paddingRight: `${padding?.right ?? 0}px`,
    paddingBottom: `${padding?.bottom ?? 0}px`,
    paddingLeft: `${padding?.left ?? 0}px`,
    marginTop: `${margin?.top ?? 0}px`,
    marginRight: `${margin?.right ?? 0}px`,
    marginBottom: `${margin?.bottom ?? 0}px`,
    marginLeft: `${margin?.left ?? 0}px`,
    borderTopWidth: `${border?.top ?? 0}px`,
    borderRightWidth: `${border?.right ?? 0}px`,
    borderBottomWidth: `${border?.bottom ?? 0}px`,
    borderLeftWidth: `${border?.left ?? 0}px`,
  };
}
