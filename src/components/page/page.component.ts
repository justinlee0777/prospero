import './page.css';

import div from '../../elements/div.function';
import pageClassName from './page-class-name.const';
import PageElement from './page-element.interface';
import { PageFlipAnimation } from './page-flip-animation.enum';

export default function Page(textContent: string): PageElement {
  const page = div({
    textContent,
    classnames: [pageClassName],
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
}
