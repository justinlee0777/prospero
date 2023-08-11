import * as cheerio from 'cheerio';

import HTMLParser from './html.parser';
import HTMLTokenizer from './html.tokenizer';

class ServerHTMLTokenizer extends HTMLTokenizer<
  cheerio.CheerioAPI,
  cheerio.Element
> {
  loadHTML(text: string): cheerio.CheerioAPI {
    return cheerio.load(text);
  }

  getRoot($: cheerio.CheerioAPI): cheerio.Element {
    return $('body')[0];
  }

  getInnerHTML(element: cheerio.Element, $: cheerio.CheerioAPI): string {
    return $(element).html();
  }

  getOuterHTML(element: cheerio.Element, $: cheerio.CheerioAPI): string {
    return $.html(element);
  }

  getText(element: cheerio.Element, $: cheerio.CheerioAPI): string {
    return $(element).text();
  }
}

export default HTMLParser(ServerHTMLTokenizer);
