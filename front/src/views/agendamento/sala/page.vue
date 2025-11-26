<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ArrowLeft, Calendar as CalendarIcon, Clock, Check, XCircle, Loader2 
} from 'lucide-vue-next'
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const roomId = route.params.roomId

const sidebarOpen = ref(false)
const isLoading = ref(true)
const roomName = ref('')
const roomSchedule = ref<any[]>([]) 
const existingBookings = ref<any[]>([]) 

// Seleção
const selectedDateIndex = ref<number>(0)
const selectedTime = ref<string | null>(null)

const dayMap = [
  'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 
  'quinta-feira', 'sexta-feira', 'sábado'
]

// --- FUNÇÕES DE NORMALIZAÇÃO (O SEGREDO DO BLOQUEIO) ---

// Remove segundos: "07:50:00" vira "07:50"
const normalizeTime = (time: string) => {
  if (!time) return ''
  return time.substring(0, 5)
}

// Pega só a data YYYY-MM-DD independente do Timezone
const normalizeDate = (dateInput: string | Date) => {
  if (!dateInput) return ''
  // Se for string ISO (2025-12-01T00:...) pega a primeira parte
  if (typeof dateInput === 'string') return dateInput.split('T')[0]
  // Se for objeto Date
  const d = new Date(dateInput)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Corrige acentos vindos errados do banco
const fixEncoding = (text: string) => {
  try { return decodeURIComponent(escape(text)) } catch (e) { return text }
}

// Gera os próximos 14 dias
const dates = computed(() => {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return {
      index: i,
      obj: d,
      dayName: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
      dayNumber: d.getDate(),
      // Usa a função manual para garantir a data correta sem fuso
      fullDate: normalizeDate(d), 
      apiDayKey: dayMap[d.getDay()] 
    }
  })
})

// --- LÓGICA DE DISPONIBILIDADE ---
// --- LÓGICA DE BLOQUEIO E DISPONIBILIDADE ---
const availableSlots = computed(() => {
  if (!roomSchedule.value || !Array.isArray(roomSchedule.value)) return []
  
  const dateInfo = dates.value[selectedDateIndex.value]
  
  const dayConfig = roomSchedule.value.find((item: any) => item.dia === dateInfo.apiDayKey)

  if (!dayConfig || !dayConfig.horarios) return []

  return dayConfig.horarios
    .filter((slot: any) => slot.disponivel)
    .map((slot: any) => {
      
      // VERIFICAÇÃO DE RESERVA (Agora busca em todas as estruturas possíveis)
      const isBooked = existingBookings.value.some((booking: any) => {
        // 1. Normaliza a DATA
        const rawDate = booking.data_agendamento || booking.data
        if (!rawDate) return false
        const bookingYMD = typeof rawDate === 'string' ? rawDate.split('T')[0] : ''
        
        // 2. Tenta encontrar o HORÁRIO DE INÍCIO (Na raiz ou dentro de array/JSON)
        let rawStart = booking.horario_inicio || booking.inicio
        
        // Se não achou na raiz, verifica se está dentro de um array 'horarios' (padrão do seu POST)
        if (!rawStart && Array.isArray(booking.horarios) && booking.horarios.length > 0) {
           rawStart = booking.horarios[0].inicio
        } 
        // Se veio como string JSON (comum em alguns bancos), tenta fazer parse
        else if (!rawStart && typeof booking.horarios === 'string') {
           try {
             const parsed = JSON.parse(booking.horarios)
             if (Array.isArray(parsed) && parsed.length > 0) rawStart = parsed[0].inicio
           } catch(e) {}
        }

        const bookingStart = normalizeTime(rawStart)
        const slotStart = normalizeTime(slot.inicio)

        const match = bookingYMD === dateInfo.fullDate && bookingStart === slotStart
        
        // DEBUG MELHORADO: Mostra o objeto inteiro se a data bater, para vermos a estrutura
        if (bookingYMD === dateInfo.fullDate) {
           console.log('--- DEBUG RESERVA ---')
           console.log('Objeto Reserva:', booking)
           console.log(`Comparando: Banco[${bookingStart}] == Slot[${slotStart}] -> ${match}`)
        }

        return match
      })

      return {
        label: `${normalizeTime(slot.inicio)} - ${normalizeTime(slot.fim)}`,
        value: `${normalizeTime(slot.inicio)} - ${normalizeTime(slot.fim)}`,
        start: slot.inicio,
        disabled: isBooked 
      }
    })
})

const selectFirstAvailableDay = () => {
  if (!roomSchedule.value || !Array.isArray(roomSchedule.value)) return
  const firstIndex = dates.value.findIndex(date => {
    return roomSchedule.value.find((item: any) => item.dia === date.apiDayKey)
  })
  if (firstIndex !== -1) selectedDateIndex.value = firstIndex
}

const fetchData = async () => {
  isLoading.value = true
  try {
    // 1. Busca Sala
    const resRoom = await api.get(`/sala/${roomId}`)
    if (resRoom.data.success) {
      roomName.value = fixEncoding(resRoom.data.data.nome)
      const rawSchedule = resRoom.data.data.horario_funcionamento || resRoom.data.data.horario
      roomSchedule.value = Array.isArray(rawSchedule) ? rawSchedule : []
    }

    // 2. Busca Reservas Existentes
    const resBookings = await api.get('/agendamentos') 
    if (resBookings.data.success) {
      // Filtra apenas reservas desta sala
      existingBookings.value = resBookings.data.data.filter((b: any) => 
        Number(b.fk_salas_id) === Number(roomId)
      )
      console.log('Reservas carregadas:', existingBookings.value)
    }
    
    selectFirstAvailableDay()

  } catch (error) {
    console.error('Erro ao carregar dados:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})

const handleContinue = () => {
  if (selectedTime.value) {
    const dateInfo = dates.value[selectedDateIndex.value]
    router.push({
      path: `/agendamento/${roomId}/confirmar`,
      query: {
        date: dateInfo.fullDate, 
        dateDisplay: dateInfo.obj.toLocaleDateString('pt-BR'),
        time: selectedTime.value
      }
    })
  }
}

const handleLogout = () => router.push('/login')
</script>

<template>
  <div class="flex h-screen bg-slate-50">
    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" @logout="handleLogout" />

    <div class="flex-1 flex flex-col overflow-hidden">
      <Header title="Nova Reserva" @toggle-sidebar="sidebarOpen = true" />

      <main class="flex-1 overflow-y-auto p-4 md:p-8">
        <div class="max-w-3xl mx-auto">
          
          <button @click="router.back()" class="flex items-center text-slate-500 hover:text-rose-700 mb-6 transition-colors">
            <ArrowLeft class="w-4 h-4 mr-2" /> Voltar para lista
          </button>

          <div v-if="isLoading" class="flex justify-center py-12">
            <Loader2 class="w-10 h-10 animate-spin text-rose-600" />
          </div>

          <div v-else class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div class="p-6 border-b border-slate-100 bg-rose-50/30">
              <h1 class="text-2xl font-bold text-slate-900">Selecione o Horário</h1>
              <p class="text-slate-500 mt-1">Sala: <span class="font-bold text-rose-700">{{ roomName }}</span></p>
            </div>

            <div class="p-6 space-y-8">
              
              <div>
                <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <CalendarIcon class="w-4 h-4 text-rose-600" /> Data
                </h3>
                <div class="flex gap-3 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200">
                  <button 
                    v-for="date in dates" 
                    :key="date.index"
                    @click="selectedDateIndex = date.index; selectedTime = null" 
                    class="flex flex-col items-center justify-center min-w-[70px] h-20 rounded-lg border-2 transition-all duration-200 relative shrink-0"
                    :class="selectedDateIndex === date.index 
                      ? 'border-rose-600 bg-rose-50 text-rose-700 shadow-sm' 
                      : 'border-slate-100 hover:border-rose-200 text-slate-500 hover:bg-slate-50'"
                  >
                    <span class="text-[10px] font-bold uppercase">{{ date.dayName }}</span>
                    <span class="text-xl font-bold">{{ date.dayNumber }}</span>
                    <span v-if="roomSchedule.find((i:any) => i.dia === date.apiDayKey)" class="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  </button>
                </div>
              </div>

              <div>
                <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Clock class="w-4 h-4 text-rose-600" /> 
                  Horários para {{ dates[selectedDateIndex].dayName }}, dia {{ dates[selectedDateIndex].dayNumber }}
                </h3>

                <div v-if="availableSlots.length === 0" class="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <Clock class="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p class="text-sm text-slate-500">Nenhum horário configurado para esta data.</p>
                </div>

                <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  <button
                    v-for="slot in availableSlots"
                    :key="slot.value"
                    @click="!slot.disabled && (selectedTime = slot.value)"
                    :disabled="slot.disabled"
                    class="py-2.5 px-2 rounded-md text-xs font-medium border transition-all text-center flex flex-col items-center justify-center gap-1 relative overflow-hidden"
                    :class="[
                      slot.disabled 
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60' 
                        : selectedTime === slot.value
                          ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700'
                    ]"
                  >
                    <span>{{ slot.label }}</span>
                    <span v-if="slot.disabled" class="text-[9px] font-bold text-red-500 flex items-center gap-1 mt-0.5">
                      <XCircle class="w-3 h-3" /> Ocupado
                    </span>
                  </button>
                </div>
              </div>

            </div>

            <div class="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <div class="text-xs text-slate-400">
                <span v-if="selectedTime">Selecionado: <strong>{{ dates[selectedDateIndex].fullDate }}</strong> às <strong>{{ selectedTime }}</strong></span>
              </div>
              <button 
                @click="handleContinue"
                :disabled="!selectedTime"
                class="bg-[#be123c] hover:bg-[#9f1239] text-white px-8 py-2.5 rounded-md font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
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