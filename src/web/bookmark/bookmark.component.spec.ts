jest.mock('../../utils/merge.function', () => (arg: any) => arg);

import BookmarkData from './bookmark-data.interface';
import BookmarkStorage from './bookmark-storage.interface';
import BookmarkComponent from './bookmark.component';

describe('BookmarkComponent', () => {
  let mockStorageGet: jest.SpyInstance<BookmarkData | Promise<BookmarkData>>;
  let mockStorageSave: jest.SpyInstance<BookmarkData>;

  let mockStorage: BookmarkStorage;

  beforeEach(() => {
    mockStorageGet = jest.fn();
    mockStorageSave = jest.fn();

    mockStorage = {
      get: mockStorageGet as any,
      save: mockStorageSave as any,
    };
  });

  test('creates', () => {
    const component = BookmarkComponent(mockStorage);

    expect(component).toBeTruthy();

    expect(component.classList.toString()).toBe('bookmark');

    expect(component.tabIndex).toBe(0);
  });

  test('fetches any saved bookmark data on initialization', async () => {
    mockStorageGet.mockReturnValue({
      pageNumber: 10,
    });

    const component = BookmarkComponent(mockStorage);

    await new Promise(process.nextTick);

    expect(component.pagenumber).toBe(10);
    expect(component.textContent).toBe('11');
  });

  test('fetches any saved bookmark data asynchronously and tells the client', async () => {
    let resolve: any;

    mockStorageGet.mockReturnValue(
      new Promise((resolveFn) => (resolve = resolveFn))
    );

    const component = BookmarkComponent(mockStorage);

    const onbookmarkretrieval = jest.fn();
    component.onbookmarkretrieval = onbookmarkretrieval;

    resolve!({
      pageNumber: 10,
    });

    await new Promise(process.nextTick);

    expect(component.pagenumber).toBe(10);
    expect(component.textContent).toBe('11');

    expect(onbookmarkretrieval).toHaveBeenCalledTimes(1);
    expect(onbookmarkretrieval).toHaveBeenCalledWith({
      pageNumber: 10,
    });
  });

  test('tells the client that a bookmark was saved, even after the fact', async () => {
    mockStorageGet.mockReturnValue({
      pageNumber: 10,
    });

    const component = BookmarkComponent(mockStorage);

    await new Promise(process.nextTick);

    expect(component.pagenumber).toBe(10);
    expect(component.textContent).toBe('11');

    const onbookmarkretrieval = jest.fn();
    component.onbookmarkretrieval = onbookmarkretrieval;

    expect(onbookmarkretrieval).toHaveBeenCalledTimes(1);
    expect(onbookmarkretrieval).toHaveBeenCalledWith({
      pageNumber: 10,
    });
  });

  test('saves a bookmark', async () => {
    jest.useFakeTimers();

    const component = BookmarkComponent(mockStorage);
    component.pagenumber = 15;

    component.dispatchEvent(new MouseEvent('click'));

    expect(mockStorageSave).toHaveBeenCalledTimes(1);
    expect(mockStorageSave).toHaveBeenCalledWith({
      pageNumber: 15,
    });

    expect(component.textContent).toBe('16');

    expect(component.classList.toString()).toBe('bookmark bookmarkActivated');

    jest.advanceTimersByTime(300);

    await Promise.resolve(); // Wait for timeout promise to finish resolving.

    expect(component.classList.toString()).toBe('bookmark');
  });
});
