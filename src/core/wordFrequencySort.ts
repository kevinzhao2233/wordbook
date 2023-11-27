import { IOriginToken } from './splitWord';

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
}

export const wordFrequencySort = (originTokens: IOriginToken[][]) => {
  const wordMap: IWordMap = {};

  originTokens.flat().forEach((token) => {
    if (token.tag === 'word') {
      const word = token.value.toLowerCase();
      if (wordMap[word]?.frequency) {
        wordMap[word].frequency += 1;
        wordMap[word].originSentenceSet.add(token.originSentence);
      } else {
        wordMap[word] = { frequency: 1, originSentenceSet: new Set([token.originSentence]) };
      }
    }
  });

  // 去重并依照词频排序的所有词
  const words: IWord[] = Object.entries(wordMap)
    .sort((a, b) => b[1].frequency - a[1].frequency)
    .map(([word, info], idx) => ({
      word,
      frequency: info.frequency,
      No: idx + 1,
      originSentenceList: Array.from(info.originSentenceSet),
    }));

  return words;
};
