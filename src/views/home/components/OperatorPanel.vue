<template>
  <div class="operator-container" :class="props.state.toLocaleLowerCase()">
    <SelectFile v-if="props.state === 'NO_FILE'" @on-select-file="selectFile" @on-select-folder="selectFolder" />

    <div v-if="props.state === 'SELECTING_FILE'" class="selecting-file">
      <div class="title">
        <div class="title-content">
          <a-tooltip>
            <template #title>返回首页</template>
            <HomeTwo class="home-icon" @click="goHome" />
          </a-tooltip>
          选择的文件
        </div>
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
      <div class="make-btn" @click="emits('onStart', toRaw(formState))">开始制作单词书</div>
    </div>

    <div v-if="['SPLITTING', 'IN_TRANSLATION'].includes(state)" class="making">
      <div class="title">
        <div class="title-content">
          <a-tooltip>
            <template #title>返回首页</template>
            <HomeTwo class="home-icon" @click="goHome" />
          </a-tooltip>
          正在制作你的单词书...
        </div>
      </div>
      <div class="alert">
        <p>翻译进度受词典接口限制，可能进度会非常慢，还请耐心等待。</p>
      </div>
      <div v-if="props.state === 'SPLITTING'" class="progress-info">正在拆分单词</div>
      <div v-if="props.state === 'IN_TRANSLATION'" class="progress-info">
        <span>正在翻译单词和句子</span>
        <span class="value">{{ translationProgress }} <span class="separator">/</span> {{ neetTranslateNum }}</span>
      </div>
      <div class="progress-bar-group">
        <div class="progress-bar">
          <div class="progress-bar-inner" :style="{ width: `${splitProgress}%` }" />
        </div>
        <div class="progress-bar">
          <div class="progress-bar-inner" :style="{ width: `${translationProgress / neetTranslateNum * 100}%` }" />
        </div>
      </div>
    </div>

    <div v-if="props.state === 'DONE'" class="print">
      <div class="title">
        <div class="title-content">
          <a-tooltip>
            <template #title>返回首页</template>
            <HomeTwo class="home-icon" @click="goHome" />
          </a-tooltip>
          你的单词书已经生成喽
        </div>
      </div>
      <p class="print-desc">
        你现在可以点击下面的打印按钮打印单词书。
      </p>
      <p class="print-desc">
        这本单词书已经为你保存到了当前浏览器，后续你可以在任意时候打开单词书，并再次打印。
      </p>
      <div class="make-btn" @click="emits('onPrint')">现在就打印</div>
    </div>

    <div v-if="props.state === 'PREVIEW'">
      <div class="title">
        <div class="title-content">
          <a-tooltip>
            <template #title>返回首页</template>
            <HomeTwo class="home-icon" @click="goHome" />
          </a-tooltip>
          {{ previewBook?.name }}
        </div>
      </div>

      <div class="description">
        <div class="label">单词量：</div>
        <div class="value">{{ props.previewBook?.wordCount }}</div>
      </div>
      <div class="description">
        <div class="label">使用的翻译：</div>
        <div class="value">{{ dictName }}</div>
      </div>
      <div class="description">
        <div class="label">制作时间：</div>
        <div class="value">{{ dayjs(props.previewBook?.createTime).format('YYYY-MM-DD HH:mm') }}</div>
      </div>
      <div class="make-btn" @click="emits('onPrint')">打印这个单词本</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  CloseSmall, FileText, Down, HomeTwo,
} from '@icon-park/vue-next';
import { useFileDialog } from '@vueuse/core';
import {
  ref, watch, toRaw, computed,
} from 'vue';
import dayjs from 'dayjs';
import { FileState, IBook, IOptions } from '../types';
import { isRepeatFile, arrayToFileList } from '@/utils/helper';
import SelectFile from './SelectFile.vue';
import { dictionarys, chooseSentenceWays } from '../consts';

interface IProps {
  state: FileState;
  translationProgress: number;
  neetTranslateNum: number;
  previewBook?: IBook;
}
const props = withDefaults(defineProps<IProps>(), { previewBook: undefined });

interface IEmits {
  (e: 'onChangeFile', fileList: FileList): void;
  (e: 'onStart', options: IOptions): void;
  (e: 'onPrint'): void;
  (e: 'onExport'): void;
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

/**
 * 监听文件选择，选择好后向父组件传递文件列表
 */
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

/**
 * 表单数据
 */
const formState = ref<IOptions>({
  useDictionary: 'youdao',
  chooseSentenceWay: 'randomFromShortestFive',
});

/**
 * 分词进度
 */
const splitProgress = ref(0);

// 分词的过程，构造一个假的进度条，虽然可以做成真的，就是感觉没必要，需要频繁在两个进程之间通信
watch(
  () => props.state,
  (state, oldState) => {
    let interval = 0;
    if (state === 'SPLITTING' && oldState === 'SELECTING_FILE') {
      splitProgress.value = 10;
      interval = setInterval(() => {
        splitProgress.value += (100 - splitProgress.value) / 4;
        console.log(splitProgress.value);
        if (splitProgress.value >= 100) {
          clearInterval(interval);
        }
      }, 100);
    }
    if (state === 'IN_TRANSLATION') {
      splitProgress.value = 100;
    }
  },
);

const dictName = computed(() => {
  const name = dictionarys.find((item) => item.value === props.previewBook?.useDictionary)?.label;
  return name || props.previewBook?.useDictionary;
});

const goHome = () => {
  window.location.href = '/';
};
</script>

<style lang="scss" scoped>
.operator-container {
  transition: all 0.3s;

  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 34px;
    margin-bottom: 12px;

    .title-content {
      display: flex;
      align-items: center;
      font-size: 18px;
      font-weight: 600;
      line-height: 1;

      .home-icon {
        margin-right: 6px;
        margin-bottom: -1px;
        color: $text-200;
        cursor: pointer;

        &:hover {
          color: $text-100;
        }
      }
    }
  }

  .selecting-file {
    .title {

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
          font-weight: 500;

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
      height: 42px;
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
  }

  .description {
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    .label {
      color: rgba($text-200, 0.6);
    }

    .value {
      color: $text-200;
    }
  }

  .make-btn {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    padding: 8px 20px;
    margin-top: 24px;
    font-size: 16px;
    color: #ffffff;
    cursor: pointer;
    background: $primary-200;
    border: 1px solid $primary-200;
    border-radius: 14px;
  }

  &.selecting_file,
  &.splitting,
  &.in_translation,
  &.done,
  &.preview {
    width: 420px;
    padding: 32px;
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
            transition: width 0.3s ease-out;
          }
        }
      }

      .alert {
        padding: 12px;
        margin: 12px 0 20px;
        background: rgba($accent-200, 0.6);
        border-radius: 6px;

        :last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}
</style>
