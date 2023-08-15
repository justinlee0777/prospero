import HTMLTransformerOptions from '../transformers/html/html-transformer-options.interface';
import FontLocations from './font-locations.interface';

export default interface PagesConfig {
  fontLocation?: FontLocations;
  html?: boolean | HTMLTransformerOptions;
}
