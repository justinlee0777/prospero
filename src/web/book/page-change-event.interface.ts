export default interface PageChangeEvent {
  pageNumber: number;
  animationFinished: Promise<void>;
}
