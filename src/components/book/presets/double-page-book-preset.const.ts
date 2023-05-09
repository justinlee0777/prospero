import listenToClickEvents from '../../listeners/listen-to-click-events.function';
import listenToKeyboardEvents from '../../listeners/listen-to-keyboard-events.function';
import DoublePageBookAnimation from '../animations/double-page-book.animation';
import CreateBookConfigPreset from './create-book-config-preset.interface';

/**
 * An animated double-paged book.
 * Only navigable by clicking on the sides of the book and through the keyboard arrows.
 */
const DoublePageBookPreset: CreateBookConfigPreset = () => ({
  pagesShown: 2,
  listeners: [listenToClickEvents, listenToKeyboardEvents],
  animation: new DoublePageBookAnimation(),
});

export default DoublePageBookPreset;
