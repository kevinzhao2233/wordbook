import { split } from 'sentence-splitter';
import Tokenizer from 'wink-tokenizer';

interface IWordMap {
  [key: string]: {
    frequency: number;
    originSentenceSet: Set<string>;
  };
}

interface IOriginToken extends Tokenizer.Token {
  originSentence: string;
}

interface IWord {
  word: string;
  frequency: number;
  No: number;
  originSentenceList: string[];
}

export const splitWord = (article: string) => {
  const START_TIME = Date.now();
  const tokenizerInst = new Tokenizer();

  // 将文章分成句子，每个句子是一个 sentenceNode
  const sentenceNodes = split(article);

  const pureSentenceNodes = sentenceNodes.filter(
    (node) => node.type === 'Sentence',
  );

  // 原始的词 Token
  const originTokens: IOriginToken[][] = [];

  pureSentenceNodes
    .map((node) => node.raw as string)
    .forEach((sentence) => originTokens.push(tokenizerInst.tokenize(sentence).map((item: Tokenizer.Token) => ({
      ...item,
      originSentence: sentence,
    }))));

  const wordMap: IWordMap = {};

  // console.log(originTokens, pureSentenceNodes);

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

  const END_TIME = Date.now();
  console.log(`分词用时：${END_TIME - START_TIME}ms`);
  return { pureSentenceNodes, words };
};
