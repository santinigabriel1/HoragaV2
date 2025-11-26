<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff } from 'lucide-vue-next'

// Hooks
const router = useRouter()

// Estados (Refs)
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)

// Função de Login
const handleLogin = async () => {
  // Simulação de login
  isLoading.value = true
  
  // Aqui futuramente entraremos com o Pinia/Backend
  console.log('Login efetuado:', email.value)
  
  // Pequeno timeout só para dar sensação de processamento
  setTimeout(() => {
    isLoading.value = false
    router.push('/agendamento') // Redireciona para a futura área logada
  }, 1000)
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

        <form @submit.prevent="handleLogin" class="space-y-5">
          
          <div class="space-y-2">
            <label for="email" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900">
              E-mail
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="seu@email.com"
              required
              class="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
            />
          </div>

          <div class="space-y-2">
            <label for="password" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900">
              Senha
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                required
                class="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10 transition-all"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <EyeOff v-if="showPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            :disabled="isLoading"
            class="inline-flex w-full items-center justify-center whitespace-nowrap rounded-md text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#be123c] text-white hover:bg-[#9f1239] h-10 px-4 py-2"
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

      <p class="text-center text-xs text-slate-500 mt-6">
        Ao entrar, você concorda com nossos Termos de Serviço
      </p>
    </div>
  </main>
</template>