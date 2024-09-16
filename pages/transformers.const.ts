import IndentTransformer from '../src/transformers/indent/indent.transformer';
import Transformer from '../src/transformers/models/transformer.interface';
import TextToHTMLTransformer from '../src/transformers/text-to-html/html.transformer';

const transformers: Array<Transformer> = [new TextToHTMLTransformer(), new IndentTransformer(5)];

export default transformers;
