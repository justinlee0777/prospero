import styles from './page.module.css';

import div from '../../elements/div.function';
import merge from '../../utils/merge.function';
import CreatePageElement from './create-page-element.interface';
import pageClassName from './page-class-name.const';
import PageComponent from './page-element.interface';

const PageComponent: CreatePageElement = (pageConfig, config = {}) => {
  const children = [];

  if (pageConfig.numbering) {
    const numbering = div({
      classnames: [styles.pageNumber],
      textContent: pageConfig.numbering.pageNumber.toString(),
      styles: {
        [pageConfig.numbering.alignment]: '1em',
      },
    });

    children.push(numbering);
  }

  const page = div(
    merge(
      {
        classnames: [pageClassName],
        children,
      },
      config
    )
  ) as unknown as PageComponent;

  page.destroy = () => page.remove();

  return page;
};

export default PageComponent;
