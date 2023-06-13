import ServerPages from '../../server-pages';
import BookElement from '../book/book-element.interface';
import BookComponent from '../book/book.component';
import CreateBookElement from '../book/create-book-element.interface';

type CreateBookElementWithoutRequiredArgs = Tail<Parameters<CreateBookElement>>;

/**
 * Ariel is a little spirit that creates a book communicating with a backend for its pages.
 *
 * @param endpoint Endpoint must follow specification:
 * - Endpoint allows at least two query parameters: pageNumber (beginning at 1) and pageSize
 * - Request body must return PaginatedResponse (see src/components/book/pagined-response.interface.ts)
 *
 * @param bookArgs are ways to configure the book ex. pages shown or the element itself
 */
export default async function Ariel(
  endpoint: string,
  ...bookArgs: CreateBookElementWithoutRequiredArgs
): Promise<BookElement> {
  const pages = new ServerPages(endpoint);

  const pageStyles = await pages.getPageStyles();

  return BookComponent(
    {
      pageStyles,
      getPage: (pageNumber) => pages.get(pageNumber),
    },
    ...(bookArgs ?? [])
  );
}
