import Component from '../model/component.interface';

export default interface PagePickerElement extends HTMLInputElement, Component {
  /**
   * @param pageNumber the user is attempting to go to.
   */
  onpagechange?: (pageNumber: number) => void;
}
