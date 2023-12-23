export type FileState = 'NO_FILE' | 'SELECTING_FILE' | 'SPLITTING' | 'IN_TRANSLATION' | 'DONE' | 'PRINT';

export interface IOptions {
  useDictionary: string;
  chooseSentenceWay: string;
}
