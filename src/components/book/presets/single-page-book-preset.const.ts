import listenToClickEvents from '../../listeners/listen-to-click-events.function';
import SinglePageBookAnimation from '../animations/single-page-book.animation';
import CreateBookConfigPreset from './create-book-config-preset.interface';

/**
 * An animated single paged book, best for mobile.
 * Only navigable by clicking on the sides of the book.
 */
const SinglePageBookPreset: CreateBookConfigPreset = () => ({
  pagesShown: 1,
  listeners: [listenToClickEvents],
  animation: new SinglePageBookAnimation(),
});

export default SinglePageBookPreset;
