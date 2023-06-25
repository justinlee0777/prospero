# Prospero: Render text on the web as a book

> To work mine end upon their senses that<br/>
> This airy charm is for, I’ll break my staff,<br/>
> Bury it certain fathoms in the earth,<br/>
> And deeper than did ever plummet sound<br/>
> I’ll drown my book.<br/>

- Prospero, _The Tempest_ by William Shakespeare

As Prospero set aside his books, forsaking their awesome powers, so we shall set aside physical books for electronic ones.

### Installation

`prospero` has two peer dependencies that are used only for operations on Node.

The project relies on the package `canvas` so that text rendered with certain fonts can be appropriately sized. `canvas` has unique compilation if your OS does not support it out-of-the-box. Please refer to the "Compiling" section of the [GitHub](https://github.com/Automattic/node-canvas).

`jsdom` is also used to simulate a Window on Node. This initializes a sanitizer that will remove certain tags from text, as they are incompatible with `prospero`. (A possible feature is to disable the sanitization so the client may accept any drawbacks.)

Therefore, to install `prospero` in your project, run:

```
npm install canvas jsdom prospero
```

### Usage

`prospero` has two barrel entry-points: `prospero/server` and `prospero/web`. For tree-shaking, there are individual entry-points divided by utility as exposed in `exports` of the `package.json`.

`prospero/server` uses dependencies from the Node environment. `Pages` (`prospero/server/pages`) takes text and paginates them based on the dimensions given to it.

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

#### Markdown

`prospero` supports only some of the Markdown specification. All inline elements and headings (without margins) are supported.

Directly, `prospero` supports

- The following tags: a, code, del, em, span, strong, sub, sup
- The following attributes: style, href

and only a limited set of style values:

- font-size, font-weight

H1 - H6 tags are converted into `<span>` with the proper font sizes.

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

### Limitations

`canvas` is not thread-safe (https://github.com/Automattic/node-canvas/issues/2019). Therefore, only one `Pages` instance can work at a time, if you are working on the server.

Therefore `prospero` does not support web workers, on server and web (DOM manipulation cannot be done within a web worker).

`prospero` is not intended to handle block-level or replaced elements.

`prospero` supports only a subset of CSS properties.

`prospero` supports only some of the Markdown specification.

`prospero` is an inherently imperfect attempt to reproduce the browser's layout of text (handling whitespace, breaking words, wrapping) on the server. This is how it achieves decent performance, space-wise and time-wise. Limiting what `prospero` supports to a reasonable subset of the browser's features also limits program complexity.

The ideal use case for `prospero` are essays, fiction and non-fiction, and articles, which do not require any graphics beyond font.

In theory, one could sacrifice performance for functionality (for example, block-level elements) by using Chromium on the server. This would be worth researching.

### Concept and architecture

This section needs to be greatly expanded.

Books are inherently static resources. This seems incompatible with the web, which is inherently dynamic.

Some of the strengths of books come from being static, however. For example, the author can portion content reasonably for their audience. Content is also more easily found, as it is always in the exact same place.

Currently, I have observed two patterns:

- Those who want to translate books/paper-oriented media onto the web use images (PDF usually). This is extremely comprehensive and fits all use cases, but PDF is a fairly inflexible media.
- Similarly, E-readers are device-specific.
- Those who embrace the web's dynamic nature use hyperlinks, embedded media and scroll listeners to portion content.

`prospero` is meant to fit in-between: somewhat flexible and organized. Users essentially get a book on the web.

#### Parsers and Pages

`prospero` at its core is composed of parser and page models. The input for parsers is pure text; their return value is the text in a container before overflow. There would be a unique parser, for example, for each value of the `line-break` CSS property. Parsers iterate through parser states, which describe the book being built and the word being parsed. This is for transparency and helps the developer and the upcoming processors.

Pages are a layer over parsers that expose the parser's state at a given time. They provide a convenient way to get the pages of a book.

Parsers return generators. A pure client-side solution of `prospero` (through the `FlexibleBookComponent`) is viable as parsing only one page of code is quite fast. For best performance, it is better to paginate content on the server and serve it to users as one would an asset.

### Roadmap

- Angular ~~and React-compatible~~ components

Possible:

- Idiomatic React component
