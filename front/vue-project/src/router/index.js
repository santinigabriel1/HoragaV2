import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/login.vue'
import HomeApp from '../view/HomeApp.vue'

const routes = [
  { path: '/', name: 'Login', component: Login },
  { path: '/home', name: 'Home', component: HomeApp }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router