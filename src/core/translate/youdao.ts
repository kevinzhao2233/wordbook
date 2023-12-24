import { customAlphabet } from 'nanoid';
import localforage from 'localforage';
import { SHA256, enc } from 'crypto-js';
import axios from 'axios';
import { IWord } from '../wordFrequencySort';
// eslint-disable-next-line import/no-duplicates
import { AxiosJsonp } from '../../utils/axios';
// eslint-disable-next-line import/no-duplicates
import '../../utils/axios';
import { ITranslateResult, IWordsResult } from '.';
import { simulateSetInterval } from '@/utils/helper';

const nanoid = customAlphabet('1234567890abcdef', 32);

export const translateByYoudao = async (
  words: IWord[],
  resultCb: (result: IWordsResult) => void,
  progressCb: (progress: number) => void,
) => {
  let appKey = '';
  let key = '';
  const settingsStr = localStorage.getItem('wordbook::settings');
  if (settingsStr) {
    const settings = JSON.parse(settingsStr);
    if (settings.accouts.youdao.appKey && settings.accouts.youdao.key) {
      appKey = settings.accouts.youdao.appKey;
      key = settings.accouts.youdao.key;
    }
  }
  const from = 'en';
  const to = 'zh-CHS';

  let idx = 0;

  const testNum = words.length;

  const stopInterval = simulateSetInterval(() => {
    if (idx >= testNum) {
      stopInterval();
      return;
    }
    const salt = nanoid();
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
          localforage.setItem(words[wordIndex].word, {
            word: words[wordIndex].word,
            explains: result.explains,
            usPhonetic: result.usPhonetic,
            ukPhonetic: result.ukPhonetic,
          });
        }
        progressCb(idx + 1);
      } else {
        console.log(res, JSON.stringify(res));
        stopInterval();
      }
      if (idx >= testNum) {
        resultCb(words);
      }
    });
  }, 500);
};

const truncate = (q: string) => {
  const len = q.length;
  if (len <= 20) return q;
  return q.substring(0, 10) + len + q.substring(len - 10, len);
};

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
