/**
 * Regular expressions for getting the value from the 'style' attribute of an HTML element.
 * The first capture group is the property key.
 * The second capture group is the property value.
 *
 * Valid values:
 * font-size: 16px
 * font-size: 16px;
 * font-weight:bold
 * font-size: 16px;font-weight: bold
 */
const StyleValueRegex = /([a-zA-Z-]+): *([a-zA-Z0-9\. ]+);?/g;

export default StyleValueRegex;
