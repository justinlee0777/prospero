export default function setAttributes(
  element: HTMLElement,
  attributes: Object
): void {
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}
