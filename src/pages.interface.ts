import GetPage from './get-page.interface';
import PageStyles from './page-styles.interface';
import PagesAsIndicesOutput from './pages-as-indices-output.interface';
import PagesOutput from './pages-output.interface';

/**
 * An object that gets pages for a text.
 */
export default interface IPages {
  get: GetPage;

  getPageStyles(): PageStyles;

  getAll(): Array<string>;

  /**
   * @returns a JS object that is compatable with the structured clone algorithm. This behavior will be unit tested.
   * @link https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
   */
  getData(): PagesOutput;

  /**
   * @returns a JS object that is compatable with the structured clone algorithm. This behavior will be unit tested.
   * @link https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
   */
  getDataAsIndices(): PagesAsIndicesOutput;
}
