import localforage from 'localforage';
import { Merge } from 'type-fest';
import { IWord } from '../wordFrequencySort';
import { translateByYoudao } from './youdao';

export interface ITranslateResult {
  originQuery?: string;
  explains: {
    pos: string;
    trans: string;
  }[];
  isTranslated: boolean;
  usPhonetic: string;
  ukPhonetic: string;
}

export type ILocalWordResult = Exclude<ITranslateResult, 'originQuery'>

export type IWordResult = Merge<IWord, Partial<ITranslateResult>>

export type IWordsResult = IWordResult[]

/**
 * 从本地缓存中获取单词翻译结果
 * @param words 单词列表
 */
const translateByLocal = async (words: IWord[]) => {
  const localWordsResult: IWordResult[] = [];
  const localWords = await localforage.keys();

  const LocalwordMap = new Map(localWords.map((key) => [key, true]));
  let index = 0;
  for await (const { word } of words) {
    if (LocalwordMap.has(word)) {
      const wordRes: ILocalWordResult | null = await localforage.getItem(word);
      if (wordRes) {
        localWordsResult[index] = {
          ...words[index],
          explains: wordRes.explains,
          isTranslated: true,
          usPhonetic: wordRes.usPhonetic,
          ukPhonetic: wordRes.ukPhonetic,
        };
      }
    } else {
      localWordsResult[index] = {
        ...words[index],
        isTranslated: false,
      };
    }
    index += 1;
  }
  return localWordsResult;
};

export const translateWords = async (
  words: IWord[],
  useDictionary: string,
  resultCb: (result: IWordsResult) => void,
  progressCb: (progress: number) => void,
) => {
  const localWordsResult = await translateByLocal(words);

  progressCb(localWordsResult.length);

  const needTranslateWords = localWordsResult.filter((word) => !word.isTranslated);

  /**
   * 翻译句子
   */
  const translateSentence = () => {
    translateByYoudao(localWordsResult, false, (result) => {
      const resultMap = new Map(result.map((word) => [word.word, word]));
      for (let i = 0; i < words.length; i += 1) {
        if (resultMap.has(words[i].word)) {
          localWordsResult[i] = resultMap.get(words[i].word) as IWordResult;
        }
      }
      resultCb(localWordsResult);
    }, (progress) => {
      progressCb(localWordsResult.length + progress);
    });
  };

  /**
   * 调用接口，翻译单词
   */
  if (needTranslateWords.length) {
    if (useDictionary === 'youdao') {
      translateByYoudao(needTranslateWords, true, (result) => {
        const resultMap = new Map(result.map((word) => [word.word, word]));
        for (let i = 0; i < words.length; i += 1) {
          if (resultMap.has(words[i].word)) {
            localWordsResult[i] = resultMap.get(words[i].word) as IWordResult;
          }
        }
        translateSentence();
      }, (progress) => {
        progressCb(progress);
      });
    }
  } else {
    // 如果所有单词都从本地翻译了，则直接翻译句子
    translateSentence();
  }
};
