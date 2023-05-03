import CreateElementConfig from './create-element.config';

export default interface CreateElement<T extends HTMLElement> {
  (config?: CreateElementConfig): T;
}
