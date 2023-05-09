import normalizeContainerStyle from './normalize-container-style.function';

describe('normalizeContainerStyle()', () => {
  const incompleteContainerStyle: Parameters<
    typeof normalizeContainerStyle
  >[0] = {
    computedFontFamily: 'Arial',
    computedFontSize: '16px',
    lineHeight: 24,
  };

  test('normalizes styles without padding', () => {
    let containerStyle = normalizeContainerStyle(incompleteContainerStyle);

    expect(containerStyle.padding).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });

    containerStyle = normalizeContainerStyle({
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

  test('normalizes styles without margin', () => {
    let containerStyle = normalizeContainerStyle(incompleteContainerStyle);

    expect(containerStyle.margin).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });

    containerStyle = normalizeContainerStyle({
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

  test('normalizes styles without border', () => {
    let containerStyle = normalizeContainerStyle(incompleteContainerStyle);

    expect(containerStyle.border).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });

    containerStyle = normalizeContainerStyle({
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
});
