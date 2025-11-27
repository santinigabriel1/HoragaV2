<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
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
const isDeleting = ref(false)
const institutions = ref<any[]>([])

// Estados de Modal
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const itemToDelete = ref<number | null>(null)

const formData = reactive({
  id: null as number | null,
  nome: '',
  descricao: ''
})

// --- ACTIONS ---

const fetchInstitutions = async () => {
  isLoading.value = true
  try {
    const { data } = await api.get('/instituicoes')
    
    if (data.success && authStore.user) {
      // SOLUÇÃO PONTO 1: Filtragem no Frontend
      // Só mostra instituições onde o organizador é o usuário logado
      const userId = Number(authStore.user.id)

      const myInstitutions = data.data.filter((inst: any) => {
        return Number(inst.organizador) === userId
      })

      // Mapeia os dados
      institutions.value = myInstitutions.map((inst: any) => ({
        id: inst.id,
        name: inst.nome,
        description: inst.descricao,
        managerId: inst.organizador,
        // Como filtrei pelo meu ID, o gestor sou eu
        managerName: authStore.user?.nome || 'Eu', 
        status: 'active'
      }))
    }
  } catch (error) {
    console.error('Erro ao buscar:', error)
  } finally {
    isLoading.value = false
  }
}

// --- MODAIS ---
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
    // Garante que o organizador é o usuário logado
    const payload = {
      nome: formData.nome,
      descricao: formData.descricao,
      organizador: authStore.user?.id 
    }

    if (isEditing.value && formData.id) {
      await api.patch(`/instituicao/${formData.id}`, payload)
      notification.showSuccess('Atualizado com sucesso!', () => fetchInstitutions())
    } else {
      await api.post('/instituicao', payload)
      notification.showSuccess('Criado com sucesso!', () => fetchInstitutions())
    }
    
    showModal.value = false
  } catch (error: any) {
    notification.showError('Erro: ' + (error.response?.data?.message || error.message))
  } finally {
    isSaving.value = false
  }
}

// --- EXCLUSÃO ---
const confirmDelete = (id: number) => {
  itemToDelete.value = id
  showDeleteModal.value = true
}

const executeDelete = async () => {
  if (!itemToDelete.value) return
  isDeleting.value = true
  
  try {
    await api.delete(`/instituicao/${itemToDelete.value}`)
    showDeleteModal.value = false
    notification.showSuccess('Removido com sucesso.', () => fetchInstitutions())
  } catch (error: any) {
    showDeleteModal.value = false
    // SOLUÇÃO PONTO 2: Melhor feedback de erro
    const msg = error.response?.data?.message || error.message
    if (msg.includes('foreign key') || msg.includes('constraint')) {
      notification.showError('Não é possível excluir: Existem salas vinculadas a esta instituição.')
    } else {
      notification.showError('Erro ao excluir: ' + msg)
    }
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
              <h1 class="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Instituições</h1>
              <p class="text-slate-500">Gerencie as unidades que você criou.</p>
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
                
                <div class="flex gap-1">
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
                  <span class="truncate max-w-[120px]" :title="inst.managerName">Criado por você</span>
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