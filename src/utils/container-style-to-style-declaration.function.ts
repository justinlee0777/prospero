import ContainerStyle from '../container-style.interface';
import toPixelUnits from './to-pixel-units.function';

export default function containerStyleToStyleDeclaration(
  containerStyle: ContainerStyle
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
  } = containerStyle;

  const fontSizeInPixels = toPixelUnits(computedFontSize);
  const unitlessLineHeight = lineHeight / fontSizeInPixels;

  return {
    width: `${width}px`,
    height: `${height}px`,
    fontSize: computedFontSize,
    fontFamily: computedFontFamily,
    lineHeight: unitlessLineHeight.toString(),
    paddingTop: `${padding.top}px`,
    paddingRight: `${padding.right}px`,
    paddingBottom: `${padding.bottom}px`,
    paddingLeft: `${padding.left}px`,
    marginTop: `${margin.top}px`,
    marginRight: `${margin.right}px`,
    marginBottom: `${margin.bottom}px`,
    marginLeft: `${margin.left}px`,
    borderTopWidth: `${border.top}px`,
    borderRightWidth: `${border.right}px`,
    borderBottomWidth: `${border.bottom}px`,
    borderLeftWidth: `${border.left}px`,
  };
}