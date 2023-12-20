import { createApp } from 'vue';
import Antd from 'ant-design-vue';
import App from './App.vue';
import 'ant-design-vue/dist/reset.css';
import '@/styles/global.scss';

createApp(App).use(Antd).mount('#app');
