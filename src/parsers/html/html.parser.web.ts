import HTMLParser from './html.parser';
import HTMLTokenizer from './html.tokenizer';

class WebHTMLTokenizer extends HTMLTokenizer<Document, HTMLElement> {
  loadHTML(text: string): Document {
    const parser = new DOMParser();
    return parser.parseFromString(text, 'text/html');
  }

  getRoot(document: Document): HTMLElement {
    return document.body;
  }

  getInnerHTML(element: HTMLElement): string {
    return element.innerHTML;
  }

  getOuterHTML(element: HTMLElement): string {
    return element.outerHTML;
  }

  getText(element: HTMLElement): string {
    return element.textContent;
  }
}

export default HTMLParser(WebHTMLTokenizer);
