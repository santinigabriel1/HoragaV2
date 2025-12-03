<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Calendar, Percent, XCircle, Activity } from 'lucide-vue-next'
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'

const router = useRouter()
const sidebarOpen = ref(false)

// --- DADOS ---
const monthlyData = [
  { month: 'Jan', reservas: 40, cancelamentos: 5 },
  { month: 'Fev', reservas: 45, cancelamentos: 6 },
  { month: 'Mar', reservas: 52, cancelamentos: 4 },
  { month: 'Abr', reservas: 58, cancelamentos: 7 },
  { month: 'Mai', reservas: 65, cancelamentos: 5 },
  { month: 'Jun', reservas: 72, cancelamentos: 8 },
]

const roomUsage = [
  { name: 'Sala A', value: 28, color: '#c41e3a' },
  { name: 'Sala B', value: 22, color: '#d63c4d' },
  { name: 'Lab', value: 25, color: '#e85a61' },
  { name: 'Auditório', value: 25, color: '#f07676' },
]

// --- LÓGICA VISUAL ---

// Calcula o valor máximo para definir a escala (altura 100%)
const maxVal = Math.max(...monthlyData.map(d => Math.max(d.reservas, d.cancelamentos))) * 1.1

// Função simples para converter valor em % de altura
const getBarHeight = (val: number) => `${(val / maxVal) * 100}%`

// Gradiente Pizza (CSS Conic)
const pieGradient = computed(() => {
  let accumulated = 0
  const parts = roomUsage.map(item => {
    const start = accumulated
    accumulated += item.value
    return `${item.color} ${start}% ${accumulated}%`
  })
  return `conic-gradient(${parts.join(', ')})`
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
        title="Estatísticas" 
        @toggle-sidebar="sidebarOpen = true" 
      />

      <main class="flex-1 overflow-y-auto p-4 md:p-8">
        <div class="max-w-7xl mx-auto">
          
          <div class="mb-8">
            <h1 class="text-3xl md:text-2xl font-bold text-slate-900 mb-2">DASHBOARD</h1>
            <p class="text-slate-500">Análise detalhada de suas reservas e uso de salas</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div class="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <div class="flex items-center justify-between mb-2"><span class="text-sm font-medium text-slate-500">Total de Reservas</span><Calendar class="w-4 h-4 text-slate-400" /></div>
              <div class="text-3xl font-bold text-slate-900">354</div>
              <p class="text-xs text-slate-500 mt-1"><span class="text-green-600 font-bold">+12%</span> este mês</p>
            </div>
            <div class="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <div class="flex items-center justify-between mb-2"><span class="text-sm font-medium text-slate-500">Taxa de Ocupação</span><Percent class="w-4 h-4 text-slate-400" /></div>
              <div class="text-3xl font-bold text-slate-900">84%</div>
              <p class="text-xs text-slate-500 mt-1">Salas utilizadas</p>
            </div>
            <div class="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <div class="flex items-center justify-between mb-2"><span class="text-sm font-medium text-slate-500">Cancelamentos</span><XCircle class="w-4 h-4 text-slate-400" /></div>
              <div class="text-3xl font-bold text-slate-900">35</div>
              <p class="text-xs text-slate-500 mt-1"><span class="text-green-600 font-bold">-8%</span> este mês</p>
            </div>
            <div class="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <div class="flex items-center justify-between mb-2"><span class="text-sm font-medium text-slate-500">Média Diária</span><Activity class="w-4 h-4 text-slate-400" /></div>
              <div class="text-3xl font-bold text-slate-900">11.8</div>
              <p class="text-xs text-slate-500 mt-1">Reservas/dia</p>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            
            <div class="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <div class="mb-6">
                <h3 class="font-bold text-lg text-slate-900">Visão Mensal</h3>
                <p class="text-sm text-slate-500">Volume total de atividade</p>
              </div>
              <div class="h-[250px] flex items-end justify-between gap-2 px-2 border-b border-slate-100">
                <div v-for="data in monthlyData" :key="data.month" class="flex flex-col items-center flex-1 h-full justify-end group">
                  <div class="w-full max-w-[40px] bg-rose-50 rounded-t-md relative h-full flex items-end justify-center overflow-hidden">
                    <div 
                      class="w-full bg-[#c41e3a] transition-all duration-500 hover:opacity-90" 
                      :style="{ height: getBarHeight(data.reservas) }"
                    ></div>
                  </div>
                  <span class="text-xs text-slate-500 mt-3 font-medium">{{ data.month }}</span>
                </div>
              </div>
            </div>

            <div class="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col">
              <div class="mb-6">
                <h3 class="font-bold text-lg text-slate-900">Uso por Sala</h3>
                <p class="text-sm text-slate-500">Distribuição de reservas</p>
              </div>
              <div class="flex-1 flex items-center justify-center relative">
                <div class="w-48 h-48 rounded-full relative transition-transform hover:scale-105 duration-500" :style="{ background: pieGradient }"></div>
              </div>
              <div class="grid grid-cols-2 gap-3 mt-6">
                <div v-for="room in roomUsage" :key="room.name" class="flex items-center gap-2 text-sm">
                  <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: room.color }"></div>
                  <span class="text-slate-600">{{ room.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <div class="mb-8 flex justify-between items-start">
              <div>
                <h3 class="font-bold text-lg text-slate-900">Comparativo de Ocupação</h3>
                <p class="text-sm text-slate-500">Reservas efetivas vs. Cancelamentos</p>
              </div>
              <div class="flex gap-4">
                 <div class="flex items-center gap-2 text-xs text-slate-600"><div class="w-3 h-3 rounded-sm bg-[#c41e3a]"></div> Reservas</div>
                 <div class="flex items-center gap-2 text-xs text-slate-600"><div class="w-3 h-3 rounded-sm bg-[#f07676]"></div> Cancelamentos</div>
              </div>
            </div>

            <div class="h-[300px] w-full relative">
              <div class="absolute inset-0 flex flex-col justify-between pointer-events-none">
                <div class="w-full border-t border-dashed border-slate-200"></div>
                <div class="w-full border-t border-dashed border-slate-200"></div>
                <div class="w-full border-t border-dashed border-slate-200"></div>
                <div class="w-full border-t border-dashed border-slate-200"></div>
                <div class="w-full border-t border-slate-200"></div> </div>

              <div class="absolute inset-0 flex items-end justify-between px-4">
                <div 
                  v-for="(data, index) in monthlyData" 
                  :key="index" 
                  class="flex flex-col items-center justify-end h-full flex-1 gap-2 group"
                >
                  <div class="flex items-end gap-1 sm:gap-2 h-full w-full justify-center">
                    
                    <div class="relative flex flex-col justify-end h-full w-4 sm:w-8">
                      <div 
                        class="w-full bg-[#f07676] rounded-t-sm transition-all duration-500 group-hover:opacity-80"
                        :style="{ height: getBarHeight(data.cancelamentos) }"
                      ></div>
                      <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {{ data.cancelamentos }}
                      </div>
                    </div>

                    <div class="relative flex flex-col justify-end h-full w-4 sm:w-8">
                      <div 
                        class="w-full bg-[#c41e3a] rounded-t-sm transition-all duration-500 group-hover:opacity-80"
                        :style="{ height: getBarHeight(data.reservas) }"
                      ></div>
                      <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {{ data.reservas }}
                      </div>
                    </div>

                  </div>
                  
                  <span class="text-xs font-bold text-slate-500 mt-3 uppercase tracking-wider">{{ data.month }}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  </div>
</template>