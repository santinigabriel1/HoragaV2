<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Building2, MapPin, Phone, MoreVertical, 
  Plus, Search, CheckCircle2, XCircle 
} from 'lucide-vue-next'
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'

const router = useRouter()
const sidebarOpen = ref(false)
const searchQuery = ref('')

// Dados Mockados das Instituições
const institutions = ref([
  { 
    id: 1, 
    name: 'Campus Central - Tatuí', 
    address: 'Rod. Mário Batista Mori, 971', 
    phone: '(15) 3251-4788',
    rooms: 12,
    status: 'active',
    manager: 'Carlos Eduardo'
  },
  { 
    id: 2, 
    name: 'Unidade Tecnológica', 
    address: 'Rua São Bento, 450 - Centro', 
    phone: '(15) 3259-1122',
    rooms: 8,
    status: 'active',
    manager: 'Ana Paula'
  },
  { 
    id: 3, 
    name: 'Anexo Laboratórios', 
    address: 'Av. das Nações, 102', 
    phone: '(15) 3305-8890',
    rooms: 5,
    status: 'maintenance',
    manager: 'Roberto Santos'
  }
])

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
        title="Instituições" 
        @toggle-sidebar="sidebarOpen = true" 
      />

      <main class="flex-1 overflow-y-auto p-4 md:p-8">
        <div class="max-w-7xl mx-auto">
          
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 class="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Instituições</h1>
              <p class="text-slate-500">Gerencie os campus e unidades da sua organização.</p>
            </div>
            <button class="flex items-center gap-2 bg-[#be123c] hover:bg-[#9f1239] text-white px-4 py-2.5 rounded-md font-bold transition-colors shadow-sm">
              <Plus class="w-5 h-5" />
              Nova Instituição
            </button>
          </div>

          <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-6 flex gap-4 items-center">
            <div class="relative flex-1">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                v-model="searchQuery"
                type="text" 
                placeholder="Buscar por nome ou endereço..." 
                class="w-full pl-10 pr-4 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
            </div>
            <div class="text-sm text-slate-500 font-medium hidden sm:block">
              {{ institutions.length }} unidades encontradas
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="inst in institutions" 
              :key="inst.id"
              class="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div class="p-5 border-b border-slate-100 flex justify-between items-start">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                    <Building2 class="w-6 h-6" />
                  </div>
                  <div>
                    <h3 class="font-bold text-slate-900">{{ inst.name }}</h3>
                    <span 
                      class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide mt-1"
                      :class="inst.status === 'active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'"
                    >
                      <component :is="inst.status === 'active' ? CheckCircle2 : XCircle" class="w-3 h-3" />
                      {{ inst.status === 'active' ? 'Ativa' : 'Manutenção' }}
                    </span>
                  </div>
                </div>
                <button class="text-slate-400 hover:text-slate-600 p-1">
                  <MoreVertical class="w-5 h-5" />
                </button>
              </div>

              <div class="p-5 space-y-3">
                <div class="flex items-start gap-3 text-sm text-slate-600">
                  <MapPin class="w-4 h-4 mt-0.5 text-slate-400" />
                  <span>{{ inst.address }}</span>
                </div>
                <div class="flex items-center gap-3 text-sm text-slate-600">
                  <Phone class="w-4 h-4 text-slate-400" />
                  <span>{{ inst.phone }}</span>
                </div>
              </div>

              <div class="px-5 py-3 bg-slate-50 border-t border-slate-100 rounded-b-lg flex justify-between items-center text-xs text-slate-500 font-medium">
                <span>{{ inst.rooms }} salas cadastradas</span>
                <span>Gestor: {{ inst.manager }}</span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  </div>
</template>