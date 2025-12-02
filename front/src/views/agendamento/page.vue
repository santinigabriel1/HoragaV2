<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  DoorOpen, Users, Clock, AlertCircle, Bell, CalendarCheck, 
  Trash2, Loader2, AlertTriangle 
} from 'lucide-vue-next'
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'
import Modal from '@/components/ui/Modal.vue'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'

const router = useRouter()
const authStore = useAuthStore()
const notification = useNotificationStore()

const sidebarOpen = ref(false)
const isLoading = ref(true)
const isCanceling = ref(false)

// Dados
const classrooms = ref<any[]>([])
const recentReservations = ref<any[]>([])

// Estado do Modal de Cancelamento
const showCancelModal = ref(false)
const bookingToCancel = ref<number | null>(null)

const userName = computed(() => `Bem vindo, ${authStore.userName}`)

const formatDateShort = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset())
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

const formatTime = (time: string) => time ? time.substring(0, 5) : ''

// --- ACTIONS ---

const fetchData = async () => {
  isLoading.value = true
  try {
    // 1. Buscamos SALAS e INSTITUIÇÕES ao mesmo tempo
    const [resRooms, resInst] = await Promise.all([
      api.get('/salas'),
      api.get('/instituicoes')
    ])

    const userId = Number(authStore.user?.id)

    // 2. Filtramos apenas as MINHAS instituições (onde sou organizador)
    const myInstIds = new Set<number>()
    if (resInst.data.success) {
      resInst.data.data.forEach((inst: any) => {
        if (Number(inst.organizador) === userId) {
          myInstIds.add(inst.id)
        }
      })
    }

    // 3. Filtramos as salas que pertencem a essas instituições
    if (resRooms.data.success) {
      const allRooms = resRooms.data.data
      
      const myRooms = allRooms.filter((sala: any) => myInstIds.has(sala.fk_instituicao_id))

      classrooms.value = myRooms.map((sala: any) => ({
        id: sala.id,
        name: sala.nome,
        capacity: 30, // Se tiver capacidade no banco, altere aqui: sala.capacidade
        available: true 
      }))
    }

    await fetchReservations()
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const fetchReservations = async () => {
  try {
    const resBookings = await api.get('/agendamentos') // ou /agendamento/listar
    if (resBookings.data.success) {
      const allBookings = resBookings.data.data
      const userId = Number(authStore.user?.id)
      
      // Filtra apenas reservas do usuário logado
      const myBookings = allBookings.filter((b: any) => Number(b.fk_usuario_id) === userId)

      recentReservations.value = myBookings.slice(0, 10).map((b: any) => {
        let startTime = b.horario_inicio
        if (!startTime && b.horarios && b.horarios.length > 0) startTime = b.horarios[0].inicio
        
        // Nome da sala seguro
        let roomName = 'Sala ID ' + b.fk_salas_id
        if (b.sala && b.sala.nome) {
          roomName = b.sala.nome
        } else {
          // Tenta achar na lista de salas já carregada
          const found = classrooms.value.find(c => c.id === b.fk_salas_id)
          if (found) roomName = found.name
        }

        return {
          id: b.id,
          roomName,
          subject: b.proposito || 'Sem assunto', 
          date: formatDateShort(b.data_agendamento || b.data),
          time: formatTime(startTime),
          status: 'Confirmado'
        }
      })
    }
  } catch (error) { console.error(error) }
}

// --- LÓGICA DE CANCELAMENTO (COM EVENTO GLOBAL) ---
const openCancelModal = (id: number) => {
  bookingToCancel.value = id
  showCancelModal.value = true
}

const confirmCancel = async () => {
  if (!bookingToCancel.value) return
  
  isCanceling.value = true
  try {
    // 1. Chamada API para deletar
    await api.delete(`/agendamento/${bookingToCancel.value}`)
    
    // 2. Atualização Local Imediata (Remove visualmente da lista)
    recentReservations.value = recentReservations.value.filter(r => r.id !== bookingToCancel.value)
    
    // 3. Atualização do HEADER (Remove notificação sem reload)
    window.dispatchEvent(new Event('booking:updated'))

    // 4. Feedback Visual
    showCancelModal.value = false
    notification.showSuccess('Agendamento cancelado.')

  } catch (error: any) {
    showCancelModal.value = false
    notification.showError('Erro ao cancelar: ' + (error.response?.data?.message || error.message))
  } finally {
    isCanceling.value = false
  }
}

const handleLogout = () => authStore.logout()
const navigateToBooking = (roomId: number) => router.push(`/agendamento/${roomId}`)

onMounted(() => fetchData())

const notifications = [
  { id: 1, type: 'maintenance', title: 'Manutenção Programada', message: 'Lab. Informática 03 estará indisponível amanhã.' }
]
</script>

<template>
  <div class="flex h-screen bg-slate-50">
    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" @logout="handleLogout" />

    <div class="flex-1 flex flex-col overflow-hidden">
      <Header :title="userName" @toggle-sidebar="sidebarOpen = true" />

      <main class="flex-1 overflow-y-auto p-4 md:p-8">
        <div class="max-w-7xl mx-auto">
          
          <div class="mb-8">
            <h1 class="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Agendamento</h1>
            <p class="text-slate-500">Visão geral das salas e atividades recentes.</p>
          </div>

          <div v-if="isLoading" class="flex justify-center items-center h-64">
            <Loader2 class="animate-spin h-12 w-12 text-rose-600" />
          </div>

          <div v-else>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div v-if="classrooms.length === 0" class="col-span-full text-center py-8 text-slate-500 border border-dashed rounded-lg">
                Nenhuma sala disponível nas suas instituições.
              </div>

              <div v-for="room in classrooms" :key="room.id" class="bg-white rounded-lg border border-slate-200 p-0 flex flex-col hover:border-rose-600 hover:shadow-md transition-all duration-200 group">
                <div class="p-5 flex-1">
                  <div class="flex justify-between items-start mb-4">
                    <h3 class="font-bold text-lg text-slate-900 leading-tight pr-2">{{ room.name }}</h3>
                    <span class="text-xs font-bold px-2.5 py-1 rounded-md whitespace-nowrap border bg-green-50 text-green-700 border-green-200">Disponível</span>
                  </div>
                  <div class="space-y-3">
                    <div class="flex items-center gap-2 text-sm text-slate-500"><Users class="w-4 h-4" /><span>Capacidade: {{ room.capacity }}</span></div>
                    <div class="flex items-center gap-2 text-sm text-slate-500"><Clock class="w-4 h-4" /><span>Ver grade horária</span></div>
                  </div>
                </div>
                <div class="p-5 pt-0 mt-auto">
                  <button @click="navigateToBooking(room.id)" class="w-full flex items-center justify-center gap-2 bg-[#be123c] hover:bg-[#9f1239] text-white font-semibold py-2.5 px-4 rounded-md transition-colors shadow-sm"><DoorOpen class="w-4 h-4" /> Reservar</button>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div class="lg:col-span-2 space-y-4">
                <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6 h-full">
                  <div class="flex items-center gap-2 mb-1"><CalendarCheck class="w-5 h-5 text-slate-400" /><h3 class="font-bold text-lg text-slate-800">Reservas Recentes</h3></div>
                  <p class="text-slate-500 text-sm mb-6">Últimas atividades agendadas no sistema.</p>

                  <div v-if="recentReservations.length === 0" class="text-sm text-slate-400 italic text-center py-8">Nenhuma reserva encontrada.</div>

                  <div class="space-y-3">
                    <div v-for="res in recentReservations" :key="res.id" class="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-md border border-slate-100 hover:bg-slate-50 transition-colors gap-3 group">
                      <div class="flex-1">
                        <div class="font-bold text-slate-800">{{ res.roomName }}</div>
                        <div class="text-sm text-slate-600 mt-0.5">{{ res.subject }}</div>
                        <div class="text-xs text-slate-400 mt-1 flex items-center gap-1"><Clock class="w-3 h-3" /> {{ res.date }} às {{ res.time }}</div>
                      </div>
                      <div class="flex items-center gap-3">
                        <span class="px-3 py-1 rounded-md text-xs font-bold border bg-green-50 text-green-700 border-green-200">{{ res.status }}</span>
                        <button @click="openCancelModal(res.id)" class="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-md transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100" title="Cancelar Agendamento"><Trash2 class="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-4">
                <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6 h-full">
                  <div class="flex items-center gap-2 mb-1"><Bell class="w-5 h-5 text-slate-400" /><h3 class="font-bold text-lg text-slate-800">Notificações</h3></div>
                  <p class="text-slate-500 text-sm mb-6">Avisos do sistema</p>
                  <div class="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    <div v-for="notif in notifications" :key="notif.id" class="p-3 rounded-md border-l-4 flex gap-3 bg-slate-50" :class="notif.type === 'maintenance' ? 'border-orange-400 bg-orange-50/50' : 'border-blue-400 bg-blue-50/50'">
                      <AlertCircle class="w-4 h-4 mt-0.5 flex-shrink-0" :class="notif.type === 'maintenance' ? 'text-orange-600' : 'text-blue-600'" />
                      <div><div class="font-semibold text-sm text-slate-800">{{ notif.title }}</div><p class="text-xs text-slate-600 mt-1 leading-relaxed">{{ notif.message }}</p></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Modal :is-open="showCancelModal" title="Cancelar Reserva" @close="showCancelModal = false">
        <div class="text-center space-y-4">
          <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-2">
            <AlertTriangle class="w-8 h-8 text-red-500" />
          </div>
          <h3 class="text-lg font-bold text-slate-900">Tem certeza?</h3>
          <p class="text-sm text-slate-500 leading-relaxed">
            Você está prestes a cancelar este agendamento. <br> Ação irreversível.
          </p>
          <div class="flex gap-3 pt-4">
            <button 
              @click="showCancelModal = false" 
              class="flex-1 h-11 rounded-md border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Voltar
            </button>
            <button 
              @click="confirmCancel" 
              :disabled="isCanceling" 
              class="flex-1 h-11 rounded-md bg-red-600 text-white font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Loader2 v-if="isCanceling" class="w-4 h-4 animate-spin" />
              <span v-else>Sim, Cancelar</span>
            </button>
          </div>
        </div>
      </Modal>

    </div>
  </div>
</template>