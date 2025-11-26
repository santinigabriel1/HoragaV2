<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Clock, Calendar, Save, Plus, Trash2, AlertCircle 
} from 'lucide-vue-next'
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'

const router = useRouter()
const sidebarOpen = ref(false)
const isSaving = ref(false)

// Configuração Semanal (Adaptado para múltiplos horários - Estilo ETEC)
const weeklySchedule = ref([
  { 
    day: 'Segunda-feira', 
    isOpen: true, 
    slots: [
      { start: '07:10', end: '08:00' },
      { start: '08:00', end: '08:50' }
    ] 
  },
  { 
    day: 'Terça-feira', 
    isOpen: true, 
    slots: [{ start: '07:10', end: '12:20' }] 
  },
  { 
    day: 'Quarta-feira', 
    isOpen: true, 
    slots: [{ start: '07:10', end: '12:20' }] 
  },
  { 
    day: 'Quinta-feira', 
    isOpen: true, 
    slots: [{ start: '07:10', end: '12:20' }] 
  },
  { 
    day: 'Sexta-feira', 
    isOpen: true, 
    slots: [{ start: '07:10', end: '12:20' }] 
  },
  { 
    day: 'Sábado', 
    isOpen: true, 
    slots: [{ start: '08:00', end: '12:00' }] 
  },
  { 
    day: 'Domingo', 
    isOpen: false, 
    slots: [] 
  },
])

// Exceções (Feriados)
const exceptions = ref([
  { id: 1, date: '2025-12-25', name: 'Natal' },
  { id: 2, date: '2026-01-01', name: 'Ano Novo' },
])

const newException = ref({ date: '', name: '' })

// --- FUNÇÕES DE HORÁRIO ---

const addTimeSlot = (dayIndex: number) => {
  // Adiciona um slot vazio padrão
  weeklySchedule.value[dayIndex].slots.push({ start: '', end: '' })
}

const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
  weeklySchedule.value[dayIndex].slots.splice(slotIndex, 1)
}

// --- FUNÇÕES DE EXCEÇÃO ---

const addException = () => {
  if (newException.value.date && newException.value.name) {
    exceptions.value.push({
      id: Date.now(),
      date: newException.value.date,
      name: newException.value.name
    })
    newException.value = { date: '', name: '' }
  }
}

const removeException = (id: number) => {
  exceptions.value = exceptions.value.filter(e => e.id !== id)
}

const handleSave = () => {
  isSaving.value = true
  setTimeout(() => {
    isSaving.value = false
    alert('Configurações salvas com sucesso!')
  }, 1000)
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
        title="Configuração de Disponibilidade" 
        @toggle-sidebar="sidebarOpen = true" 
      />

      <main class="flex-1 overflow-y-auto p-4 md:p-8">
        <div class="max-w-6xl mx-auto">
          
          <div class="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 class="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Disponibilidade</h1>
              <p class="text-slate-500">Defina os horários de aula e funcionamento dos laboratórios.</p>
            </div>
            
            <button 
              @click="handleSave"
              :disabled="isSaving"
              class="flex items-center gap-2 bg-[#be123c] hover:bg-[#9f1239] text-white px-6 py-2.5 rounded-md font-bold transition-colors shadow-sm disabled:opacity-70"
            >
              <Save v-if="!isSaving" class="w-5 h-5" />
              <span v-else>Salvando...</span>
              {{ isSaving ? '' : 'Salvar Alterações' }}
            </button>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div class="lg:col-span-2 space-y-6">
              <div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div class="p-6 border-b border-slate-100 bg-slate-50/50">
                  <div class="flex items-center gap-2">
                    <Clock class="w-5 h-5 text-rose-600" />
                    <h3 class="font-bold text-lg text-slate-900">Grade Horária Semanal</h3>
                  </div>
                  <p class="text-sm text-slate-500 mt-1">Configure múltiplos intervalos por dia (ex: aulas de 50min).</p>
                </div>

                <div class="divide-y divide-slate-100">
                  <div 
                    v-for="(schedule, dayIndex) in weeklySchedule" 
                    :key="dayIndex"
                    class="p-5 flex flex-col md:flex-row gap-4 hover:bg-slate-50 transition-colors items-start"
                  >
                    <div class="flex items-center gap-4 min-w-[160px] pt-2">
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" v-model="schedule.isOpen" class="sr-only peer">
                        <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#be123c]"></div>
                      </label>
                      <span class="font-medium text-slate-700" :class="{'text-slate-400': !schedule.isOpen}">
                        {{ schedule.day }}
                      </span>
                    </div>

                    <div class="flex-1 w-full">
                      
                      <div v-if="!schedule.isOpen" class="flex items-center gap-2 text-slate-400 text-sm italic bg-slate-100 px-3 py-2 rounded-md w-fit">
                        <AlertCircle class="w-4 h-4" /> Fechado / Sem expediente
                      </div>

                      <div v-else class="space-y-3">
                        <div 
                          v-for="(slot, slotIndex) in schedule.slots" 
                          :key="slotIndex"
                          class="flex items-center gap-3 animate-fade-in"
                        >
                          <div class="flex items-center gap-2 bg-white border border-slate-200 rounded-md px-3 py-1.5 shadow-sm">
                            <input 
                              type="time" 
                              v-model="slot.start"
                              class="border-none focus:ring-0 p-0 text-sm text-slate-700 font-medium w-[85px] bg-transparent"
                            >
                            <span class="text-slate-400 text-xs font-medium">até</span>
                            <input 
                              type="time" 
                              v-model="slot.end"
                              class="border-none focus:ring-0 p-0 text-sm text-slate-700 font-medium w-[85px] bg-transparent"
                            >
                          </div>
                          
                          <button 
                            @click="removeTimeSlot(dayIndex, slotIndex)"
                            class="text-slate-400 hover:text-red-600 p-2 rounded-md hover:bg-red-50 transition-colors"
                            title="Remover horário"
                          >
                            <Trash2 class="w-4 h-4" />
                          </button>
                        </div>

                        <button 
                          @click="addTimeSlot(dayIndex)"
                          class="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-50 transition-colors mt-2"
                        >
                          <Plus class="w-3 h-3" /> Adicionar Horário
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-6">
              <div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden sticky top-6">
                <div class="p-6 border-b border-slate-100 bg-slate-50/50">
                  <div class="flex items-center gap-2">
                    <Calendar class="w-5 h-5 text-rose-600" />
                    <h3 class="font-bold text-lg text-slate-900">Datas Bloqueadas</h3>
                  </div>
                  <p class="text-sm text-slate-500 mt-1">Feriados, conselhos de classe ou dias sem aula.</p>
                </div>

                <div class="p-6 space-y-4">
                  <div class="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div>
                      <label class="text-xs font-bold text-slate-500 uppercase">Data</label>
                      <input 
                        type="date" 
                        v-model="newException.date"
                        class="w-full mt-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                      >
                    </div>
                    <div>
                      <label class="text-xs font-bold text-slate-500 uppercase">Motivo</label>
                      <input 
                        type="text" 
                        v-model="newException.name"
                        placeholder="Ex: Conselho de Classe"
                        class="w-full mt-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                      >
                    </div>
                    <button 
                      @click="addException"
                      :disabled="!newException.date || !newException.name"
                      class="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-md text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus class="w-4 h-4" /> Adicionar Data
                    </button>
                  </div>

                  <div class="space-y-2">
                    <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Próximos Bloqueios</h4>
                    
                    <div v-if="exceptions.length === 0" class="text-sm text-slate-400 italic text-center py-4">
                      Nenhuma exceção cadastrada.
                    </div>

                    <div 
                      v-for="exception in exceptions" 
                      :key="exception.id"
                      class="flex items-center justify-between p-3 border border-slate-100 rounded-md hover:border-rose-200 transition-colors bg-white"
                    >
                      <div>
                        <p class="font-bold text-slate-800 text-sm">{{ exception.name }}</p>
                        <p class="text-xs text-slate-500">{{ new Date(exception.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) }}</p>
                      </div>
                      <button 
                        @click="removeException(exception.id)"
                        class="text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
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
