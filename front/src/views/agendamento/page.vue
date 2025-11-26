<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { DoorOpen, Users, Clock, AlertCircle, Bell } from 'lucide-vue-next'
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'

const router = useRouter()
const sidebarOpen = ref(false)

const classrooms = [
  { id: 1, name: 'Laboratório de Informática 1', capacity: 30, available: true, nextSession: '10:00' },
  { id: 2, name: 'Laboratório de Informática 2', capacity: 25, available: true, nextSession: '14:00' },
  { id: 3, name: 'Laboratório de Química', capacity: 20, available: false, nextSession: '16:00' },
  { id: 4, name: 'Sala Maker', capacity: 100, available: true, nextSession: '15:30' },
]

const recentReservations = [
  { id: 1, room: 'Lab. Informática 01', professor: 'Prof. Maria Silva', status: 'Confirmado', time: 'Hoje 08:00 - 10:00' },
  { id: 2, room: 'Lab. Química', professor: 'Prof. João Santos', status: 'Pendente', time: 'Amanhã 14:00 - 16:00' },
  { id: 3, room: 'Sala 205', professor: 'Prof. Ana Costa', status: 'Confirmado', time: 'Hoje 10:00 - 12:00' },
]

const notifications = [
  { id: 1, type: 'maintenance', title: 'Manutenção Programada', message: 'Lab. Informática 03 estará indisponível amanhã das 08:00 às 12:00 para manutenção.' },
  { id: 2, type: 'event', title: 'Evento - Colóquio de Pesquisa', message: 'Sala Maker será utilizada para o Colóquio de Pesquisa na próxima sexta das 14:00 às 18:00.' },
  { id: 3, type: 'maintenance', title: 'Manutenção Preventiva', message: 'Laboratório de Química passará por manutenção preventiva no sábado.' },
]

const handleLogout = () => {
  router.push('/login')
}

const navigateToBooking = (roomId: number) => {
  router.push(`/agendamento/${roomId}`)
}
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
        title="Bem vindo, Gabriel" 
        @toggle-sidebar="sidebarOpen = true" 
      />

      <main class="flex-1 overflow-y-auto p-4 md:p-8">
        <div class="max-w-7xl mx-auto">
          
          <div class="mb-8">
            <h1 class="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Agendamento</h1>
            <p class="text-slate-500">Escolha uma sala disponível para agendar sua atividade</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div 
              v-for="room in classrooms" 
              :key="room.id" 
              class="bg-white rounded-lg border border-slate-200 p-0 flex flex-col hover:border-rose-600 hover:shadow-md transition-all duration-200 group"
              :class="{ 'opacity-75 bg-slate-50': !room.available }"
            >
              <div class="p-5 flex-1">
                <div class="flex justify-between items-start mb-4">
                  <h3 class="font-bold text-lg text-slate-900 leading-tight pr-2">{{ room.name }}</h3>
                  
                  <span 
                    class="text-xs font-bold px-2.5 py-1 rounded-md whitespace-nowrap border"
                    :class="room.available 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-red-50 text-red-700 border-red-200'"
                  >
                    {{ room.available ? 'Disponível' : 'Ocupada' }}
                  </span>
                </div>
                
                <div class="space-y-3">
                  <div class="flex items-center gap-2 text-sm text-slate-500">
                    <Users class="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>Capacidade: {{ room.capacity }} pessoas</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm text-slate-500">
                    <Clock class="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span class="whitespace-nowrap">Disponível das 07:00 às 22:30</span>
                  </div>
                </div>
              </div>

              <div class="p-5 pt-0 mt-auto">
                <button 
                  @click="navigateToBooking(room.id)"
                  :disabled="!room.available"
                  class="w-full flex items-center justify-center gap-2 bg-[#be123c] hover:bg-[#9f1239] text-white font-semibold py-2.5 px-4 rounded-md transition-colors disabled:bg-rose-200 disabled:cursor-not-allowed text-sm shadow-sm"
                >
                  <DoorOpen class="w-4 h-4" />
                  Reservar
                </button>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div class="lg:col-span-2 space-y-4">
              <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div class="flex items-center gap-2 mb-1">
                  <Clock class="w-5 h-5 text-slate-400" />
                  <h3 class="font-bold text-lg text-slate-800">Reservas Recentes</h3>
                </div>
                <p class="text-slate-500 text-sm mb-6">Últimas reservas realizadas no sistema</p>

                <div class="space-y-3">
                  <div 
                    v-for="res in recentReservations" 
                    :key="res.id"
                    class="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-md border border-slate-100 hover:bg-slate-50 transition-colors gap-3"
                  >
                    <div>
                      <div class="font-semibold text-slate-800">{{ res.room }}</div>
                      <div class="text-sm text-slate-500">{{ res.professor }}</div>
                      <div class="text-xs text-slate-400 mt-1">{{ res.time }}</div>
                    </div>
                    <span 
                      class="px-3 py-1 rounded-md text-xs font-bold self-start sm:self-center border"
                      :class="res.status === 'Confirmado' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'"
                    >
                      {{ res.status }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6 h-full">
                <div class="flex items-center gap-2 mb-1">
                  <Bell class="w-5 h-5 text-slate-400" />
                  <h3 class="font-bold text-lg text-slate-800">Notificações</h3>
                </div>
                <p class="text-slate-500 text-sm mb-6">Avisos importantes</p>

                <div class="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  <div 
                    v-for="notif in notifications" 
                    :key="notif.id"
                    class="p-3 rounded-md border-l-4 flex gap-3 bg-slate-50"
                    :class="notif.type === 'maintenance' ? 'border-orange-400 bg-orange-50/50' : 'border-blue-400 bg-blue-50/50'"
                  >
                    <AlertCircle 
                      class="w-4 h-4 mt-0.5 flex-shrink-0" 
                      :class="notif.type === 'maintenance' ? 'text-orange-600' : 'text-blue-600'"
                    />
                    <div>
                      <div class="font-semibold text-sm text-slate-800">{{ notif.title }}</div>
                      <p class="text-xs text-slate-600 mt-1 leading-relaxed">{{ notif.message }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  </div>
</template>
