// 允许使用全局变量，如 self
/* eslint-disable no-restricted-globals */

import { nanoid } from 'nanoid';
import { WorkerEventData } from '@/typings';
import { IOriginToken, splitWord } from './splitWord';
import { readFile } from './readFile';
import { parseSrt } from './parser/parseSrt';
import { parseMarkdownToHtml } from './parser/parseMarkdown';
import { wordFrequencySort } from './wordFrequencySort';
import { IOptions } from '@/views/home/types';

// 解析 HTML 需要借助主线程渲染到 dom，所以这里需要一个池子，用来存储去解析的 html
const parseHTMLPool: Map<string, boolean> = new Map();
const tmpMdRaws: string[] = [];

const allOriginTokens: IOriginToken[][] = [];

let options = {} as IOptions;

/**
 * 分词，这里来的所有文件都是可以进行分词的类型，比如 txt, md, srt 等等
 * @param fileList 文件列表
 */
const handleSplitWord = async (fileList: FileList) => {
  postMessageToMain({
    type: 'split-word:start',
    payload: '',
  });
  const readFileFnList = Array.from(fileList).map((file) => readFile(file));

  for await (const res of readFileFnList) {
    if (res.type === 'txt') {
      const { originTokens } = splitWord(res.raw);
      allOriginTokens.push(...originTokens);
    }
    if (res.type === 'srt') {
      const text = parseSrt(res.raw);
      const { originTokens } = splitWord(text);
      allOriginTokens.push(...originTokens);
    }
    if (res.type === 'md') {
      const html = parseMarkdownToHtml(res.raw);
      const id = nanoid();
      parseHTMLPool.set(id, false);
      postMessageToMain({
        type: 'parse-html',
        payload: { id, html },
      });
    }
  }
  // 没有 md，这里直接生成单词书，若有则需要等待后面 parse-html:done 事件
  if (parseHTMLPool.size === 0) {
    generateWordBook(allOriginTokens);
  }
};

const generateWordBook = (tokens: IOriginToken[][]) => {
  const { words, santenceNum } = wordFrequencySort(tokens, options);

  postMessageToMain({
    type: 'split-word:done',
    payload: { words, santenceNum },
  });
};

const postMessageToMain = (data: WorkerEventData) => {
  self.postMessage(data);
};

onmessage = function (event: MessageEvent<WorkerEventData>) {
  const { data } = event;
  if (data.type === 'split-word') {
    handleSplitWord(data.payload.files);
    options = data.payload.options;
  }
  if (data.type === 'parse-html:done') {
    parseHTMLPool.set(data.payload.id, true);
    tmpMdRaws.push(data.payload.raw);

    let isAllDone = true;
    parseHTMLPool.forEach((value) => {
      if (isAllDone === true && value === false) { isAllDone = false; }
    });
    if (isAllDone) {
      const { originTokens } = splitWord(tmpMdRaws.join('\n'));
      allOriginTokens.push(...originTokens);
      generateWordBook(allOriginTokens);
    }
  }
  if (data.type === 'stop') {
    this.postMessage('ended');
  }
};
