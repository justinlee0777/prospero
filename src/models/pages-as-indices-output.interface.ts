import RequiredPagesOutput from './required-pages-output.interface';

export default interface PagesAsIndicesOutput extends RequiredPagesOutput {
  /**
   * This is the transformed text, not the the original.
   */
  text: string;
  pages: Array<{
    beginIndex: number;
    /** Exclusive. */
    endIndex: number;
  }>;
}
