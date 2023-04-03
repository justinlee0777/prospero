/**
 * @param callback - if 'callback' is invoked multiple times, it will only be called once after the specified time so as to reduce wasted calls.
 */
export default function debounce(
  callback: () => void,
  delayInMilliseconds = 300
): () => void {
  let locked = false;

  return async function () {
    if (!locked) {
      locked = true;
      await new Promise<void>((resolve) =>
        setTimeout(() => {
          locked = false;
          callback();
          resolve();
        }, delayInMilliseconds)
      );
    }
  };
}
