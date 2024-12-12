import CreateElement from './create-element.interface';
import setElement from './set-element.function';

const ul: CreateElement<HTMLUListElement> = (...args) => {
  const element = document.createElement('ul');

  setElement(element, ...args);

  return element;
};

export default ul;
