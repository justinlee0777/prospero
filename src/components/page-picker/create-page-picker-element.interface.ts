import CreateElementConfig from '../../elements/create-element.config';
import PagePickerElement from './page-picker-element.interface';

export default interface CreatePagePickerElement {
  (elementConfig?: CreateElementConfig): PagePickerElement;
}
