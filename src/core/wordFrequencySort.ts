import { findShortestFive, findShortestSentence, getRandomSentence } from '@/utils/helper';
import { IOriginToken } from './splitWord';
import { IOptions } from '@/views/home/types';

export interface IWordMap {
  [key: string]: {
    frequency: number;
    originSentenceSet: Set<string>;
  };
}

export interface IWord {
  word: string;
  frequency: number;
  No: number;
  originSentenceList: string[];
  displaySentence: string;
  displaySentenceTranslated?: string;
}

export const wordFrequencySort = (originTokens: IOriginToken[][], options: IOptions) => {
  const wordMap: IWordMap = {};

  originTokens.flat().forEach((token) => {
    if (token.tag === 'word') {
      const word = token.value.toLowerCase();
      if (wordMap[word]?.frequency) {
        wordMap[word].frequency += 1;
        if (token.originSentence.length <= 200) {
          wordMap[word].originSentenceSet.add(token.originSentence);
        }
      } else {
        wordMap[word] = {
          frequency: 1,
          originSentenceSet: token.originSentence.length <= 200 ? new Set([token.originSentence]) : new Set([]),
        };
      }
    }
  });

  const santenceSet = new Set();

  // 去重并依照词频排序的所有词
  const words: IWord[] = Object.entries(wordMap)
    .sort((a, b) => b[1].frequency - a[1].frequency)
    .map(([word, info], idx) => {
      const originSentenceList = Array.from(info.originSentenceSet);
      let displaySentence = '';
      if (options.chooseSentenceWay === 'randomFromShortestFive') {
        displaySentence = getRandomSentence(findShortestFive(originSentenceList));
      }
      if (options.chooseSentenceWay === 'shortest') {
        displaySentence = findShortestSentence(originSentenceList) || '';
      }
      santenceSet.add(displaySentence);
      return {
        word,
        frequency: info.frequency,
        No: idx + 1,
        originSentenceList,
        displaySentence,
      };
    });

  return { words, santenceNum: santenceSet.size };
};
