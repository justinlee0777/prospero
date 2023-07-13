import HTMLTransformerOptions from '../transformers/html/html-transformer-options.interface';

export default interface PagesConfig {
  fontLocation?: string;
  html?: boolean | HTMLTransformerOptions;
}
