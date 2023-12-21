<template>
  <div class="select-container" :class="props.state.toLocaleLowerCase()">
    <template v-if="props.state === 'SELECTING_FILE'">
      <div v-if="files && files.length > 0" class="file-list">
        <div class="title">选择的文件</div>
        <div v-for="(file, idx) in files" :key="file?.webkitRelativePath || idx" class="file-item">
          <div class="file-name" :title="file.name">{{ file.name }}</div>
          <CloseSmall class="remove-btn" size="20" />
        </div>
      </div>
      <div class="divider" />
      表单
      <div class="make-btn" @click="emits('onStart')">开始制作单词本</div>
    </template>

    <div v-if="props.state ==='NO_FILE'" class="select-button">
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
import { ref } from 'vue';
import { FileState } from '../types';
import { isRepeatFile, arrayToFileList } from '@/utils/helper';

interface IProps {
  state: FileState;
}
const props = withDefaults(defineProps<IProps>(), { });

interface IEmits {
  (e: 'onChangeFile', fileList: FileList): void;
  (e: 'onStart'): void;
}
const emits = defineEmits<IEmits>();

const files = ref<File[]>([]);

const { open, onChange } = useFileDialog();

onChange((fileList) => {
  if (!fileList || fileList.length === 0) {
    return;
  }
  let hasRepeatFlag = false;
  for (let index = 0; index < fileList.length; index += 1) {
    const file = fileList[index];
    if (!isRepeatFile(files.value, file)) {
      files.value.push(file);
    } else {
      hasRepeatFlag = true;
    }
  }
  if (hasRepeatFlag) {
    // TODO 提示
  }

  if (files.value.length) {
    emits('onChangeFile', arrayToFileList(files.value));
  }
});

</script>

<style lang="scss" scoped>
.select-container {
  transition: all 0.3s;

  .file-list {
    min-height: 120px;
    max-height: 500px;
    overflow: hidden auto;

    .title {
      font-size: 18px;
      font-weight: 600;
    }

    .file-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 2px 0;

      .file-name {
        flex: 1;
        overflow: hidden;
        font-size: 14px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .remove-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: 12px;
        opacity: 0;
      }

      &:hover {
        .remove-btn {
          opacity: 0.5;

          &:hover {
            opacity: 1;
          }
        }
      }
    }
  }

  .divider {
    width: 100%;
    height: 1px;
    margin: 12px 0;
    background: $bg-300;
  }

  .select-button {
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

  .make-btn {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
    padding: 8px 20px;
    margin-top: 20px;
    font-size: 16px;
    color: #ffffff;
    cursor: pointer;
    background: $primary-200;
    border-radius: 14px;
  }

  &.selecting_file {
    width: 420px;
    padding: 20px 24px 32px;
    background: $bg-200;
    border-radius: 20px;
  }
}
</style>
