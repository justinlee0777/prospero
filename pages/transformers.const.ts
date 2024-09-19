import IndentTransformer from '../src/transformers/indent/indent.transformer';
import Transformer from '../src/transformers/models/transformer.interface';
import NewlineTransformer from '../src/transformers/newline/newline.transformer';
import TextToHTMLTransformer from '../src/transformers/text-to-html/html.transformer';

const transformers: Array<Transformer> = [
  new TextToHTMLTransformer(),
  new IndentTransformer(5),
  new NewlineTransformer({
    beginningSections: 4,
    betweenParagraphs: 1,
  }),
];

export default transformers;
