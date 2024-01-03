<template>
  <div id="print-result-container" class="result" :class="[props.state.toLocaleLowerCase(), { example: isExample }]">
    <div v-if="wordList.length" class="directory">
      <div class="directory-title">词汇表</div>
      <template v-for="(item, idx) in letters" :key="item">
        <div v-if="wordListByLetter[item]">
          <div class="title" :class="idx === 0 ? 'title-first' : ''">{{ item }}</div>
          <p v-for="word in wordListByLetter[item]" :key="word.word">{{ word.word }} / No.{{ word.No }}</p>
        </div>
      </template>
    </div>
    <div v-for="(item, idx) in wordList" :key="item.word" class="word-item">
      <h2 v-if="idx % stageInterval === 0" class="stage">
        STAGE {{ idx / stageInterval + 1 }}
        <span class="extra"><span class="label">No.</span>{{ item.No }}<span class="label"> ~ No.</span>{{
          item.No + stageInterval > wordList[wordList.length - 1].No ? wordList[wordList.length - 1].No : item.No + stageInterval
        }}</span>
      </h2>
      <div class="main-info">
        <div class="word">{{ item.word }}</div>
        <div v-if="item.isTranslated && item.usPhonetic" class="pronounce">
          <span class="thin">美</span>&nbsp;/<span class="font-Gilroy">{{ item.usPhonetic }}</span>/</div>
        <div v-if="item.isTranslated && item.ukPhonetic" class="pronounce">
          <span class="thin">英</span>&nbsp;/<span class="font-Gilroy">{{ item.ukPhonetic }}</span>/</div>
        <div class="frequency">
          <div class="label">词频</div>
          <div class="value">{{ item.frequency }}</div>
        </div>
        <div class="no">
          <div class="label">No.</div>
          <div class="value">{{ idx + 1 }}</div>
        </div>
      </div>
      <p v-if="item.isTranslated" class="paraphrase-container">
        <template v-for="par in item.explains" :key="par.pos">
          <span class="pos">{{ par.pos }}</span>
          <span class="tran">{{ par.trans }}</span>
        </template>
      </p>
      <p class="origin-sentence thin">
        {{ item.displaySentence }}&nbsp;{{ item.displaySentenceTranslated }}
      </p>
    </div>
    <div v-if="isExample" class="mask">
      <p class="desc">最终，你的单词本就会像这个示例一样。</p>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  nextTick, ref, watch, shallowRef, triggerRef,
} from 'vue';
import dayjs from 'dayjs';
import { IWordsResult, translateWords } from '@/core/translate';
import { FileState } from '../types';
import { exampleWordList } from '@/assets/exampleWordList';

interface IProps {
  rawWordList: IWordsResult;
  state: FileState;
  useDictionary?: string;
}
const props = withDefaults(defineProps<IProps>(), { useDictionary: 'youdao' });

interface IEmits {
  (e: 'onTranslationDone'): void;
  (e: 'onTranslationProgress', progress: number): void;
}
const emits = defineEmits<IEmits>();

const isExample = ref(false);

// TODO 需要放到设置中
/**
 * 40 个单词一组
 */
const stageInterval = ref(40);

const wordList = shallowRef<IWordsResult>([]);

watch(() => props.state, (newVal) => {
  if (['SELECTING_FILE', 'SPLITTING'].includes(newVal)) {
    nextTick(() => {
      wordList.value = exampleWordList;
      isExample.value = true;
    });
  } else {
    isExample.value = false;
  }
  if (newVal === 'IN_TRANSLATION') {
    setTimeout(() => {
      wordList.value = props.rawWordList;
      const copyWordList: IWordsResult = JSON.parse(JSON.stringify(wordList.value));
      // 界面要渲染单词，可能会卡住，导致翻译的进程出现问题，所以这里等待一会儿
      setTimeout(() => {
        startTrans(copyWordList);
      }, props.rawWordList.length / 2);
    }, 300);
  }
}, {
  immediate: true,
});

/**
 * 开始翻译
 * @param copyWordList 待翻译的单词列表
 */
const startTrans = async (copyWordList: IWordsResult) => {
  translateWords(copyWordList, props.useDictionary, (newWordList) => {
    emits('onTranslationDone');
    wordList.value = newWordList;
    nextTick(() => {
      sortWitchLetter();
    });
  }, (progress) => {
    emits('onTranslationProgress', progress);
  });
};

const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
const wordListByLetter = shallowRef<{ [key: string]: IWordsResult }>({});

/**
 * 按照字母顺序对单词列表进行排序
 */
const sortWitchLetter = () => {
  // 对wordList.value 中每一个 word 按照字母顺序排序，比如 a b c d
  const copyWordList: IWordsResult = JSON.parse(JSON.stringify(wordList.value));
  copyWordList.sort((a, b) => {
    if (a.word < b.word) {
      return -1;
    }
    if (a.word > b.word) {
      return 1;
    }
    return 0;
  });
  copyWordList.forEach((item) => {
    const letter = item.word[0];
    if (!wordListByLetter.value[letter]) {
      wordListByLetter.value[letter] = [];
    }
    wordListByLetter.value[letter].push(item);
  });
  triggerRef(wordListByLetter);
  nextTick(() => {
    saveBook();
  });
};

const saveBook = () => {
  if (props.state === 'DONE') {
    window.bookStore.setItem(String(Date.now()), {
      name: `我的单词书 ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`,
      createTime: Date.now(),
      useDictionary: props.useDictionary,
      wordCount: wordList.value.length,
      wordList: wordList.value,
      _version: 1,
    });
  }
};
</script>

<style lang="scss" scoped>
.thin {
  font-weight: 300;
  color: rgba(#000000, 0.6);
}
.font-Gilroy {
  font-family: Gilroy;
  font-weight: bolder;
}

.result {
  position: relative;
  padding: 0 9pt;
  font-size: 9pt;
  line-height: 1.4;

  .directory {
    column-count: 3;
    break-before: page;

    .directory-title {
      padding: 20pt 0;
      font-size: 20pt;
      font-weight: bold;
      text-align: center;
      column-span: all;
    }

    .title {
      padding-left: 4pt;
      margin-top: 1em;
      font-size: 12pt;
      font-weight: bold;
      background: rgba(#000000, 0.1);

      &.title-first {
        margin-top: 0;
      }
    }

    p {
      margin: 0;
      line-height: 1.7;
    }
  }

  .word-item {
    margin-bottom: 14pt;

    .stage {
      padding: 10pt 0 2pt;
      margin-bottom: 30pt;
      font-size: 20pt;
      border-bottom: 1px solid;
      break-before: page;

      .extra {
        margin-left: 10pt;
        font-size: 10.5pt;

        .label {
          color: rgba(#000000, 0.5);
        }
      }
    }

    .main-info {
      display: flex;
      column-gap: 14pt;
      align-items: end;
      justify-content: space-between;
      margin-bottom: 5pt;

      .word {
        font-size: 11pt;
        font-weight: 600;
      }

      .pronounce {
        font-size: 10.5pt;
      }

      .no {
        display: flex;
        align-items: end;
        padding: 0 2px;

        .label {
          font-size: 10.5pt;
          line-height: 1;
          color: rgba(#000000, 0.5);
        }

        .value {
          font-size: 10.5pt;
          line-height: 1;
        }
      }

      .frequency {
        display: flex;
        margin-left: auto;
        font-size: 9pt;

        .label {
          padding: 0 2px;
          line-height: calc(9pt + 5px);
          color: #ffffff;
          background: rgba(#000000, 0.5);
        }
        .value {
          min-width: 18pt;
          text-align: center;
          border: 1px solid rgba(#000000, 0.3);
        }
      }
    }

    .paraphrase-container {
      margin-bottom: 0.4em;

      .pos {
        margin-right: 0.3em;
        font-family: georgia;
        font-style: italic;
      }

      .tran {
        margin-right: 0.5em;
        color: rgba(#000000, 0.8);
      }
    }
  }

  .mask {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba($bg-100, 0), rgba($bg-100, 1) 60%);

    .desc {
      position: absolute;
      top: 60%;
      left: 50%;
      width: 100%;
      font-size: 16px;
      color: $primary-300;
      text-align: center;
      transform: translate(-50%, -50%);
    }
  }

  &.example {
    overflow: hidden !important;
  }

  // &.print {
  //   padding: 1cm 0.8cm 1cm 1.2cm;
  // }
}
</style>
