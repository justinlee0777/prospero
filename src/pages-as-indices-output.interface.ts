import ContainerStyle from './container-style.interface';

export default interface PagesAsIndicesOutput {
  /**
   * This is the transformed text, not the the original.
   */
  text: string;
  containerStyles: ContainerStyle;
  pages: Array<{
    beginIndex: number;
    /** Exclusive. */
    endIndex: number;
  }>;
}
