import HTMLTokenizer, { TokenType } from './html.tokenizer';

describe('HTMLTokenizer', () => {
  interface MockLoader {}

  interface MockElement {
    innerHTML?: string;
    outerHTML?: string;
    text: string;
    childNodes: Array<MockElement>;
    tagName: string;
    nodeType: 1 | 3;
  }

  class MockHTMLTokenizer extends HTMLTokenizer<MockLoader, MockElement> {
    loadHTML = jest.fn();

    getRoot = jest.fn<MockElement, []>().mockReturnValue({
      tagName: 'body',
      innerHTML: '<div id="foo">foo<span>bar</span></div>baz<span>foo</span>',
      outerHTML:
        '<body><div>foo<span>bar</span></div>baz<span>foo</span></body>',
      nodeType: 1,
      text: 'foobarbazfoo',
      childNodes: [
        {
          tagName: 'div',
          innerHTML: 'foo<span>bar</span>',
          outerHTML: '<div id="foo">foo<span>bar</span></div>',
          text: 'foobar',
          nodeType: 1,
          childNodes: [
            {
              tagName: '',
              text: 'foo',
              nodeType: 3,
              childNodes: [],
            },
            {
              tagName: 'span',
              innerHTML: 'bar',
              outerHTML: '<span>bar</span>',
              text: 'bar',
              nodeType: 1,
              childNodes: [
                {
                  tagName: '',
                  text: 'bar',
                  nodeType: 3,
                  childNodes: [],
                },
              ],
            },
          ],
        },
        {
          tagName: '',
          nodeType: 3,
          text: 'baz',
          childNodes: [],
        },
        {
          nodeType: 1,
          text: 'foo',
          tagName: 'span',
          innerHTML: 'foo',
          outerHTML: '<span>foo</span>',
          childNodes: [
            {
              tagName: '',
              text: 'foo',
              nodeType: 3,
              childNodes: [],
            },
          ],
        },
      ],
    });

    getInnerHTML(element: MockElement, loader: MockLoader): string {
      return element.innerHTML ?? '';
    }

    getOuterHTML(element: MockElement, loader: MockLoader): string {
      return element.outerHTML ?? '';
    }

    getText(element: MockElement, loader: MockLoader): string {
      return element.text;
    }
  }

  test('gets tokens for an HTML parser', () => {
    const tokenizer = new MockHTMLTokenizer();

    const generator = tokenizer.getTokens(
      '<div id="foo">foo<span>bar</span></div>baz<span>foo</span>'
    );

    expect(generator.next().value).toEqual({
      tag: {
        name: 'div',
        opening: '<div id="foo">',
        closing: '</div>',
      },
      type: TokenType.HTML,
    });

    expect(tokenizer.loadHTML).toHaveBeenCalledTimes(1);
    expect(tokenizer.loadHTML).toHaveBeenCalledWith(
      '<div id="foo">foo<span>bar</span></div>baz<span>foo</span>'
    );

    expect(tokenizer.getRoot).toHaveBeenCalledTimes(1);

    expect(generator.next().value).toEqual({
      content: 'foo',
      type: TokenType.TEXT,
    });

    expect(generator.next().value).toEqual({
      tag: {
        name: 'span',
        opening: '<span>',
        closing: '</span>',
      },
      type: TokenType.HTML,
    });

    expect(generator.next().value).toEqual({
      content: 'bar',
      type: TokenType.TEXT,
    });

    expect(generator.next().value).toEqual({
      tagName: 'span',
      type: TokenType.END_HTML,
    });

    expect(generator.next().value).toEqual({
      tagName: 'div',
      type: TokenType.END_HTML,
    });

    expect(generator.next().value).toEqual({
      content: 'baz',
      type: TokenType.TEXT,
    });

    expect(generator.next().value).toEqual({
      tag: {
        name: 'span',
        opening: '<span>',
        closing: '</span>',
      },
      type: TokenType.HTML,
    });

    expect(generator.next().value).toEqual({
      content: 'foo',
      type: TokenType.TEXT,
    });

    expect(generator.next().value).toEqual({
      tagName: 'span',
      type: TokenType.END_HTML,
    });
  });
});
