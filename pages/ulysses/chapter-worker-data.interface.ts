import ContainerStyle from '../../src/container-style.interface';

export default interface ChapterWorkerData {
  mobileStyles: ContainerStyle;
  desktopStyles: ContainerStyle;
  filename: string;
}
