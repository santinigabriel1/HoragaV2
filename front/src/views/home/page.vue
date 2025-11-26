<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Clock, Users, BarChart3, Building2, Menu, X } from 'lucide-vue-next'

// Hooks
const router = useRouter()
const menuOpen = ref(false)

// Funções de navegação
const navigateTo = (path: string) => {
  router.push(path)
  menuOpen.value = false
}
</script>

<template>
  <main class="min-h-screen bg-rose-50/50">
    
    <nav class="bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          
          <div class="text-2xl font-bold text-rose-800 cursor-pointer tracking-tight" @click="navigateTo('/')">
            <span>HORAGA</span>
          </div>

          <div class="hidden sm:flex gap-3">
            <button 
              @click="navigateTo('/login')"
              class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-rose-100 hover:text-rose-900 h-10 px-4 py-2 text-slate-700"
            >
              Entrar
            </button>
            <button 
              @click="navigateTo('/register')"
              class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#be123c] text-white hover:bg-[#9f1239] h-10 px-6 py-2 shadow-sm"
            >
              Cadastro
            </button>
          </div>

          <button
            class="sm:hidden inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-rose-100 h-9 rounded-md px-3 text-rose-900"
            @click="menuOpen = !menuOpen"
          >
            <X v-if="menuOpen" class="w-5 h-5" />
            <Menu v-else class="w-5 h-5" />
          </button>
        </div>

        <div v-if="menuOpen" class="sm:hidden mt-4 pb-4 flex flex-col gap-2 border-t border-rose-100 pt-4">
          <button 
            class="w-full justify-start inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-rose-50 h-10 px-4 py-2 text-slate-700"
            @click="navigateTo('/login')"
          >
            Entrar
          </button>
          <button 
            class="w-full justify-start inline-flex items-center whitespace-nowrap rounded-md text-sm font-bold transition-colors bg-[#be123c] text-white hover:bg-[#9f1239] h-10 px-4 py-2"
            @click="navigateTo('/register')"
          >
            Cadastro
          </button>
        </div>
      </div>
    </nav>

    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24">
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        
        <div>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-balance leading-[1.1] mb-6 text-slate-900">
            Agendamento de Salas 
            <span class="text-[#be123c]">Simplificado</span>
          </h1>
          <p class="text-lg sm:text-xl text-slate-600 mb-10 text-pretty leading-relaxed">
            Reserve salas e gerencie sua disponibilidade de forma intuitiva. Horaga torna o agendamento educacional mais fácil e eficiente.
          </p>
          <div class="flex flex-col sm:flex-row gap-4">
            <button 
              @click="navigateTo('/register')" 
              class="w-full sm:w-auto inline-flex items-center justify-center whitespace-nowrap rounded-md text-base font-bold transition-colors bg-[#be123c] text-white hover:bg-[#9f1239] h-12 px-8 shadow-md"
            >
              Começar Agora
            </button>
            <button 
              class="w-full sm:w-auto inline-flex items-center justify-center whitespace-nowrap rounded-md text-base font-medium transition-colors border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 h-12 px-8 shadow-sm"
            >
              Saiba Mais
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div class="rounded-xl border-none bg-white text-slate-950 shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <div class="flex flex-col space-y-3 pb-3">
              <Clock class="w-8 h-8 text-[#be123c]" />
              <h3 class="text-lg font-bold leading-none tracking-tight">Agendamento</h3>
            </div>
            <div class="text-sm text-slate-500 font-medium">
              Reserve salas com poucos cliques
            </div>
          </div>

          <div class="rounded-xl border-none bg-white text-slate-950 shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <div class="flex flex-col space-y-3 pb-3">
              <Users class="w-8 h-8 text-[#be123c]" />
              <h3 class="text-lg font-bold leading-none tracking-tight">Multiusuário</h3>
            </div>
            <div class="text-sm text-slate-500 font-medium">
              Colabore com sua equipe facilmente
            </div>
          </div>

          <div class="rounded-xl border-none bg-white text-slate-950 shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <div class="flex flex-col space-y-3 pb-3">
              <BarChart3 class="w-8 h-8 text-[#be123c]" />
              <h3 class="text-lg font-bold leading-none tracking-tight">Análise</h3>
            </div>
            <div class="text-sm text-slate-500 font-medium">
              Estatísticas detalhadas
            </div>
          </div>

          <div class="rounded-xl border-none bg-white text-slate-950 shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <div class="flex flex-col space-y-3 pb-3">
              <Building2 class="w-8 h-8 text-[#be123c]" />
              <h3 class="text-lg font-bold leading-none tracking-tight">Instituições</h3>
            </div>
            <div class="text-sm text-slate-500 font-medium">
              Gerencie múltiplas filiais
            </div>
          </div>

        </div>
      </div>
    </section>
  </main>
</template>