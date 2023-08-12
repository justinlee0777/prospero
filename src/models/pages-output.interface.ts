import RequiredPagesOutput from './required-pages-output.interface';

export default interface PagesOutput extends RequiredPagesOutput {
  pages: Array<string>;
}
