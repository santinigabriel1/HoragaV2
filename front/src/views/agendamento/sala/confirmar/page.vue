<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft, MapPin, Calendar, Clock } from 'lucide-vue-next'
import Sidebar from '@/components/layout/Sidebar.vue'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

// Dados da URL
const roomId = route.params.roomId
const dateISO = route.query.date as string
const dateDisplay = route.query.dateDisplay as string
const timeParam = route.query.time as string

const roomName = ref('Carregando...')
const isLoading = ref(false)
const sidebarOpen = ref(false)

const formData = reactive({
  subject: '',
  description: ''
})

onMounted(async () => {
  if (roomId) {
    try {
      const { data } = await api.get(`/sala/${roomId}`)
      if (data.success) {
        roomName.value = data.data.nome
      }
    } catch (e) {
      roomName.value = 'Sala não encontrada'
    }
  }
})

const handleSubmit = async () => {
  // Validação rápida
  if (!formData.subject) return notificationStore.showError('Preencha o assunto!')
  
  isLoading.value = true

  try {
    const [start, end] = timeParam.split(' - ')

    // Verifica usuário logado
    if (!authStore.user || !authStore.user.id) {
      notificationStore.showError('Sessão expirada. Faça login novamente.')
      router.push('/login')
      return
    }

    // Payload Corrigido
    const payload = {
      fk_usuario_id: authStore.user.id,
      fk_salas_id: Number(roomId),
      data_agendamento: dateISO,
      horarios: [
        {
          inicio: start,
          fim: end
        }
      ],
      proposito: formData.subject,
      // --- CORREÇÃO AQUI: Enviando a descrição para o banco ---
      descricao: formData.description 
    }

    console.log('Enviando:', payload)

    const { data } = await api.post('/agendamento', payload)

    if (data.success) {
      notificationStore.showSuccess('Reserva realizada com sucesso!')
      router.push('/calendario') // Redireciona para a agenda para ver o resultado
    } else {
      throw new Error(data.message || 'Erro ao salvar')
    }

  } catch (error: any) {
    console.error(error)
    const msg = error.response?.data?.message || error.message || 'Erro desconhecido'
    notificationStore.showError(`Erro ao reservar: ${msg}`)
  } finally {
    isLoading.value = false
  }
}

const handleLogout = () => router.push('/login')
</script>

<template>
  <div class="flex h-screen bg-slate-50">
    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" @logout="handleLogout" />

    <div class="flex-1 flex flex-col overflow-hidden">
      <Header title="Confirmar Reserva" @toggle-sidebar="sidebarOpen = true" />

      <main class="flex-1 overflow-y-auto p-4 md:p-8">
        <div class="max-w-4xl mx-auto">
          
          <button @click="router.back()" class="flex items-center gap-2 text-rose-700 hover:text-rose-900 mb-6 font-medium transition-colors">
            <ChevronLeft class="w-5 h-5" />
            <span>Voltar para horários</span>
          </button>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div class="lg:col-span-1">
              <div class="bg-white rounded-lg shadow-sm border border-slate-200 sticky top-6 overflow-hidden">
                <div class="p-4 bg-slate-50 border-b border-slate-200">
                  <h3 class="font-bold text-slate-800">Resumo</h3>
                </div>
                <div class="p-6 space-y-5">
                  <div class="flex items-start gap-3">
                    <div class="p-2 bg-rose-50 rounded text-rose-600"><MapPin class="w-5 h-5" /></div>
                    <div><p class="text-xs text-slate-500 uppercase font-bold">LOCAL</p><p class="text-sm font-medium text-slate-900">{{ roomName }}</p></div>
                  </div>
                  <div class="flex items-start gap-3">
                    <div class="p-2 bg-rose-50 rounded text-rose-600"><Calendar class="w-5 h-5" /></div>
                    <div><p class="text-xs text-slate-500 uppercase font-bold">DATA</p><p class="text-sm font-medium text-slate-900">{{ dateDisplay }}</p></div>
                  </div>
                  <div class="flex items-start gap-3">
                    <div class="p-2 bg-rose-50 rounded text-rose-600"><Clock class="w-5 h-5" /></div>
                    <div><p class="text-xs text-slate-500 uppercase font-bold">HORÁRIO</p><p class="text-sm font-medium text-slate-900">{{ timeParam }}</p></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="lg:col-span-2">
              <div class="bg-white rounded-lg shadow-sm border border-slate-200">
                <div class="p-6 border-b border-slate-100">
                  <h3 class="text-xl font-bold text-slate-900">Detalhes</h3>
                  <p class="text-sm text-slate-500">Informe o motivo da reserva.</p>
                </div>
                
                <div class="p-6">
                  <form @submit.prevent="handleSubmit" class="space-y-5">
                    <div>
                      <label class="block text-sm font-semibold text-slate-900 mb-2">Assunto / Propósito <span class="text-red-500">*</span></label>
                      <input v-model="formData.subject" type="text" required class="w-full h-10 px-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" placeholder="Ex: Aula de Java" />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-semibold text-slate-900 mb-2">Descrição</label>
                      <textarea v-model="formData.description" rows="4" class="w-full p-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none" placeholder="Detalhes adicionais (Opcional)..."></textarea>
                    </div>

                    <div class="pt-2 flex gap-3">
                      <button type="button" @click="router.back()" class="flex-1 h-11 rounded-md border border-slate-300 font-bold text-slate-700 hover:bg-slate-50">Cancelar</button>
                      <button type="submit" :disabled="isLoading" class="flex-1 h-11 rounded-md bg-[#be123c] text-white font-bold hover:bg-[#9f1239] disabled:opacity-50 flex items-center justify-center gap-2">
                        <span v-if="isLoading">Processando...</span>
                        <span v-else>Confirmar Reserva</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  </div>
</template>