import PageStyles from './page-styles.interface';

export default interface PagesOutput {
  /** Whether the inputted text was parsed as HTML. */
  html?: boolean;
  pages: Array<string>;
  pageStyles: PageStyles;
}
