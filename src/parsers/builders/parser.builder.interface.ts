import FontLocations from '../../models/font-locations.interface';
import PageStyles from '../../models/page-styles.interface';
import Transformer from '../../transformers/models/transformer.interface';
import Optional from '../../utils/optional.type';
import Parser from '../models/parser.interface';

export default interface IParserBuilder {
  fromPageStyles(
    containerStyle: Optional<PageStyles, 'padding' | 'margin' | 'border'>
  ): IParserBuilder;

  setTransformers(transformers: Array<Transformer>): IParserBuilder;

  setFontLocation(urlOrLocations: FontLocations): IParserBuilder;

  build(): Parser;
}
