import Tokenizer from 'wink-tokenizer';

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

  function run() {
    if (!running) {
      return; // 终止循环
    }

    callback();
    setTimeout(run, interval);
  }

  setTimeout(run, interval);

  // 提供一个终止函数
  return function stop() {
    running = false;
  };
};
