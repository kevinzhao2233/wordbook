<template>
  <div class="operator-container" :class="props.state.toLocaleLowerCase()">
    <SelectFile v-if="props.state === 'NO_FILE'" @on-select-file="selectFile" @on-select-folder="selectFolder" />

    <template v-if="props.state === 'SELECTING_FILE'">
      <div class="title">
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
      <div class="make-btn" @click="emits('onStart', toRaw(formState))">开始制作单词本</div>
    </template>

    <div v-if="['SPLITTING', 'IN_TRANSLATION'].includes(state)" class="making">
      <div class="making-title">
        <span>正在制作单词本...</span>
      </div>
      <div v-if="props.state === 'SPLITTING'" class="progress-info">拆分单词</div>
      <div v-if="props.state === 'IN_TRANSLATION'" class="progress-info">
        <span>翻译单词和句子</span>
        <span class="value">{{ translationProgress }} <span class="separator">/</span> {{ neetTranslateNum }}</span>
      </div>
      <div class="progress-bar-group">
        <div class="progress-bar">
          <div class="progress-bar-inner" :style="{ width: `${splitProgress}%` }" />
        </div>
        <div class="progress-bar">
          <div class="progress-bar-inner" :style="{ width: `${translationProgress}%` }" />
        </div>
      </div>
      <div class="alert">
        翻译进度受词典接口限制，可能进度会非常慢，还请耐心等待。
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  CloseSmall, FileText, Down,
} from '@icon-park/vue-next';
import { useFileDialog } from '@vueuse/core';
import { ref, watch, toRaw } from 'vue';
import { FileState, IOptions } from '../types';
import { isRepeatFile, arrayToFileList } from '@/utils/helper';
import SelectFile from './SelectFile.vue';

interface IProps {
  state: FileState;
  translationProgress: number;
  neetTranslateNum: number;
}
const props = withDefaults(defineProps<IProps>(), { });

interface IEmits {
  (e: 'onChangeFile', fileList: FileList): void;
  (e: 'onStart', options: IOptions): void;
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

const formState = ref<IOptions>({
  useDictionary: 'youdao',
  chooseSentenceWay: 'randomFromShortestFive',
});

const splitProgress = ref(0);

watch(
  () => props.state,
  (state, oldState) => {
    let interval = 0;
    if (state === 'SPLITTING' && oldState === 'SELECTING_FILE') {
      splitProgress.value = 10;
      interval = setInterval(() => {
        splitProgress.value += (100 - splitProgress.value) / 2.5;
        if (splitProgress.value >= 100) {
          clearInterval(interval);
        }
      }, 300);
    }
    if (state === 'IN_TRANSLATION') {
      splitProgress.value = 100;
    }
  },
);

const dictionarys = [
  {
    label: '有道翻译',
    value: 'youdao',
  },
];

const chooseSentenceWays = [
  {
    label: '始终选择最短的',
    value: 'shortest',
  },
  {
    label: '从最短的五个句子中随机',
    value: 'randomFromShortestFive',
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

  &.selecting_file,
  &.splitting,
  &.in_translation {
    width: 420px;
    padding: 20px 32px 32px;
    background: $bg-200;
    border-radius: 20px;
    box-shadow: inset 0 0 0 1px $bg-300, 0 4px 12px -4px $bg-300;

    .making {

      .progress-info {
        display: flex;
        align-items: end;
        justify-content: space-between;

        .value {
          font-size: 16px;
          font-weight: 500;

          .separator {
            color: rgba($text-300, 0.6);
          }
        }
      }

      .progress-bar-group {
        display: flex;
        gap: 4px;
        align-items: center;
        justify-content: space-between;
        height: 16px;
        margin: 12px 0 24px;
        overflow: hidden;

        .progress-bar {
          flex: 1;
          height: 100%;
          border: 2px solid $accent-100;

          &:first-child {
            flex: 1;
            border-radius: 6px 2px 2px 6px;
          }

          &:last-child {
            flex: 2;
            border-radius: 2px 6px 6px 2px;
          }

          .progress-bar-inner {
            height: 100%;
            background: $accent-100;
            transition: width 0.32s ease-out;
          }
        }
      }

      .making-title {
        margin-bottom: 20px;
        font-size: 18px;
        text-align: center;
        letter-spacing: 2px;
        background: linear-gradient(315deg, $primary-200 25%, $accent-100);
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .alert {
        padding: 12px;
        background: rgba($accent-200, 0.6);
        border-radius: 6px;
      }
    }
  }
}
</style>