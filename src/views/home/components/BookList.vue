<template>
  <div class="book-list">
    <template v-if="myBooks.length > 0">
      <h2 class="title">
        我生成的单词书
      </h2>
      <div class="list">
        <Book
          v-for="book in myBooks"
          :key="book.name"
          :book="book"
          @click="emits('on-preview', book)"
          @delete="deleteMyBook(book)"
        />
      </div>
    </template>
    <template v-if="publicBooks.length > 0">
      <h2 class="title">
        这里还有现成的单词书
      </h2>
      <div class="list">
        <Book
          v-for="book in publicBooks"
          :key="book.name"
          :book="book"
          @click="emits('on-preview', book)"
        />
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { ref, shallowRef, triggerRef } from 'vue';
import Book from './Book.vue';
import { IBook } from '../types';

interface IEmits {
  (e: 'on-preview', book: IBook): void;
}
const emits = defineEmits<IEmits>();

const myBooks = shallowRef<IBook[]>([]);

const getMyBooks = async () => {
  const bookKeys = await window.bookStore.keys();
  const tmpBooks: IBook[] = [];
  for await (const key of bookKeys) {
    const book: IBook | null = await window.bookStore.getItem(key);
    if (book) {
      tmpBooks.unshift(book);
    }
  }
  myBooks.value = tmpBooks;
};

getMyBooks();

const deleteMyBook = (book: IBook) => {
  window.bookStore.removeItem(book.id).then(() => {
    getMyBooks();
  });
};

const publicBooks = ref<IBook[]>([]);
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
}
</style>
