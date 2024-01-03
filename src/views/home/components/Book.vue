<template>
  <div class="book">
    <div class="book-decor" />
    <div class="name">{{ book.name }}</div>
    <div v-if="dictName" class="translate-by-tag">{{ dictName }}</div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { IBook } from '../types';
import { dictionarys } from '../consts';

interface IProps {
  book: IBook;
}

const props = withDefaults(defineProps<IProps>(), {});

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

  &:hover {
    transform: translateY(-3px);
  }
}
</style>
