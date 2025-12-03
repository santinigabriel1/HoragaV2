<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Clock, Calendar, Save, Plus, Trash2, AlertCircle, Copy, ClipboardPaste, Check 
} from 'lucide-vue-next'
import Sidebar from '@/components/layout/Sidebar.vue'
import api from '@/services/api'
import { useNotificationStore } from '@/stores/notification' 
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const sidebarOpen = ref(false)
const isSaving = ref(false)
const isLoading = ref(false)
const notificationStore = useNotificationStore()
const authStore = useAuthStore()


const rooms = ref<any[]>([])
const selectedRoomId = ref<string | number>('')

const copiedSlots = ref<any[] | null>(null)

const copySchedule = (dayIndex: number) => {
  const sourceSlots = weeklySchedule.value[dayIndex].slots
  if (sourceSlots.length === 0) return alert('Não há horários neste dia para copiar.')
  copiedSlots.value = JSON.parse(JSON.stringify(sourceSlots))
}

const pasteSchedule = (dayIndex: number) => {
  if (!copiedSlots.value) return
  weeklySchedule.value[dayIndex].slots = JSON.parse(JSON.stringify(copiedSlots.value))
  weeklySchedule.value[dayIndex].isOpen = true
}

const dayMapping: Record<string, string> = {
  'Segunda-feira': 'segunda-feira',
  'Terça-feira': 'terça-feira',
  'Quarta-feira': 'quarta-feira',
  'Quinta-feira': 'quinta-feira',
  'Sexta-feira': 'sexta-feira',
  'Sábado': 'sábado',
  'Domingo': 'domingo'
}

const weeklySchedule = ref([
  { day: 'Segunda-feira', isOpen: false, slots: [] as any[] },
  { day: 'Terça-feira', isOpen: false, slots: [] as any[] },
  { day: 'Quarta-feira', isOpen: false, slots: [] as any[] },
  { day: 'Quinta-feira', isOpen: false, slots: [] as any[] },
  { day: 'Sexta-feira', isOpen: false, slots: [] as any[] },
  { day: 'Sábado', isOpen: false, slots: [] as any[] },
  { day: 'Domingo', isOpen: false, slots: [] as any[] },
])

const fetchRooms = async () => {
  try {
    const [resRooms, resInst] = await Promise.all([
      api.get('/salas'),
      api.get('/instituicoes')
    ])
    
    const userId = String(authStore.user?.id)

    // Identifica minhas instituições
    const myInstIds = new Set<number>()
    if (resInst.data.success) {
      resInst.data.data.forEach((inst: any) => {
        if (String(inst.organizador) === userId) myInstIds.add(inst.id)
      })
    }

    // Filtra salas
    if (resRooms.data.success) {
      rooms.value = resRooms.data.data.filter((room: any) => myInstIds.has(room.fk_instituicao_id))
      
      if (rooms.value.length > 0) {
        selectedRoomId.value = rooms.value[0].id
      }
    }
  } catch (error) {
    console.error('Erro ao buscar salas:', error)
  }
}

const loadSchedule = async (id: number | string) => {
  isLoading.value = true
  weeklySchedule.value.forEach(d => { d.isOpen = false; d.slots = [] })
  copiedSlots.value = null 

  try {
    const { data } = await api.get(`/sala/${id}`)
    const scheduleData = data.data.horario_funcionamento || data.data.horario

    if (data.success && Array.isArray(scheduleData)) {
      weeklySchedule.value.forEach(dayObj => {
        const apiDayName = dayMapping[dayObj.day]
        const dayData = scheduleData.find((item: any) => item.dia === apiDayName)

        if (dayData && dayData.horarios && dayData.horarios.length > 0) {
          dayObj.isOpen = true
          dayObj.slots = dayData.horarios.map((h: any) => ({
            start: h.inicio,
            end: h.fim
          }))
        }
      })
    }
  } catch (error) { console.error(error) } finally { isLoading.value = false }
}

const handleSave = async () => {
  if (!selectedRoomId.value) return alert('Selecione uma sala!')
  isSaving.value = true
  try {
    const payload = weeklySchedule.value.map(day => {
      const apiDayName = dayMapping[day.day]
      const horarios = day.isOpen 
        ? day.slots.filter(s => s.start && s.end).map(s => ({ inicio: s.start, fim: s.end, disponivel: true }))
        : []
      return { dia: apiDayName, horarios: horarios }
    })

    const { data } = await api.post(`/sala/editar_horario/${selectedRoomId.value}`, payload)
    if (data.success) {
      notificationStore.showSuccess('Horários salvos com sucesso!')
      loadSchedule(selectedRoomId.value)
    }
  } catch (error: any) {
    notificationStore.showError('Erro ao salvar: ' + (error.response?.data?.message || error.message))
  } finally { isSaving.value = false }
}

watch(selectedRoomId, (newId) => { if (newId) loadSchedule(newId) })
onMounted(() => fetchRooms())

const addTimeSlot = (dayIndex: number) => {
  weeklySchedule.value[dayIndex].slots.push({ start: '', end: '' })
  weeklySchedule.value[dayIndex].isOpen = true
}

const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
  weeklySchedule.value[dayIndex].slots.splice(slotIndex, 1)
  if (weeklySchedule.value[dayIndex].slots.length === 0) weeklySchedule.value[dayIndex].isOpen = false
}

const handleLogout = () => router.push('/login')
const exceptions = ref([{ id: 1, date: '2025-12-25', name: 'Natal' }])
</script>

<template>
  <div class="flex h-screen bg-slate-50">
    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" @logout="handleLogout" />

    <div class="flex-1 flex flex-col overflow-hidden">
      <Header title="Configuração de Disponibilidade" @toggle-sidebar="sidebarOpen = true" />

      <main class="flex-1 overflow-y-auto p-4 md:p-8">
        <div class="max-w-6xl mx-auto">
          
          <div class="mb-8">
            <h1 class="text-3xl md:text-2xl font-bold text-slate-900 mb-2">DISPONIBILIDADE</h1>
            <p class="text-slate-500">Defina os horários de funcionamento.</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-6 flex items-center gap-4">
            <div class="bg-rose-50 p-2 rounded-md text-rose-600"><Clock class="w-6 h-6" /></div>
            <div class="flex-1">
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Selecione a Sala</label>
              <select v-model="selectedRoomId" class="w-full sm:w-1/2 border border-slate-300 rounded-md px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500">
                <option value="" disabled>Carregando...</option>
                <option v-for="room in rooms" :key="room.id" :value="room.id">{{ room.nome }}</option>
              </select>
            </div>
          </div>

          <div v-if="isLoading" class="flex justify-center py-12">
            <Loader2 class="w-10 h-10 animate-spin text-rose-600" />
          </div>

          <div v-else-if="selectedRoomId" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div class="lg:col-span-2 space-y-6">
              <div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div class="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <div>
                    <h3 class="font-bold text-lg text-slate-900">Grade Horária</h3>
                    <p class="text-sm text-slate-500">Configure os intervalos.</p>
                  </div>
                  <div v-if="copiedSlots" class="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200 font-medium flex items-center gap-1 animate-pulse">
                    <Check class="w-3 h-3" /> Horários copiados
                  </div>
                </div>

                <div class="divide-y divide-slate-100">
                  <div v-for="(schedule, dayIndex) in weeklySchedule" :key="dayIndex" class="p-5 flex flex-col md:flex-row gap-4 hover:bg-slate-50 transition-colors items-start group">
                    
                    <div class="flex items-center gap-4 min-w-[180px] pt-2 justify-between">
                      <div class="flex items-center gap-3">
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" v-model="schedule.isOpen" @change="!schedule.isOpen ? schedule.slots = [] : addTimeSlot(dayIndex)" class="sr-only peer">
                          <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#be123c]"></div>
                        </label>
                        <span class="font-medium text-slate-700 text-sm" :class="{'text-slate-400': !schedule.isOpen}">{{ schedule.day }}</span>
                      </div>

                      <div class="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button v-if="schedule.slots.length > 0" @click="copySchedule(dayIndex)" class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Copiar">
                          <Copy class="w-4 h-4" />
                        </button>
                        <button v-if="copiedSlots" @click="pasteSchedule(dayIndex)" class="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded" title="Colar">
                          <ClipboardPaste class="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div class="flex-1 w-full">
                      <div v-if="!schedule.isOpen" class="flex items-center gap-2 text-slate-400 text-sm italic bg-slate-100 px-3 py-2 rounded-md w-fit">
                        <AlertCircle class="w-4 h-4" /> Fechado
                      </div>
                      <div v-else class="space-y-2">
                        <div class="flex flex-wrap gap-2">
                          <div v-for="(slot, slotIndex) in schedule.slots" :key="slotIndex" class="flex items-center gap-1 bg-white border border-slate-200 rounded-md pl-2 pr-1 py-1 shadow-sm">
                            <input type="time" v-model="slot.start" class="border-none focus:ring-0 p-0 text-xs text-slate-700 font-medium w-[65px] bg-transparent">
                            <span class="text-slate-400 text-[10px]">até</span>
                            <input type="time" v-model="slot.end" class="border-none focus:ring-0 p-0 text-xs text-slate-700 font-medium w-[65px] bg-transparent">
                            <button @click="removeTimeSlot(dayIndex, slotIndex)" class="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50"><Trash2 class="w-3 h-3" /></button>
                          </div>
                          <button @click="addTimeSlot(dayIndex)" class="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-50 border border-dashed border-rose-200 h-[34px]"><Plus class="w-3 h-3" /> Add</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-6">
              
              <button 
                @click="handleSave"
                :disabled="isSaving || !selectedRoomId"
                class="w-full flex items-center justify-center gap-2 bg-[#be123c] hover:bg-[#9f1239] text-white py-2 rounded-md font-bold shadow-sm disabled:opacity-70 transition-colors text-sm"
              >
                <Save v-if="!isSaving" class="w-4 h-4" />
                <span v-else>Salvando...</span>
                {{ isSaving ? '' : 'Salvar Alterações' }}
              </button>

              <div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div class="p-4 border-b border-slate-100 bg-slate-50/50"><h3 class="font-bold text-sm text-slate-900">Feriados</h3></div>
                <div class="p-4"><div v-for="ex in exceptions" :key="ex.id" class="flex justify-between p-2 border-b text-xs"><span>{{ ex.name }}</span><span class="text-slate-500">{{ ex.date }}</span></div></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>