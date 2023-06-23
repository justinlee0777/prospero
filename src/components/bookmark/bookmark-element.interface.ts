import Component from '../model/component.interface';
import BookmarkData from './bookmark-data.interface';

export default interface BookmarkElement extends HTMLElement, Component {
  pagenumber: number;

  /** */
  onbookmarkretrieval?: (bookmark: BookmarkData) => void;
}
