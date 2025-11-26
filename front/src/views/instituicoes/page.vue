<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Building2, MapPin, MoreVertical, Plus, Search, CheckCircle2, 
  User, Pencil, Trash2, Loader2 
} from 'lucide-vue-next'
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'
import Modal from '@/components/ui/Modal.vue'
import api from '@/services/api'

const router = useRouter()
const sidebarOpen = ref(false)
const searchQuery = ref('')
const isLoading = ref(true)
const isSaving = ref(false)
const institutions = ref<any[]>([])

// --- ESTADO DO MODAL ---
const showModal = ref(false)
const isEditing = ref(false)
const formData = reactive({
  id: null as number | null,
  nome: '',
  descricao: ''
})

// --- AÇÕES DO CRUD ---

// 1. Buscar (Read)
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
        managerName: 'Carregando...', // Placeholder
        status: 'active'
      }))
      institutions.value = items

      // Busca nomes dos organizadores em segundo plano
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

// 2. Abrir Modal Criar
const openCreateModal = () => {
  isEditing.value = false
  formData.id = null
  formData.nome = ''
  formData.descricao = ''
  showModal.value = true
}

// 3. Abrir Modal Editar
const openEditModal = (inst: any) => {
  isEditing.value = true
  formData.id = inst.id
  formData.nome = inst.name
  formData.descricao = inst.description
  showModal.value = true
}

// 4. Salvar (Create / Update)
const handleSave = async () => {
  isSaving.value = true
  try {
    if (isEditing.value && formData.id) {
      // PATCH /instituicao/:id
      await api.patch(`/instituicao/${formData.id}`, {
        nome: formData.nome,
        descricao: formData.descricao
      })
      alert('Instituição atualizada com sucesso!')
    } else {
      // POST /instituicao
      await api.post('/instituicao', {
        nome: formData.nome,
        descricao: formData.descricao
      })
      alert('Instituição criada com sucesso!')
    }
    showModal.value = false
    fetchInstitutions() // Atualiza a lista
  } catch (error: any) {
    alert('Erro: ' + (error.response?.data?.message || error.message))
  } finally {
    isSaving.value = false
  }
}

// 5. Deletar
const handleDelete = async (id: number) => {
  if (!confirm('Tem certeza que deseja excluir esta instituição?')) return
  
  try {
    await api.delete(`/instituicao/${id}`)
    alert('Instituição removida.')
    fetchInstitutions()
  } catch (error: any) {
    alert('Erro ao excluir: ' + (error.response?.data?.message || error.message))
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
                
                <div class="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button @click="openEditModal(inst)" class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Editar">
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button @click="handleDelete(inst.id)" class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Excluir">
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

      <Modal 
        :is-open="showModal" 
        :title="isEditing ? 'Editar Instituição' : 'Nova Instituição'" 
        @close="showModal = false"
      >
        <form @submit.prevent="handleSave" class="space-y-5">
          
          <div class="space-y-1.5">
            <label class="block text-sm font-semibold text-slate-700">Nome da Instituição <span class="text-red-500">*</span></label>
            <input 
              v-model="formData.nome" 
              type="text" 
              required 
              class="w-full h-10 px-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all placeholder:text-slate-400" 
              placeholder="Ex: ETEC de Tietê - Campus 1" 
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-sm font-semibold text-slate-700">Descrição / Endereço</label>
            <textarea 
              v-model="formData.descricao" 
              rows="3" 
              class="w-full p-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all resize-none placeholder:text-slate-400" 
              placeholder="Digite o endereço ou detalhes sobre esta unidade..."
            ></textarea>
          </div>

          <div class="flex gap-3 pt-2">
            <button 
              type="button" 
              @click="showModal = false" 
              class="flex-1 h-10 rounded-md border border-slate-300 font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              :disabled="isSaving || !formData.nome" 
              class="flex-1 h-10 rounded-md bg-[#be123c] text-white font-bold hover:bg-[#9f1239] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
              <span v-else>{{ isEditing ? 'Salvar Alterações' : 'Criar Instituição' }}</span>
            </button>
          </div>

        </form>
      </Modal>

    </div>
  </div>
</template>