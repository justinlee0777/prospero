import IndentProcessor from '../src/transformers/indent/indent.transformer';
import Processor from '../src/transformers/models/transformer.interface';

const processors: Array<Processor> = [new IndentProcessor(5)];

export default processors;
