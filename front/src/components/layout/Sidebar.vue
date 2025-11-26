<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { Home, Calendar, Clock, BarChart3, Building2, LogOut, X, DoorOpen } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits(['close', 'logout'])
const route = useRoute()

// Verifica se a rota atual começa com o path do link (para manter ativo nas sub-rotas)
const isActive = (path: string) => route.path.startsWith(path)

const menuItems = [
  { label: 'Agendamento', icon: Home, path: '/agendamento' },
  { label: 'Salas', icon: DoorOpen, path: '/salas' }, // <--- NOVO ITEM
  { label: 'Calendário', icon: Calendar, path: '/calendario' },
  { label: 'Disponibilidade', icon: Clock, path: '/disponibilidade' },
  { label: 'Estatísticas', icon: BarChart3, path: '/estatisticas' },
  { label: 'Instituições', icon: Building2, path: '/instituicoes' },
]
</script>

<template>
  <aside class="hidden md:flex md:w-64 flex-col bg-white border-r border-slate-200 h-full">
    <div class="p-6 border-b border-slate-100">
      <h1 class="text-2xl font-bold text-rose-800 tracking-tight">HORAGA</h1>
    </div>
    
    <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
      <RouterLink 
        v-for="item in menuItems" 
        :key="item.label" 
        :to="item.path"
        class="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors"
        :class="isActive(item.path) ? 'bg-[#be123c] text-white shadow-sm' : 'text-slate-600 hover:bg-rose-50 hover:text-rose-900'"
      >
        <component :is="item.icon" class="w-5 h-5" />
        {{ item.label }}
      </RouterLink>
    </nav>

    <div class="p-4 border-t border-slate-100">
      <button 
        @click="$emit('logout')"
        class="flex items-center gap-3 px-4 py-3 w-full rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
      >
        <LogOut class="w-5 h-5" />
        Sair
      </button>
    </div>
  </aside>

  <div v-if="isOpen" class="fixed inset-0 z-40 bg-black/50 md:hidden" @click="$emit('close')"></div>
  <aside 
    v-if="isOpen" 
    class="fixed left-0 top-0 z-50 h-full w-64 bg-white shadow-2xl flex flex-col md:hidden transition-transform"
  >
    <div class="p-6 border-b border-slate-100 flex justify-between items-center">
      <h1 class="text-2xl font-bold text-rose-800">HORAGA</h1>
      <button @click="$emit('close')" class="text-slate-500"><X class="w-6 h-6" /></button>
    </div>
    <nav class="flex-1 p-4 space-y-1">
      <RouterLink 
        v-for="item in menuItems" 
        :key="item.label" 
        :to="item.path"
        @click="$emit('close')"
        class="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors"
        :class="isActive(item.path) ? 'bg-[#be123c] text-white' : 'text-slate-600 hover:bg-rose-50'"
      >
        <component :is="item.icon" class="w-5 h-5" />
        {{ item.label }}
      </RouterLink>
    </nav>
  </aside>
</template>