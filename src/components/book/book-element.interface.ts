import PageChangeEvent from './page-change-event.interface';

export default interface BookElement extends HTMLElement {
  destroy(): void;

  onpagechange?: (event: PageChangeEvent) => void;
}
