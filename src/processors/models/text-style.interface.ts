import ContainerStyle from '../../container-style.interface';

/**
 * A subset of ContainerStyle that describes transformations to the text.
 */
type TextStyle = Pick<ContainerStyle, 'textIndent'>;

export default TextStyle;
