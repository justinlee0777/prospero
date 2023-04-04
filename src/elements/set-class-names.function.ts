export default function setClassNames(
  element: HTMLElement,
  classNames: Array<string>
): void {
  element.classList.add(...classNames);
}
