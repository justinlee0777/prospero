import PageStyles from './page-styles.interface';

export default interface RequiredPagesOutput {
  /** Whether the inputted text was parsed as HTML. */
  html: boolean;
  pageStyles: PageStyles;
}
