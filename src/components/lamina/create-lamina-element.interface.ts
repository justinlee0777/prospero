import CreateElementConfig from '../../elements/create-element.config';
import LaminaElement from './lamina-element.interface';

export default interface CreateLaminaElement {
  (elementConfig?: CreateElementConfig): LaminaElement;
}
