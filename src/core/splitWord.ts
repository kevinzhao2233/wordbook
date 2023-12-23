import { split } from 'sentence-splitter';
import Tokenizer from 'wink-tokenizer';
import { isWord, removeSymbols } from '@/utils/helper';

export interface IOriginToken extends Tokenizer.Token {
  originSentence: string;
}

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
      const effectiveTokens = tokens.filter((token) => isWord(token));

      originTokens.push(effectiveTokens.map((item) => ({
        ...item,
        originSentence: removeSymbols(sentence),
      })));
    });

  return { pureSentenceNodes, originTokens };
};
