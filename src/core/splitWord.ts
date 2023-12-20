import { split } from 'sentence-splitter';
import Tokenizer from 'wink-tokenizer';

export interface IOriginToken extends Tokenizer.Token {
  originSentence: string;
}

/**
 * 判断是否是词
 * @param word 要被判断的文本
 */
const isWord = (word: string) => {
  if (word.length === 0) {
    return false;
  }
  // @ts-ignore
  // eslint-disable-next-line eqeqeq
  if (word == Number(word)) {
    return false;
  }
  return true;
};

/**
 * 分词
 * @param article 文章
 */
export const splitWord = (article: string) => {
  const tokenizerInst = new Tokenizer();

  // 将文章分成句子，每个句子是一个 sentenceNode
  const sentenceNodes = split(article);

  const pureSentenceNodes = sentenceNodes.filter((node) => node.type === 'Sentence');

  // 原始的词 Token
  const originTokens: IOriginToken[][] = [];

  pureSentenceNodes
    .map((node) => node.raw as string)
    .forEach((sentence) => {
      const tokens = tokenizerInst.tokenize(sentence);
      const effectiveTokens = tokens.filter((token) => isWord(token.value));

      originTokens.push(effectiveTokens.map((item) => ({
        ...item,
        originSentence: sentence,
      })));
    });

  return { pureSentenceNodes, originTokens };
};
