<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Clock, MapPin, Loader2, AlignLeft 
} from 'lucide-vue-next'
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'
import Modal from '@/components/ui/Modal.vue'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth' // <--- 1. Importar Store

const router = useRouter()
const authStore = useAuthStore() // <--- 2. Inicializar Store
const sidebarOpen = ref(false)
const isLoading = ref(true)

// Estado
const currentDate = ref(new Date()) 
const events = ref<any[]>([])
const showModal = ref(false)
const selectedEvent = ref<any>(null)

// Configurações do Grid
const startHour = 6 
const endHour = 23 
const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i)

// --- NAVEGAÇÃO SEMANAL ---
const weekLabel = computed(() => {
  const start = getStartOfWeek(new Date(currentDate.value))
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const m1 = start.toLocaleDateString('pt-BR', { month: 'short' })
  const m2 = end.toLocaleDateString('pt-BR', { month: 'short' })
  const y = start.getFullYear()
  if (m1 === m2) return `${m1} ${y}`
  return `${m1} - ${m2} ${y}`
})

function getStartOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  return new Date(d.setDate(diff))
}

const prevWeek = () => {
  const d = new Date(currentDate.value)
  d.setDate(d.getDate() - 7)
  currentDate.value = d
}

const nextWeek = () => {
  const d = new Date(currentDate.value)
  d.setDate(d.getDate() + 7)
  currentDate.value = d
}

const goToToday = () => currentDate.value = new Date()

// --- GERAÇÃO DOS DIAS ---
const weekDays = computed(() => {
  const start = getStartOfWeek(new Date(currentDate.value))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const dateISO = `${year}-${month}-${day}`
    const isToday = new Date().toDateString() === d.toDateString()
    return {
      dateObj: d,
      dayName: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
      dayNumber: d.getDate(),
      dateISO, 
      isToday
    }
  })
})

// --- CÁLCULO VISUAL ---
const getEventStyle = (event: any) => {
  if (!event.startTimeRaw || !event.endTimeRaw) return { display: 'none' }
  const [hStart, mStart] = event.startTimeRaw.split(':').map(Number)
  const [hEnd, mEnd] = event.endTimeRaw.split(':').map(Number)
  const startMinutes = (hStart - startHour) * 60 + mStart
  const endMinutes = (hEnd - startHour) * 60 + mEnd
  const durationMinutes = endMinutes - startMinutes
  const pixelsPerMinute = 80 / 60
  return {
    top: `${startMinutes * pixelsPerMinute}px`,
    height: `${Math.max(durationMinutes * pixelsPerMinute, 20)}px`
  }
}

const getEventsForDay = (dateISO: string) => {
  return events.value.filter(e => e.dateISO === dateISO)
}

// --- API SEGURA (FILTRAGEM) ---
const fetchAgendamentos = async () => {
  isLoading.value = true
  try {
    // 1. Busca TUDO em paralelo
    const [resInst, resRooms, resBookings] = await Promise.all([
      api.get('/instituicoes'),
      api.get('/salas'),
      api.get('/agendamentos')
    ])

    const userId = String(authStore.user?.id)

    // 2. Identifica IDs das MINHAS Instituições
    const myInstIds = new Set<number>()
    if (resInst.data.success) {
      resInst.data.data.forEach((inst: any) => {
        if (String(inst.organizador) === userId) {
          myInstIds.add(inst.id)
        }
      })
    }

    // 3. Identifica IDs das MINHAS Salas (e mapeia nomes)
    const myRoomIds = new Set<number>()
    const myRoomsMap = new Map<number, string>()
    
    if (resRooms.data.success) {
      resRooms.data.data.forEach((room: any) => {
        // Só aceita sala se pertencer a uma instituição minha
        if (myInstIds.has(room.fk_instituicao_id)) {
          myRoomIds.add(room.id)
          myRoomsMap.set(room.id, room.nome)
        }
      })
    }

    // 4. Filtra Agendamentos
    if (resBookings.data.success) {
      const allBookings = resBookings.data.data
      
      // Só aceita agendamento se pertencer a uma sala minha
      const validBookings = allBookings.filter((b: any) => myRoomIds.has(b.fk_salas_id))

      events.value = validBookings.map((item: any) => {
        let sTime = item.horario_inicio
        let eTime = item.horario_fim
        if (!sTime && item.horarios && item.horarios.length > 0) {
          sTime = item.horarios[0].inicio
          eTime = item.horarios[0].fim
        }
        if (!sTime) sTime = "00:00"
        if (!eTime) eTime = "01:00"

        const rawDate = item.data_agendamento || item.data
        const dateISO = typeof rawDate === 'string' ? rawDate.split('T')[0] : ''

        const colors = [
          'bg-blue-50 border-blue-600 text-blue-700',
          'bg-rose-50 border-rose-600 text-rose-700',
          'bg-emerald-50 border-emerald-600 text-emerald-700',
          'bg-amber-50 border-amber-600 text-amber-700',
          'bg-purple-50 border-purple-600 text-purple-700'
        ]
        const colorClass = colors[(item.fk_salas_id || item.id) % colors.length]

        // Pega nome da sala do mapa seguro
        const roomName = myRoomsMap.get(item.fk_salas_id) || item.sala?.nome || `Sala ${item.fk_salas_id}`

        return {
          id: item.id,
          title: item.proposito || item.assunto || 'Reservado',
          description: item.descricao,
          room: roomName,
          dateISO,
          dateDisplay: new Date(dateISO + 'T00:00:00').toLocaleDateString('pt-BR'),
          startTimeRaw: sTime.substring(0, 5),
          endTimeRaw: eTime.substring(0, 5),
          timeDisplay: `${sTime.substring(0, 5)} - ${eTime.substring(0, 5)}`,
          colorClass
        }
      })
      
      console.log('✅ EVENTOS SEGUROS:', events.value)
    }
  } catch (error) {
    console.error('Erro API:', error)
  } finally {
    isLoading.value = false
  }
}

const openEventDetails = (event: any) => {
  selectedEvent.value = event
  showModal.value = true
}

const handleLogout = () => router.push('/login')

onMounted(() => fetchAgendamentos())
</script>

<template>
  <div class="flex h-screen bg-white">
    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" @logout="handleLogout" />
    <div class="flex-1 flex flex-col overflow-hidden">
      <Header title="Calendário" @toggle-sidebar="sidebarOpen = true" />
      <main class="flex-1 overflow-y-auto p-4">
        <div class="max-w-6xl mx-auto h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200">
          <div class="px-6 py-4 flex items-center justify-between border-b border-slate-200 shrink-0 bg-white z-20">
            <div class="flex items-center gap-4">
              <h2 class="text-xl font-bold text-slate-900 capitalize">{{ weekLabel }}</h2>
              <div class="flex items-center rounded-md border border-slate-200 bg-white shadow-sm">
                <button @click="prevWeek" class="p-2 hover:bg-slate-50 border-r border-slate-200 text-slate-600"><ChevronLeft class="w-4 h-4" /></button>
                <button @click="goToToday" class="px-4 py-1 text-xs font-bold hover:bg-slate-50 text-slate-700">Hoje</button>
                <button @click="nextWeek" class="p-2 hover:bg-slate-50 border-l border-slate-200 text-slate-600"><ChevronRight class="w-4 h-4" /></button>
              </div>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto flex flex-col relative bg-white">
            <div class="flex border-b border-slate-200 sticky top-0 bg-white z-30 ml-[60px] shadow-sm">
              <div v-for="day in weekDays" :key="day.dateISO" class="flex-1 py-3 text-center border-l border-slate-100 first:border-l-0">
                <p class="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">{{ day.dayName }}</p>
                <div class="w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm font-bold transition-colors" :class="day.isToday ? 'bg-rose-600 text-white shadow-md' : 'text-slate-900 hover:bg-slate-100'">{{ day.dayNumber }}</div>
              </div>
            </div>
            <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-white/80 z-40"><Loader2 class="w-10 h-10 animate-spin text-rose-600" /></div>
            <div class="flex flex-1 relative min-h-[1400px]">
              <div class="w-[60px] border-r border-slate-200 flex-shrink-0 bg-white sticky left-0 z-20">
                <div v-for="h in hours" :key="h" class="h-[80px] border-b border-slate-50 text-[10px] text-slate-400 font-medium text-right pr-2 pt-1 relative"><span class="-translate-y-1/2 block">{{ String(h).padStart(2, '0') }}:00</span></div>
              </div>
              <div class="flex flex-1 relative">
                <div class="absolute inset-0 flex flex-col pointer-events-none"><div v-for="h in hours" :key="`grid-${h}`" class="h-[80px] border-b border-slate-100 w-full border-dashed"></div></div>
                <div v-for="day in weekDays" :key="`col-${day.dateISO}`" class="flex-1 border-l border-slate-100 relative first:border-l-0 group hover:bg-slate-50/30 transition-colors">
                  <div v-for="event in getEventsForDay(day.dateISO)" :key="event.id" @click.stop="openEventDetails(event)" class="absolute left-1 right-1 rounded-md border-l-[3px] p-2 cursor-pointer hover:brightness-95 hover:scale-[1.02] transition-all shadow-sm overflow-hidden z-10 flex flex-col justify-start" :class="event.colorClass" :style="getEventStyle(event)">
                    <div class="font-bold text-xs leading-tight mb-0.5">{{ event.title }}</div>
                    <div class="text-[10px] font-medium opacity-90 flex items-center gap-1"><Clock class="w-3 h-3" /> {{ event.timeDisplay }}</div>
                    <div class="text-[10px] mt-auto opacity-80 truncate font-medium">{{ event.room }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Modal :is-open="showModal" title="Detalhes do Evento" @close="showModal = false">
        <div v-if="selectedEvent" class="space-y-5">
          <div class="flex items-center gap-3 p-4 rounded-lg bg-slate-50 border border-slate-100">
            <div class="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-rose-600 border border-rose-100"><CalendarIcon class="w-5 h-5" /></div>
            <div><h4 class="font-bold text-slate-900 text-lg">{{ selectedEvent.title }}</h4><p class="text-xs text-slate-500 font-medium uppercase tracking-wide">Reserva Confirmada</p></div>
          </div>
          <div class="space-y-4 text-sm">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3"><span class="text-slate-500 flex items-center gap-2"><MapPin class="w-4 h-4" /> Sala</span><span class="font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded text-xs">{{ selectedEvent.room }}</span></div>
            <div class="flex items-center justify-between border-b border-slate-100 pb-3"><span class="text-slate-500 flex items-center gap-2"><Clock class="w-4 h-4" /> Data/Hora</span><span class="font-medium text-slate-800">{{ selectedEvent.dateDisplay }} • {{ selectedEvent.timeDisplay }}</span></div>
            <div class="pt-1" v-if="selectedEvent.description"><span class="text-slate-500 flex items-center gap-2 text-xs uppercase font-bold mb-2"><AlignLeft class="w-3 h-3" /> Observações</span><p class="text-slate-700 bg-slate-50 p-3 rounded-lg text-xs leading-relaxed border border-slate-100">{{ selectedEvent.description }}</p></div>
          </div>
          <button @click="showModal = false" class="w-full py-3 rounded-lg bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors shadow-md">Fechar</button>
        </div>
      </Modal>
    </div>
  </div>
</template>
<style scoped>.custom-scrollbar::-webkit-scrollbar{width:0}</style>