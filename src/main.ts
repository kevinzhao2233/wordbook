import { createApp } from 'vue';
import Antd from 'ant-design-vue';
import localforage from 'localforage';
import App from './App.vue';
import 'ant-design-vue/dist/reset.css';
import '@/styles/global.scss';

const dictionaryStoreCfg = {
  name: 'wordbook',
  version: 1.0,
  storeName: 'dictionary',
};

const bookStoreCfg = {
  name: 'wordbook',
  version: 1.0,
  storeName: 'book',
};

const dictionaryStore = localforage.createInstance(dictionaryStoreCfg);

const bookStore = localforage.createInstance(bookStoreCfg);

window.dictionaryStore = dictionaryStore;
window.bookStore = bookStore;

createApp(App).use(Antd).mount('#app');
