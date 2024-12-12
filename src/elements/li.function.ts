import CreateElement from './create-element.interface';
import setElement from './set-element.function';

const li: CreateElement<HTMLLIElement> = (...args) => {
  const element = document.createElement('li');

  setElement(element, ...args);

  return element;
};

export default li;
