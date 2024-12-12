import CreateElement from './create-element.interface';
import setElement from './set-element.function';

const button: CreateElement<HTMLButtonElement> = (...args) => {
  const element = document.createElement('button');

  setElement(element, ...args);

  return element;
};

export default button;
