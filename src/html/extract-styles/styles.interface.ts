import { BlockStyles } from './block-styles.interface';
import { FontStyles } from './font-styles.interface';

export default interface Styles {
  /** If there are no container styles, the value is null. */
  block: BlockStyles | null;
  /** If there are no font styles, the value is null. */
  font: FontStyles | null;
}
