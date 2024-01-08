<template>
  <div class="book">
    <div class="book-decor" />
    <div class="name">{{ book.name }}</div>
    <div v-if="dictName" class="translate-by-tag">{{ dictName }}</div>
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
  border-radius: 12px;
  transition: transform 0.3s ease-in-out;

  .book-decor {
    position: absolute;
    top: 0;
    left: 0;
    width: 16px;
    height: 100%;
    background: linear-gradient(90deg, $bg-200 20%, $accent-200);
  }

  .name {
    font-size: 18px;
    text-align: center;
  }

  .translate-by-tag {
    position: absolute;
    top: 20px;
    right: 0;
    padding: 1px 8px;
    font-size: 12px;
    color: #ffffff;
    background-color: $primary-200;
    border-radius: 12px 0 0 12px;
  }

  .operation-bar {
    position: absolute;
    right: 0;
    bottom: 20px;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: end;
    height: 32px;
    padding: 0 8px;
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
