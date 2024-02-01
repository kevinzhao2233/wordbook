<template>
  <div class="book" :style="{backgroundImage: 'url(' + (book.coverBlob || svgSrc) + ')'}">
    <div class="book-decor" />
    <div class="name">{{ book.name }}</div>
    <div class="create-time">{{ humanTime(book.createTime) }}</div>
    <div v-if="dictName" class="translate-by-tag">{{ book.isDraft ? '未完成 | ' : '' }}{{ dictName }}</div>
    <div class="operation-bar" @click.stop="() => {}">
      <a-tooltip>
        <template #title>删除</template>
        <delete-one
          class="icon-btn"
          theme="outline"
          size="18"
          @click="emits('delete')"
        />
      </a-tooltip>
    </div>
  </div>
</template>
<script setup lang="ts">
import { DeleteOne } from '@icon-park/vue-next';
import { computed } from 'vue';
import { IBook } from '../types';
import { dictionarys } from '../consts';
import { humanTime } from '@/utils/helper';
import { blobSvg } from '@/utils/blobSvg';

interface IProps {
  book: IBook;
}

const props = withDefaults(defineProps<IProps>(), {});

interface IEmits {
  (e: 'delete'): void;
}

const emits = defineEmits<IEmits>();

const dictName = computed(() => {
  const name = dictionarys.find((item) => item.value === props.book.useDictionary)?.label;
  return name || props.book.useDictionary;
});

const svg = blobSvg();
const svgSrc = `data:image/svg+xml,${encodeURIComponent(svg)}`;

</script>

<style lang="scss" scoped>
.book {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 210 / 297;
  padding: 12px 24px 12px 32px;
  overflow: hidden;
  cursor: pointer;
  background: $bg-200;
  background-repeat: no-repeat;
  background-position: bottom -50px right -50px;
  border-radius: 12px;
  transition: transform 0.3s ease-in-out;

  .book-decor {
    position: absolute;
    top: 0;
    left: 0;
    width: 16px;
    height: 100%;
  }

  .name {
    font-size: 18px;
    font-weight: 500;
    color: $accent-100;
    text-align: center;
  }

  .create-time {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: start;
    height: 32px;
    padding-left: 16px;
    font-size: 12px;
    color: $text-300;
  }

  .translate-by-tag {
    position: absolute;
    top: 0;
    right: 0;
    padding: 1px 8px;
    font-size: 12px;
    color: #ffffff;
    background-color: $primary-200;
    border-radius: 0 0 0 12px;
  }

  .operation-bar {
    position: absolute;
    top: 30px;
    right: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: end;
    height: 32px;
    padding: 0 8px;
    color: $text-300;
    cursor: default;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;

    .icon-btn {
      cursor: pointer;
    }
  }

  &:hover {
    transform: translateY(-3px);

    .operation-bar {
      opacity: 1;
    }
  }
}
</style>
