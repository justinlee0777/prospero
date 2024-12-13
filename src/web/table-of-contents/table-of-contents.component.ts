import styles from './table-of-contents.module.css';

import button from '../../elements/button.function';
import CreateElementConfig from '../../elements/create-element.config';
import li from '../../elements/li.function';
import ul from '../../elements/ul.function';
import { TableOfContentsConfig } from '../../models/table-of-contents.interface';
import merge from '../../utils/merge.function';
import TableOfContentsElement from './table-of-contents-element.interface';

export default function TableOfContentsComponent(
  config: TableOfContentsConfig,
  elementConfig: CreateElementConfig = {}
): TableOfContentsElement {
  const tableOfContents = ul(
    merge({ classnames: [styles.tableOfContents] }, elementConfig)
  ) as unknown as TableOfContentsElement;

  const closeButton = button({
    classnames: [styles.closeButton],
    textContent: '\u2190',
    eventListeners: {
      click: (event) => {
        event.stopPropagation();
        tableOfContents.onpaneclose?.();
      },
    },
  });

  tableOfContents.appendChild(closeButton);

  config.sections.forEach(({ title, pageNumber }) => {
    const sectionElement = li({
      classnames: [styles.tableOfContentsSection],
      textContent: `${title} (${pageNumber + 1})`,
    });

    sectionElement.tabIndex = 0;
    sectionElement.onclick = (event) => {
      event.stopPropagation();
      tableOfContents.onpageselected?.(pageNumber);
    };

    tableOfContents.appendChild(sectionElement);
  });

  tableOfContents.prospero = {
    destroy: () => tableOfContents.remove(),
    type: 'tableOfContents',
  };

  return tableOfContents;
}
