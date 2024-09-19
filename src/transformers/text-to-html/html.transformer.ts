import sourceCodeUrl from '../../consts/source-code-url';
import { EjectingTransformer } from '../models/transformer.interface';

/**
 * Use to convert pure text into HTML.
 * It merely wraps new paragraphs in <p> tags.
 */
export default class TextToHTMLTransformer implements EjectingTransformer {
  source = `${sourceCodeUrl}/transformers/text-to-html/html.transformer.js`;

  transform(text: string): string {
    /**
     * Match all non-newline character groups.
     */
    const pattern = /([^\n]+)/g;

    const newText = text.replace(pattern, `<p>$1</p>`).replaceAll('\n', '');

    return newText;
  }

  eject(): ConstructorParameters<typeof TextToHTMLTransformer> {
    return [];
  }
}
