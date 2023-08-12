import PageStyles from '../src/models/page-styles.interface';
import normalizePageStyles from '../src/utils/normalize-page-styles.function';

const containerStyles: PageStyles = {
  width: 375,
  height: 667,
  computedFontFamily: 'Arial',
  computedFontSize: '16px',
  lineHeight: 24,
  padding: {
    top: 24,
    right: 24,
    bottom: 24,
    left: 24,
  },
};

export default normalizePageStyles(containerStyles);
