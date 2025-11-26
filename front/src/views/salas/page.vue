<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { 
  DoorOpen, Plus, Pencil, Trash2, Loader2, Building2 
} from 'lucide-vue-next'
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'
import Modal from '@/components/ui/Modal.vue'
import api from '@/services/api'

const router = useRouter()
const sidebarOpen = ref(false)
const isLoading = ref(true)
const isSaving = ref(false)

// Dados
const rooms = ref<any[]>([])
const institutions = ref<any[]>([]) // Lista para o select

// Estado do Modal
const showModal = ref(false)
const isEditing = ref(false)
const formData = reactive({
  id: null as number | null,
  nome: '',
  descricao: '',
  fk_instituicao_id: '' as string | number
})

// --- ACTIONS ---

const fetchData = async () => {
  isLoading.value = true
  
  // 1. Buscar Instituições (Essencial para o Select)
  try {
    console.log('Buscando instituições...')
    const resInst = await api.get('/instituicoes')
    console.log('Instituições encontradas:', resInst.data)

    if (resInst.data.success) {
      // O backend retorna [{ id: 1, nome: '...', ... }]
      institutions.value = resInst.data.data
    }
  } catch (error) {
    console.error('Erro crítico ao buscar instituições:', error)
  }

  // 2. Buscar Salas
  try {
    const resRooms = await api.get('/salas')
    if (resRooms.data.success) {
      rooms.value = resRooms.data.data
    }
  } catch (error) {
    console.error('Erro ao buscar salas (pode estar vazia):', error)
  } finally {
    isLoading.value = false
  }
}

const openCreateModal = () => {
  isEditing.value = false
  formData.id = null
  formData.nome = ''
  formData.descricao = ''
  
  // Tenta selecionar a primeira instituição automaticamente se houver
  if (institutions.value.length > 0) {
    formData.fk_instituicao_id = institutions.value[0].id
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

const handleSave = async () => {
  if (!formData.fk_instituicao_id) return alert('Selecione uma instituição!')
  
  isSaving.value = true
  try {
    if (isEditing.value && formData.id) {
      // PATCH
      await api.patch(`/sala/${formData.id}`, {
        nome: formData.nome,
        descricao: formData.descricao,
        fk_instituicao_id: formData.fk_instituicao_id
      })
      alert('Sala atualizada!')
    } else {
      // POST
      await api.post('/sala', {
        nome: formData.nome,
        descricao: formData.descricao,
        fk_instituicao_id: formData.fk_instituicao_id
      })
      alert('Sala criada com sucesso!')
    }
    showModal.value = false
    fetchData()
  } catch (error: any) {
    console.error(error)
    alert('Erro: ' + (error.response?.data?.message || error.message))
  } finally {
    isSaving.value = false
  }
}

const handleDelete = async (id: number) => {
  if (!confirm('Deseja excluir esta sala?')) return
  try {
    await api.delete(`/sala/${id}`)
    alert('Sala removida.')
    fetchData()
  } catch (error: any) {
    alert('Erro ao excluir: ' + (error.response?.data?.message || error.message))
  }
}

// Função auxiliar para mostrar o nome da instituição na lista
const getInstName = (id: number) => {
  const inst = institutions.value.find(i => i.id === id)
  return inst ? inst.nome : 'ID ' + id
}

const handleLogout = () => router.push('/login')

onMounted(() => {
  fetchData()
})
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
              <h1 class="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Salas & Laboratórios</h1>
              <p class="text-slate-500">Cadastre os espaços físicos disponíveis para reserva.</p>
            </div>
            <button @click="openCreateModal" class="flex items-center gap-2 bg-[#be123c] hover:bg-[#9f1239] text-white px-4 py-2.5 rounded-md font-bold transition-colors shadow-sm">
              <Plus class="w-5 h-5" /> Nova Sala
            </button>
          </div>

          <div v-if="isLoading" class="flex justify-center py-12">
            <Loader2 class="w-10 h-10 animate-spin text-rose-600" />
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="room in rooms" :key="room.id" class="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
              <div class="p-5 border-b border-slate-100 flex justify-between items-start">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                    <DoorOpen class="w-6 h-6" />
                  </div>
                  <div>
                    <h3 class="font-bold text-slate-900 leading-tight">{{ room.nome }}</h3>
                    <div class="flex items-center gap-1 mt-1 text-xs text-slate-500">
                      <Building2 class="w-3 h-3" />
                      <span>{{ getInstName(room.fk_instituicao_id) }}</span>
                    </div>
                  </div>
                </div>
                <div class="flex gap-1">
                  <button @click="openEditModal(room)" class="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Pencil class="w-4 h-4" /></button>
                  <button @click="handleDelete(room.id)" class="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 class="w-4 h-4" /></button>
                </div>
              </div>
              <div class="p-5 flex-1">
                <p class="text-sm text-slate-600">{{ room.descricao || 'Sem descrição definida.' }}</p>
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
              class="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-rose-500 outline-none bg-white disabled:bg-slate-100"
            >
              <option value="" disabled>Selecione...</option>
              <option v-for="inst in institutions" :key="inst.id" :value="inst.id">
                {{ inst.nome }}
              </option>
            </select>
            <p v-if="institutions.length === 0" class="text-xs text-red-500 mt-1">
              Nenhuma instituição encontrada. Cadastre uma primeiro.
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
            <textarea v-model="formData.descricao" rows="3" class="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-rose-500 outline-none" placeholder="Equipamentos, capacidade..."></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="showModal = false" class="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-md">Cancelar</button>
            <button type="submit" :disabled="isSaving" class="px-4 py-2 bg-[#be123c] text-white rounded-md hover:bg-[#9f1239] disabled:opacity-50">
              {{ isSaving ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  </div>
</template>