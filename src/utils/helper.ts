import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Tokenizer from 'wink-tokenizer';

/**
 * 将时间转换为人性化的描述，比如 10分钟前、1小时前、几秒前
 * @param targetTime 目标时间
 * @returns 人性化的时间描述
 */
export const humanTime = (targetTime: string | number | dayjs.Dayjs | Date | null | undefined): string => {
  dayjs.extend(relativeTime);
  const now = dayjs();
  const target = dayjs(targetTime);
  return now.to(target);
};

/*
 * 生成文件唯一id
 * @param file 文件
 */
export const generageFileId = (file: File) => `${file.name}__${file.size}__${file.lastModified}`;

/**
 * 判断文件是否重复
 * @param files 文件列表
 * @param newFile 新文件
 */
export const isRepeatFile = (files: File[], newFile: File) => {
  const map: Record<string, File> = {};
  for (let i = 0; i < files.length; i += 1) {
    map[generageFileId(files[i])] = files[i];
  }
  return map[generageFileId(newFile)];
};

/**
 * 将数组转为文件列表
 * @param files 文件数组
 */
export const arrayToFileList = (files: File[]): FileList => {
  const dataTransfer = new DataTransfer();
  files.forEach((file) => {
    dataTransfer.items.add(file);
  });
  return dataTransfer.files;
};

/**
 * 去除非字母数字
 * @param sentence 句子
 */
export const removeSymbols = (inputString: string) => inputString.replace(/^[^a-zA-Z0-9"']+/, '');

/**
 * 判断是否是词
 * @param word 要被判断的文本
 */
export const isWord = (token: Tokenizer.Token) => {
  if (token.tag !== 'word') {
    return false;
  }
  if (!(/^[a-zA-Z]{2,50}$/).test(token.value)) {
    return false;
  }
  // @ts-ignore
  // eslint-disable-next-line eqeqeq
  if (token.value == Number(token.value)) {
    return false;
  }
  return true;
};

export const findShortestSentence = (sentenceList: string[]) => {
  let shortestSentence = null;
  for (let i = 1; i < sentenceList.length; i += 1) {
    if (!shortestSentence && sentenceList[i].indexOf(' ') > 0) {
      shortestSentence = sentenceList[i];
    }
    if (shortestSentence && sentenceList[i].length < shortestSentence.length && sentenceList[i].indexOf(' ') > 0) {
      shortestSentence = sentenceList[i];
    }
  }
  return shortestSentence;
};

export const findShortestFive = (sentences: string[]) => {
  const shortestFive = [];

  for (const sentence of sentences) {
    if (sentence.length < 200) {
      if (shortestFive.length < 5) {
        shortestFive.push(sentence);
        shortestFive.sort((a, b) => a.length - b.length);
      } else if (sentence.length < shortestFive[4].length) {
        shortestFive.pop();
        shortestFive.push(sentence);
        shortestFive.sort((a, b) => a.length - b.length);
      }
    }
  }

  return shortestFive;
};

export const getRandomSentence = (shortestFive: string[]) => {
  const randomIndex = Math.floor(Math.random() * shortestFive.length);
  return shortestFive[randomIndex];
};

/**
 * 模拟 setInterval
 * @param callback 回调函数
 * @param interval 间隔时间
 */
export const simulateSetInterval = (callback: () => void, interval: number) => {
  let running = true;

  function run(isTriggerNext: boolean) {
    if (!running) {
      return; // 终止循环
    }

    callback();

    if (!isTriggerNext) {
      // 立即开始下一次循环
      timeoutId = setTimeout(run, interval);
    }
  }

  let timeoutId = setTimeout(run, interval);

  // 提供一个终止函数
  function stop() {
    running = false;
    clearTimeout(timeoutId);
  }

  // 提供一个手动触发下一次循环的函数
  function triggerNext() {
    if (running) {
      // 清除上一次的定时器并立即开始下一次循环
      clearTimeout(timeoutId);
      timeoutId = setTimeout(run(true) as any, 0);
    }
  }

  return { stop, triggerNext };
};

/**
 * 检查字典是否有账号
 * @param dictionary 字典名称
 * @returns boolean
 */
export const eheckDictionaryAccout = (dictionary: string) => {
  try {
    const wordbookSettingsStr = localStorage.getItem('wordbook::settings');
    if (wordbookSettingsStr) {
      const wordbookSettings = JSON.parse(wordbookSettingsStr);
      if (!wordbookSettings?.accouts[dictionary]) {
        return false;
      }
      const currentDictionarySettion = wordbookSettings.accouts[dictionary];
      let hasValue = true;
      for (const key in currentDictionarySettion) {
        if (Object.prototype.hasOwnProperty.call(currentDictionarySettion, key)) {
          const item = currentDictionarySettion[key];
          if (!item && hasValue) {
            hasValue = false;
          }
        }
      }
      return hasValue;
    }
    return false;
  } catch (error) {
    return false;
  }
};
