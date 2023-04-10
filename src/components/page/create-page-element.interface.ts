import { CreateElementConfig } from '../../elements/create-element.interface';
import PageElement from './page-element.interface';
import PageNumberingAlignment from './page-numbering-alignment.enum';

interface PageArgs {
  numbering: {
    pageNumber: number;
    alignment: PageNumberingAlignment;
  };
}

export default interface CreatePageElement {
  (pageArgs: PageArgs, config?: CreateElementConfig): PageElement;
}
