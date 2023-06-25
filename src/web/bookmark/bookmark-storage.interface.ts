import BookmarkData from './bookmark-data.interface';

/**
 * Retrieve and save bookmarks synchronously or asynchronously.
 */
export default interface BookmarkStorage {
  get(): BookmarkData | Promise<BookmarkData | undefined> | undefined;
  save(bookmark: BookmarkData): void | Promise<void>;
}
