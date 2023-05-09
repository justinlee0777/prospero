import BookConfig from '../book-config.interface';

export default interface CreateBookConfigPreset {
  (): BookConfig;
}
