import AddListeners from '../model/add-listeners.interface';

const listenToClickEvents: AddListeners = (book, [decrement, increment]) => {
  function flipPage(event: MouseEvent) {
    const midpoint = book.clientWidth / 2;
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
