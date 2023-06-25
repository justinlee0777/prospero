import CreateElementConfig from '../../elements/create-element.config';
import BooksElement from './books-element.interface';

export default interface CreateBooksElement {
  (config?: CreateElementConfig): BooksElement;
}
