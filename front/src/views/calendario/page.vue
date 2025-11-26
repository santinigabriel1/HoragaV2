<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-vue-next'
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'

const router = useRouter()
const sidebarOpen = ref(false)

// Estado do Calendário
const currentDate = ref(new Date())
const currentMonth = ref('Novembro 2025') // Simplificado para demo

// Mock de Eventos no Calendário
const events = [
  { id: 1, day: 5, title: 'Manutenção Lab 1', type: 'maintenance' },
  { id: 2, day: 12, title: 'Aula Prof. Maria', type: 'class' },
  { id: 3, day: 12, title: 'Reunião Coord.', type: 'meeting' },
  { id: 4, day: 24, title: 'Evento Maker', type: 'event' },
]

// Gera dias do mês (simulado para 30 dias começando na quarta-feira)
const days = Array.from({ length: 35 }, (_, i) => {
  const dayNum = i - 2 // Offset para começar no dia da semana correto
  return {
    day: dayNum > 0 && dayNum <= 30 ? dayNum : null,
    isToday: dayNum === 26 // Simula que hoje é dia 26
  }
})

const getEventsForDay = (day: number | null) => {
  if (!day) return []
  return events.filter(e => e.day === day)
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
        title="Calendário de Reservas" 
        @toggle-sidebar="sidebarOpen = true" 
      />

      <main class="flex-1 overflow-y-auto p-4 md:p-8">
        <div class="max-w-7xl mx-auto h-full flex flex-col">
          
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
              {{ currentMonth }}
            </h2>
            <div class="flex gap-2">
              <button class="p-2 hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition-colors">
                <ChevronLeft class="w-5 h-5 text-slate-600" />
              </button>
              <button class="px-4 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium hover:bg-slate-50">
                Hoje
              </button>
              <button class="p-2 hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition-colors">
                <ChevronRight class="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>

          <div class="grid grid-cols-7 mb-2 text-center">
            <div v-for="d in ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']" :key="d" class="text-xs font-bold text-slate-400">
              {{ d }}
            </div>
          </div>

          <div class="grid grid-cols-7 grid-rows-5 gap-2 flex-1 min-h-[500px]">
            <div 
              v-for="(date, index) in days" 
              :key="index"
              class="bg-white rounded-lg border border-slate-200 p-2 flex flex-col transition-all hover:border-rose-300 min-h-[100px]"
              :class="{'bg-slate-50 opacity-50': !date.day, 'ring-2 ring-rose-500 ring-offset-2': date.isToday}"
            >
              <div v-if="date.day" class="flex justify-between items-start mb-2">
                <span class="text-sm font-bold text-slate-700" :class="{'text-rose-600': date.isToday}">
                  {{ date.day }}
                </span>
              </div>

              <div v-if="date.day" class="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                <div 
                  v-for="event in getEventsForDay(date.day)" 
                  :key="event.id"
                  class="text-[10px] px-2 py-1 rounded border truncate font-medium cursor-pointer"
                  :class="{
                    'bg-orange-50 text-orange-700 border-orange-200': event.type === 'maintenance',
                    'bg-blue-50 text-blue-700 border-blue-200': event.type === 'class',
                    'bg-purple-50 text-purple-700 border-purple-200': event.type === 'meeting',
                    'bg-green-50 text-green-700 border-green-200': event.type === 'event',
                  }"
                >
                  {{ event.title }}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Estilo sutil para scrollbar dentro dos dias se houver muitos eventos */
.custom-scrollbar::-webkit-scrollbar {
  width: 2px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
</style>