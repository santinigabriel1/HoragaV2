<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Building2, MapPin, MoreVertical, Plus, Search, CheckCircle2, 
  User, Pencil, Trash2, Loader2, AlertTriangle 
} from 'lucide-vue-next'
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'
import Modal from '@/components/ui/Modal.vue'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'

const router = useRouter()
const authStore = useAuthStore()
const notification = useNotificationStore()

const sidebarOpen = ref(false)
const searchQuery = ref('')
const isLoading = ref(true)
const isSaving = ref(false)
const isDeleting = ref(false) // Estado de loading para exclusão
const institutions = ref<any[]>([])

// --- ESTADOS DOS MODAIS ---
const showModal = ref(false) // Modal de Criar/Editar
const showDeleteModal = ref(false) // Modal de Confirmação de Exclusão
const isEditing = ref(false)

// Dados do Formulário (Criar/Editar)
const formData = reactive({
  id: null as number | null,
  nome: '',
  descricao: ''
})

// Dados para Exclusão
const itemToDelete = ref<number | null>(null)

// --- PERMISSÃO ---
const canManage = (inst: any) => {
  if (!authStore.user) return false
  const userId = Number(authStore.user.id)
  const ownerId = Number(inst.managerId)
  const userRole = authStore.user.cargo || ''
  return userId === ownerId || userRole === 'Administrador'
}

// --- ACTIONS ---

const fetchInstitutions = async () => {
  isLoading.value = true
  try {
    const { data } = await api.get('/instituicoes')
    
    if (data.success) {
      const items = data.data.map((inst: any) => ({
        id: inst.id,
        name: inst.nome,
        description: inst.descricao,
        managerId: inst.organizador,
        managerName: 'Carregando...',
        status: 'active'
      }))
      institutions.value = items

      items.forEach(async (inst: any) => {
        if (inst.managerId) {
          try {
            const userRes = await api.get(`/usuario/${inst.managerId}`)
            if (userRes.data.success) inst.managerName = userRes.data.data.nome
          } catch { inst.managerName = 'Desconhecido' }
        } else {
          inst.managerName = 'Sem Organizador'
        }
      })
    }
  } catch (error) {
    console.error('Erro ao buscar:', error)
  } finally {
    isLoading.value = false
  }
}

// --- LÓGICA DE FORMULÁRIO ---
const openCreateModal = () => {
  isEditing.value = false
  formData.id = null
  formData.nome = ''
  formData.descricao = ''
  showModal.value = true
}

const openEditModal = (inst: any) => {
  isEditing.value = true
  formData.id = inst.id
  formData.nome = inst.name
  formData.descricao = inst.description
  showModal.value = true
}

const handleSave = async () => {
  isSaving.value = true
  try {
    const payload = {
      nome: formData.nome,
      descricao: formData.descricao,
      organizador: authStore.user?.id 
    }

    if (isEditing.value && formData.id) {
      await api.patch(`/instituicao/${formData.id}`, payload)
      notification.showSuccess('Instituição atualizada com sucesso!', () => fetchInstitutions())
    } else {
      await api.post('/instituicao', payload)
      notification.showSuccess('Instituição criada com sucesso!', () => fetchInstitutions())
    }
    
    showModal.value = false
  } catch (error: any) {
    notification.showError('Erro: ' + (error.response?.data?.message || error.message))
  } finally {
    isSaving.value = false
  }
}

// --- LÓGICA DE EXCLUSÃO (NOVA) ---

// 1. Abre o modal de confirmação (não deleta ainda)
const confirmDelete = (id: number) => {
  itemToDelete.value = id
  showDeleteModal.value = true
}

// 2. Executa a exclusão real
const executeDelete = async () => {
  if (!itemToDelete.value) return
  
  isDeleting.value = true
  try {
    await api.delete(`/instituicao/${itemToDelete.value}`)
    
    showDeleteModal.value = false
    notification.showSuccess('Instituição removida.', () => fetchInstitutions())
  } catch (error: any) {
    // Aqui capturamos se o erro for de Chave Estrangeira (Foreign Key)
    console.error(error)
    showDeleteModal.value = false
    
    const msg = error.response?.data?.message || error.message
    
    // Tratamento amigável para erro de vínculo
    if (msg.includes('foreign key') || msg.includes('constraint')) {
      notification.showError('Não é possível excluir: Esta instituição possui salas ou horários vinculados. Exclua as salas primeiro.')
    } else {
      notification.showError('Erro ao excluir: ' + msg)
    }
  } finally {
    isDeleting.value = false
  }
}

const handleLogout = () => router.push('/login')

onMounted(() => {
  fetchInstitutions()
})
</script>

<template>
  <div class="flex h-screen bg-slate-50">
    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" @logout="handleLogout" />

    <div class="flex-1 flex flex-col overflow-hidden">
      <Header title="Instituições" @toggle-sidebar="sidebarOpen = true" />

      <main class="flex-1 overflow-y-auto p-4 md:p-8">
        <div class="max-w-7xl mx-auto">
          
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 class="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Instituições</h1>
              <p class="text-slate-500">Gerencie os campus e unidades da sua organização.</p>
            </div>
            <button @click="openCreateModal" class="flex items-center gap-2 bg-[#be123c] hover:bg-[#9f1239] text-white px-4 py-2.5 rounded-md font-bold transition-colors shadow-sm">
              <Plus class="w-5 h-5" /> Nova Instituição
            </button>
          </div>

          <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-6 flex gap-4 items-center">
            <div class="relative flex-1">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input v-model="searchQuery" type="text" placeholder="Buscar por nome..." class="w-full pl-10 pr-4 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
            </div>
            <div class="text-sm text-slate-500 font-medium hidden sm:block">{{ institutions.length }} unidades</div>
          </div>

          <div v-if="isLoading" class="flex justify-center py-12">
            <Loader2 class="w-10 h-10 animate-spin text-rose-600" />
          </div>

          <div v-else-if="institutions.length === 0" class="text-center py-12 bg-white rounded-lg border border-dashed border-slate-300">
            <Building2 class="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p class="text-slate-500 font-medium">Nenhuma instituição encontrada.</p>
            <p class="text-slate-400 text-sm">Cadastre uma para começar a criar salas.</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="inst in institutions" :key="inst.id" class="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col relative overflow-hidden">
              
              <div class="p-5 border-b border-slate-100 flex justify-between items-start">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                    <Building2 class="w-6 h-6" />
                  </div>
                  <div>
                    <h3 class="font-bold text-slate-900 leading-tight line-clamp-1" :title="inst.name">{{ inst.name }}</h3>
                    <span class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide mt-1 bg-green-50 text-green-700 border border-green-200">
                      <CheckCircle2 class="w-3 h-3" /> Ativa
                    </span>
                  </div>
                </div>
                
                <div v-if="canManage(inst)" class="flex gap-1">
                  <button @click="openEditModal(inst)" class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Editar">
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button @click="confirmDelete(inst.id)" class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Excluir">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div class="p-5 space-y-3 flex-1">
                <div class="flex items-start gap-3 text-sm text-slate-600">
                  <MapPin class="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                  <span class="line-clamp-2">{{ inst.description || 'Sem descrição.' }}</span>
                </div>
              </div>

              <div class="px-5 py-3 bg-slate-50 border-t border-slate-100 rounded-b-lg flex justify-between items-center text-xs text-slate-500 font-medium">
                <span>ID: #{{ inst.id }}</span>
                <div class="flex items-center gap-1">
                  <User class="w-3 h-3" />
                  <span class="truncate max-w-[120px]" :title="inst.managerName">Org: {{ inst.managerName }}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Modal :is-open="showModal" :title="isEditing ? 'Editar Instituição' : 'Nova Instituição'" @close="showModal = false">
        <form @submit.prevent="handleSave" class="space-y-5">
          <div class="space-y-1.5">
            <label class="block text-sm font-semibold text-slate-700">Nome da Instituição <span class="text-red-500">*</span></label>
            <input v-model="formData.nome" type="text" required class="w-full h-10 px-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all" placeholder="Ex: ETEC Central" />
          </div>
          <div class="space-y-1.5">
            <label class="block text-sm font-semibold text-slate-700">Descrição / Endereço</label>
            <textarea v-model="formData.descricao" rows="3" class="w-full p-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none" placeholder="Detalhes..."></textarea>
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

      <Modal :is-open="showDeleteModal" title="Excluir Instituição" @close="showDeleteModal = false">
        <div class="text-center space-y-4">
          <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-2">
            <AlertTriangle class="w-8 h-8 text-red-500" />
          </div>
          <h3 class="text-lg font-bold text-slate-900">Tem certeza?</h3>
          <p class="text-sm text-slate-500 leading-relaxed">
            Você está prestes a excluir esta instituição. <br>
            Essa ação <strong>não pode ser desfeita</strong>.
          </p>
          
          <div class="flex gap-3 pt-4">
            <button 
              @click="showDeleteModal = false" 
              class="flex-1 h-11 rounded-md border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              @click="executeDelete" 
              :disabled="isDeleting"
              class="flex-1 h-11 rounded-md bg-red-600 text-white font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Loader2 v-if="isDeleting" class="w-4 h-4 animate-spin" />
              <span v-else>Sim, Excluir</span>
            </button>
          </div>
        </div>
      </Modal>

    </div>
  </div>
</template>