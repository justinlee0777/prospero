import AddListeners from '../../model/add-listeners.interface';

const listenToClickEvents: AddListeners = (book, [decrement, increment]) => {
  function flipPage(event: MouseEvent) {
    const eventTarget = event.target;

    if ((eventTarget as HTMLElement)['tagName'] === 'A') {
      // Do nothing if an anchor tag is clicked on.
      return;
    }

    const { x, width } = book.getBoundingClientRect();
    const midpoint = x + width / 2;
    if (event.clientX >= midpoint) {
      increment();
    } else {
      decrement();
    }
  }

  book.addEventListener('click', flipPage);

  return () => book.removeEventListener('click', flipPage);
};

export default listenToClickEvents;
