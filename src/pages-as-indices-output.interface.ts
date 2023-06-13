import PageStyles from './page-styles.interface';

export default interface PagesAsIndicesOutput {
  /**
   * This is the transformed text, not the the original.
   */
  text: string;
  pageStyles: PageStyles;
  pages: Array<{
    beginIndex: number;
    /** Exclusive. */
    endIndex: number;
  }>;
}
