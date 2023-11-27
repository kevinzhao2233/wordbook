<template>
  <div class="page-container">
    <div v-if="state === 'NO_FILE'" class="choise-container">
      <Plus size="28" class="icon" />
      <span class="text-btn" @click="open({ accept: '.srt, .md, .txt', reset: true, directory: false })">选择文件</span>
      <span>/</span>
      <span class="text-btn" @click="open({ reset: true, directory: true })">文件夹</span>
    </div>
    <!-- <BookList /> -->
    <WordList :raw-word-list="rawWordList" />
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

onChange((fileList: FileList) => {
  console.log(fileList);
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
  if (newValue.type === 'split-word:done') {
    console.log(newValue.payload);
    rawWordList.value = newValue.payload;
  }
});
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
    border: 2px solid rgba($primary-color, 0.2);
    border-radius: 28px;
    box-shadow: 0 12px 32px -8px rgba($primary-color, 0.2);

    .icon {
      margin-right: 8px;
    }

    .text-btn {
      color: #343434;
      cursor: pointer;
      transition: font-size 0.3s, color 0.3s;

      &:hover {
        font-size: 1.2em;
        color: #121315;
      }
    }
  }
}
</style>
