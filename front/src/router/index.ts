import { createRouter, createWebHistory } from 'vue-router'

// Use o @ para importar
const Home = () => import('@/views/home/page.vue')
const Login = () => import('@/views/login/page.vue')
const Register = () => import('@/views/register/page.vue')
const Agendamento = () => import('@/views/agendamento/page.vue')
const Calendario = () => import('@/views/calendario/page.vue')
const Estatisticas = () => import('@/views/estatisticas/page.vue')
const Instituicoes = () => import('@/views/instituicoes/page.vue')
const Disponibilidade = () => import('@/views/disponibilidade/page.vue')
const Salas = () => import('@/views/salas/page.vue')
const Melhorias = () => import('@/views/melhorias/page.vue')
const Usuarios = () => import('@/views/usuarios/page.vue')

// ATUALIZADO: Renomeamos a pasta '[roomId]' para 'sala' para evitar erros de importação
const RoomSelection = () => import('@/views/agendamento/sala/page.vue')
const ConfirmBooking = () => import('@/views/agendamento/sala/confirmar/page.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { 
      path: '/', 
      name: 'home', 
      component: Home 
    },
    { 
      path: '/login', 
      name: 'login', 
      component: Login 
    },
    { 
      path: '/register', 
      name: 'register', 
      component: Register 
    },
    { 
      path: '/agendamento', 
      name: 'agendamento', 
      component: Agendamento 
    },
    { 
      path: '/calendario', 
      name: 'calendario', 
      component: Calendario 
    },
    {
      path: '/estatisticas',
      name: 'estatisticas',
      component: Estatisticas
    },
    { 
      path: '/instituicoes', 
      name: 'instituicoes', 
      component: Instituicoes 
    },
    {
      path: '/disponibilidade',
      name: 'disponibilidade',
      component: Disponibilidade
    },
    {
      path: '/salas',
      name: 'salas',
      component: Salas
    },
    {
      path: '/melhorias',
      name: 'melhorias',
      component: Melhorias
    },
    {
      path: '/usuarios',
      name: 'usuarios',
      component: Usuarios
    },
    // Rota Dinâmica (A URL continua igual, mas aponta para a pasta 'sala')
    { 
      path: '/agendamento/:roomId', 
      name: 'room-selection', 
      component: RoomSelection 
    },
    // Rota de Confirmação
    { 
      path: '/agendamento/:roomId/confirmar', 
      name: 'confirm-booking', 
      component: ConfirmBooking 
    }
  ]
})

export default router