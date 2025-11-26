<script setup lang="ts">
import { X } from 'lucide-vue-next'

defineProps<{
  isOpen: boolean
  title: string
}>()

const emit = defineEmits(['close'])
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
      
      <div class="flex justify-between items-center p-4 border-b border-slate-100">
        <h3 class="font-bold text-lg text-slate-900">{{ title }}</h3>
        <button @click="emit('close')" class="text-slate-400 hover:text-slate-600">
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="p-6">
        <slot></slot>
      </div>

    </div>
  </div>
</template>