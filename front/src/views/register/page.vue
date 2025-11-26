<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff } from 'lucide-vue-next'

// Hooks
const router = useRouter()

// Estados
const showPassword = ref(false)
const isLoading = ref(false)

// Usamos 'reactive' para agrupar os dados do formulário (igual ao useState com objeto)
const formData = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// Função de Cadastro
const handleRegister = async () => {
  if (formData.password !== formData.confirmPassword) {
    alert('As senhas não coincidem!')
    return
  }

  isLoading.value = true

  // Simulação de cadastro
  console.log('Dados do cadastro:', formData)

  setTimeout(() => {
    isLoading.value = false
    // Aqui você redirecionaria para o dashboard ou login
    router.push('/agendamento') 
  }, 1000)
}
</script>

<template>
  <main class="min-h-screen bg-rose-50/50 flex items-center justify-center p-4">
    <div class="w-full max-w-md animate-fade-in">
      
      <div class="text-center mb-8">
        <div class="text-3xl font-bold text-rose-800 mb-2 tracking-tight">HORAGA</div>
        <p class="text-slate-500">Crie sua conta</p>
      </div>

      <div class="bg-white rounded-xl shadow-xl border-none p-6 sm:p-8">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-slate-900">Cadastro</h2>
          <p class="text-sm text-slate-500 mt-1">Preencha os dados abaixo para começar</p>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
          
          <div class="space-y-2">
            <label for="name" class="text-sm font-medium leading-none text-slate-900">Nome Completo</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              placeholder="João Silva"
              required
              class="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 transition-all"
            />
          </div>

          <div class="space-y-2">
            <label for="email" class="text-sm font-medium leading-none text-slate-900">E-mail</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              placeholder="seu@email.com"
              required
              class="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 transition-all"
            />
          </div>

          <div class="space-y-2">
            <label for="password" class="text-sm font-medium leading-none text-slate-900">Senha</label>
            <div class="relative">
              <input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                required
                class="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 pr-10 transition-all"
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

          <div class="space-y-2">
            <label for="confirmPassword" class="text-sm font-medium leading-none text-slate-900">Confirmar Senha</label>
            <input
              id="confirmPassword"
              v-model="formData.confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              required
              class="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 transition-all"
            />
          </div>

          <button 
            type="submit"
            :disabled="isLoading" 
            class="inline-flex w-full items-center justify-center whitespace-nowrap rounded-md text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#be123c] text-white hover:bg-[#9f1239] h-10 px-4 py-2 mt-2"
          >
            <span v-if="isLoading">Criando conta...</span>
            <span v-else>Criar Conta</span>
          </button>
        </form>

        <div class="mt-6 text-center text-sm">
          <span class="text-slate-500">Já tem uma conta? </span>
          <RouterLink to="/login" class="text-[#be123c] hover:underline font-bold">
            Faça login
          </RouterLink>
        </div>
      </div>

      <p class="text-center text-xs text-slate-500 mt-6">
        Ao se cadastrar, você concorda com nossos Termos de Serviço
      </p>
    </div>
  </main>
</template>