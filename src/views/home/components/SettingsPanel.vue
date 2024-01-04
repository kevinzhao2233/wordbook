<template>
  <a-form
    :model="formState"
    autocomplete="off"
    layout="vertical"
  >
    <div class="alert">
      以下所有配置项都将在你的浏览器保存，<b>不会上传到任何地方</b>，这意味着如果清除浏览器缓存，这些配置将会丢失。
    </div>
    <div class="title title-first">词典设置</div>
    <!-- 后面可能需要句子和单词的分别设置（等有了自己的后台，或者支持 DeepL、ChatGPT 等翻译服务） -->
    <a-form-item label="使用词典" extra="以后会增加其他词典">
      <a-select v-model:value="formState.useDictionary">
        <a-select-option value="youdao">有道翻译</a-select-option>
      </a-select>
    </a-form-item>
    <div class="title">
      <span>词典账号 - 有道翻译</span>
      <a-tooltip>
        <template #title>请按照<a href="https://ai.youdao.com/doc.s#guide" target="_blank">官网教程</a>申请</template>
        <Help />
      </a-tooltip>
    </div>
    <p class="alert-msg">有道翻译对未付费用户限制请求频率（好几秒请求一次），所以最好还是充一点钱（哪怕一两块钱）</p>
    <div class="grid-form">
      <a-form-item label="有道翻译 appKey">
        <a-input v-model:value="formState.accouts.youdao.appKey" />
      </a-form-item>
      <a-form-item label="有道翻译 key">
        <a-input v-model:value="formState.accouts.youdao.key" />
      </a-form-item>
    </div>
  </a-form>
</template>
<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { Help } from '@icon-park/vue-next';

const formState = useStorage('wordbook::settings', {
  _version: 1,
  useDictionary: 'youdao',
  accouts: {
    youdao: {
      appKey: '',
      key: '',
    },
  },
});
</script>

<style lang="scss" scoped>
.alert {
  padding: 12px;
  margin-bottom: 28px;
  background: $accent-200;
  border-radius: 6px;
}
.title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 12px;
  margin: 28px 0 12px;
  font-size: 15px;
  font-weight: 500;
  line-height: 40px;
  background: $bg-200;
  border-radius: 6px;

  &.title-first {
    margin-top: 0;
  }

  a {
    color: #ffffff;
  }
}

.alert-msg {
  color: $error-color;
}

.grid-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 12px;
}
</style>
