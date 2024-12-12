import button from '../../elements/button.function';
import CreateElementConfig from '../../elements/create-element.config';
import merge from '../../utils/merge.function';
import TableOfContentsIcon from '../assets/toc.svg';
import TableOfContentsButtonElement from './table-of-contents-button-element.interface';
import styles from './table-of-contents-button.module.css';

export default function TableOfContentsButtonComponent(
  elementConfig: CreateElementConfig = {}
): TableOfContentsButtonElement {
  const tableOfContentsButton = button(
    merge({ classnames: [styles.tableOfContentsButton] }, elementConfig)
  ) as unknown as TableOfContentsButtonElement;

  const svg = document.createElement('object');
  svg.type = 'image/svg+xml';
  svg.data = TableOfContentsIcon;
  svg.style.pointerEvents = 'none';

  tableOfContentsButton.appendChild(svg);

  // Needed for focus, apparently.
  tableOfContentsButton.tabIndex = 0;

  tableOfContentsButton.prospero = {
    destroy: () => tableOfContentsButton.remove(),
    type: 'tableOfContentsButton',
  };

  return tableOfContentsButton;
}
