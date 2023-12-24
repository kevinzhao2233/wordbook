import localforage from 'localforage';
import { Merge } from 'type-fest';
import { IWord } from '../wordFrequencySort';
import { translateByYoudao } from './youdao';

export interface ITranslateResult {
  originQuery: string;
  explains: {
    pos: string;
    trans: string;
  }[];
  isTranslated: boolean;
  usPhonetic: string;
  ukPhonetic: string;
}

export type IWordResult = Merge<IWord, Partial<ITranslateResult>>

export type IWordsResult = IWordResult[]

export const translateWords = (
  words: IWord[],
  useDictionary: string,
  resultCb: (result: IWordsResult) => void,
  progressCb: (progress: number) => void,
) => {
  // const localWordsResult: IWordsResult = [];
  // localforage.keys().then(async (localWords) => {
  //   const LocalwordMap = new Map(localWords.map((key) => [key, true]));
  //   for await (const { word } of words) {
  //     if (LocalwordMap.has(word)) {
  //       const wordRes: IWordResult | null = await localforage.getItem(word);
  //       if (wordRes) {
  //         localWordsResult.push(wordRes);
  //       }
  //     }
  //   }
  //   console.log(localWordsResult);
  //   const needTranslateWords = words.filter((word) => !localWordsResult.find((localWord) => localWord.word === word.word));
  //   if (useDictionary === 'youdao') {
  //     translateByYoudao(words, resultCb, progressCb);
  //   }
  // });
  if (useDictionary === 'youdao') {
    translateByYoudao(words, resultCb, progressCb);
  }
};
