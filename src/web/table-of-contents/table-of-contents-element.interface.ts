import Component from '../model/component.interface';

export default interface TableOfContentsElement extends HTMLElement, Component {
  onpaneclose?: () => void;
  onpageselected?: (pageNumber: number) => void;
}
