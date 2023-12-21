<template>
  <div class="book-list">
    <h2 class="title">
      或者看看现成的单词本
    </h2>
    <div class="list">
      <div v-for="book in books" :key="book.name" class="book">
        <div class="book-decor" />
        <div class="name">{{ book.name }}</div>
        <div class="translate-by-tag">{{ book.translateBy }}</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';

const books = ref([
  {
    name: '老友记第10季字幕',
    translateBy: '有道',
  },
  {
    name: 'CET4',
    translateBy: '百度',
  },
]);
</script>

<style lang="scss" scoped>
.book-list {
  width: 100%;
  padding: 24px;

  .title {
    margin-bottom: 24px;
    font-size: 24px;
    font-weight: 500;
    color: $text-200;
  }

  .list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 24px;
    margin-bottom: 24px;
  }

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
}
</style>
