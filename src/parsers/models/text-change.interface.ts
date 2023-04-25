import TextChangeType from './text-change-type.enum';

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

type TextChange = DeleteWordChange | ReplaceChange;

export default TextChange;
