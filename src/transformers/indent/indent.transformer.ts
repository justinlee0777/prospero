import sourceCodeUrl from '../../consts/source-code-url';
import { EjectingTransformer } from '../models/transformer.interface';

interface IndentTransformerOptions {
  htmlCompatible?: boolean;
  /** Element selector. */
  exclude?: string;
}

/**
 * Add indentation to new paragraphs.
 */
export default class IndentTransformer implements EjectingTransformer {
  source = `${sourceCodeUrl}/transformers/indent/indent.transformer.js`;

  private text: string;

  constructor(
    private spaces: number,
    private options: IndentTransformerOptions = {
      htmlCompatible: true,
    }
  ) {
    const { htmlCompatible = true } = options;

    const spaceCharacter = htmlCompatible ? '&nbsp;' : ' ';
    this.text = Array(this.spaces).fill(spaceCharacter).join('');
  }

  transform(text: string): string {
    const parser = new DOMParser();

    const document = parser.parseFromString(text, 'text/html');

    const childNodes = document.body.childNodes;

    let newText = '';

    for (const node of childNodes) {
      switch (node.nodeType) {
        case 1:
          const element = node as HTMLElement;

          if (
            !(this.options.exclude && element.matches(this.options.exclude))
          ) {
            element.innerHTML = `${this.text}${element.innerHTML}`;
          }

          newText += element.outerHTML;
          break;
        case 3:
          newText += (node.textContent ?? '')
            .split('\n')
            .map((textContent) => `${this.text}${textContent}`)
            .join('\n');
          break;
      }
    }

    return newText;
  }

  eject(): ConstructorParameters<typeof IndentTransformer> {
    return [this.spaces, this.options];
  }
}
