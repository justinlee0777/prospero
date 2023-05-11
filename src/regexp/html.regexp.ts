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
const HTMLRegex = /(<([A-Za-z]+).*?>)([^<>]*)<\/\2>/g;

export default HTMLRegex;
