import EventListenersMap from './event-listeners-map.interface';

/**
 * TODO: Remember to destroy event listeners.
 */
export default function setEventListeners(
  element: HTMLElement,
  eventListeners: Partial<EventListenersMap>
): void {
  Object.entries(eventListeners).forEach(([eventName, callback]) => {
    element.addEventListener(eventName, callback);
  });
}
