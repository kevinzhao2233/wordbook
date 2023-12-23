<template>
  <div class="page-container" :class="state.toLocaleLowerCase()">
    <div v-if="state === 'NO_FILE'" class="app-title">制作一个单词本</div>
    <div v-if="state === 'NO_FILE'" class="sub-title">从下面选择几个文件或文件夹开始吧</div>
    <OperatorPanel
      v-if="['NO_FILE', 'SELECTING_FILE', 'SPLITTING', 'IN_TRANSLATION'].includes(state)"
      class="operator-panel"
      :state="state"
      :neet-translate-num="neetTranslateNum"
      :translation-progress="translationProgress"
      @on-change-file="onChangeFile"
      @on-start="startMakeBook"
    />
    <BookList v-if="state === 'NO_FILE'" style="margin-top: 40px;" />
    <div v-if="state === 'DONE'" class="translation-container">
      <a-button type="primary" @click="handlePrint">打印</a-button>
    </div>
    <WordList
      v-if="['SELECTING_FILE', 'SPLITTING', 'IN_TRANSLATION', 'DONE', 'PRINT'].includes(state)"
      class="word-list-container"
      :raw-word-list="rawWordList"
      :state="state"
      @on-translation-done="onTranslationDone"
      @on-translation-progress="onTranslationProgress"
    />

    <HamburgerButton
      v-if="state !== 'PRINT'"
      class="settings-btn"
      size="28"
      @click="openSettings = true"
    />
    <a-drawer
      v-model:open="openSettings"
      root-class-name="settings-drawer-root-class"
      :width="420"
      :closable="false"
    >
      <template #title>
        <div class="settings-title">
          <div class="title">配置</div>
          <Close class="close-settings-btn" size="24" @click="openSettings = false" />
        </div>
      </template>
      <SettingsPanel />
    </a-drawer>
  </div>
</template>
<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { HamburgerButton, Close } from '@icon-park/vue-next';
import { useWebWorker } from '@vueuse/core';
// @ts-ignore
import workerUrl from '../../core/worker?worker=file-chooser';

import BookList from './components/BookList.vue';
import { FileState } from './types';
import { WorkerEventData } from '@/typings';
import { parseHtml } from '@/core/parseHtml';
import WordList from './components/WordList.vue';
import { IWordsResult } from '@/core/translate/youdao';
import OperatorPanel from './components/OperatorPanel.vue';
import SettingsPanel from './components/SettingsPanel.vue';

const { data, post, terminate } = useWebWorker(workerUrl);

const state = ref<FileState>('NO_FILE');

const files = ref<FileList>();

const onChangeFile = (fileList: FileList) => {
  files.value = fileList;
  state.value = 'SELECTING_FILE';
};

const rawWordList = ref<IWordsResult>([]);

const neetTranslateNum = ref(0);

const startMakeBook = () => {
  if (!files.value?.length) return;
  post({ type: 'split-word', payload: files.value } as WorkerEventData);
};

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
    rawWordList.value = newValue.payload.words;
    neetTranslateNum.value = newValue.payload.santenceNum + newValue.payload.words.length;
    state.value = 'IN_TRANSLATION';
    terminate();
  }
});

const onTranslationDone = () => {
  state.value = 'DONE';
};

const translationProgress = ref(0);
const onTranslationProgress = (progress: number) => {
  translationProgress.value = progress;
};

const handlePrint = () => {
  state.value = 'PRINT';
  console.log('打印');
  nextTick(() => {
    window.print();
  });
};

const openSettings = ref(false);
</script>

<style lang="scss" scoped>
.page-container {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 36px;
  align-items: center;
  height: 100vh;
  padding: 32px 60px;
  overflow: hidden auto;
  background: $bg-100;

  .app-title {
    margin-top: 72px;
    margin-bottom: 16px;
    font-size: 60px;
    font-weight: 900;
    color: $text-200;
    letter-spacing: 2px;
    background: linear-gradient(315deg, $primary-200 25%, $accent-100);
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .sub-title {
    font-size: 20px;
    color: $text-300;
  }

  .settings-btn {
    position: fixed;
    top: 24px;
    right: 24px;
    cursor: pointer;
  }

  .word-list-container {
    flex: 1;
    max-width: 720px;
    height: 100%;
    overflow-y: auto;
    border: 2px solid $bg-300;
    border-radius: 14px;
  }

  &.print {
    padding: 0;
    overflow: visible;
    background: #ffffff;

    .word-list-container {
      max-width: 100%;
      height: auto;
      overflow-y: visible;
      border: none;
      border-radius: 0;
    }
  }

  &.selecting_file,
  &.splitting,
  &.in_translation {
    display: flex;
    flex-direction: row;
    justify-content: center;

    .operator-panel {
      flex: 0 0 420px;
      margin-bottom: 150px;
    }

    .word-list-container {
      flex: 1;
      min-width: 500px;
    }
  }
}
</style>
<style lang="scss">
.settings-drawer-root-class {

  .ant-drawer-header,
  .ant-drawer-body {
    background: $bg-100;
  }

  .settings-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 48px;

    .title {
      font-size: 20px;
    }

    .close-settings-btn {
      margin-right: 4px;
      cursor: pointer;
    }
  }
}
</style>
