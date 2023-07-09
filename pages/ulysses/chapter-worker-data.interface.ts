import PageStyles from '../../src/models/page-styles.interface';

export default interface ChapterWorkerData {
  mobileStyles: PageStyles;
  desktopStyles: PageStyles;
  filename: string;
}
