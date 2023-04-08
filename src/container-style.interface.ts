export default interface ContainerStyle {
  /** In pixels. */
  width: number;
  /** In pixels. */
  height: number;
  computedFontSize: string;
  computedFontFamily: string;
  /** In pixels. */
  lineHeight: number;
  padding: {
    /** In pixels. */
    top: number;
    /** In pixels. */
    right: number;
    /** In pixels. */
    bottom: number;
    /** In pixels. */
    left: number;
  };
  margin: {
    /** In pixels. */
    top: number;
    /** In pixels. */
    right: number;
    /** In pixels. */
    bottom: number;
    /** In pixels. */
    left: number;
  };
  border: {
    /** In pixels. */
    top: number;
    /** In pixels. */
    right: number;
    /** In pixels. */
    bottom: number;
    /** In pixels. */
    left: number;
  };
}
