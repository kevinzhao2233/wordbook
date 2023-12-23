<template>
  <div class="operator-container" :class="props.state.toLocaleLowerCase()">
    <template v-if="props.state === 'SELECTING_FILE'">
      <div v-if="files && files.length > 0" class="title">
        <span>选择的文件</span>
        <a-dropdown>
          <div class="small-add-btn">继续添加</div>
          <template #overlay>
            <a-menu>
              <a-menu-item @click="selectFile">文件</a-menu-item>
              <a-menu-item @click="selectFolder">文件夹</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
      <div v-if="files && files.length > 0" class="file-list">
        <div v-for="(file, idx) in files" :key="file?.webkitRelativePath || idx" class="file-item">
          <div class="file-name" :title="file.name"><FileText class="file-icon" /><span>{{ file.name }}</span></div>
          <CloseSmall class="remove-btn" size="20" />
        </div>
      </div>
      <div class="divider" />
      <div class="form-item">
        <div class="label">使用词典</div>
        <a-dropdown placement="bottomRight">
          <div class="dropdown">
            {{ dictionarys.find(item => item.value === formState.useDictionary)?.label }}
            &nbsp;<Down class="down-icon" />
          </div>
          <template #overlay>
            <a-menu>
              <a-menu-item
                v-for="item in dictionarys"
                :key="item.value"
                @click="formState.useDictionary = item.value"
              >{{ item.label }}</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
      <div class="form-item">
        <div class="label">单词所在的句子</div>
        <a-dropdown placement="bottomRight">
          <div class="dropdown">
            {{ chooseSentenceWays.find(item => item.value === formState.chooseSentenceWay)?.label }}
              &nbsp;<Down class="down-icon" />
          </div>
          <template #overlay>
            <a-menu>
              <a-menu-item
                v-for="item in chooseSentenceWays"
                :key="item.value"
                @click="formState.chooseSentenceWay = item.value"
              >{{ item.label }}</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
      <div class="make-btn" @click="emits('onStart')">开始制作单词本</div>
    </template>

    <SelectFile v-if="props.state === 'NO_FILE'" @on-select-file="selectFile" @on-select-folder="selectFolder" />
  </div>
</template>
<script setup lang="ts">
import {
  CloseSmall, FileText, Down,
} from '@icon-park/vue-next';
import { useFileDialog } from '@vueuse/core';
import { ref } from 'vue';
import { FileState } from '../types';
import { isRepeatFile, arrayToFileList } from '@/utils/helper';
import SelectFile from './SelectFile.vue';

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

const selectFile = () => {
  open({ accept: '.srt,.md,.txt', directory: false });
};

const selectFolder = () => {
  open({ directory: true });
};

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

const formState = ref({
  useDictionary: 'youdao',
  chooseSentenceWay: 'short',
});

const dictionarys = [
  {
    label: '有道翻译',
    value: 'youdao',
  },
];

const chooseSentenceWays = [
  {
    label: '始终选择最短的',
    value: 'short',
  },
  {
    label: '从最短的五个句子中随机选择',
    value: 'random',
  },
];

</script>

<style lang="scss" scoped>
.operator-container {
  transition: all 0.3s;

  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    span {
      font-size: 18px;
      font-weight: 600;
    }

    .small-add-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px 16px;
      font-size: 16px;
      color: #ffffff;
      cursor: pointer;
      user-select: none;
      background: $primary-200;
      border-radius: 10px;
    }
  }

  .file-list {
    min-height: 120px;
    max-height: 240px;
    padding-right: 20px;
    margin-right: -31px;
    overflow: hidden auto;

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

        .file-icon {
          margin-right: 4px;
          color: $text-300;
          vertical-align: middle;
        }
      }

      .remove-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: 12px;
        cursor: pointer;
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

  .form-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 36px;
    font-size: 15px;

    .label {
      color: rgba($text-200, 0.9);
    }

    .dropdown {
      cursor: pointer;
    }

    .down-icon {
      color: $text-300;
      vertical-align: middle;
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
    padding: 20px 32px 32px;
    margin-top: 120px;
    background: $bg-200;
    border-radius: 20px;
    box-shadow: inset 0 0 0 1px $bg-300, 0 4px 12px -4px $bg-300;
  }
}
</style>
