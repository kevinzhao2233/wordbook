<template>
  <div class="result">
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
        <div v-if="item.isTranslated" class="pronounce">
          <span class="thin">美</span>&nbsp;/<span class="font-Gilroy">{{ item.usPhonetic }}</span>/</div>
        <div v-if="item.isTranslated" class="pronounce">
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
        {{ item.displaySentence }}
      </p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { IWordsResult, translateWords } from '@/core/translate';
import { FileState } from '../types';

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

// TODO 需要放到设置中
const stageInterval = ref(40);

const wordList = ref<IWordsResult>([]);

const isTranslating = ref(false);

watch(() => props.state, (newVal) => {
  if (newVal === 'IN_TRANSLATION') {
    nextTick(() => {
      wordList.value = props.rawWordList;
      const copyWordList: IWordsResult = JSON.parse(JSON.stringify(wordList.value));
      setTimeout(() => {
        startTrans(copyWordList);
      }, 3000);
    });
  }
}, {
  immediate: true,
});

const startTrans = async (copyWordList: IWordsResult) => {
  isTranslating.value = true;
  console.log('开始翻译啦', wordList.value);
  translateWords(copyWordList, props.useDictionary, (newWordList) => {
    console.log('翻译完啦', newWordList);
    emits('onTranslationDone');
    wordList.value = newWordList;
    nextTick(() => {
      isTranslating.value = false;
      sortWitchLetter();
    });
  }, (progress) => {
    emits('onTranslationProgress', progress);
  });
};

const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
const wordListByLetter = ref<{ [key: string]: IWordsResult }>({});

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
  console.log(wordListByLetter.value);
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
}
</style>
