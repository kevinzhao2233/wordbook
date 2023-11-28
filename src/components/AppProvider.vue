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
    colorPrimary: '#ff7f50',
    colorLink: '#ff7f50',
    colorLinkActive: '#dd6236',
    colorLinkHover: '#ffa078',
    colorSuccess: '#13c2c2',
    colorWarning: '#ffab25',
    colorError: '#fb5228',
    colorText: '#000000',
    colorTextSecondary: '#2c2c2c',
  },
};

dayjs.locale('zh-cn');
</script>
