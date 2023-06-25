import CreateElementConfig from '../../elements/create-element.config';
import BookConfig from './book-config.interface';
import BookElement from './book-element.interface';
import RequiredBookArgs from './required-book-args.interface';

export default interface CreateBookElement {
  (
    requiredArgs: RequiredBookArgs,
    optionalArgs?: BookConfig,
    config?: CreateElementConfig
  ): BookElement;
}
