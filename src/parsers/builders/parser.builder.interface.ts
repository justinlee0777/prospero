import PageStyles from '../../page-styles.interface';
import Transformer from '../../transformers/models/transformer.interface';
import Optional from '../../utils/optional.type';
import Parser from '../models/parser.interface';

export default interface IParserBuilder {
  fromPageStyles(
    containerStyle: Optional<PageStyles, 'padding' | 'margin' | 'border'>
  ): IParserBuilder;

  setProcessors(transformers: Array<Transformer>): IParserBuilder;

  setFontLocation(url: string): IParserBuilder;

  forHTML(): IParserBuilder;

  build(): Parser;
}
