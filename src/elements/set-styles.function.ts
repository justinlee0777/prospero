export default function setStyles(
  element: HTMLElement,
  styles: Partial<CSSStyleDeclaration>
): void {
  Object.entries(styles).forEach(([key, value]) => {
    (element.style as any)[key] = value;
  });
}
