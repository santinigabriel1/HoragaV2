<script setup lang="ts">
import { Menu, Bell } from 'lucide-vue-next'

defineProps<{
  title?: string
}>()

defineEmits(['toggleSidebar'])
</script>

<template>
  <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 z-30 flex-shrink-0">
    <div class="flex items-center gap-4">
      <button @click="$emit('toggleSidebar')" class="md:hidden text-slate-600 hover:bg-slate-100 p-2 rounded-md">
        <Menu class="w-6 h-6" />
      </button>
      <h2 class="text-lg font-semibold text-slate-800">{{ title || 'Bem vindo, Gabriel' }}</h2>
    </div>
    
    <div class="flex items-center gap-4">
      <button class="text-slate-500 hover:bg-slate-100 p-2 rounded-full relative">
        <Bell class="w-5 h-5" />
        <span class="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full"></span>
      </button>
      <div class="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-800 font-bold text-sm border border-rose-200">
        GS
      </div>
    </div>
  </header>
</template>