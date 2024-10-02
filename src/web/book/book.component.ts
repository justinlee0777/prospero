import 'picture-in-picture-js/index.css';
import styles from './book.module.css';

import type { HTMLPIPElement } from 'picture-in-picture-js';
import { createTriggerElement } from 'picture-in-picture-js';

import CreateElementConfig from '../../elements/create-element.config';
import GetPage from '../../models/get-page.interface';
import merge from '../../utils/merge.function';
import normalizePageStyles from '../../utils/normalize-page-styles.function';
import NullaryFn from '../../utils/nullary-fn.type';
import BookmarkComponent from '../bookmark/bookmark.component';
import LaminaElement from '../lamina/lamina-element.interface';
import LaminaComponent from '../lamina/lamina.component';
import LoadingIconComponent from '../loading-icon/loading-icon.component';
import PagePickerComponent from '../page-picker/page-picker.component';
import PageNumberingAlignment from '../page/page-numbering-alignment.enum';
import pageSelector from '../page/page-selector.const';
import PageComponent from '../page/page.component';
import BookConfig from './book-config.interface';
import BookElement from './book-element.interface';
import CreateBookElement from './create-book-element.interface';
import defaultBookConfig from './default-book-config.const';
import getBookStyles from './initialization/get-book-styles.function';
import initialize from './initialization/initialize.function';
import PageChangeEvent from './page-change-event.interface';
import RequiredBookArgs from './required-book-args.interface';

class BookComponent {
  private bookElement: BookElement;

  private currentPage: number;

  private pageNumberUpdates: Array<(pageNumber: number) => void> = [];

  private lamina: LaminaElement;

  private overlay: HTMLPIPElement | undefined;

  constructor(
    private args: RequiredBookArgs,
    private bookConfig: BookConfig = defaultBookConfig,
    private elementConfig: CreateElementConfig = {}
  ) {
    this.bookConfig = bookConfig = {
      ...defaultBookConfig,
      ...bookConfig,
    };

    const {
      pageStyles: userDefinedPageStyles,
      pagesShown,
      media,
      animation,
      listeners,
      showBookmark,
      theme,
    } = bookConfig;

    this.currentPage = bookConfig.currentPage ?? 0;

    let { pageStyles } = args;
    pageStyles = normalizePageStyles(pageStyles);

    const [bookStyles, calculatedPageStyles] = getBookStyles(
      pageStyles,
      userDefinedPageStyles,
      pagesShown
    );

    const destroyCallbacks = [];

    this.lamina = LaminaComponent();

    const book = initialize(
      {
        media,
        prospero: {
          type: 'book',
          destroy: () => {
            book.remove();
            destroyCallbacks.forEach((callback) => callback());
          },
        },
      },
      merge(
        {
          classnames: [styles.book, theme?.className],
          styles: {
            ...(this.elementConfig.styles ?? {}),
            ...bookStyles,
          },
          children: [this.lamina],
        },
        this.elementConfig
      )
    );

    elementConfig = merge(elementConfig, {
      styles: {
        ...calculatedPageStyles,
      },
      classnames: [theme?.pageClassName],
    });

    const decrement = () => this.updatePage(this.currentPage - pagesShown);
    const increment = () => this.updatePage(this.currentPage + pagesShown);

    destroyCallbacks.push(
      ...listeners.map((listener) => listener(book, [decrement, increment])),
      () => this.lamina.prospero.destroy()
    );

    // Add page picker if configured
    if (bookConfig.showPagePicker) {
      const pagePicker = PagePickerComponent({
        classnames: [styles.bookPagePicker],
      });

      this.lamina.appendChild(pagePicker);

      // 'goToPage' is based off 0 while the client goes by 1. Therefore, offset by 1.
      pagePicker.onpagechange = async (pageNumber) => {
        const newPage = pageNumber - 1;
        if (newPage !== this.currentPage) {
          const pageChanged = await this.updatePage(newPage);

          const invalidClass = styles.bookPagePickerInvalid;

          if (!pageChanged) {
            pagePicker.classList.add(invalidClass);
          } else {
            pagePicker.classList.remove(invalidClass);
          }
        }
      };

      destroyCallbacks.push(() => pagePicker.prospero.destroy());
    }

    // Add bookmark if configured
    if (showBookmark) {
      const bookmarkStorage = showBookmark.storage;

      const bookmark = BookmarkComponent(bookmarkStorage, {
        classnames: [styles.bookBookmark],
      });

      /*
       * Used to prevent flashing content.
       * If the bookmark is retrieved before 1000 milliseconds, go to the bookmarked page.
       * If not, then go to the 0th page. It is acceptable for the request to complete after 1000ms.
       */
      const timeoutId = setTimeout(() => this.goToPage(this.currentPage), 1000);
      bookmark.onbookmarkretrieval = ({ pageNumber }) => {
        this.goToPage((this.currentPage = pageNumber));

        animation?.initialize({ pageNumber });

        clearTimeout(timeoutId);
      };

      bookmark.pagenumber = this.currentPage;

      this.lamina.appendChild(bookmark);

      this.pageNumberUpdates.push(
        (pageNumber) => (bookmark.pagenumber = pageNumber)
      );

      destroyCallbacks.push(() => bookmark.prospero.destroy());
    } else {
      this.goToPage(this.currentPage);
    }

    this.bookElement = book;
  }

  getElement(): BookElement {
    return this.bookElement;
  }

  private async updatePage(pageNumber: number) {
    const oldPage = this.currentPage;

    const destroyLoadingIcon = this.addLoadingIcon(this.lamina);

    let pageChanged = false;

    try {
      pageChanged = await this.goToPage(pageNumber);
    } finally {
      destroyLoadingIcon();
    }

    if (!pageChanged) {
      this.currentPage = oldPage;
    } else {
      this.currentPage = pageNumber;
      this.pageNumberUpdates.forEach((update) => update(this.currentPage));
    }

    return pageChanged;
  }

  private async goToPage(pageNumber: number): Promise<boolean> {
    const { pagesShown } = this.bookConfig;

    const leftmostPage = pageNumber - (pageNumber % pagesShown);
    const pageNumbers = Array(pagesShown)
      .fill(undefined)
      .map((_, i) => leftmostPage + i);

    const offset = 100 / pagesShown;

    const pageContent = await Promise.all(
      pageNumbers.map((number) =>
        Promise.resolve(this.getPage(number)).then((content) => ({
          number,
          content,
        }))
      )
    );

    if (pageContent.every(({ content }) => content === null)) {
      return false;
    }

    const oldPages = [
      ...this.bookElement.querySelectorAll(pageSelector),
    ] as Array<PageComponent>;

    const pages = pageContent.map(({ number, content }, i) => {
      let numbering;

      if (this.bookConfig.showPageNumbers) {
        numbering = {
          alignment:
            number % 2 === 0
              ? PageNumberingAlignment.LEFT
              : PageNumberingAlignment.RIGHT,
          pageNumber: number + 1,
        };
      }

      const pageComponent = PageComponent(
        {
          numbering,
        },
        merge<CreateElementConfig>(
          {
            innerHTML: content,
            styles: {
              left: `${offset * i}%`,
            },
          },
          this.elementConfig
        )
      );

      const { pictureInPicture } = this.bookConfig;

      if (pictureInPicture) {
        const affectedElements = pageComponent.querySelectorAll(
          pictureInPicture.affectedElements
        );

        affectedElements.forEach((affectedElement, elIndex) => {
          const key = `pip-page-${i}-index-${elIndex}`;

          const triggerElement = createTriggerElement(affectedElement, {
            replaceWith: true,
            autoLock: pictureInPicture.autoLock,
            onpipcreated: (pip) => {
              this.overlay = pip;
              this.overlay.id = key;
            },
            onpipdestroyed: () => {
              this.overlay = undefined;
            },
            existingPIP: this.overlay?.id === key && this.overlay,
          });

          triggerElement.onclick = (event) => event.stopPropagation();
        });
      }

      return pageComponent;
    });

    /*
     * The animation handles the actual page changing as it may need to control
     * how and when the pages are deleted.
     */
    const animationFinished = this.bookConfig.animation.changePage(
      this.bookElement,
      pageNumber,
      oldPages,
      pages
    );

    const pageChangeEvent: PageChangeEvent = {
      pageNumber,
      animationFinished,
    };

    this.bookElement.onpagechange?.(pageChangeEvent);

    return true;
  }

  private async getPage(pageNumber: number): Promise<string | null> {
    let getPage: GetPage;

    if ('pages' in this.args) {
      const { pages } = this.args;
      getPage = (pageNumber) => {
        if (pageNumber < 0 || pageNumber >= pages.length) {
          return null;
        } else {
          return pages[pageNumber];
        }
      };
    } else {
      getPage = this.args.getPage;
    }

    return getPage(pageNumber);
  }

  /**
   *
   * @returns destruction of loading icon.
   */
  private addLoadingIcon(parent: HTMLElement): NullaryFn {
    const loadingIcon = LoadingIconComponent({
      classnames: [styles.bookLoadingIcon],
    });

    parent.appendChild(loadingIcon);

    return () => loadingIcon.prospero.destroy();
  }
}

const createBookElement: CreateBookElement = (
  requiredArgs,
  optionalArgs,
  config
) => new BookComponent(requiredArgs, optionalArgs, config).getElement();

export default createBookElement;
