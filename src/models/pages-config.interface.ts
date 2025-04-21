import FontLocations from './font-locations.interface';

export default interface PagesConfig {
  fontLocation?: FontLocations;
  /**
   * Tell prospero which tags to apply section breaks on.
   * Basically, this will ensure the tag is not the last element on the page,
   * and moves it over to the next one.
   */
  sectionBreak?: {
    beginningSelector: string;
  };
}
