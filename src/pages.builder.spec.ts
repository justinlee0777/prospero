jest.mock(
  './pages',
  () =>
    class MockPages {
      constructor(public containerStyle, public text, public processors) {}
    }
);

import PagesBuilder from './pages.builder';
import Transformer from './transformers/models/transformer.interface';

describe('PagesBuilder', () => {
  test('builds pages for various screen sizes', () => {
    const pages = new PagesBuilder()
      .setText('Foo\nBar\nBaz\n')
      .setFont('16px', 'Arial')
      .setLineHeight(24)
      // Pixel
      .addSize(393, 851)
      // iPad mini
      .addSize(768, 1024)
      // Samsung Galaxy S20 Ultra
      .addSize(412, 915)
      .build();

    expect(pages.length).toBe(3);

    const [pixel, ipad, galaxy] = pages.map((page: any) => ({
      containerStyle: page.containerStyle,
      text: page.text,
      processors: page.processors,
    }));

    expect(pixel).toEqual({
      containerStyle: {
        computedFontSize: '16px',
        computedFontFamily: 'Arial',
        lineHeight: 24,
        width: 393,
        height: 851,
        margin: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
        border: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      },
      text: 'Foo\nBar\nBaz\n',
      processors: [],
    });

    expect(galaxy).toEqual({
      containerStyle: {
        computedFontSize: '16px',
        computedFontFamily: 'Arial',
        lineHeight: 24,
        width: 412,
        height: 915,
        margin: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
        border: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      },
      text: 'Foo\nBar\nBaz\n',
      processors: [],
    });

    expect(ipad).toEqual({
      containerStyle: {
        computedFontSize: '16px',
        computedFontFamily: 'Arial',
        lineHeight: 24,
        width: 768,
        height: 1024,
        margin: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
        border: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      },
      text: 'Foo\nBar\nBaz\n',
      processors: [],
    });
  });

  test('sets margin, padding and border', () => {
    const pages = new PagesBuilder()
      .setText('Foo\nBar\nBaz\n')
      .setFont('16px', 'Arial')
      .setLineHeight(24)
      .setBorder({
        top: 1,
        right: 1,
        bottom: 1,
        left: 1,
      })
      .setMargin({
        top: 8,
        right: 0,
        bottom: 8,
        left: 0,
      })
      .setPadding({
        top: 12,
        right: 12,
        bottom: 12,
        left: 12,
      })
      .addSize(393, 851)
      .build();

    expect(pages.length).toBe(1);

    const pixel = {
      containerStyle: (pages[0] as any).containerStyle,
      text: (pages[0] as any).text,
      processors: (pages[0] as any).processors,
    };

    expect(pixel).toEqual({
      containerStyle: {
        computedFontSize: '16px',
        computedFontFamily: 'Arial',
        lineHeight: 24,
        width: 393,
        height: 851,
        margin: {
          top: 8,
          right: 0,
          bottom: 8,
          left: 0,
        },
        padding: {
          top: 12,
          right: 12,
          bottom: 12,
          left: 12,
        },
        border: {
          top: 1,
          right: 1,
          bottom: 1,
          left: 1,
        },
      },
      text: 'Foo\nBar\nBaz\n',
      processors: [],
    });
  });

  test('sets processors', () => {
    const mockTransformer1: Transformer = {
      transform: (foo) => foo,
    };
    const mockTransformer2: Transformer = {
      transform: (bar) => bar,
    };

    const pages = new PagesBuilder()
      .setText('Foo\nBar\nBaz\n')
      .setFont('16px', 'Arial')
      .setLineHeight(24)
      .setTransformers([mockTransformer1, mockTransformer2])
      .addSize(393, 851)
      .build();

    expect(pages.length).toBe(1);

    const pixel = {
      containerStyle: (pages[0] as any).containerStyle,
      text: (pages[0] as any).text,
      processors: (pages[0] as any).processors,
    };

    expect(pixel).toEqual({
      containerStyle: {
        computedFontSize: '16px',
        computedFontFamily: 'Arial',
        lineHeight: 24,
        width: 393,
        height: 851,
        margin: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
        border: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      },
      text: 'Foo\nBar\nBaz\n',
      processors: [mockTransformer1, mockTransformer2],
    });
  });

  test('gives the user an appropriate error if there is not enough data to make pages', () => {
    const builder = new PagesBuilder();
    const error = `The builder requires additional information. Ensure you have called 'setFont', 'setLineHeight', 'setText', 'addSize' before building.`;

    expect(() => builder.build()).toThrowError(error);

    builder.setFont('16px', 'Arial');

    expect(() => builder.build()).toThrowError(error);

    builder.setLineHeight(32);

    expect(() => builder.build()).toThrowError(error);

    builder.setText('Foo\nBar\nBaz\n');

    expect(() => builder.build()).toThrowError(error);

    builder.addSize(393, 851);

    const pages = builder.build();

    expect(pages).toBeTruthy();
    expect(pages.length).toBe(1);
  });
});
