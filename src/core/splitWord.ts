import { split } from 'sentence-splitter';
import Tokenizer from 'wink-tokenizer';

export interface IOriginToken extends Tokenizer.Token {
  originSentence: string;
}

export const splitWord = (article: string) => {
  const tokenizerInst = new Tokenizer();

  // 将文章分成句子，每个句子是一个 sentenceNode
  const sentenceNodes = split(article);

  const pureSentenceNodes = sentenceNodes.filter((node) => node.type === 'Sentence');

  // 原始的词 Token
  const originTokens: IOriginToken[][] = [];

  pureSentenceNodes
    .map((node) => node.raw as string)
    .forEach((sentence) => originTokens.push(tokenizerInst.tokenize(sentence).map((item: Tokenizer.Token) => ({
      ...item,
      originSentence: sentence,
    }))));

  return { pureSentenceNodes, originTokens };
};
