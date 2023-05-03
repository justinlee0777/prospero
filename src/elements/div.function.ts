import CreateElement from './create-element.interface';
import setElement from './set-element.function';

const div: CreateElement<HTMLDivElement> = (...args) => {
  const element = document.createElement('div');

  setElement(element, ...args);

  return element;
};

export default div;
