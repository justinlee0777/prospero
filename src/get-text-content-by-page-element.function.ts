import getTextContent from './get-text-content.function';
import toPixelUnits from './utils/to-pixel-units.function';

export default function getTextContentByPageElement(
  pageElement: HTMLElement,
  textContent: string
): Generator<string> {
  const style = window.getComputedStyle(pageElement);

  return getTextContent(
    {
      width: toPixelUnits(style.width),
      height: toPixelUnits(style.height),
      lineHeight: toPixelUnits(style.lineHeight),
      computedFontFamily: style.fontFamily,
      computedFontSize: style.fontSize,
      padding: {
        top: toPixelUnits(style.paddingTop),
        right: toPixelUnits(style.paddingRight),
        bottom: toPixelUnits(style.paddingBottom),
        left: toPixelUnits(style.paddingLeft),
      },
      margin: {
        top: toPixelUnits(style.marginTop),
        right: toPixelUnits(style.marginRight),
        bottom: toPixelUnits(style.marginBottom),
        left: toPixelUnits(style.marginLeft),
      },
      border: {
        top: toPixelUnits(style.borderTopWidth),
        right: toPixelUnits(style.borderRightWidth),
        bottom: toPixelUnits(style.borderBottomWidth),
        left: toPixelUnits(style.borderLeftWidth),
      },
    },
    textContent
  );
}
