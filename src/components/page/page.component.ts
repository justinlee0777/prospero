import styles from './page.module.css';

import div from '../../elements/div.function';
import CreatePageElement from './create-page-element.interface';
import pageClassName from './page-class-name.const';
import PageElement from './page-element.interface';
import PageFlipAnimation from './page-flip-animation.enum';

const Page: CreatePageElement = (pageConfig, config = {}) => {
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
  }) as unknown as PageElement;

  let resolveDestruction: (pageFlip?: PageFlipAnimation) => void;

  const destruction = new Promise((resolve) => (resolveDestruction = resolve))
    .then((pageFlip?: PageFlipAnimation) => {
      if (pageFlip) {
        const transform = ['skewY(0) translateX(0) scaleX(1)'];

        switch (pageFlip) {
          case PageFlipAnimation.RIGHT:
            transform.push('skewY(-30deg) translateX(-100%) scaleX(.5)');
            break;
          case PageFlipAnimation.LEFT:
            transform.push('skewY(30deg) translateX(100%) scaleX(.5)');
            break;
        }

        return page
          .animate(
            {
              transform,
            },
            600
          )
          .finished.then<void>();
      } else {
        return Promise.resolve();
      }
    })
    .then(() => page.remove());

  page.destroy = (animation) => {
    resolveDestruction(animation?.pageFlip);
    return destruction;
  };

  return page;
};

export default Page;
