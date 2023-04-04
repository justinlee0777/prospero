import CreateElement from './create-element.interface';
import setClassNames from './set-class-names.function';
import setEventListeners from './set-event-listeners.function';
import setStyles from './set-styles.function';
import setTextContent from './set-text-content.function';

export function setElement(
  element: HTMLElement,
  ...[config]: Parameters<CreateElement<HTMLElement>>
): void {
  if (!config) {
    return;
  }

  config.textContent && setTextContent(element, config.textContent);
  config.classnames && setClassNames(element, config.classnames);
  config.styles && setStyles(element, config.styles);
  config.eventListeners && setEventListeners(element, config.eventListeners);
}
