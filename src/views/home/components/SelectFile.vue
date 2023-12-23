<template>
  <div class="select-button">
    <Plus class="icon" />
    <span class="text-btn" @click="emits('onSelectFile')">选择文件</span>
    <span>/</span>
    <span class="text-btn" @click="emits('onSelectFolder')">文件夹</span>
  </div>
</template>
<script setup lang="ts">
import { Plus } from '@icon-park/vue-next';

interface IEmits {
  (e: 'onSelectFile'): void;
  (e: 'onSelectFolder'): void;
}
const emits = defineEmits<IEmits>();

</script>

<style lang="scss" scoped>
.select-button {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 320px;
  height: 72px;
  padding: 0 20px;
  margin-top: 80px;
  font-size: 20px;
  color: #ffffff;
  background: $primary-200;
  border-radius: 28px;

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    margin-right: 8px;
    font-size: 28px;
    color: #ffffff;
  }

  .text-btn {
    cursor: pointer;
    transition: font-size 0.2s;

    &:hover {
      font-size: 1.2em;
    }
  }
}
</style>
