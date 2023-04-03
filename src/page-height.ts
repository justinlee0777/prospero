export default class PageHeight {
  private lineHeight: number;

  private cachedHeight: number;

  constructor(private containerElement: HTMLElement) {
    const { fontSize, lineHeight } = window.getComputedStyle(containerElement);

    // Used to strip out non-numbers. (Assumes always in units of pixel)
    const alphabet = /[a-z]/gi;
    this.lineHeight = Number(lineHeight.replace(alphabet, ''));
  }

  get(containerHeight: number): number {
    const numberOfLines = Math.floor(containerHeight / this.lineHeight);

    return numberOfLines * this.lineHeight;
  }

  set(containerHeight: number): void {
    const pageHeight = this.get(containerHeight);

    if (this.cachedHeight !== pageHeight) {
      this.containerElement.style.maxHeight = `${pageHeight}px`;
    }
    this.cachedHeight = pageHeight;
  }
}
