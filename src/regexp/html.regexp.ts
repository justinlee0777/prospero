const anyTag = '[A-Za-z0-9]+';

/**
 * Omitting non-closing tags for the time-being as those - afaik - are not allowed.
 * Capture groups
 * First: the entire opening tag, plus attributes
 * Second: the tag name itself
 * Third: the tag content
 *
 * To be unit tested one day:
 * Allowed:
 * - <div>foo</div>
 * - <span>bar</span>
 * - <span style="color: blue">foo</span>
 * Disallowed:
 * - <span>foo</div>
 * - foo
 * - <span>bar
 * - baz</span>
 * - baz<span>
 */
export default function createHTMLRegex(
  tagname = anyTag,
  voidElement = false
): RegExp {
  if (voidElement) {
    return createVoidElementRegex(tagname);
  }

  const openingTag = `<(${tagname}).*?>`;
  const tagContent = '[\\S\\s]*?';
  const closingTag = '</\\2>';

  return new RegExp(`(${openingTag})(${tagContent})${closingTag}`, 'g');
}

/**
 * Capture groups:
 * First: the entire opening tag, plus attributes
 * Second: the tag name itself
 */
function createVoidElementRegex(tagname: string): RegExp {
  return new RegExp(`(<(${tagname}/?).*?>)`, 'g');
}
