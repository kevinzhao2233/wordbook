<template>
  <div v-if="props.state === 'NO_FILE'" class="choise-container">
    <div v-if="files && files.length > 0" class="file-list">
      <div v-for="(file, idx) in files" :key="file?.webkitRelativePath || idx" class="file-item">
        <div class="file-name">{{ file.name }}</div>
        <a-button type="text" :icon="h(CloseSmall)" />
      </div>
    </div>
    <!-- <div class="primary-btn">开始制作单词本</div> -->

    <div class="choise-button">
      <Plus class="icon" />
      <span class="text-btn" @click="open({ accept: '.srt, .md, .txt', reset: true, directory: false })">选择文件</span>
      <span>/</span>
      <span class="text-btn" @click="open({ reset: true, directory: true })">文件夹</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { CloseSmall, Plus } from '@icon-park/vue-next';
import { useFileDialog } from '@vueuse/core';
import { h } from 'vue';
import { FileState } from '../types';

interface IProps {
  state: FileState;
}
const props = withDefaults(defineProps<IProps>(), { });

interface IEmits {
  (e: 'onStart'): void;
}
const emits = defineEmits<IEmits>();

const { files, open, onChange } = useFileDialog();

onChange((fileList) => {
  if (!fileList || fileList.length === 0) {
    return;
  }
  console.log({ fileList });
  // post({ type: 'split-word', payload: fileList } as WorkerEventData);
});

</script>

<style lang="scss" scoped>
.choise-container {
  transition: all 0.3s;

  .file-list {
    max-height: 500px;
    overflow: hidden auto;

    .file-item {
      display: flex;
      align-items: center;
      padding: 12px 0;

      .file-name {
        overflow: hidden;
        font-size: 14px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .choise-button {
    display: flex;
    gap: 8px;
    align-items: center;
    width: 320px;
    height: 72px;
    padding: 0 20px;
    margin-top: 80px;
    font-size: 20px;
    color: #ffffff;
    background: $primary-200;
    border-radius: 28px;

    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      margin-right: 8px;
      font-size: 28px;
      color: #ffffff;
    }

    .text-btn {
      cursor: pointer;
      transition: font-size 0.2s;

      &:hover {
        font-size: 1.2em;
      }
    }
  }
}
</style>
