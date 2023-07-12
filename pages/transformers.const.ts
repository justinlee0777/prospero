import IndentTransformer from '../src/transformers/indent/indent.transformer';
import Transformer from '../src/transformers/models/transformer.interface';

const transformers: Array<Transformer> = [new IndentTransformer(5)];

export default transformers;
