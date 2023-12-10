import { SHA256, enc } from 'crypto-js';
import axios from 'axios';
import { Merge } from 'type-fest';
import { IWord } from '../wordFrequencySort';
// eslint-disable-next-line import/no-duplicates
import { AxiosJsonp } from '../../utils/axios';
// eslint-disable-next-line import/no-duplicates
import '../../utils/axios';

export type IWordsResult = Merge<IWord, Partial<ITranslateResult>>[]

export const translateWords = async (words: IWord[], cb: (result: IWordsResult) => void) => {
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

    const sign = SHA256(str1).toString(enc.Hex);

    idx += 1;

    (axios as AxiosJsonp).jsonp('https://openapi.youdao.com/api', {
      q: query,
      appKey,
      salt,
      from,
      to,
      sign,
      signType: 'v3',
      curtime,
    }).then((res: any) => {
      if (res.errorCode === '0') {
        const result = populateYoudaoRes(res);
        const wordIndex = words.findIndex((item) => item.word === result.originQuery);
        if (wordIndex !== -1) {
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

const truncate = (q: string) => {
  const len = q.length;
  if (len <= 20) return q;
  return q.substring(0, 10) + len + q.substring(len - 10, len);
};

interface ITranslateResult {
  originQuery: string;
  explains: {
    pos: string;
    trans: string;
  }[];
  isTranslated: boolean;
  usPhonetic: string;
  ukPhonetic: string;
}

const populateYoudaoRes = (res: any) => {
  const result: ITranslateResult = {
    originQuery: res.query,
    explains: [],
    isTranslated: true,
    usPhonetic: '',
    ukPhonetic: '',
  };
  if (res.isWord) {
    result.usPhonetic = res.basic.phonetic;
    result.ukPhonetic = res.basic['uk-phonetic'];

    res.basic.explains.forEach((explain: string) => {
      const pos = `${explain.split('.')[0]}.`;
      result.explains.push({
        pos,
        trans: explain.substring(pos.length).trim(),
      });
    });
  }
  return result;
};
