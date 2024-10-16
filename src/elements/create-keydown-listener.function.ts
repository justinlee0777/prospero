interface KeyCodesFunctionMap {
  [code: KeyboardEvent['code']]: EventListenerOrEventListenerObject;
}

export default function createKeydownListener(
  map: KeyCodesFunctionMap
): EventListenerOrEventListenerObject {
  return (event: Event) => {
    const keyCode = (event as KeyboardEvent).code;

    Object.entries(map).forEach(([matchingCode, callback]) => {
      if (keyCode === matchingCode) {
        typeof callback === 'object'
          ? callback.handleEvent(event)
          : callback(event);
      }
    });
  };
}
