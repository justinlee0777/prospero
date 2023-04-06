import GetPage from './get-page.interface';

export default function buildPagesByGenerator(
  generator: Generator<string>
): GetPage {
  const cachedPages: Array<string> = [];
  let result: IteratorResult<string>;

  /**
   * @returns the text content for the given page number, or null if we have reached the end of pages.
   */
  return (pageNumber) => {
    const difference = pageNumber - (cachedPages.length - 1);

    if (difference < 0) {
      return cachedPages[pageNumber];
    } else if (result?.done) {
      return cachedPages[pageNumber] || null;
    } else {
      const newPages = [];
      let i = 0;

      while (i < difference) {
        result = generator.next();

        if (result.done) {
          break;
        } else {
          newPages.push(result.value);
          i++;
        }
      }

      cachedPages.push(...newPages);

      return cachedPages[pageNumber] || null;
    }
  };
}
