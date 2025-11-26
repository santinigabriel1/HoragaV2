<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth' // Importe a store
import { Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore() // Inicialize a store

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('') // Para mostrar erro na tela

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    // Chama a action da store (que chama a API real)
    await authStore.login(email.value, password.value)
    
    // Se não der erro, redireciona
    router.push('/agendamento')
  } catch (error: any) {
    // Captura mensagem de erro do backend se houver
    errorMessage.value = error.response?.data?.mensagem || 'Erro ao fazer login. Verifique suas credenciais.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="min-h-screen bg-rose-50/50 flex items-center justify-center p-4">
    <div class="w-full max-w-md animate-fade-in">
      
      <div class="text-center mb-8">
        <div class="text-3xl font-bold text-rose-800 mb-2 tracking-tight">HORAGA</div>
        <p class="text-slate-500">Bem-vindo de volta</p>
      </div>

      <div class="bg-white rounded-xl shadow-xl border-none p-6 sm:p-8">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-slate-900">Entrar</h2>
          <p class="text-sm text-slate-500 mt-1">Digite suas credenciais para continuar</p>
        </div>

        <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          
          <div class="space-y-2">
            <label for="email" class="text-sm font-medium text-slate-900">E-mail</label>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="seu@email.com"
              required
              class="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div class="space-y-2">
            <label for="password" class="text-sm font-medium text-slate-900">Senha</label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                required
                class="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none pr-10"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <EyeOff v-if="showPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            :disabled="isLoading"
            class="inline-flex w-full items-center justify-center rounded-md text-sm font-bold bg-[#be123c] text-white hover:bg-[#9f1239] h-10 px-4 py-2 transition-colors disabled:opacity-70"
          >
            <span v-if="isLoading">Entrando...</span>
            <span v-else>Entrar</span>
          </button>
        </form>

        <div class="mt-6 text-center text-sm">
          <span class="text-slate-500">Não tem uma conta? </span>
          <RouterLink to="/register" class="text-[#be123c] hover:underline font-bold">
            Cadastre-se
          </RouterLink>
        </div>
      </div>
    </div>
  </main>
</template>