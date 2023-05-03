# Prospero: Render text on the web as a book

> To work mine end upon their senses that<br/>
> This airy charm is for, I’ll break my staff,<br/>
> Bury it certain fathoms in the earth,<br/>
> And deeper than did ever plummet sound<br/>
> I’ll drown my book.<br/>

- Prospero, _The Tempest_ by William Shakespeare

As Prospero set aside his books, forsaking their awesome powers, so we shall set aside physical books for electronic ones.

### Installation

The project relies on the package `canvas` so that text rendered with certain fonts can be appropriately sized. `canvas` has unique compilation if your OS does not support it out-of-the-box. Please refer to the "Compiling" section of the [GitHub](https://github.com/Automattic/node-canvas).

Therefore, to install `prospero` in your project, run:

```
npm install canvas prospero
```

### Usage

`prospero` currently has two entry-points: `prospero/server` and `prospero/web`.

`prospero/server` contains functions dependent on the Node environment. `PagesBuilder` takes text and paginates them based on the dimensions given to it.

```
const [galaxyFold, iphoneXR] = new PagesBuilder()
    .setFont('12px', 'Arial')
    .setLineHeight(24)
    .setText('FooBarBaz')
    .setPadding({
        top: 8,
        right: 8,
        bottom: 8,
        left: 8,
    })
    .addSize(280, 653)
    .addSize(414, 896)
    .build();
```

`prospero` currently supports only italics, bold etc. by supporting Markdown's inline elements. This is done through a `Processor`.

```
new PagesBuilder()
    .setProcessors([
        // Sets indentations for new paragraphs.
        new IndentProcessor(5),
        new HTMLProcessor()
    ])
```

`prospero/server` also exports `LoaderBuilder`, which loads text from a web resource or a file from the local filesystem.

```
let builder = await LoaderBuilder.fromWebHost('http://example.com/text.md');
builder = await builder.asMarkdown();

const text = builder.getText();
```

`prospero/web` contains components that use data generated from `prospero/server`.

The pages are not responsive. The optimal experience for `prospero` is to support multiple books for several screen sizes (currently only supporting `min-width`):

```
const [galaxyFold, iphoneXR] = // ...

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

### Concept and architecture

This section needs to be greatly expanded.

Books are inherently static resources. This seems incompatible with the web, which is inherently dynamic.

Some of the strengths of books come from being static, however. For example, the author can portion content reasonably for their audience. Content is also more easily found, as it is always in the exact same place.

Currently, I have observed two patterns:

- Those who want to translate books/paper-oriented media onto the web use images (PDF usually). This is extremely comprehensive and fits all use cases, but PDF is a fairly inflexible media.
- Similarly, E-readers are device-specific.
- Those who embrace the web's dynamic nature use hyperlinks, embedded media and scroll listeners to portion content.

`prospero` is meant to fit in-between: somewhat flexible and organized. Users essentially get a book on the web.

#### Limitations

`prospero` is not intended to handle block-level or replaced elements.

`prospero` currently does not support different font sizes.

`prospero` supports only a subset of CSS properties.

`prospero` supports only some of the Markdown specification.

`prospero` is an inherently imperfect attempt to reproduce the browser's layout of text (handling whitespace, breaking words, wrapping) on the server, as it is trying to guess at the browser's fundamental behavior - and there are several. This is how it achieves decent performance, space-wise and time-wise. Limiting what `prospero` supports to a reasonable subset of the browser's features also limits program complexity.

The ideal use case for `prospero` are essays, fiction and non-fiction, and articles, which do not require any graphics beyond font.

In theory, one could sacrifice performance for functionality (for example, block-level elements) by using Chromium on the server. This would be worth researching.

#### Parsers and Pages

`prospero` at its core is composed of parser and page models. The input for parsers is pure text; their return value is the text in a container before overflow. There would be a unique parser, for example, for each value of the `line-break` CSS property. Parsers iterate through parser states, which describe the book being built and the word being parsed. This is for transparency and helps the developer and the upcoming processors.

Pages are a layer over parsers that expose the parser's state at a given time. They provide a convenient way to get the pages of a book.

Parsers return generators. In theory, this makes a pure client-side solution of `prospero` viable as parsing only one page of code is quite fast and therefore a feature worth exploring. However, for best performance, there are more techniques available to the developer for already-paginated content over the entire text.

#### Processors

The processors of `prospero` modify the generated parser state. Though this allows for great flexibility and a division of responsibilities from parsers, it also makes processors difficult to code.

Processors are excellent for transforming text using simple triggers. They consume only the parser state, which exposes the current page, line, and word being examined at a given moment. This is a lot of data, but usually a processor only needs a subset of this to be effective.

However, processors need to leave notes for other processors if they transform the text. For example, the `HTMLProcessor` remembers where in the text the previous HTML tags were in order to add them in afterwards. There is no design guideline saying processors cannot be stateful, so processors need to leave behind notes if they add/delete/replace phrases, and where. Notes also have the additional benefit of being transparent and debuggable.

### Roadmap

- Book look-and-feel (ex. animations)
- Look the screen when a book is being flipped
- Support for different font sizes
- Support for H1..6 from Markdown
- Angular and React-compatible components
- Bookmarking
