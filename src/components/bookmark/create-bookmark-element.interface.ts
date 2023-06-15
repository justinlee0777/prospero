import CreateElementConfig from '../../elements/create-element.config';
import BookmarkElement from './bookmark-element.interface';
import BookmarkStorage from './bookmark-storage.interface';

export default interface CreateBookmarkElement {
  (
    storage: BookmarkStorage,
    elementConfig?: CreateElementConfig
  ): BookmarkElement;
}
