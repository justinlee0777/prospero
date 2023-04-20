import ContainerStyle from './container-style.interface';
import ParserBuilder from './parsers/builders/parser.builder';

export default function* getTextContent(
  containerStyle: ContainerStyle,
  textContent: string
): Generator<string> {
  const parser = ParserBuilder.fromContainerStyle(containerStyle);

  yield* parser.generatePages(textContent);
}
