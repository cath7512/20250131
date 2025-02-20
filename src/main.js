import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);
app.use(router);
app.mount('#app');

if (import.meta.hot) {
  import.meta.hot.accept();
}
