import WordWidthCalculator from '../../word-width.calculator.server';
import ParserFactory from '../parser.factory.server';
import ParserBuilder from './parser.builder';

export default ParserBuilder(WordWidthCalculator, ParserFactory);
