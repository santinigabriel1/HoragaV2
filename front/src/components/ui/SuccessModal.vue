<script setup lang="ts">
import { useNotificationStore } from '@/stores/notification'
import { Check, X } from 'lucide-vue-next'

const store = useNotificationStore()
</script>

<template>
  <Transition name="fade">
    <div v-if="store.isVisible" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center transform transition-all animate-bounce-in relative overflow-hidden">
        
        <div class="absolute top-0 left-0 w-full h-2" :class="store.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'"></div>

        <div class="mb-6 flex justify-center">
          <div v-if="store.type === 'success'" class="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center relative">
            <svg class="w-12 h-12 text-emerald-500 check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
            </svg>
            <div class="absolute inset-0 rounded-full border-4 border-emerald-100 animate-ping-slow"></div>
          </div>

          <div v-else class="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
            <X class="w-10 h-10 text-red-500" />
          </div>
        </div>

        <h3 class="text-xl font-bold text-slate-900 mb-2">
          {{ store.type === 'success' ? 'Sucesso!' : 'Atenção' }}
        </h3>
        <p class="text-slate-600 mb-8 leading-relaxed">
          {{ store.message }}
        </p>

        <button 
          @click="store.close()" 
          class="w-full py-3 px-6 rounded-xl font-bold text-white transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg"
          :class="store.type === 'success' 
            ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200' 
            : 'bg-red-500 hover:bg-red-600 shadow-red-200'"
        >
          {{ store.type === 'success' ? 'Continuar' : 'Fechar' }}
        </button>

      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Animação de Entrada do Modal */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.animate-bounce-in {
  animation: bounce-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes bounce-in {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* Animação do Check (Desenho) */
.check-icon path {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: draw 0.6s ease-out forwards 0.2s;
}

@keyframes draw {
  to { stroke-dashoffset: 0; }
}

/* Animação do Círculo pulsando */
.animate-ping-slow {
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}
</style>