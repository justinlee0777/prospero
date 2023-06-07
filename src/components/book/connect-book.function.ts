import PagesUsingEndpoint from '../../pages-using-endpoint';
import BookElement from './book-element.interface';
import BookComponent from './book.component';
import CreateBookElement from './create-book-element.interface';

type CreateBookElementWithoutRequiredArgs = Tail<Parameters<CreateBookElement>>;

/**
 * Endpoint must follow specification:
 * - Endpoint allows at least two query parameters: pageNumber (beginning at 1) and pageSize
 * - Request body must return PaginatedResponse (see src/components/book/pagined-response.interface.ts)
 */
export default async function connectBook(
  endpoint: string,
  bookArgs: CreateBookElementWithoutRequiredArgs = []
): Promise<BookElement> {
  const pages = new PagesUsingEndpoint(endpoint);

  const containerStyles = await pages.getContainerStyle();

  return BookComponent(
    {
      containerStyles,
      getPage: (pageNumber) => pages.get(pageNumber),
    },
    ...bookArgs
  );
}
