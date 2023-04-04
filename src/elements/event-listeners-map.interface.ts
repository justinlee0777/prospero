type EventListenersMap = Record<
  keyof HTMLElementEventMap,
  EventListenerOrEventListenerObject
>;

export default EventListenersMap;
