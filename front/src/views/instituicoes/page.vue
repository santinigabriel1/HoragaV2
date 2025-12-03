<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Building2, MapPin, Plus, CheckCircle2, 
  User, Pencil, Trash2, Loader2, AlertTriangle, 
  Users, Check, X, ShieldAlert 
} from 'lucide-vue-next'
import Sidebar from '@/components/layout/Sidebar.vue'
import Modal from '@/components/ui/Modal.vue'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'

const router = useRouter()
const authStore = useAuthStore()
const notification = useNotificationStore()

const sidebarOpen = ref(false)
const isLoading = ref(true)
const isSaving = ref(false)
const isDeleting = ref(false)
const institutions = ref<any[]>([]) 

// --- ESTADOS DOS MODAIS ---
const showModal = ref(false) // Criar/Editar
const showDeleteModal = ref(false) // Excluir
const showManageModal = ref(false) // <--- NOVO: Gerenciar Usuários

const isEditing = ref(false)
const itemToDelete = ref<number | null>(null)
const selectedInstitution = ref<any>(null) // Instituição sendo gerenciada

// Lista de usuários da instituição selecionada (Mock para exemplo)
const institutionUsers = ref<any[]>([])
const isLoadingUsers = ref(false)

const formData = reactive({
  id: null as number | null,
  nome: '',
  descricao: ''
})

// --- BUSCA INICIAL ---
const fetchInstitutions = async () => {
  isLoading.value = true
  try {
    const { data } = await api.get('/instituicoes')
    
    if (data.success && authStore.user) {
      const userId = Number(authStore.user.id)
      
      const myInstitutions = data.data.filter((inst: any) => Number(inst.organizador) === userId)

      institutions.value = myInstitutions.map((inst: any) => ({
        id: inst.id,
        name: inst.nome,
        description: inst.descricao,
        managerId: inst.organizador,
        managerName: authStore.user?.nome || 'Eu', 
        status: 'active',
        // Simulando contagem de pendências (no futuro virá do backend: inst.pending_requests)
        pendingCount: Math.random() > 0.5 ? Math.floor(Math.random() * 5) : 0 
      }))
    }
  } catch (error) {
    console.error('Erro ao buscar:', error)
  } finally {
    isLoading.value = false
  }
}

// --- GESTÃO DE USUÁRIOS (NOVO) ---
const openManageModal = async (inst: any) => {
  selectedInstitution.value = inst
  showManageModal.value = true
  isLoadingUsers.value = true
  institutionUsers.value = []

  try {
    // AQUI: No futuro, chamar api.get(`/instituicao/${inst.id}/usuarios`)
    // Simulando resposta da API com base na sua imagem de referência
    await new Promise(resolve => setTimeout(resolve, 600)) // Fake delay
    
    institutionUsers.value = [
      { id: 1, nome: 'Gustavo Gomes', email: 'gustavo@email.com', status: 'approved', avatar: '' },
      { id: 2, nome: 'Gabriel Ferreira', email: 'gabriel@email.com', status: 'approved', avatar: '' },
      { id: 3, nome: 'Bruno da Silveira', email: 'bruno@email.com', status: 'pending', avatar: '' }, // Pendente
      { id: 4, nome: 'Yuri Peruzzo', email: 'yuri@email.com', status: 'pending', avatar: '' },    // Pendente
    ]
  } catch (error) {
    notification.showError('Erro ao carregar usuários.')
  } finally {
    isLoadingUsers.value = false
  }
}

const approveUser = async (userId: number) => {
  // Chamada API: api.patch(`/instituicao/vinculo/${userId}`, { status: 'approved' })
  const user = institutionUsers.value.find(u => u.id === userId)
  if (user) {
    user.status = 'approved'
    notification.showSuccess(`Acesso liberado para ${user.nome}`)
    // Atualiza contador visualmente no card
    if (selectedInstitution.value && selectedInstitution.value.pendingCount > 0) {
      selectedInstitution.value.pendingCount--
    }
  }
}

const rejectUser = async (userId: number) => {
  // Chamada API: api.delete(`/instituicao/vinculo/${userId}`)
  institutionUsers.value = institutionUsers.value.filter(u => u.id !== userId)
  notification.showSuccess('Solicitação rejeitada/removida.')
   if (selectedInstitution.value && selectedInstitution.value.pendingCount > 0) {
      selectedInstitution.value.pendingCount--
    }
}

// --- CRUD PADRÃO (MANTIDO) ---
const openCreateModal = () => {
  isEditing.value = false; formData.id = null; formData.nome = ''; formData.descricao = ''
  showModal.value = true
}

const openEditModal = (inst: any, event: Event) => {
  event.stopPropagation() // Evita abrir o modal de gestão ao clicar no edit
  isEditing.value = true; formData.id = inst.id; formData.nome = inst.name; formData.descricao = inst.description
  showModal.value = true
}

const handleSave = async () => {
  isSaving.value = true
  try {
    const payload = { nome: formData.nome, descricao: formData.descricao, organizador: authStore.user?.id }
    if (isEditing.value && formData.id) {
      await api.patch(`/instituicao/${formData.id}`, payload)
      const index = institutions.value.findIndex(i => i.id === formData.id)
      if (index !== -1) {
        institutions.value[index].name = formData.nome
        institutions.value[index].description = formData.descricao
      }
      notification.showSuccess('Atualizado!')
    } else {
      const { data } = await api.post('/instituicao', payload)
      institutions.value.push({
        id: data.data.id, name: formData.nome, description: formData.descricao,
        managerId: authStore.user?.id, managerName: authStore.user?.nome, status: 'active', pendingCount: 0
      })
      notification.showSuccess('Criado!')
    }
    showModal.value = false
  } catch (error: any) {
    notification.showError('Erro: ' + (error.response?.data?.message || error.message))
  } finally {
    isSaving.value = false
  }
}

const confirmDelete = (id: number, event: Event) => {
  event.stopPropagation() // Evita abrir o modal de gestão
  itemToDelete.value = id; showDeleteModal.value = true
}

const executeDelete = async () => {
  if (!itemToDelete.value) return; isDeleting.value = true
  try {
    await api.delete(`/instituicao/${itemToDelete.value}`)
    institutions.value = institutions.value.filter(i => i.id !== itemToDelete.value)
    showDeleteModal.value = false
    notification.showSuccess('Removido.')
  } catch (error: any) {
    showDeleteModal.value = false
    notification.showError('Erro ao excluir: ' + error.message)
  } finally {
    isDeleting.value = false
  }
}

const handleLogout = () => router.push('/login')
onMounted(() => fetchInstitutions())
</script>

<template>
  <div class="flex h-screen bg-slate-50">
    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" @logout="handleLogout" />

    <div class="flex-1 flex flex-col overflow-hidden">
      <Header title="Minhas Instituições" @toggle-sidebar="sidebarOpen = true" />

      <main class="flex-1 overflow-y-auto p-4 md:p-8">
        <div class="max-w-7xl mx-auto">
          
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 class="text-3xl md:text-2xl font-bold text-slate-900 mb-2">INSTITUIÇÕES</h1>
              <p class="text-slate-500">Gerencie suas unidades e aprove novos membros.</p>
            </div>
            <button @click="openCreateModal" class="flex items-center gap-2 bg-[#be123c] hover:bg-[#9f1239] text-white px-4 py-2.5 rounded-md font-bold transition-colors shadow-sm">
              <Plus class="w-5 h-5" /> Nova Instituição
            </button>
          </div>

          <div v-if="isLoading" class="flex justify-center py-12">
            <Loader2 class="w-10 h-10 animate-spin text-rose-600" />
          </div>

          <div v-else-if="institutions.length === 0" class="text-center py-12 bg-white rounded-lg border border-dashed border-slate-300">
            <Building2 class="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p class="text-slate-500 font-medium">Você ainda não tem instituições.</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="inst in institutions" 
              :key="inst.id" 
              @click="openManageModal(inst)"
              class="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-rose-200 transition-all cursor-pointer group flex flex-col relative overflow-hidden"
            >
              <div v-if="inst.pendingCount > 0" class="absolute top-3 right-3 flex items-center gap-1 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full border border-red-200 z-10 animate-pulse">
                <AlertTriangle class="w-3 h-3" />
                {{ inst.pendingCount }} Pendentes
              </div>

              <div class="p-5 border-b border-slate-100 flex justify-between items-start">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                    <Building2 class="w-6 h-6" />
                  </div>
                  <div>
                    <h3 class="font-bold text-slate-900 leading-tight line-clamp-1 text-lg group-hover:text-rose-700 transition-colors">{{ inst.name }}</h3>
                    <span class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide mt-1 bg-green-50 text-green-700 border border-green-200">
                      <CheckCircle2 class="w-3 h-3" /> Ativa
                    </span>
                  </div>
                </div>
              </div>

              <div class="p-5 flex-1">
                <div class="flex items-start gap-3 text-sm text-slate-600">
                  <MapPin class="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                  <span class="line-clamp-2">{{ inst.description || 'Sem descrição.' }}</span>
                </div>
              </div>

              <div class="px-5 py-3 bg-slate-50 border-t border-slate-100 rounded-b-lg flex justify-between items-center text-xs text-slate-500 font-medium">
                <div class="flex gap-1">
                  <button @click="openEditModal(inst, $event)" class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Editar">
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button @click="confirmDelete(inst.id, $event)" class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Excluir">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
                <div class="flex items-center gap-1 text-rose-600 font-bold group-hover:translate-x-1 transition-transform">
                  Gerenciar <Users class="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Modal :is-open="showModal" :title="isEditing ? 'Editar' : 'Nova Instituição'" @close="showModal = false">
        <form @submit.prevent="handleSave" class="space-y-5">
          <div class="space-y-1.5">
            <label class="block text-sm font-semibold text-slate-700">Nome <span class="text-red-500">*</span></label>
            <input v-model="formData.nome" type="text" required class="w-full h-10 px-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all" placeholder="Ex: Campus Central" />
          </div>
          <div class="space-y-1.5">
            <label class="block text-sm font-semibold text-slate-700">Descrição</label>
            <textarea v-model="formData.descricao" rows="3" class="w-full p-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none" placeholder="Endereço ou detalhes..."></textarea>
          </div>
          <div class="flex gap-3 pt-2">
            <button type="button" @click="showModal = false" class="flex-1 h-10 rounded-md border border-slate-300 font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancelar</button>
            <button type="submit" :disabled="isSaving || !formData.nome" class="flex-1 h-10 rounded-md bg-[#be123c] text-white font-bold hover:bg-[#9f1239] disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm">
              <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
              <span v-else>{{ isEditing ? 'Salvar' : 'Criar' }}</span>
            </button>
          </div>
        </form>
      </Modal>

      <Modal :is-open="showManageModal" title="Gestão de Membros" @close="showManageModal = false">
        <div class="space-y-6">
          <div class="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
             <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-rose-600 shadow-sm border border-slate-100 font-bold">
               {{ selectedInstitution?.name.substring(0,2).toUpperCase() }}
             </div>
             <div>
               <h4 class="font-bold text-slate-900">{{ selectedInstitution?.name }}</h4>
               <p class="text-xs text-slate-500">Gerencie quem tem acesso a esta unidade.</p>
             </div>
          </div>

          <div v-if="isLoadingUsers" class="py-10 flex justify-center">
            <Loader2 class="w-8 h-8 animate-spin text-rose-600" />
          </div>

          <div v-else class="space-y-6">
            
            <div v-if="institutionUsers.some(u => u.status === 'pending')">
              <h5 class="text-sm font-bold text-amber-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                <AlertTriangle class="w-4 h-4" /> Solicitações Pendentes
              </h5>
              <div class="space-y-2">
                <div v-for="user in institutionUsers.filter(u => u.status === 'pending')" :key="user.id" class="flex items-center justify-between p-3 rounded-md border border-amber-200 bg-amber-50">
                   <div class="flex items-center gap-3">
                     <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center text-amber-600 font-bold text-xs shadow-sm">
                       {{ user.nome.substring(0,2).toUpperCase() }}
                     </div>
                     <div>
                       <p class="text-sm font-bold text-slate-800">{{ user.nome }}</p>
                       <p class="text-xs text-slate-500">{{ user.email }}</p>
                     </div>
                   </div>
                   <div class="flex gap-2">
                     <button @click="approveUser(user.id)" class="p-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors" title="Aprovar"><Check class="w-4 h-4" /></button>
                     <button @click="rejectUser(user.id)" class="p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors" title="Rejeitar"><X class="w-4 h-4" /></button>
                   </div>
                </div>
              </div>
            </div>

            <hr v-if="institutionUsers.some(u => u.status === 'pending') && institutionUsers.some(u => u.status === 'approved')" class="border-slate-100" />

            <div>
              <h5 class="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Users class="w-4 h-4" /> Membros Ativos
              </h5>
              
              <div v-if="institutionUsers.filter(u => u.status === 'approved').length === 0" class="text-center py-4 text-slate-400 text-sm italic">
                Nenhum membro ativo.
              </div>

              <div class="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                <div v-for="user in institutionUsers.filter(u => u.status === 'approved')" :key="user.id" class="flex items-center justify-between p-2 hover:bg-slate-50 rounded-md transition-colors group">
                   <div class="flex items-center gap-3">
                     <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                       {{ user.nome.substring(0,2).toUpperCase() }}
                     </div>
                     <div>
                       <p class="text-sm font-medium text-slate-700">{{ user.nome }}</p>
                       <p class="text-xs text-slate-400">{{ user.email }}</p>
                     </div>
                   </div>
                   <button @click="rejectUser(user.id)" class="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded transition-all" title="Remover Membro">
                     <Trash2 class="w-4 h-4" />
                   </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </Modal>

      <Modal :is-open="showDeleteModal" title="Excluir" @close="showDeleteModal = false">
        <div class="text-center space-y-4">
          <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-2"><AlertTriangle class="w-8 h-8 text-red-500" /></div>
          <h3 class="text-lg font-bold text-slate-900">Tem certeza?</h3>
          <p class="text-sm text-slate-500 leading-relaxed">Ação irreversível.</p>
          <div class="flex gap-3 pt-4">
            <button @click="showDeleteModal = false" class="flex-1 h-11 rounded-md border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition-colors">Cancelar</button>
            <button @click="executeDelete" :disabled="isDeleting" class="flex-1 h-11 rounded-md bg-red-600 text-white font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
              <Loader2 v-if="isDeleting" class="w-4 h-4 animate-spin" />
              <span v-else>Sim, Excluir</span>
            </button>
          </div>
        </div>
      </Modal>

    </div>
  </div>
</template>