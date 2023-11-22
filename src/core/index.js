import { split } from 'sentence-splitter';
import tokenizer from 'wink-tokenizer';
import sha256 from 'crypto-js/sha256';
import encHex from 'crypto-js/enc-hex';
// import CryptoJS from 'crypto-js';
import axios from 'axios';
import '../utils/axios';

export const splitWord = (article) => {
  const START_TIME = Date.now();
  const tokenizerInst = tokenizer();

  // 将文章分成句子，每个句子是一个 sentenceNode
  const sentenceNodes = split(article);

  const pureSentenceNodes = sentenceNodes.filter(
    (node) => node.type === 'Sentence',
  );

  // 原始的词 Token
  const originTokens = [];

  pureSentenceNodes
    .map((node) => node.raw)
    .forEach((sentence) => originTokens.push(tokenizerInst.tokenize(sentence).map((item) => ({ ...item, originSentence: sentence }))));

  const wordMap = {};

  console.log(originTokens, pureSentenceNodes);

  originTokens.flat().forEach((token, idx) => {
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
  const words = Object.entries(wordMap)
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

export const translateWords = async (words, cb) => {
  const appKey = '36ca3ad0c96e371e';
  const key = 'LVMX92sWVBws39qxNuG6iqxiXLQz8xIz';
  const from = 'en';
  const to = 'zh-CHS';

  let idx = 0;

  const timer = setInterval(() => {
    if (idx >= 5) {
      clearInterval(timer);
      return;
    }
    const salt = (new Date()).getTime();
    const curtime = Math.round(new Date().getTime() / 1000);
    // 批量查的时候 query 为数组
    const query = words[idx].word;
    // 批量查的时候将 truncate(query) 改为 truncate(query.join(''))
    const str1 = appKey + truncate(query) + salt + curtime + key;
    // var vocabId =  '您的用户词表ID';

    const sign = sha256(str1).toString(encHex);

    idx += 1;

    axios.jsonp('https://openapi.youdao.com/api', {
      q: query,
      appKey,
      salt,
      from,
      to,
      sign,
      signType: 'v3',
      curtime,
    }).then((res) => {
      if (res.errorCode === '0') {
        const result = populateYoudaoRes(res);
        const wordIndex = words.findIndex((item) => item.word === result.originQuery);
        if (wordIndex) {
          words[wordIndex] = {
            ...words[wordIndex],
            ...result,
          };
        }
      }
      if (idx >= 5) {
        cb(words);
      }
    });
  }, 200);
};

const populateYoudaoRes = (res) => {
  const result = {
    originQuery: res.query,
    explains: [],
    isTranslated: true,
  };
  if (res.isWord) {
    result.usPhonetic = res.basic.phonetic;
    result.ukPhonetic = res.basic['uk-phonetic'];

    res.basic.explains.forEach((explain) => {
      const pos = `${explain.split('.')[0]}.`;
      result.explains.push({
        pos,
        trans: explain.substring(pos.length).trim(),
      });
    });
  }
  return result;
};

const truncate = (q) => {
  const len = q.length;
  if (len <= 20) return q;
  return q.substring(0, 10) + len + q.substring(len - 10, len);
};
