<template>
  <div class="result">
    <div v-for="(item, idx) in wordList" :key="item.word" class="word-item">
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
          <div class="value">{{ item.No }}</div>
        </div>
      </div>
      <p v-if="item.isTranslated" class="paraphrase-container">
        <template v-for="par in item.explains" :key="par.pos">
          <span class="pos">{{ par.pos }}</span>
          <span class="tran">{{ par.trans }}</span>
        </template>
      </p>
      <p class="origin-sentence thin">
        {{ findTheShortestSentence(item.originSentenceList) }}
      </p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { IWordsResult, translateWords } from '@/core/translate/youdao';

interface IProps {
  rawWordList: IWordsResult;
}
const props = withDefaults(defineProps<IProps>(), { });

const wordList = ref<IWordsResult>([]);

const isTranslating = ref(false);

watch(() => props.rawWordList, (newVal) => {
  if (isTranslating.value) return;
  wordList.value = newVal;
  startTrans();
});

const startTrans = async () => {
  isTranslating.value = true;
  translateWords(JSON.parse(JSON.stringify(wordList.value)), (newWordList) => {
    console.log('翻译完啦', newWordList);
    wordList.value = newWordList;
    nextTick(() => {
      isTranslating.value = false;
    });
  });
};

const findTheShortestSentence = (sentenceList: string[]) => {
  let shortestSentence = sentenceList[0];
  for (let i = 1; i < sentenceList.length; i += 1) {
    if (sentenceList[i].length < shortestSentence.length) {
      shortestSentence = sentenceList[i];
    }
  }
  return shortestSentence;
};
</script>

<style lang="scss" scoped>
.result {
  flex: 1;
  max-width: 720px;
  line-height: 1.4;

  .word-item {
    margin-bottom: 24px;

    .main-info {
      display: flex;
      column-gap: 24px;
      align-items: end;
      justify-content: space-between;
      margin-bottom: 8px;

      .word {
        font-size: 1.2em;
        font-weight: 600;
      }

      // .pronounce {
      // }

      .no {
        display: flex;
        padding: 0 2px;
        font-size: 12px;

        .label {
          color: rgba(#000000, 0.5);
        }
      }

      .frequency {
        display: flex;
        margin-left: auto;
        font-size: 12px;

        .label {
          padding-right: 2px;
          padding-left: 2px;
          color: #ffffff;
          background: rgba(#000000, 0.5);
        }
        .value {
          min-width: 25px;
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
