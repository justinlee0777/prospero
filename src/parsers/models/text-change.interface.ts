import TextChangeType from './text-change-type.enum';

export interface AddWordChange {
  word: string;
  textIndex: number;
  type: TextChangeType.ADD_WORD;
}

export interface DeleteWordChange {
  word: string;
  textIndex: number;
  type: TextChangeType.DELETE_WORD;
}

export interface ReplaceChange {
  original: string;
  replacement: string;
  textIndex: number;
  type: TextChangeType.REPLACE;
}

type TextChange = AddWordChange | DeleteWordChange | ReplaceChange;

export default TextChange;
