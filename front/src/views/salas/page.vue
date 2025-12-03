<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { 
  DoorOpen, Plus, Pencil, Trash2, Loader2, Building2, 
  AlertTriangle 
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
const isLoading = ref(true)
const isSaving = ref(false)
const isDeleting = ref(false)

// Dados
const rooms = ref<any[]>([])
const myInstitutions = ref<any[]>([]) 

// Estados Modais
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const itemToDelete = ref<number | null>(null)

const formData = reactive({
  id: null as number | null,
  nome: '',
  descricao: '',
  fk_instituicao_id: '' as string | number,
})

// --- BUSCA DE DADOS ---
const fetchData = async () => {
  isLoading.value = true
  
  try {
    const userId = authStore.user?.id ? Number(authStore.user.id) : null
    
    // 1. Busca Instituições Primeiro
    try {
      const { data } = await api.get('/instituicoes')
      if (data.success) {
        const rawList = Array.isArray(data.data) ? data.data : []
        
        // Se for usuário comum, filtra. Se a API já filtrar, isso é redundante mas seguro.
        if (userId) {
           myInstitutions.value = rawList.filter((inst: any) => Number(inst.organizador) === userId)
        } else {
           myInstitutions.value = rawList
        }
      }
    } catch (e) { console.error('Erro Inst:', e) }

    // 2. Busca Salas
    try {
      const { data } = await api.get('/salas')
      if (data.success) {
        const allRooms = Array.isArray(data.data) ? data.data : []
        
        // Filtra para exibir apenas salas das minhas instituições
        const myInstIds = new Set(myInstitutions.value.map(i => i.id))
        
        rooms.value = allRooms.filter((room: any) => myInstIds.has(room.fk_instituicao_id))
      }
    } catch (e) { console.error('Erro Salas:', e) }

  } catch (error) {
    console.error('Erro Geral:', error)
  } finally {
    isLoading.value = false
  }
}

// --- CRUD: SALVAR ---
const handleSave = async () => {
  if (!formData.fk_instituicao_id) return notification.showError('Selecione uma instituição!')
  isSaving.value = true
  
  try {
    const payload = {
      nome: formData.nome,
      descricao: formData.descricao,
      fk_instituicao_id: formData.fk_instituicao_id,
    }

    if (isEditing.value && formData.id) {
      await api.patch(`/sala/${formData.id}`, payload)
      await fetchData() 
      notification.showSuccess('Sala atualizada!')
    } else {
      await api.post('/sala', payload)
      await fetchData()
      notification.showSuccess('Sala criada!')
    }
    showModal.value = false
  } catch (error: any) {
    notification.showError('Erro: ' + (error.response?.data?.message || error.message))
  } finally {
    isSaving.value = false
  }
}

// --- CRUD: EXCLUIR ---
const executeDelete = async () => {
  if (!itemToDelete.value) return
  isDeleting.value = true
  try {
    await api.delete(`/sala/${itemToDelete.value}`)
    rooms.value = rooms.value.filter(r => r.id !== itemToDelete.value)
    showDeleteModal.value = false
    notification.showSuccess('Sala removida.')
  } catch (error: any) {
    showDeleteModal.value = false
    notification.showError('Erro ao excluir: ' + (error.response?.data?.message || error.message))
  } finally {
    isDeleting.value = false
  }
}

// --- UTILS ---
const openCreateModal = () => {
  isEditing.value = false
  formData.id = null; formData.nome = ''; formData.descricao = ''
  // Pré-seleciona se tiver só uma instituição
  if (myInstitutions.value.length === 1) {
    formData.fk_instituicao_id = myInstitutions.value[0].id
  } else {
    formData.fk_instituicao_id = ''
  }
  showModal.value = true
}

const openEditModal = (room: any) => {
  isEditing.value = true
  formData.id = room.id
  formData.nome = room.nome
  formData.descricao = room.descricao
  formData.fk_instituicao_id = room.fk_instituicao_id
  showModal.value = true
}

const confirmDelete = (id: number) => { itemToDelete.value = id; showDeleteModal.value = true }
const getInstName = (id: number) => { const inst = myInstitutions.value.find(i => i.id === id); return inst ? (inst.nome || inst.name) : '...' }
const handleLogout = () => router.push('/login')

onMounted(() => fetchData())
</script>

<template>
  <div class="flex h-screen bg-slate-50">
    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" @logout="handleLogout" />

    <div class="flex-1 flex flex-col overflow-hidden">
      <Header title="Gestão de Salas" @toggle-sidebar="sidebarOpen = true" />

      <main class="flex-1 overflow-y-auto p-4 md:p-8">
        <div class="max-w-7xl mx-auto">
          
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 class="text-3xl md:text-2xl font-bold text-slate-900 mb-2">SALAS & LABORATÓRIOS</h1>
              <p class="text-slate-500">Gerencie os espaços físicos disponíveis para reserva.</p>
            </div>
            <button @click="openCreateModal" class="flex items-center gap-2 bg-[#be123c] hover:bg-[#9f1239] text-white px-4 py-2.5 rounded-md font-bold transition-colors shadow-sm">
              <Plus class="w-5 h-5" /> Nova Sala
            </button>
          </div>

          <div v-if="isLoading" class="flex justify-center py-12">
            <Loader2 class="w-10 h-10 animate-spin text-rose-600" />
          </div>

          <div v-else-if="rooms.length === 0" class="text-center py-12 bg-white rounded-lg border border-dashed border-slate-300">
             <DoorOpen class="w-12 h-12 text-slate-300 mx-auto mb-3" />
             <p class="text-slate-500 font-medium">Nenhuma sala cadastrada.</p>
             <p v-if="myInstitutions.length === 0" class="text-xs text-red-500 mt-2">
               Você precisa cadastrar uma Instituição antes de criar salas.
             </p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="room in rooms" 
              :key="room.id" 
              class="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-rose-200 transition-all group flex flex-col relative overflow-hidden"
            >
              <div class="p-5 border-b border-slate-100 flex justify-between items-start">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                    <DoorOpen class="w-6 h-6" />
                  </div>
                  <div>
                    <h3 class="font-bold text-slate-900 leading-tight">{{ room.nome }}</h3>
                    <div class="flex items-center gap-1 mt-1 text-xs text-slate-500">
                      <Building2 class="w-3 h-3" />
                      <span>{{ getInstName(room.fk_instituicao_id) || 'Inst. Desconhecida' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="p-5 flex-1">
                <p class="text-sm text-slate-600 line-clamp-2">{{ room.descricao || 'Sem descrição definida.' }}</p>
              </div>

              <div class="px-5 py-3 border-t border-slate-100 rounded-b-lg flex justify-end items-center text-xs bg-slate-50/50">
                <div class="flex gap-1">
                  <button @click="openEditModal(room)" class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar">
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button @click="confirmDelete(room.id)" class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Excluir">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Modal :is-open="showModal" :title="isEditing ? 'Editar Sala' : 'Nova Sala'" @close="showModal = false">
        <form @submit.prevent="handleSave" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Nome da Sala</label>
            <input v-model="formData.nome" type="text" required class="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-rose-500 outline-none" placeholder="Ex: Laboratório 01" />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Pertence à Instituição</label>
            <select 
              v-model="formData.fk_instituicao_id" 
              required
              class="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-rose-500 outline-none bg-white disabled:bg-slate-100"
            >
              <option value="" disabled>Selecione...</option>
              <option v-for="inst in myInstitutions" :key="inst.id" :value="inst.id">
                {{ inst.nome || inst.name || 'Instituição sem nome' }}
              </option>
            </select>
            <p v-if="myInstitutions.length === 0" class="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertTriangle class="w-3 h-3" /> Nenhuma instituição encontrada.
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
            <textarea v-model="formData.descricao" rows="3" class="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-rose-500 outline-none" placeholder="Equipamentos, capacidade..."></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="showModal = false" class="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-md">Cancelar</button>
            <button type="submit" :disabled="isSaving" class="px-4 py-2 bg-[#be123c] text-white rounded-md hover:bg-[#9f1239] disabled:opacity-50 flex items-center gap-2">
              <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
              <span>{{ isSaving ? 'Salvando...' : 'Salvar' }}</span>
            </button>
          </div>
        </form>
      </Modal>
      
      <Modal :is-open="showDeleteModal" title="Excluir Sala" @close="showDeleteModal = false">
        <div class="text-center space-y-4">
          <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-2"><AlertTriangle class="w-8 h-8 text-red-500" /></div>
          <h3 class="text-lg font-bold text-slate-900">Tem certeza?</h3>
          <p class="text-sm text-slate-500 leading-relaxed">Ação irreversível.</p>
          <div class="flex gap-3 pt-4">
            <button @click="showDeleteModal = false" class="flex-1 h-11 rounded-md border border-slate-300 font-bold text-slate-700 hover:bg-slate-50">Cancelar</button>
            <button @click="executeDelete" :disabled="isDeleting" class="flex-1 h-11 rounded-md bg-red-600 text-white font-bold hover:bg-red-700 flex items-center justify-center gap-2">
              <Loader2 v-if="isDeleting" class="w-4 h-4 animate-spin" />
              <span v-else>Sim, Excluir</span>
            </button>
          </div>
        </div>
      </Modal>

    </div>
  </div>
</template>