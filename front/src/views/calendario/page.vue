<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Filter, RotateCcw, LayoutGrid, ChevronLeft, ChevronRight, 
  Calendar as CalendarIcon, Clock, Users, Search, Info, User 
} from 'lucide-vue-next'
import Sidebar from '@/components/layout/Sidebar.vue'
import Modal from '@/components/ui/Modal.vue'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const sidebarOpen = ref(false)
const isLoading = ref(true)

// --- ESTADO DA DATA ---
const currentDate = ref(new Date())

// --- DADOS ---
const rooms = ref<any[]>([]) 
const bookings = ref<any[]>([]) 
const myInstitutions = ref<any[]>([]) 

// --- ESTADO DO MODAL DE DETALHES ---
const showEventModal = ref(false)
const selectedEvent = ref<any>(null)

// --- CONFIGURAÇÃO DO GRID ---
const startHour = 7  
const endHour = 22   
const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i)

// --- COMPUTEDS ---
const formattedDateTitle = computed(() => {
  return currentDate.value.toLocaleDateString('pt-BR', { 
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' 
  }).replace(/^\w/, (c) => c.toUpperCase())
})

const shortDate = computed(() => currentDate.value.toLocaleDateString('pt-BR'))

const isToday = computed(() => {
  const today = new Date()
  return today.toDateString() === currentDate.value.toDateString()
})

// --- NAVEGAÇÃO ---
const prevDay = () => {
  const d = new Date(currentDate.value)
  d.setDate(d.getDate() - 1)
  currentDate.value = d
}
const nextDay = () => {
  const d = new Date(currentDate.value)
  d.setDate(d.getDate() + 1)
  currentDate.value = d
}
const goToToday = () => currentDate.value = new Date()

// --- AUXILIAR: RESOLVER NOME DO USUÁRIO ---
const getUserName = (booking: any) => {
  // 1. Verifica se o agendamento é MEU (do usuário logado)
  const myId = Number(authStore.user?.id)
  const bookingUserId = Number(booking.fk_usuario_id)

  if (myId && bookingUserId === myId) {
    // Retorna o nome da sessão atual (ex: "teste")
    return authStore.user?.nome || 'Eu'
  }

  // 2. Se não for eu, tenta pegar do objeto 'usuario' (se o backend fez JOIN)
  if (booking.usuario && booking.usuario.nome) {
    return booking.usuario.nome
  }

  // 3. Fallback se não tiver nome
  return `Usuário #${bookingUserId}`
}

// --- AUXILIAR: RESOLVER EMAIL ---
const getUserEmail = (booking: any) => {
  const myId = Number(authStore.user?.id)
  const bookingUserId = Number(booking.fk_usuario_id)

  if (myId && bookingUserId === myId) {
    return authStore.user?.email || 'Email não disponível'
  }
  return booking.usuario?.email || 'Email não disponível'
}

// --- BUSCA DE DADOS ---
const fetchData = async () => {
  isLoading.value = true
  try {
    const userId = Number(authStore.user?.id)

    const [resInst, resRooms, resBookings] = await Promise.all([
      api.get('/instituicoes'),
      api.get('/salas'),
      api.get('/agendamentos')
    ])

    // Instituições
    if (resInst.data.success) {
      const rawInst = Array.isArray(resInst.data.data) ? resInst.data.data : []
      myInstitutions.value = rawInst.filter((i: any) => Number(i.organizador) === userId)
    }

    // Salas
    if (resRooms.data.success) {
      const allRooms = Array.isArray(resRooms.data.data) ? resRooms.data.data : []
      const myInstIds = new Set(myInstitutions.value.map(i => i.id))
      rooms.value = allRooms.filter((r: any) => myInstIds.has(r.fk_instituicao_id))
    }

    // Agendamentos
    if (resBookings.data.success) {
      // LOG PARA DEBUG: Veja no console o que está vindo do banco
      console.log('📦 Dados recebidos da API:', resBookings.data.data)
      bookings.value = resBookings.data.data
    }

  } catch (error) {
    console.error('Erro ao carregar agenda:', error)
  } finally {
    isLoading.value = false
  }
}

// --- LÓGICA DO GRID ---
const getBookingForSlot = (roomId: number, hour: number) => {
  const targetDateStr = currentDate.value.toISOString().split('T')[0]

  const found = bookings.value.find((b: any) => {
    if (Number(b.fk_salas_id) !== roomId) return false
    
    // Tratamento de data (alguns bancos retornam com T00:00:00, outros só a data)
    const bDate = b.data_agendamento || b.data
    if (!bDate.toString().startsWith(targetDateStr)) return false

    // Tratamento de horário
    let bStartHour = 0
    if (b.horario_inicio) {
      bStartHour = parseInt(b.horario_inicio.split(':')[0])
    } else if (b.horarios && b.horarios.length > 0) {
      bStartHour = parseInt(b.horarios[0].inicio.split(':')[0])
    }

    return bStartHour === hour
  })

  if (found) {
    return {
      raw: found,
      // Tenta pegar .proposito (banco) ou .subject (front antigo)
      title: found.proposito || found.subject || 'Reservado', 
      userName: getUserName(found)
    }
  }
  
  return null
}

// --- ABRIR DETALHES ---
const openEventDetails = (slotData: any) => {
  if (!slotData || !slotData.raw) return
  
  const booking = slotData.raw
  
  // LOG PARA DEBUG DO ITEM CLICADO
  console.log('🔍 Item clicado:', booking)

  selectedEvent.value = {
    id: booking.id,
    title: booking.proposito || 'Sem assunto',
    // Tenta pegar .descricao, .description ou .observacao
    description: booking.descricao || booking.description || booking.observacao || 'Nenhuma descrição informada.',
    user: getUserName(booking),
    email: getUserEmail(booking),
    room: rooms.value.find(r => r.id === Number(booking.fk_salas_id))?.nome || 'Sala',
    time: booking.horario_inicio ? booking.horario_inicio.substring(0,5) : (booking.horarios?.[0]?.inicio || 'Horário indefinido')
  }
  showEventModal.value = true
}

const handleLogout = () => router.push('/login')
onMounted(() => fetchData())
</script>

<template>
  <div class="flex h-screen bg-slate-50">
    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" @logout="handleLogout" />

    <div class="flex-1 flex flex-col overflow-hidden">
      <Header title="Agenda de Salas" @toggle-sidebar="sidebarOpen = true" />

      <main class="flex-1 overflow-y-auto p-4 md:p-6">
        <div class="max-w-[1600px] mx-auto space-y-6">
          
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 class="text-2xl font-bold text-slate-800 uppercase tracking-tight">AGENDAMENTOS</h1>
              <p class="text-sm text-slate-500">Gerencie a ocupação das salas por horário</p>
            </div>
            <div class="flex gap-2">
              <button class="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-600 text-sm font-medium hover:bg-slate-50">
                <LayoutGrid class="w-4 h-4" /> Cards
              </button>
              <button class="flex items-center gap-2 px-3 py-2 bg-[#be123c] text-white rounded-md text-sm font-medium hover:bg-[#9f1239] shadow-sm">
                <Filter class="w-4 h-4" /> Filtros
              </button>
              <button class="flex items-center gap-2 px-3 py-2 bg-slate-700 text-white rounded-md text-sm font-medium hover:bg-slate-800 shadow-sm">
                <RotateCcw class="w-4 h-4" /> Reagendar Grade
              </button>
            </div>
          </div>

          <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div class="flex-1 w-full relative">
              <input type="text" placeholder="Filtrar por turma..." class="w-full pl-3 pr-10 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-rose-500 transition-colors">
              <Search class="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>
            <div class="flex-1 w-full relative">
              <input type="text" placeholder="Filtrar por professor..." class="w-full pl-3 pr-10 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-rose-500 transition-colors">
              <Search class="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>
            <button class="text-sm text-slate-500 hover:text-red-500 font-medium whitespace-nowrap px-2">
              × Limpar Filtros
            </button>
          </div>

          <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-2 flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-2 pl-2">
              <CalendarIcon class="w-5 h-5 text-[#be123c]" />
              <span class="font-bold text-slate-700">Selecione a Data</span>
            </div>

            <div class="flex flex-col items-center">
              <h2 class="text-xl font-bold text-slate-900">{{ formattedDateTitle }}</h2>
              <p class="text-xs text-slate-400 uppercase tracking-wider font-bold">Grade Diária</p>
            </div>

            <div class="flex items-center gap-2">
              <div class="flex items-center bg-slate-100 rounded-md p-1">
                <button @click="prevDay" class="p-1 hover:bg-white hover:shadow-sm rounded transition-all text-slate-600"><ChevronLeft class="w-5 h-5" /></button>
                <button @click="nextDay" class="p-1 hover:bg-white hover:shadow-sm rounded transition-all text-slate-600"><ChevronRight class="w-5 h-5" /></button>
              </div>
              
              <div class="flex items-center gap-2 border border-slate-300 rounded-md px-3 py-1.5 bg-white">
                <span class="text-sm font-medium text-slate-600">{{ shortDate }}</span>
                <CalendarIcon class="w-4 h-4 text-slate-400" />
              </div>

              <button 
                @click="goToToday"
                class="px-4 py-1.5 rounded-md text-sm font-bold transition-colors shadow-sm"
                :class="isToday ? 'bg-[#be123c] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
              >
                Hoje
              </button>
            </div>
          </div>

          <div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
            <div class="overflow-x-auto">
              <div class="min-w-[1200px]">
                
                <div class="flex border-b border-slate-200 bg-slate-50">
                  <div class="w-48 p-4 shrink-0 font-bold text-slate-700 text-sm flex items-center gap-2 border-r border-slate-200">
                    <LayoutGrid class="w-4 h-4" /> Salas
                  </div>
                  <div class="flex-1 grid" :style="`grid-template-columns: repeat(${hours.length}, 1fr)`">
                    <div v-for="h in hours" :key="h" class="py-3 text-center text-xs font-bold text-slate-500 border-r border-slate-100 last:border-r-0">
                      <Clock class="w-3 h-3 inline mr-1 mb-0.5" /> {{ String(h).padStart(2, '0') }}:00
                    </div>
                  </div>
                </div>

                <div v-if="isLoading" class="p-12 flex justify-center text-[#be123c]">
                   <Loader2 class="w-10 h-10 animate-spin" />
                </div>
                
                <div v-else-if="rooms.length === 0" class="p-12 text-center text-slate-400 italic">
                  Nenhuma sala cadastrada.
                </div>

                <div v-else>
                  <div v-for="room in rooms" :key="room.id" class="flex border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                    
                    <div class="w-48 p-4 shrink-0 border-r border-slate-200 bg-white group-hover:bg-slate-50/50 transition-colors">
                      <p class="font-bold text-slate-800 text-sm">{{ room.nome }}</p>
                      <div class="flex items-center gap-1 text-slate-400 text-xs mt-1">
                        <Users class="w-3 h-3" />
                        <span>{{ room.capacity || 30 }} lugares</span>
                      </div>
                    </div>

                    <div class="flex-1 grid" :style="`grid-template-columns: repeat(${hours.length}, 1fr)`">
                      <div 
                        v-for="h in hours" 
                        :key="h" 
                        class="border-r border-slate-100 last:border-r-0 relative h-20 p-1"
                      >
                        <div 
                          v-if="getBookingForSlot(room.id, h)" 
                          @click="openEventDetails(getBookingForSlot(room.id, h))"
                          class="h-full w-full bg-rose-100 border-l-4 border-rose-600 rounded-r-md p-2 text-xs flex flex-col justify-center shadow-sm cursor-pointer hover:bg-rose-200 transition-colors group/item"
                        >
                          <span class="font-bold text-rose-900 truncate">
                            {{ getBookingForSlot(room.id, h).title }}
                          </span>
                          <span class="text-rose-700 text-[10px] truncate mt-0.5">
                            {{ getBookingForSlot(room.id, h).userName }}
                          </span>
                        </div>

                        <div v-else class="h-full w-full flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer text-slate-300 hover:text-rose-300 transition-colors">
                          <span class="text-2xl font-light">+</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg border border-slate-200 p-4 flex items-center gap-6 text-sm">
             <span class="font-bold text-slate-700">Legenda</span>
             <div class="flex items-center gap-2">
               <div class="w-3 h-3 bg-rose-600 rounded-sm"></div>
               <span class="text-slate-600">Ocupado</span>
             </div>
             <div class="flex items-center gap-2">
               <div class="w-3 h-3 bg-white border border-slate-300 rounded-sm"></div>
               <span class="text-slate-600">Disponível</span>
             </div>
          </div>

        </div>
      </main>

      <Modal :is-open="showEventModal" title="Detalhes do Agendamento" @close="showEventModal = false">
        <div v-if="selectedEvent" class="space-y-5">
          
          <div class="bg-rose-50 border border-rose-100 rounded-lg p-4 flex items-start gap-4">
            <div class="bg-white p-2 rounded-full text-rose-600 shadow-sm">
              <CalendarIcon class="w-6 h-6" />
            </div>
            <div>
              <h3 class="font-bold text-lg text-rose-900 leading-tight">{{ selectedEvent.title }}</h3>
              <p class="text-rose-700 text-sm mt-1">{{ selectedEvent.time }} • {{ selectedEvent.room }}</p>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                <User class="w-3 h-3" /> Responsável
              </label>
              <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-md border border-slate-100">
                <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-600 font-bold border border-slate-200 uppercase">
                  {{ selectedEvent.user.substring(0,2) }}
                </div>
                <div>
                  <p class="text-sm font-bold text-slate-800">{{ selectedEvent.user }}</p>
                  <p class="text-xs text-slate-500">{{ selectedEvent.email }}</p>
                </div>
              </div>
            </div>

            <div>
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                <Info class="w-3 h-3" /> Descrição / Observações
              </label>
              <div class="p-3 bg-slate-50 rounded-md border border-slate-100 text-sm text-slate-700 leading-relaxed min-h-[80px]">
                {{ selectedEvent.description }}
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-2">
            <button @click="showEventModal = false" class="px-6 py-2 bg-slate-900 text-white rounded-md font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm">
              Fechar
            </button>
          </div>
        </div>
      </Modal>

    </div>
  </div>
</template>