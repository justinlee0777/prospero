import EventListenersMap from './event-listeners-map.interface';

export default interface CreateElementConfig {
  textContent?: string;
  innerHTML?: string;
  children?: Array<Node>;
  classnames?: Array<string>;
  attributes?: Object;
  styles?: Partial<CSSStyleDeclaration>;
  eventListeners?: Partial<EventListenersMap>;
}
