export type FileState =
'NO_FILE'
|'SELECTING_FILE'
|'SPLITTING'
|'IN_TRANSLATION'
|'DONE'
|'PRINT'
|'PREVIEW';

export interface IOptions {
  useDictionary: string;
  chooseSentenceWay: string;
}

export interface IBook {
  name: string;
  createTime: number;
  useDictionary: string;
  wordCount: number;
  wordList: any;
  _version: number;
}
