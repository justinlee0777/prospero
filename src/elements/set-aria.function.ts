import CreateElementConfig from './create-element.config';

export default function setARIA(
  element: HTMLElement,
  ariaConfig: CreateElementConfig['aria']
): void {
  ariaConfig?.label && (element.ariaLabel = ariaConfig.label);
}
