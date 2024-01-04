<template>
  <div class="header">
    <div class="logo">wordbook</div>
    <div class="extra">

      <a href="https://github.com/kevinzhao2233/wordbook" target="_blank">
        <GithubOne size="24" />
      </a>
      <HamburgerButton
        v-if="props.state !== 'PRINT'"
        class="settings-btn"
        size="28"
        @click="openSettings = true"
      />
    </div>
  </div>
  <a-drawer
    v-model:open="openSettings"
    root-class-name="settings-drawer-root-class"
    :width="420"
    :closable="false"
  >
    <template #title>
      <div class="settings-title">
        <div class="title">配置</div>
        <Close class="close-settings-btn" size="24" @click="openSettings = false" />
      </div>
    </template>
    <SettingsPanel />
  </a-drawer>
</template>
<script setup lang="ts">
import { GithubOne, HamburgerButton, Close } from '@icon-park/vue-next';
import { ref } from 'vue';
import { FileState } from '../types';
import SettingsPanel from './SettingsPanel.vue';

interface IProps {
  state: FileState;
}
const props = withDefaults(defineProps<IProps>(), {});

const openSettings = ref(false);

const setOpenSettings = (open: boolean) => {
  openSettings.value = open;
};

defineExpose({
  setOpenSettings,
});

</script>

<style lang="scss" scoped>
.header {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 24px;

  .logo {
    font-size: 24px;
    font-weight: 600;
    color: $text-200;
    letter-spacing: 1px;
    background: linear-gradient(315deg, $primary-200 25%, $accent-100);
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .extra {
    display: flex;
    gap: 20px;
    align-items: center;

    > * {
      cursor: pointer;
      transition: color 0.2s;

      &:hover {
        color: $accent-100;
      }
    }

    a {
      color: #171725;

      &:hover {
        color: $accent-100;
      }

      &:active {
        color: rgba($accent-100, 0.7);
      }

      &:visited {
        color: #171725;
      }
    }
  }
}

</style>
