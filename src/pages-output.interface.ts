import ContainerStyle from './container-style.interface';

export default interface PagesOutput {
  pages: Array<string>;
  containerStyles: ContainerStyle;
}
