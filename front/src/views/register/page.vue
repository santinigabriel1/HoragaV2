<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff, Loader2, UserPlus } from 'lucide-vue-next'
import { useNotificationStore } from '@/stores/notification'
import api from '@/services/api'

const router = useRouter()

// Estados
const showPassword = ref(false)
const isLoading = ref(false)
const notificationStore = useNotificationStore()
// Dados do Formulário
const formData = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'Professor' // Valor padrão obrigatório para sua API
})

// Função de Cadastro
const handleRegister = async () => {
  if (formData.password !== formData.confirmPassword) {
    notificationStore.showError('As senhas não coincidem!')
    return
  }

  isLoading.value = true

  try {
    // Payload formatado para sua API
    const payload = {
      nome: formData.name,
      email: formData.email,
      senha: formData.password,
      cargo: formData.role,
      avatar: null
    }

    console.log('Enviando cadastro:', payload)

    const { data } = await api.post('/usuario', payload)

    if (data.success || data.statusCode === 201) {
      notificationStore.showSuccess('Conta criada com sucesso! Faça login para continuar.')
      router.push('/login')
    } else {
      throw new Error(data.mensagem || 'Erro ao criar conta')
    }

  } catch (error: any) {
    console.error(error)
    const msg = error.response?.data?.mensagem || error.message || 'Erro de conexão'
    notificationStore.showError(`Falha no cadastro: ${msg}`)
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
        <p class="text-slate-500">Crie sua conta para começar</p>
      </div>

      <div class="bg-white rounded-xl shadow-xl border border-slate-100 p-6 sm:p-8">
        <div class="mb-6 flex items-center gap-3">
          <div class="p-3 bg-rose-50 rounded-full text-rose-600">
            <UserPlus class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-slate-900">Cadastro</h2>
            <p class="text-sm text-slate-500">Preencha seus dados</p>
          </div>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
          
          <div class="space-y-1.5">
            <label for="name" class="text-sm font-semibold text-slate-700">Nome Completo</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              placeholder="Ex: João Silva"
              required
              class="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all"
            />
          </div>

          <div class="space-y-1.5">
            <label for="email" class="text-sm font-semibold text-slate-700">E-mail</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              placeholder="seu@email.com"
              required
              class="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all"
            />
          </div>

          <div class="space-y-1.5">
            <label for="role" class="text-sm font-semibold text-slate-700">Cargo / Função</label>
            <select
              id="role"
              v-model="formData.role"
              required
              class="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all"
            >
              <option value="Professor">Professor</option>
              <option value="Aluno">Aluno</option>
              <option value="Coordenador">Coordenador</option>
              <option value="Administrador">Administrador</option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label for="password" class="text-sm font-semibold text-slate-700">Senha</label>
            <div class="relative">
              <input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                required
                class="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <EyeOff v-if="showPassword" class="w-5 h-5" />
                <Eye v-else class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div class="space-y-1.5">
            <label for="confirmPassword" class="text-sm font-semibold text-slate-700">Confirmar Senha</label>
            <input
              id="confirmPassword"
              v-model="formData.confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              required
              class="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all"
            />
          </div>

          <button 
            type="submit"
            :disabled="isLoading" 
            class="inline-flex w-full items-center justify-center rounded-lg text-sm font-bold bg-[#be123c] text-white hover:bg-[#9f1239] h-11 mt-4 transition-all hover:shadow-lg hover:shadow-rose-200 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
          >
            <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin mr-2" />
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

      <p class="text-center text-xs text-slate-400 mt-6">
        &copy; 2025 Horagá. Todos os direitos reservados.
      </p>
    </div>
  </main>
</template>