import CreateElement from './create-element.interface';
import setARIA from './set-aria.function';
import setAttributes from './set-attributes.function';
import setChildren from './set-children.function';
import setClassNames from './set-class-names.function';
import setEventListeners from './set-event-listeners.function';
import setInnerHTML from './set-inner-html.function';
import setStyles from './set-styles.function';
import setTextContent from './set-text-content.function';

export default function setElement(
  element: HTMLElement,
  ...[config]: Parameters<CreateElement<HTMLElement>>
): void {
  if (!config) {
    return;
  }

  config.textContent && setTextContent(element, config.textContent);
  config.innerHTML && setInnerHTML(element, config.innerHTML);
  config.children && setChildren(element, config.children);
  config.classnames && setClassNames(element, config.classnames);
  config.attributes && setAttributes(element, config.attributes);
  config.styles && setStyles(element, config.styles);
  config.eventListeners && setEventListeners(element, config.eventListeners);
  config.aria && setARIA(element, config.aria);
}
