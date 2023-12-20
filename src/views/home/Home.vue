<template>
  <div class="page-container" :class="{ print: state === 'PRINT' }">
    <div v-if="state === 'NO_FILE'" class="choise-container">
      <Plus class="icon" />
      <span class="text-btn" @click="open({ accept: '.srt, .md, .txt', reset: true, directory: false })">选择文件</span>
      <span>/</span>
      <span class="text-btn" @click="open({ reset: true, directory: true })">文件夹</span>
    </div>
    <div v-if="state === 'DONE'" class="translation-container">
      <a-button type="primary" @click="handlePrint">打印</a-button>
    </div>
    <!-- <BookList /> -->
    <WordList
      class="word-list-container"
      :raw-word-list="rawWordList"
      :state="state"
      @on-translation-done="onTranslationDone"
    />
  </div>
</template>
<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { Plus } from '@icon-park/vue-next';
import { useFileDialog, useWebWorker } from '@vueuse/core';
// @ts-ignore
import workerUrl from '../../core/worker?worker=file-chooser';

import BookList from './components/BookList.vue';
import { FileState } from './types';
import { WorkerEventData } from '@/typings';
import { parseHtml } from '@/core/parseHtml';
import WordList from './components/WordList.vue';
import { IWordsResult } from '@/core/translate/youdao';

const {
  data, post, terminate, worker,
} = useWebWorker(workerUrl);

const state = ref<FileState>('NO_FILE');

const {
  files, open, reset, onChange,
} = useFileDialog();

onChange((fileList) => {
  if (!fileList || fileList.length === 0) {
    return;
  }
  console.log({ fileList });
  post({ type: 'split-word', payload: fileList } as WorkerEventData);
});

const rawWordList = ref<IWordsResult>([]);

// useWebWorker 封装了事件处理，这里的 watch 就相当于 onmessage
watch(data, (newValue) => {
  console.log('watch data', newValue);
  if (newValue.type === 'parse-html') {
    const raw = parseHtml(newValue.payload.html);
    post({ type: 'parse-html:done', payload: { id: newValue.payload.id, raw } } as WorkerEventData);
  }
  if (newValue.type === 'split-word:start') {
    state.value = 'SPLITTING';
  }
  if (newValue.type === 'split-word:done') {
    rawWordList.value = newValue.payload;
    state.value = 'IN_TRANSLATION';
  }
});

const onTranslationDone = () => {
  state.value = 'DONE';
};

const handlePrint = () => {
  state.value = 'PRINT';
  console.log('打印');
  nextTick(() => {
    window.print();
  });
};
</script>

<style lang="scss" scoped>
.page-container {
  display: flex;
  gap: 36px;
  align-items: stretch;
  justify-content: space-between;
  height: 100vh;
  min-height: 400px;
  padding: 32px 60px;
  overflow: hidden;
  background: $bg-100;

  .choise-container {
    display: flex;
    flex: 0 0 300px;
    gap: 4px;
    align-items: center;
    width: 300px;
    height: 72px;
    padding: 0 20px;
    margin-top: 240px;
    font-size: 20px;
    background: $bg-200;
    border-radius: 28px;

    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      margin-right: 8px;
      font-size: 28px;
      line-height: 28px;
      color: $primary-300;
      vertical-align: middle;
      background: $accent-200;
      border-radius: 8px;
    }

    .text-btn {
      cursor: pointer;
      transition: font-size 0.2s;

      &:hover {
        font-size: 1.2em;
      }
    }
  }

  .word-list-container {
    flex: 1;
    max-width: 720px;
    height: 100%;
    overflow-y: auto;
  }

  &.print {
    padding: 0;
    overflow: visible;
    background: #ffffff;

    .word-list-container {
      flex: 1;
      max-width: 100%;
      height: auto;
      overflow-y: visible;
    }
  }
}
</style>
