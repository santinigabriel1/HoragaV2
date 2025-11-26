<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft, CheckCircle } from 'lucide-vue-next'
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'

const route = useRoute()
const router = useRouter()

// Parâmetros da URL
const roomId = route.params.roomId as string
const dateParam = route.query.date as string
const timeParam = route.query.time as string

// Dados Mockados das Salas
const classroomsData: Record<string, { name: string, creator: string }> = {
  '1': { name: 'Laboratório de Informática 1', creator: 'Prof. Carlos Silva' },
  '2': { name: 'Laboratório de Informática 2', creator: 'Prof. Roberto Santos' },
  '3': { name: 'Laboratório de Química', creator: 'Prof. Marina Costa' },
  '4': { name: 'Sala Maker', creator: 'Prof. Lucas Oliveira' },
}

const room = classroomsData[roomId]

// Estados do Formulário
const formData = reactive({
  name: '',
  email: '',
  description: ''
})

const isLoading = ref(false)
const sidebarOpen = ref(false)

// Lógica de Submissão
const handleSubmit = async () => {
  isLoading.value = true

  // Simulação de envio ao backend
  setTimeout(() => {
    isLoading.value = false
    alert('Agendamento realizado com sucesso!')
    router.push('/agendamento')
  }, 1500)
}

// Formatador de Data
const formattedDate = computed(() => {
  if (!dateParam) return ''
  return dateParam 
})

const handleLogout = () => router.push('/login')
</script>

<template>
  <div class="flex h-screen bg-slate-50">
    
    <Sidebar 
      :is-open="sidebarOpen" 
      @close="sidebarOpen = false"
      @logout="handleLogout"
    />

    <div class="flex-1 flex flex-col overflow-hidden">
      
      <Header 
        title="Confirmar Reserva" 
        @toggle-sidebar="sidebarOpen = true" 
      />

      <main class="flex-1 overflow-y-auto p-4 md:p-8">
        
        <div v-if="!room || !dateParam || !timeParam" class="h-full flex flex-col items-center justify-center text-center">
          <h2 class="text-2xl font-bold text-slate-900 mb-2">Dados inválidos</h2>
          <p class="text-slate-500 mb-6">Faltam informações para prosseguir com o agendamento.</p>
          <button @click="router.back()" class="bg-slate-900 text-white px-6 py-2 rounded-md hover:bg-slate-800 transition-colors">Voltar</button>
        </div>

        <div v-else class="max-w-4xl mx-auto">
          
          <button @click="router.back()" class="flex items-center gap-2 text-rose-700 hover:text-rose-900 mb-6 font-medium transition-colors">
            <ChevronLeft class="w-5 h-5" />
            <span>Voltar</span>
          </button>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div class="lg:col-span-1">
              <div class="bg-white rounded-lg shadow-sm border border-slate-200 sticky top-6">
                <div class="p-6 border-b border-slate-100">
                  <h3 class="text-lg font-bold text-slate-900">{{ room.name }}</h3>
                  <p class="text-sm text-slate-500">{{ room.creator }}</p>
                </div>
                <div class="p-6 space-y-4">
                  <div class="bg-slate-50 p-4 rounded-lg space-y-3 border border-slate-100">
                    <div>
                      <span class="text-xs text-slate-500 font-bold tracking-wider">DATA</span>
                      <p class="font-semibold text-sm text-slate-800 mt-0.5 capitalize">{{ formattedDate }}</p>
                    </div>
                    <div>
                      <span class="text-xs text-slate-500 font-bold tracking-wider">HORÁRIO</span>
                      <p class="font-semibold text-sm text-slate-800 mt-0.5">{{ timeParam }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="lg:col-span-2">
              <div class="bg-white rounded-lg shadow-sm border border-slate-200">
                <div class="p-6 border-b border-slate-100">
                  <h3 class="text-xl font-bold text-slate-900">Preencha seus Dados</h3>
                  <p class="text-sm text-slate-500">Informações necessárias para confirmar o agendamento</p>
                </div>
                
                <div class="p-6">
                  <form @submit.prevent="handleSubmit" class="space-y-6">
                    
                    <div>
                      <label class="block text-sm font-semibold text-slate-900 mb-2">
                        Nome <span class="text-red-500">*</span>
                      </label>
                      <input 
                        v-model="formData.name"
                        type="text" 
                        placeholder="Seu nome completo"
                        required
                        class="w-full h-10 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-semibold text-slate-900 mb-2">
                        Email <span class="text-red-500">*</span>
                      </label>
                      <input 
                        v-model="formData.email"
                        type="email" 
                        placeholder="seu.email@email.com"
                        required
                        class="w-full h-10 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-semibold text-slate-900 mb-2">
                        Descrição da Atividade
                      </label>
                      <textarea 
                        v-model="formData.description"
                        rows="4"
                        placeholder="Descreva brevemente a atividade que será realizada na sala"
                        class="w-full p-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all resize-none"
                      ></textarea>
                    </div>

                    <div class="flex gap-3 pt-2">
                      <button 
                        type="button" 
                        @click="router.back()"
                        class="flex-1 h-10 rounded-md border border-slate-200 font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        :disabled="isLoading || !formData.name || !formData.email"
                        class="flex-1 h-10 rounded-md bg-[#be123c] text-white font-bold hover:bg-[#9f1239] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        <span v-if="isLoading">Agendando...</span>
                        <span v-else>Confirmar Agendamento</span>
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