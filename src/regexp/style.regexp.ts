/**
 * Regular expressions for getting the 'style' attribute of an HTML element.
 * The first capture group is the quotation marks around the style value. It is only captured to make sure
 * it matches with the ending quotation.
 * The second capture group is the style contents. As capture groups cannot be repeated, the user will have to get
 * the style content separately.
 *
 * Invalid values:
 *
 * style=" '
 */
const StyleRegex = /style=(["'])(.+?)\1/g;

export default StyleRegex;
