import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  
  // Estado
  const token = ref(localStorage.getItem('horaga_token') || '')
  const user = ref(JSON.parse(localStorage.getItem('horaga_user') || 'null'))
  
  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const userName = computed(() => user.value?.nome || 'Usuário')

  // Actions
  async function login(email: string, senha: string) {
    try {
      // Chama seu endpoint POST /usuario/login
      const { data } = await api.post('/usuario/login', { email, senha })
      
      if (data.success) {
        // Salva no estado
        token.value = data.data.token
        user.value = data.data.usuario
        
        // Salva no localStorage para persistir se der F5
        localStorage.setItem('horaga_token', data.data.token)
        localStorage.setItem('horaga_user', JSON.stringify(data.data.usuario))
        
        return true
      }
      return false
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('horaga_token')
    localStorage.removeItem('horaga_user')
    // Redirecionamento deve ser feito no componente ou router, mas podemos forçar aqui
    window.location.href = '/login' 
  }

  return { token, user, isAuthenticated, userName, login, logout }
})