import { createApp } from 'vue';
import App from './App.vue';
// Removed Tailwind CSS import
import router from './router';

createApp(App).use(router).mount('#app');
