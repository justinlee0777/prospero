import containerStyleToStyleDeclaration from './container-style-to-style-declaration.function';

describe('containerStyleToStyleDeclaration', () => {
  test('converts the given container style into an object compatible with the Elements API', () => {
    expect(
      containerStyleToStyleDeclaration({
        computedFontFamily: 'Arial',
        computedFontSize: '12px',
        width: 300,
        height: 300,
        lineHeight: 24,
        padding: {
          top: 8,
          right: 4,
          bottom: 8,
          left: 4,
        },
        margin: {
          top: 8,
          right: 8,
          bottom: 8,
          left: 8,
        },
        border: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      })
    ).toEqual({
      width: '300px',
      height: '300px',
      fontSize: '12px',
      fontFamily: 'Arial',
      lineHeight: '2',
      paddingTop: '8px',
      paddingRight: '4px',
      paddingBottom: '8px',
      paddingLeft: '4px',
      marginTop: '8px',
      marginRight: '8px',
      marginBottom: '8px',
      marginLeft: '8px',
      borderTopWidth: '0px',
      borderRightWidth: '0px',
      borderBottomWidth: '0px',
      borderLeftWidth: '0px',
    });
  });
});
