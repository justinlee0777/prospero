# Prospero: Render text on the web as a book

> To work mine end upon their senses that<br/>
> This airy charm is for, I’ll break my staff,<br/>
> Bury it certain fathoms in the earth,<br/>
> And deeper than did ever plummet sound<br/>
> I’ll drown my book.<br/>

- Prospero, _The Tempest_ by William Shakespeare

As Prospero set aside his books, forsaking their awesome powers, so we shall set aside physical books for electronic ones.

### Installation

To install `prospero` in your project, run:

```
npm install prospero
```

### Usage

`prospero` has two barrel entry-points: `prospero/server` and `prospero/web`. For tree-shaking, there are individual entry-points divided by utility as exposed in `exports` of the `package.json`.

`prospero/server` uses dependencies from the Node environment. `Pages` (`prospero/server/pages`) takes text and paginates them based on the dimensions given to it, using Playwright to open a browser.

```
const pageStyles: PageStyles = {
    computedFontSize: '12px', // must always be in pixels
    computedFontFamily: 'Arial',
    lineHeight: 24,
    width: 280,
    height: 653,
    // If padding, margin, border is wanted for the page, then these must be specified
};

const galaxyFold = new Pages(pageStyles, text);
```

`ServerPages` (`prospero/server/server-pages`) takes an HTTP endpoint that returns a `PaginatedResponse`.

```
/**
 * JSON response follows this mold:
 * {
 *   "value": {
 *     "pageStyles": PageStyles,
 *     "content": Array<string>,
 *   },
 *   "page": {
 *     /** Current page. */
 *     "pageNumber": number,
 *     /** Size of the page. */
 *     "pageSize": number,
 *     /** Total pages. */
 *     "pages": number,
 *     /** Total number of pages. */
 *     "totalSize": number
 *   }
 * }
 */
const pages = new ServerPages('http://localhost:9292/book-text');
```

`prospero/web` contains components that use data generated from `prospero/server`.

The pages are not responsive. The optimal experience for `prospero` is to support multiple books for several screen sizes (currently only supporting `min-width`):

```
BooksComponent({
    children: [
        // This is the fallback.
        BookComponent(galaxyFold.getData())
        BookComponent(iphoneXR.getData(), { media: { minWidth: 414 } }),
        // Multiple pages can be rendered at once.
        BookComponent(iphoneXR.getData(), { pagesShown: 2, media: { minWidth: 818 } })
    ],
})
```

This component will listen to viewport changes and re-render itself appropriately. Pages respond to keyboard arrows and swipe gestures.

With Next.js, the ideal use case is to use `prospero/server` with `getServerSideProps` or `getStaticProps` and to mount the components from `prospero/web` on the web page.

If the text is large, it is better to have a backend service working with the frontend, so that the client is not burdened with the entire text size.

To assist the user, the `Pages` API exposes a method `getDataAsIndices` that stores the pages as indices within the text content than the text itself. This can be uploaded to a relational database.

```
/**
 * JSON response follows this mold:
 * {
 *   "value": {
 *     "pageStyles": PageStyles,
 *     "content": Array<{
 *       "beginIndex": number,
 *       "endIndex": number
 *     }>,
 *   },
 *   "page": {
 *     /** Current page. */
 *     "pageNumber": number,
 *     /** Size of the page. */
 *     "pageSize": number,
 *     /** Total pages. */
 *     "pages": number,
 *     /** Total number of pages. */
 *     "totalSize": number
 *   }
 * }
 */
new Pages(..., ...).getDataAsIndices();
```

#### Component destruction

All components exported by `prospero` should be destroyed with the `destroy` API, which will get rid of event listeners.

#### Look and feel

The `BooksComponent` is only styled using the container styles you have passed in ex. `width`, `height`, `margin` _et cetera_. To get a book's look and feel, import `DefaultBookTheme` (`prospero/web/book/theming`) which will load two stylesheets to make the book look more like a book (background color, border...).

```
import { BookComponent, DefaultBookThemeClassName } from 'prospero/web';

BookComponent(
    ...,
    {
      theme: [DefaultBookTheme],
    }
  );
```

You also need to configure animations (`prospero/web/book/animations`):

```
import { BookComponent, SinglePageBookAnimation } from 'prospero/web';

BookComponent(
    ...,
    {
        ...,
        animation: new SinglePageBookAnimation(),
    }
);
```

and listeners (`prospero/web/book/listeners`) to turn the page:

```
import { BookComponent, listenToClickEvents, listenToKeyboardEvents } from 'prospero/web';

BookComponent(
    ...,
    {
        ...,
        listeners: [listenToClickEvents, listenToKeyboardEvents]
    }
);
```

#### Flexible Book

However, for texts with 2500 words or less (essays or blog posts, for example), `prospero/web` also exports `FlexibleBookComponent` (`prospero/web/flexible-book`), which will dynamically size itself.

```
FlexibleBookComponent({
    text: ... // this is the original text.
    containerStyle: ... // same as is passed to PagesBuilder
    /**
     * Choose either 'config' or 'mediaQueryList'. 'mediaQueyList' will change configurations based on screen
     * width ex. number of pages shown. The FlexibleBook will use 'pagesShown' to calculate the page's width
     * properly.
     */
    config: ...
    mediaQueryList: ...
}, {
    createProcessors: () => [ /* Processors initialized here */ ],
    forHTML: ...
}, {
    {
        styles: {
            ... // can use styles to constrain the Book's width/height/max-width ...
        }
    }
})
```

### Page Picker and Bookmarking

The page picker component allows a user to open the book at any page. To add this configuration:

```
BookComponent(
    ...,
    {
        ...,
        showPagePicker: true
    }
);
```

Bookmarking allows the user to save their page in the book. To add this configuration, you need to define a way to save the bookmark i.e. `LocalStorage`, remote server:

```
BookComponent(
    ...,
    {
        ...,
        showBookmark: {
            storage: {
                get: () =>
                    JSON.parse(localStorage.getItem('bookmark-key')),
                save: (bookmark) =>
                    localStorage.setItem(
                        'bookmark-key',
                        JSON.stringify(bookmark)
                    ),
            },
      },
    }
);
```

### Transformers

`prospero` via both entrypoints exports basic `Transformer`s (`prospero/server/transformers` or `prospero/web/transformers`), which transform the text so that the text can be stored separately in its original form. Currently there are two transformers: `IndentTransformer` and `NewlineTransformer`. Both are exported through the `web` and `server` entry-points.

`IndentTransformer` adds indentation to the beginning of paragraphs. (I personally use this for fiction.)

`NewlineTransformer` adds a certain number of newlines between paragraphs. (I personally use this for essays - think Medium.)

Both are stateful, so do not reuse them across books; please create new instances.

### Concept and architecture

This section needs to be greatly expanded.

Books are inherently static resources. This seems incompatible with the web, which is inherently dynamic.

Some of the strengths of books come from being static, however. For example, the author can portion content reasonably for their audience. Content is also more easily found, as it is always in the exact same place.

Currently, I have observed two patterns:

- Those who want to translate books/paper-oriented media onto the web use images (PDF usually). This is extremely comprehensive and fits all use cases, but PDF is a fairly inflexible media.
- Similarly, E-readers are device-specific.
- Those who embrace the web's dynamic nature use hyperlinks, embedded media and scroll listeners to portion content.

`prospero` is meant to fit in-between: somewhat flexible and organized. Users essentially get a book on the web.

#### Web and Server

`prospero` runs primarily on the web. It uses the browser's web APIs to parse HTML and measure the height of text when making pages.

When running `prospero` on the server, Playwright is used to open an instance of a browser.

### Roadmap

- Support some way to view videos outside
