<template>
  <AppProvider>
    <Home />
  </AppProvider>
</template>

<script lang="ts" setup>
import localforage from 'localforage';
import AppProvider from './components/AppProvider.vue';
import Home from './views/home/Home.vue';

localforage.config({
  name: 'wordbook',
  version: 1.0,
  storeName: 'dictionary',
});
</script>
