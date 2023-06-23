import listenToKeyboardEvents from '../listeners/listen-to-keyboard-events.function';
import listenToSwipeEvents from '../listeners/listen-to-swipe-events.function';
import DefaultPageFlipAnimation from './animations/default-page-flip.animation';
import BookConfig from './book-config.interface';
import { DefaultBookTheme } from './theming/public-api';

const defaultBookConfig: BookConfig = {
  currentPage: 0,
  pageStyles: {},
  pagesShown: 1,
  animation: new DefaultPageFlipAnimation(),
  listeners: [listenToKeyboardEvents, listenToSwipeEvents],
  showPageNumbers: true,
  theme: DefaultBookTheme,
};

export default defaultBookConfig;
