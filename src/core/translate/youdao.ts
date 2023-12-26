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
  isWord: boolean,
  resultCb: (result: IWordsResult) => void,
  progressCb: (progress: number) => void,
) => {
  const interval = 200;
  if (isWord) {
    let idx = 0;

    const wordsLength = words.length;

    const { stop } = simulateSetInterval(() => {
      if (idx >= wordsLength) {
        stop();
        return;
      }

      idx += 1;

      // 翻译单词
      translate(words[idx - 1].word).then((res: any) => {
        if (res.errorCode === '0') {
          const result = populateYoudaoRes(res);
          const wordIndex = words.findIndex((item) => item.word === result.originQuery);
          if (wordIndex !== -1) {
            words[wordIndex] = {
              ...words[wordIndex],
              ...result,
            };
            // 缓存到本地
            localforage.setItem(words[wordIndex].word, {
              word: words[wordIndex].word,
              explains: result.explains,
              usPhonetic: result.usPhonetic,
              ukPhonetic: result.ukPhonetic,
            });
          }
          progressCb(idx);
        } else {
          console.warn(res, JSON.stringify(res));
          stop();
        }
        if (idx >= wordsLength) {
          resultCb(words);
        }
      });
    }, interval);
  } else {
    /**
     * 翻译句子
     * 这里单独写是因为单词会用缓存的词典，而句子必须每个都调用有道进行翻译
     */
    let idx = 0;

    const wordsLength = words.length;
    const sentenceMap = new Map<string, string>();

    const { stop, triggerNext } = simulateSetInterval(() => {
      if (idx >= wordsLength) {
        stop();
        return;
      }
      idx += 1;
      if (words[idx - 1].displaySentence) {
        if (sentenceMap.has(words[idx - 1].displaySentence)) {
          words[idx - 1] = {
            ...words[idx - 1],
            displaySentenceTranslated: sentenceMap.get(words[idx - 1].displaySentence),
          };
          progressCb(idx);
          if (idx >= wordsLength) {
            resultCb(words);
          }
          triggerNext();
        } else {
          translate(words[idx - 1].displaySentence).then((res: any) => {
            if (res.errorCode === '0') {
              const wordIndex = words.findIndex((item) => item.displaySentence === res.query);
              if (wordIndex !== -1) {
                words[wordIndex] = {
                  ...words[wordIndex],
                  displaySentenceTranslated: res.translation[0],
                };
                // 缓存
                sentenceMap.set(words[wordIndex].displaySentence, res.translation[0]);
              }
              progressCb(idx);
            } else {
              console.warn(res, JSON.stringify(res));
              stop();
            }
            if (idx >= wordsLength) {
              resultCb(words);
            }
          });
        }
      } else {
        progressCb(idx);
      }
    }, interval);
  }
};

export const translate = async (query: string) => {
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

  const salt = nanoid();
  const curtime = Math.round(new Date().getTime() / 1000);
  // 批量查的时候将 truncate(query) 改为 truncate(query.join(''))
  const str1 = appKey + truncate(query) + salt + curtime + key;
  // var vocabId =  '您的用户词表ID';
  const sign = SHA256(str1).toString(enc.Hex);

  const res = await (axios as AxiosJsonp).jsonp('https://openapi.youdao.com/api', {
    q: query,
    appKey,
    salt,
    from,
    to,
    sign,
    signType: 'v3',
    curtime,
  });
  return res;
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
