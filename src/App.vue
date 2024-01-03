<template>
  <AppProvider>
    <Home />
  </AppProvider>
</template>

<script lang="ts" setup>
import AppProvider from './components/AppProvider.vue';
import Home from './views/home/Home.vue';
</script>
