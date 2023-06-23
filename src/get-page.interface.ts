export default interface GetPage {
  /**
   * @param pageNumber is a 0th-based index
   * @returns string if there is text at that page, or null if there is none.
   */
  (pageNumber: number): Promise<string> | string | null;
}
