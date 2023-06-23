import PageStyles from '../page-styles.interface';

export default function normalizePageStyles(
  pageStyles: PageStyles
): PageStyles {
  const defaultDimensionalValue = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };

  pageStyles = { ...pageStyles };

  ['padding', 'margin', 'border'].forEach((key) => {
    if (typeof pageStyles[key] === 'object') {
      pageStyles[key] = {
        ...defaultDimensionalValue,
        ...pageStyles[key],
      };
    } else {
      pageStyles[key] = defaultDimensionalValue;
    }
  });

  return pageStyles;
}
