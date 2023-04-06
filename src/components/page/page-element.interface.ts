import DestructionAnimation from './destruction-animation.interface';

export default interface PageElement extends HTMLElement {
  /**
   * @returns a Promise that resolves when the destruction is completed.
   */
  destroy(animation?: DestructionAnimation): Promise<void>;
}
