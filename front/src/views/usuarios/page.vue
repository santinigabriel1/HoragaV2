<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Users, Building2, Search, Check, X, ShieldAlert, 
  UserCheck, UserX, Trash2, Loader2, AlertCircle, Ban 
} from 'lucide-vue-next'
import Sidebar from '@/components/layout/Sidebar.vue'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'

const router = useRouter()
const authStore = useAuthStore()
const notification = useNotificationStore()

const sidebarOpen = ref(false)
const isLoading = ref(false)
const institutions = ref<any[]>([])
const selectedInstId = ref<string | number>('')

// Abas: 'active' | 'pending' | 'blocked'
const currentTab = ref('active')

// --- DADOS MOCKADOS (Simulando API) ---
// Na implementação real, isso viria de api.get(`/usuarios-instituicao/${id}`)
const MOCK_USERS = [
  { id: 1, nome: 'Gustavo Gomes', email: 'gustavo@email.com', cargo: 'Aluno', aceito: 1, bloqueado: 0 },
  { id: 2, nome: 'Gabriel Ferreira', email: 'gabriel@email.com', cargo: 'Professor', aceito: 1, bloqueado: 0 },
  { id: 3, nome: 'Bruno da Silveira', email: 'bruno@email.com', cargo: 'Aluno', aceito: 0, bloqueado: 0 }, // Pendente
  { id: 4, nome: 'Yuri Peruzzo', email: 'yuri@email.com', cargo: 'Aluno', aceito: 0, bloqueado: 0 },    // Pendente
  { id: 5, nome: 'Leonardo Bellotti', email: 'leo@email.com', cargo: 'Aluno', aceito: 1, bloqueado: 1 }, // Bloqueado
]

const users = ref<any[]>([])

// --- COMPUTEDS (Filtros por Aba) ---
const pendingUsers = computed(() => users.value.filter(u => u.aceito === 0 && u.bloqueado === 0))
const activeUsers = computed(() => users.value.filter(u => u.aceito === 1 && u.bloqueado === 0))
const blockedUsers = computed(() => users.value.filter(u => u.bloqueado === 1))

// --- FETCH INSTITUIÇÕES ---
const fetchInstitutions = async () => {
  try {
    const { data } = await api.get('/instituicoes')
    if (data.success && authStore.user) {
      const userId = Number(authStore.user.id)
      institutions.value = data.data.filter((i: any) => Number(i.organizador) === userId)
      
      // Seleciona a primeira automaticamente
      if (institutions.value.length > 0) {
        selectedInstId.value = institutions.value[0].id
      }
    }
  } catch (e) { console.error(e) }
}

// --- FETCH USUÁRIOS (Mockado por enquanto) ---
const fetchUsers = async () => {
  if (!selectedInstId.value) return
  isLoading.value = true
  
  try {
    // Simulação de delay da API
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Aqui viria: const { data } = await api.get(`/usuarios-instituicao/${selectedInstId.value}`)
    // users.value = data.data
    
    // Usando Mock clone para resetar estado ao trocar
    users.value = JSON.parse(JSON.stringify(MOCK_USERS))
    
  } catch (e) {
    console.error(e)
    notification.showError('Erro ao carregar usuários.')
  } finally {
    isLoading.value = false
  }
}

// --- AÇÕES ---
const approveUser = (id: number) => {
  // api.patch(...)
  const user = users.value.find(u => u.id === id)
  if (user) {
    user.aceito = 1
    notification.showSuccess('Usuário aprovado!')
  }
}

const rejectUser = (id: number) => {
  // api.delete(...) ou rejeitar
  users.value = users.value.filter(u => u.id !== id)
  notification.showSuccess('Solicitação recusada.')
}

const blockUser = (id: number) => {
  // api.patch(..., { bloqueado: 1 })
  const user = users.value.find(u => u.id === id)
  if (user) {
    user.bloqueado = 1
    notification.showSuccess('Acesso revogado (Bloqueado).')
  }
}

const unblockUser = (id: number) => {
  // api.patch(..., { bloqueado: 0 })
  const user = users.value.find(u => u.id === id)
  if (user) {
    user.bloqueado = 0
    // Volta para ativo se já foi aceito, ou pendente se não
    notification.showSuccess('Acesso restaurado.')
  }
}

watch(selectedInstId, fetchUsers)
onMounted(fetchInstitutions)

const handleLogout = () => router.push('/login')
</script>

<template>
  <div class="flex h-screen bg-slate-50">
    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" @logout="handleLogout" />

    <div class="flex-1 flex flex-col overflow-hidden">
      <Header title="Gestão de Usuários" @toggle-sidebar="sidebarOpen = true" />

      <main class="flex-1 overflow-y-auto p-4 md:p-8">
        <div class="max-w-6xl mx-auto">
          
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-slate-900 mb-2">Usuários</h1>
            <p class="text-slate-500">Gerencie quem tem acesso à sua instituição.</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row items-center gap-4">
            <div class="bg-rose-50 p-2 rounded-md text-rose-600"><Building2 class="w-6 h-6" /></div>
            <div class="flex-1 w-full">
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Instituição Selecionada</label>
              <select 
                v-model="selectedInstId" 
                class="w-full sm:w-1/2 border border-slate-300 rounded-md px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="" disabled>Selecione...</option>
                <option v-for="inst in institutions" :key="inst.id" :value="inst.id">{{ inst.nome }}</option>
              </select>
            </div>
          </div>

          <div v-if="isLoading" class="flex justify-center py-12">
            <Loader2 class="w-10 h-10 animate-spin text-rose-600" />
          </div>

          <div v-else-if="selectedInstId">
            
            <div class="flex border-b border-slate-200 mb-6">
              <button 
                @click="currentTab = 'active'"
                class="px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2"
                :class="currentTab === 'active' ? 'border-rose-600 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-700'"
              >
                <UserCheck class="w-4 h-4" /> Ativos
                <span class="bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full text-xs" v-if="activeUsers.length">{{ activeUsers.length }}</span>
              </button>
              
              <button 
                @click="currentTab = 'pending'"
                class="px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2"
                :class="currentTab === 'pending' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'"
              >
                <AlertCircle class="w-4 h-4" /> Pendentes
                <span class="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full text-xs" v-if="pendingUsers.length">{{ pendingUsers.length }}</span>
              </button>

              <button 
                @click="currentTab = 'blocked'"
                class="px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2"
                :class="currentTab === 'blocked' ? 'border-slate-500 text-slate-600' : 'border-transparent text-slate-500 hover:text-slate-700'"
              >
                <Ban class="w-4 h-4" /> Bloqueados
                <span class="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full text-xs" v-if="blockedUsers.length">{{ blockedUsers.length }}</span>
              </button>
            </div>

            <div class="space-y-3">
              
              <div v-if="currentTab === 'active'">
                <div v-if="activeUsers.length === 0" class="text-center py-10 text-slate-400 italic">Nenhum usuário ativo.</div>
                <div v-for="user in activeUsers" :key="user.id" class="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-rose-200 transition-colors">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold">{{ user.nome.substring(0,2).toUpperCase() }}</div>
                    <div>
                      <p class="font-bold text-slate-800">{{ user.nome }}</p>
                      <p class="text-xs text-slate-500">{{ user.email }} • <span class="uppercase font-bold text-[10px] bg-slate-100 px-1 rounded">{{ user.cargo }}</span></p>
                    </div>
                  </div>
                  <button @click="blockUser(user.id)" class="text-slate-400 hover:text-red-600 p-2 rounded-md hover:bg-red-50 text-xs font-bold flex items-center gap-1 transition-colors" title="Revogar Acesso">
                    <UserX class="w-4 h-4" /> Bloquear
                  </button>
                </div>
              </div>

              <div v-if="currentTab === 'pending'">
                <div v-if="pendingUsers.length === 0" class="text-center py-10 text-slate-400 italic">Nenhuma solicitação pendente.</div>
                <div v-for="user in pendingUsers" :key="user.id" class="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg shadow-sm">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-full bg-white text-amber-600 flex items-center justify-center font-bold shadow-sm">{{ user.nome.substring(0,2).toUpperCase() }}</div>
                    <div>
                      <p class="font-bold text-slate-800">{{ user.nome }}</p>
                      <p class="text-xs text-slate-600">{{ user.email }} • <span class="font-bold text-amber-700 text-[10px] uppercase">Solicitação</span></p>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button @click="approveUser(user.id)" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 shadow-sm transition-colors">
                      <Check class="w-3 h-3" /> Aceitar
                    </button>
                    <button @click="rejectUser(user.id)" class="bg-white hover:bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-colors">
                      <X class="w-3 h-3" /> Recusar
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="currentTab === 'blocked'">
                <div v-if="blockedUsers.length === 0" class="text-center py-10 text-slate-400 italic">Nenhum usuário bloqueado.</div>
                <div v-for="user in blockedUsers" :key="user.id" class="flex items-center justify-between p-4 bg-slate-100 border border-slate-200 rounded-lg opacity-75 hover:opacity-100 transition-opacity">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold">{{ user.nome.substring(0,2).toUpperCase() }}</div>
                    <div>
                      <p class="font-bold text-slate-600 line-through decoration-slate-400">{{ user.nome }}</p>
                      <p class="text-xs text-slate-500">{{ user.email }} • <span class="font-bold text-red-500 text-[10px] uppercase">Bloqueado</span></p>
                    </div>
                  </div>
                  <button @click="unblockUser(user.id)" class="text-slate-500 hover:text-green-600 p-2 rounded-md hover:bg-green-50 text-xs font-bold flex items-center gap-1 transition-colors">
                    <ShieldAlert class="w-4 h-4" /> Restaurar Acesso
                  </button>
                </div>
              </div>

            </div>

          </div>
          <div v-else class="text-center py-20 bg-white rounded-lg border border-dashed border-slate-300">
            <p class="text-slate-500">Selecione uma instituição acima para gerenciar os usuários.</p>
          </div>

        </div>
      </main>
    </div>
  </div>
</template>