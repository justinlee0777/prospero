/**
 * @returns whether the operation completed or halted early.
 */
type UpdatePage = (this: void, currentPage: number) => Promise<boolean>;

export default UpdatePage;
