<template>
  <a-config-provider :locale="zhCN" :theme="andvTheme">
    <slot name="default" />
  </a-config-provider>
</template>

<script setup lang="ts">
import { ThemeConfig } from 'ant-design-vue/es/config-provider/context';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

const andvTheme: ThemeConfig = {
  token: {
    colorPrimary: '#02d28c',
    colorLink: '#02d28c',
    colorLinkActive: '#00ab78',
    colorLinkHover: '#4debac',
    colorSuccess: '#13c2c2',
    colorWarning: '#ffab25',
    colorError: '#fb5228',
  },
};

dayjs.locale('zh-cn');
</script>
