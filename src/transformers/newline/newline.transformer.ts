import sourceCodeUrl from '../../consts/source-code-url';
import { EjectingTransformer } from '../models/transformer.interface';
import NewlineTransformerOptions from './newline-transformer-options.interface';

/**
 * Add newlines between paragraphs if there are none.
 */
export default class NewlineTransformer implements EjectingTransformer {
  source = `${sourceCodeUrl}/transformers/newline/newline.transformer.js`;

  constructor(private options: NewlineTransformerOptions = {}) {}

  transform(text: string): string {
    const sectionBeginning = this.createNewlines(
      this.options?.beginningSections ?? 0
    );
    const betweenParagraphs = this.createNewlines(
      this.options?.betweenParagraphs ?? 1
    );

    // Skip the first HTML tag encountered. We will use the "beginningSections" config instead.
    let sectionBegan = false;

    const parser = new DOMParser();

    const document = parser.parseFromString(text, 'text/html');

    const childNodes = document.body.childNodes;

    let newText = '';

    for (const node of childNodes) {
      const spaces = sectionBegan ? betweenParagraphs : sectionBeginning;

      switch (node.nodeType) {
        case 1:
          const element = node as HTMLElement;

          element.textContent = `${spaces}${element.textContent}`;

          newText += element.outerHTML;
          break;
        case 3:
          const paragraphs: Array<string> = [];

          for (const paragraph of (node.textContent ?? '').split('\n')) {
            if (!sectionBegan) {
              paragraphs.push(`${sectionBeginning}${paragraph}`);
              sectionBegan = true;
            } else {
              paragraphs.push(`${betweenParagraphs}${paragraph}`);
            }
          }

          newText += paragraphs.join('\n');
          break;
      }

      sectionBegan = true;
    }

    return newText;
  }

  eject(): ConstructorParameters<typeof NewlineTransformer> {
    return [this.options];
  }

  private createNewlines(number: number): string {
    return Array(number).fill('\n').join('');
  }
}
