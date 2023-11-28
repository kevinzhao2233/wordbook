<template>
  <AppProvider>
    <Home />
  </AppProvider>
</template>

<script lang="ts" setup>
import AppProvider from './components/AppProvider.vue';
import Home from './views/home/Home.vue';
</script>

<style lang="scss">
#app {
  width: 100vw;
  height: 100vh;
  overflow: auto;
  background-color: $bg-100;
}
</style>
