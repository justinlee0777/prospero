import TextChangeType from './text-change-type.enum';

interface DeleteWord {
  word: string;
  textIndex: number;
  type: TextChangeType.DELETE_WORD;
}

type TextChange = DeleteWord;

export default TextChange;
