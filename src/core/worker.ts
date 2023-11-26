// 允许使用全局变量，如 self
/* eslint-disable no-restricted-globals */

import { nanoid } from 'nanoid';
import { WorkerEventData } from '@/typings';
import { splitWord } from './splitWord';
import { readFile } from './readFile';
import { parseSrt } from './parseSrt';
import { parseMarkdownToHtml } from './parseMarkdown';

// 解析 HTML 需要借助主线程渲染到 dom，所以这里需要一个池子，用来存储去解析的 html
const parseHTMLPool: Map<string, boolean> = new Map();

// TODO splitWord 中取消排序，所有文件都分词之后再排序
// TODO 对 markdown 的纯文本分词

/**
 * 分词，这里来的所有文件都是可以进行分词的类型，比如 txt, md, srt 等等
 * @param fileList 文件列表
 */
const handleSplitWord = async (fileList: FileList) => {
  const readFileFnList = Array.from(fileList).map((file) => readFile(file));

  for await (const res of readFileFnList) {
    console.log('读取文件完成，文件类型：', res.type);
    if (res.type === 'txt') {
      const { pureSentenceNodes, words } = splitWord(res.raw);
      console.log('分词完成，txt', pureSentenceNodes, words);
    }
    if (res.type === 'srt') {
      const text = parseSrt(res.raw);
      const { pureSentenceNodes, words } = splitWord(text);
      console.log('分词完成，srt', pureSentenceNodes, words);
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
  // 检测，如果有 md，则需要等待后面 parse-html:done 事件处理后续逻辑
  if (parseHTMLPool.size === 0) {
    // 没有 md 则直接处理后续逻辑
  }
  // readFile(fileList[0]).then(res => {
  //   // 假设是 srt
  //   const text = parseSrt(res)
  //   console.log(text)
  // })
};

const postMessageToMain = (data: WorkerEventData) => {
  self.postMessage(data);
};

onmessage = function (event: MessageEvent<WorkerEventData>) {
  const { data } = event;
  if (data.type === 'split-word') {
    handleSplitWord(data.payload);
  }
  if (data.type === 'parse-html:done') {
    parseHTMLPool.set(data.payload.id, true);
    let isAllDone = true;
    parseHTMLPool.forEach((value) => {
      if (isAllDone === true && value === false) { isAllDone = false; }
    });
    if (isAllDone) {
      // 所有 HTML 解析完成，则可以进行后续逻辑
    }
  }
  if (data.type === 'stop') {
    this.postMessage('ended');
  }
};
