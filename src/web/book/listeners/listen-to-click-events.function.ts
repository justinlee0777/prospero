import AddListeners from '../../model/add-listeners.interface';

const listenToClickEvents: AddListeners = (book, [decrement, increment]) => {
  function flipPage(event: MouseEvent) {
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
