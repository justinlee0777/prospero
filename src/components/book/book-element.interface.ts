import PageChangeEvent from './page-change-event.interface';

export default interface BookElement extends HTMLElement {
  onpagechange?: (event: PageChangeEvent) => void;
}
