import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

createApp(App).use(router).mount('#app');

if (module.hot) {
  module.hot.accept();
}
