<template>
  <div class="container">
    <div class="origin">
      <a-space>
        <a-button type="primary" style="margin-bottom: 12px;" @click="startSplitWord">分词</a-button>
        <a-button type="primary" style="margin-bottom: 12px;" @click="startTrans">翻译</a-button>
      </a-space>
      <a-textarea v-model:value="article" :rows="8" />
    </div>
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
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { article as testArticle } from '../assets/data.js';
import { splitWord, translateWords } from '../core/index';

const article = ref(testArticle);

const wordList = ref([]);

const startSplitWord = () => {
  const { pureSentenceNodes, words } = splitWord(article.value);

  wordList.value = words;

  console.log(pureSentenceNodes, words);
};

const startTrans = async () => {
  translateWords(JSON.parse(JSON.stringify(wordList.value)), (newWordList) => {
    console.log(newWordList);
    wordList.value = newWordList;
  });
};

const findTheShortestSentence = (sentenceList) => {
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
@font-face {
  font-family: Gilroy;
  src: url(../assets/Gilroy/Gilroy-Medium-2.otf);
}

@font-face {
  font-family: georgia;
  src: url(../assets/GEORGIA/GEORGIA.ttf);

  // font-weight: 700;
}

.thin {
  font-weight: 300;
  color: rgba(#000000, 0.5);
}
.font-Gilroy {
  font-family: Gilroy;
}
.container {
  display: flex;
  gap: 48px;
  padding: 24px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;

  .origin {
    flex: 0 0 40px;
  }

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
}
</style>
