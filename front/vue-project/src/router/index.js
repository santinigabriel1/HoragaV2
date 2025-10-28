// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import Layout from '../view/Layout.vue'     // layout com Header + Sidebar
import HomeView from '../view/HomeView.vue' // conteúdo inicial

const routes = [
  { path: '/', component: Login },
  {
    path: '/app',
    component: Layout, // ← layout pai
    children: [
      { path: '', component: HomeView },       // /app → Dashboard
      // Adicione mais aqui:
      // { path: 'agendamentos', component: AgendamentosView },
      // { path: 'usuarios', component: UsuariosView }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router