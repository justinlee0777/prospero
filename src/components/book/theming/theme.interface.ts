/**
 * Aesthetic theming for the Book. The contract describes ways the user can alter the book's appearance.
 */
export default interface Theme {
  /** A classname to be added to the Book. */
  className?: string;
  /** A classname to be added to the Pages created. */
  pageClassName?: string;
}
