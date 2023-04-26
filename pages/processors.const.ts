import HTMLProcessor from '../src/processors/html/html.processor';
import IndentProcessor from '../src/processors/indent/indent.processor';
import Processor from '../src/processors/models/processor.interface';

const processors: Array<Processor> = [
  new IndentProcessor(5),
  new HTMLProcessor(),
];

export default processors;
