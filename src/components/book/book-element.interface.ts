import Component from '../model/component.interface';
import BookAttributes from './book-attributes.interface';
import PageChangeEvent from './page-change-event.interface';

export default interface BookElement
  extends HTMLElement,
    Component,
    BookAttributes {
  /** User callback for when a page changes. */
  onpagechange?: (event: PageChangeEvent) => void;
}
