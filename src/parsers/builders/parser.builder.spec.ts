let mockRegisterFont = jest.fn();

jest.mock('../../web/utils/register-font.function', () => mockRegisterFont);

import ParserBuilder from './parser.builder';

describe(ParserBuilder, () => {
  let containerStyle: any;

  beforeEach(() => {
    containerStyle = {
      width: 600,
      height: 400,
      lineHeight: 24,
      computedFontFamily: 'Times New Roman',
      computedFontSize: '16px',
    };
  });

  test('should build a parser using a custom font', () => {
    containerStyle = {
      ...containerStyle,
      computedFontFamily: 'Bookerly',
    };

    new ParserBuilder()
      .fromPageStyles(containerStyle)
      .setFontLocation('/Bookerly.tiff')
      .build();

    expect(mockRegisterFont).toBeCalledWith('Bookerly', '/Bookerly.tiff');
  });
});
