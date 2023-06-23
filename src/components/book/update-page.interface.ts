/**
 * @returns the page turned to, or the first or last page if no page can be turned to.
 */
type UpdatePage = (this: void, currentPage: number) => Promise<boolean>;

export default UpdatePage;
