import EventListenersMap from './event-listeners-map.interface';

export interface CreateElementConfig {
  textContent?: string;
  children?: Array<Node>;
  classnames?: Array<string>;
  attributes?: Object;
  styles?: Partial<CSSStyleDeclaration>;
  eventListeners?: Partial<EventListenersMap>;
}

export default interface CreateElement<T extends HTMLElement> {
  (config?: CreateElementConfig): T;
}
