export default function setChildren(
  element: HTMLElement,
  nodes: Array<Node>
): void {
  element.append(...nodes);
}
