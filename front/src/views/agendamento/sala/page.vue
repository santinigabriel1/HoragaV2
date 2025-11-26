<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Calendar as CalendarIcon, Clock, Check } from 'lucide-vue-next'
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'

const route = useRoute()
const router = useRouter()
const roomId = route.params.roomId

const sidebarOpen = ref(false)

// Lógica da Seleção
const selectedDate = ref<number | null>(null)
const selectedTime = ref<string | null>(null)

// Mock de datas (Próximos 6 dias)
const dates = Array.from({ length: 6 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() + i)
  return {
    id: i,
    day: d.getDate(),
    weekDay: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
    fullDate: d.toLocaleDateString('pt-BR')
  }
})

// Mock de horários
const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'
]

const handleContinue = () => {
  if (selectedDate.value !== null && selectedTime.value) {
    router.push({
      path: `/agendamento/${roomId}/confirmar`,
      query: {
        date: dates[selectedDate.value].fullDate,
        time: selectedTime.value
      }
    })
  }
}

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
        title="Nova Reserva" 
        @toggle-sidebar="sidebarOpen = true" 
      />

      <main class="flex-1 overflow-y-auto p-4 md:p-8">
        <div class="max-w-3xl mx-auto">
          
          <button @click="router.back()" class="flex items-center text-slate-500 hover:text-rose-700 mb-6 transition-colors">
            <ArrowLeft class="w-4 h-4 mr-2" /> Voltar para lista
          </button>

          <div class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div class="p-6 border-b border-slate-100">
              <h1 class="text-2xl font-bold text-slate-900">Selecione o Horário</h1>
              <p class="text-slate-500 mt-1">Sala Selecionada: <span class="font-semibold text-rose-700">Laboratório {{ roomId }}</span></p>
            </div>

            <div class="p-6 space-y-8">
              
              <div>
                <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <CalendarIcon class="w-4 h-4 text-rose-600" /> Data
                </h3>
                <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  <button 
                    v-for="date in dates" 
                    :key="date.id"
                    @click="selectedDate = date.id"
                    class="flex flex-col items-center justify-center min-w-[80px] h-24 rounded-lg border-2 transition-all duration-200"
                    :class="selectedDate === date.id 
                      ? 'border-rose-600 bg-rose-50 text-rose-700' 
                      : 'border-slate-100 hover:border-rose-200 text-slate-600'"
                  >
                    <span class="text-xs font-semibold uppercase">{{ date.weekDay }}</span>
                    <span class="text-2xl font-bold mt-1">{{ date.day }}</span>
                  </button>
                </div>
              </div>

              <div>
                <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Clock class="w-4 h-4 text-rose-600" /> Horários Disponíveis
                </h3>
                <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  <button
                    v-for="time in timeSlots"
                    :key="time"
                    @click="selectedTime = time"
                    class="py-2 px-4 rounded-md text-sm font-medium border transition-all"
                    :class="selectedTime === time
                      ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:bg-rose-50'"
                  >
                    {{ time }}
                  </button>
                </div>
              </div>

            </div>

            <div class="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                @click="handleContinue"
                :disabled="!selectedDate && selectedDate !== 0 || !selectedTime"
                class="bg-[#be123c] hover:bg-[#9f1239] text-white px-8 py-3 rounded-md font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Continuar
                <Check class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>