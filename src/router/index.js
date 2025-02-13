import { createRouter, createWebHistory } from 'vue-router';
import MyPlanner from '../components/myPlanner.vue';
import GoogleMaps from '../components/GoogleMaps.vue';

const routes = [
  { path: '/planner', component: MyPlanner },
  { path: '/map', component: GoogleMaps },
  { path: '/', redirect: '/map' }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
