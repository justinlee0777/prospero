jest.mock('./merge.function', () => (arg) => arg);

import normalizePageStyles from './normalize-page-styles.function';

describe('normalizePageStyles()', () => {
  const incompleteContainerStyle: Parameters<typeof normalizePageStyles>[0] = {
    computedFontFamily: 'Arial',
    computedFontSize: '16px',
    lineHeight: 24,
    width: 480,
    height: 480,
  };

  test('normalizes styles without padding', () => {
    let containerStyle = normalizePageStyles(incompleteContainerStyle);

    expect(containerStyle.padding).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });

    containerStyle = normalizePageStyles({
      ...incompleteContainerStyle,
      padding: {
        top: 8,
        right: 32,
        bottom: 18,
        left: 32,
      },
    });

    expect(containerStyle.padding).toEqual({
      top: 8,
      right: 32,
      bottom: 18,
      left: 32,
    });
  });

  test('normalizes styles with incomplete padding', () => {
    let containerStyle = normalizePageStyles(incompleteContainerStyle);

    expect(containerStyle.padding).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });

    containerStyle = normalizePageStyles({
      ...incompleteContainerStyle,
      padding: {
        right: 32,
        left: 32,
      },
    });

    expect(containerStyle.padding).toEqual({
      top: 0,
      right: 32,
      bottom: 0,
      left: 32,
    });
  });

  test('normalizes styles without margin', () => {
    let containerStyle = normalizePageStyles(incompleteContainerStyle);

    expect(containerStyle.margin).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });

    containerStyle = normalizePageStyles({
      ...incompleteContainerStyle,
      margin: {
        top: 18,
        right: 18,
        bottom: 16,
        left: 18,
      },
    });

    expect(containerStyle.margin).toEqual({
      top: 18,
      right: 18,
      bottom: 16,
      left: 18,
    });
  });

  test('normalizes styles with incomplete margin', () => {
    let containerStyle = normalizePageStyles(incompleteContainerStyle);

    expect(containerStyle.margin).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });

    containerStyle = normalizePageStyles({
      ...incompleteContainerStyle,
      margin: {
        top: 18,
        left: 18,
      },
    });

    expect(containerStyle.margin).toEqual({
      top: 18,
      right: 0,
      bottom: 0,
      left: 18,
    });
  });

  test('normalizes styles without border', () => {
    let containerStyle = normalizePageStyles(incompleteContainerStyle);

    expect(containerStyle.border).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });

    containerStyle = normalizePageStyles({
      ...incompleteContainerStyle,
      border: {
        top: 1,
        right: 1,
        bottom: 1,
        left: 1,
      },
    });

    expect(containerStyle.border).toEqual({
      top: 1,
      right: 1,
      bottom: 1,
      left: 1,
    });
  });

  test('normalizes styles with incomplete border', () => {
    let containerStyle = normalizePageStyles(incompleteContainerStyle);

    expect(containerStyle.border).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });

    containerStyle = normalizePageStyles({
      ...incompleteContainerStyle,
      border: {
        bottom: 1,
      },
    });

    expect(containerStyle.border).toEqual({
      top: 0,
      right: 0,
      bottom: 1,
      left: 0,
    });
  });
});
