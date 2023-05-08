import styles from './page.module.css';

import div from '../../elements/div.function';
import CreatePageElement from './create-page-element.interface';
import pageClassName from './page-class-name.const';
import PageComponent from './page-element.interface';

const PageComponent: CreatePageElement = (pageConfig, config = {}) => {
  const classnames = [pageClassName].concat(config?.classnames ?? []);

  const numbering = div({
    classnames: [styles.pageNumber],
    textContent: pageConfig.numbering.pageNumber.toString(),
    styles: {
      [pageConfig.numbering.alignment]: '1em',
    },
  });

  const page = div({
    ...config,
    classnames,
    children: [numbering],
  }) as unknown as PageComponent;

  page.destroy = () => page.remove();

  return page;
};

export default PageComponent;
