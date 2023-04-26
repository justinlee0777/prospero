import TextChangeType from './text-change-type.enum';

/**
 * Describes the addition of text.
 */
export interface AddTextChange {
  text: string;
  textIndex: number;
  type: TextChangeType.ADD_WORD;
}

/**
 * Describes the deletion of text.
 */
export interface DeleteTextChange {
  text: string;
  textIndex: number;
  type: TextChangeType.DELETE_WORD;
}

/**
 * Describes the replacement of text by another.
 */
export interface ReplaceTextChange {
  original: string;
  replacement: string;
  textIndex: number;
  type: TextChangeType.REPLACE;
}

/**
 * A description of changes to the text, by the parser itself or by processors.
 */
type TextChange = AddTextChange | DeleteTextChange | ReplaceTextChange;

export default TextChange;
