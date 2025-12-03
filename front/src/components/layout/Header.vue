<script setup lang="ts">
import { Menu } from 'lucide-vue-next'

// Aceita um título opcional (ex: "Agendamento", "Salas")
defineProps<{ 
  title?: string 
}>()

// Emite o evento para abrir a sidebar
defineEmits(['toggleSidebar'])
</script>

<template>
  <header class="md:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200 shrink-0 z-20">
    
    <div class="flex items-center gap-3">
      <button 
        @click="$emit('toggleSidebar')" 
        class="p-2 text-slate-600 hover:bg-slate-100 hover:text-rose-600 rounded-md transition-colors"
      >
        <Menu class="w-6 h-6" />
      </button>
    </div>

  </header>
</template>