import PageStyles from '../models/page-styles.interface';

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
    if (typeof (pageStyles as any)[key] === 'object') {
      (pageStyles as any)[key] = {
        ...defaultDimensionalValue,
        ...(pageStyles as any)[key],
      };
    } else {
      (pageStyles as any)[key] = defaultDimensionalValue;
    }
  });

  return pageStyles;
}
