<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Building2, MapPin, Plus, CheckCircle2, 
  Pencil, Trash2, Loader2, AlertTriangle, 
  Users 
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
const institutions = ref<any[]>([]) 

// --- ESTADOS DOS MODAIS ---
const showModal = ref(false) // Criar/Editar
const showDeleteModal = ref(false)
const showMembersModal = ref(false) // <--- APENAS LEITURA

const isEditing = ref(false)
const itemToDelete = ref<number | null>(null)
const selectedInstitution = ref<any>(null)

// Lista SOMENTE LEITURA de membros ativos
const activeMembers = ref<any[]>([])
const isLoadingMembers = ref(false)

const formData = reactive({ id: null as number | null, nome: '', descricao: '' })

// --- BUSCA INICIAL ---
const fetchInstitutions = async () => {
  isLoading.value = true
  try {
    const { data } = await api.get('/instituicoes')
    if (data.success && authStore.user) {
      const userId = Number(authStore.user.id)
      const raw = data.data || []
      // Filtra apenas as minhas
      institutions.value = raw.filter((i: any) => Number(i.organizador) === userId).map((i: any) => ({
        ...i,
        status: 'active'
      }))
    }
  } catch (error) { console.error(error) } 
  finally { isLoading.value = false }
}

// --- VISUALIZAR MEMBROS (READ-ONLY) ---
const openMembersModal = async (inst: any) => {
  selectedInstitution.value = inst
  showMembersModal.value = true
  isLoadingMembers.value = true
  activeMembers.value = []

  try {
    // Aqui buscaria api.get(`/usuarios-instituicao/${inst.id}`)
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // MOCK: Apenas usuários ativos (aceito=1, bloqueado=0)
    // Simulando que esses são os dados que vêm do banco
    activeMembers.value = [
      { id: 1, nome: 'Gustavo Gomes', email: 'gustavo@email.com', cargo: 'Aluno' },
      { id: 2, nome: 'Gabriel Ferreira', email: 'gabriel@email.com', cargo: 'Professor' },
      { id: 5, nome: 'Leonardo Bellotti', email: 'leo@email.com', cargo: 'Aluno' },
    ]
  } catch (e) {
    console.error(e)
  } finally {
    isLoadingMembers.value = false
  }
}

// --- CRUD ---
const openCreateModal = () => {
  isEditing.value = false; formData.id = null; formData.nome = ''; formData.descricao = ''
  showModal.value = true
}

const openEditModal = (inst: any, event: Event) => {
  event.stopPropagation()
  isEditing.value = true; formData.id = inst.id; formData.nome = inst.name || inst.nome; formData.descricao = inst.description || inst.descricao
  showModal.value = true
}

const handleSave = async () => {
  isSaving.value = true
  try {
    const payload = { nome: formData.nome, descricao: formData.descricao, organizador: authStore.user?.id }
    if (isEditing.value && formData.id) {
      await api.patch(`/instituicao/${formData.id}`, payload)
      // Atualiza local simples
      const idx = institutions.value.findIndex(i => i.id === formData.id)
      if (idx !== -1) {
        institutions.value[idx].nome = formData.nome
        institutions.value[idx].descricao = formData.descricao
      }
      notification.showSuccess('Atualizado!')
    } else {
      const { data } = await api.post('/instituicao', payload)
      institutions.value.push(data.data)
      notification.showSuccess('Criado!')
    }
    showModal.value = false
  } catch (e: any) { notification.showError(e.message) }
  finally { isSaving.value = false }
}

const confirmDelete = (id: number, event: Event) => {
  event.stopPropagation()
  itemToDelete.value = id; showDeleteModal.value = true
}

const executeDelete = async () => {
  if (!itemToDelete.value) return; isDeleting.value = true
  try {
    await api.delete(`/instituicao/${itemToDelete.value}`)
    institutions.value = institutions.value.filter(i => i.id !== itemToDelete.value)
    showDeleteModal.value = false
    notification.showSuccess('Removido.')
  } catch (e: any) { notification.showError(e.message) }
  finally { isDeleting.value = false }
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
              <h1 class="text-3xl font-bold text-slate-900 mb-2">Instituições</h1>
              <p class="text-slate-500">Gerencie suas unidades.</p>
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
            <p class="text-slate-500 font-medium">Nenhuma instituição encontrada.</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="inst in institutions" 
              :key="inst.id" 
              @click="openMembersModal(inst)"
              class="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-rose-200 transition-all cursor-pointer group flex flex-col relative overflow-hidden"
            >
              <div class="p-5 border-b border-slate-100 flex justify-between items-start">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                    <Building2 class="w-6 h-6" />
                  </div>
                  <div>
                    <h3 class="font-bold text-slate-900 leading-tight line-clamp-1 text-lg transition-colors">
                      {{ inst.nome || inst.name }}
                    </h3>
                    <span class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide mt-1 bg-green-50 text-green-700 border border-green-200">
                      <CheckCircle2 class="w-3 h-3" /> Ativa
                    </span>
                  </div>
                </div>
              </div>

              <div class="p-5 flex-1">
                <div class="flex items-start gap-3 text-sm text-slate-600">
                  <MapPin class="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                  <span class="line-clamp-2">{{ inst.descricao || inst.description || 'Sem descrição.' }}</span>
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
                <div class="flex items-center gap-1 text-slate-400 group-hover:text-rose-600 transition-colors">
                  <Users class="w-3 h-3" /> Ver Membros
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
            <input v-model="formData.nome" type="text" required class="w-full h-10 px-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all" />
          </div>
          <div class="space-y-1.5">
            <label class="block text-sm font-semibold text-slate-700">Descrição</label>
            <textarea v-model="formData.descricao" rows="3" class="w-full p-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"></textarea>
          </div>
          <div class="flex gap-3 pt-2">
            <button type="button" @click="showModal = false" class="flex-1 h-10 rounded-md border border-slate-300 font-medium text-slate-700 hover:bg-slate-50">Cancelar</button>
            <button type="submit" :disabled="isSaving || !formData.nome" class="flex-1 h-10 rounded-md bg-[#be123c] text-white font-bold hover:bg-[#9f1239] disabled:opacity-50 flex items-center justify-center gap-2">
              <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
              <span v-else>{{ isEditing ? 'Salvar' : 'Criar' }}</span>
            </button>
          </div>
        </form>
      </Modal>

      <Modal :is-open="showMembersModal" title="Membros da Instituição" @close="showMembersModal = false">
        <div class="space-y-4">
          <div class="bg-rose-50 p-4 rounded-lg border border-rose-100">
            <h4 class="font-bold text-rose-900">{{ selectedInstitution?.nome || selectedInstitution?.name }}</h4>
            <p class="text-xs text-rose-700">Listagem de usuários com acesso ativo.</p>
          </div>

          <div v-if="isLoadingMembers" class="py-8 flex justify-center">
            <Loader2 class="w-8 h-8 animate-spin text-rose-600" />
          </div>

          <div v-else>
            <div v-if="activeMembers.length === 0" class="text-center py-6 text-slate-400 italic text-sm">
              Nenhum membro vinculado.
            </div>
            <div v-else class="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              <div v-for="user in activeMembers" :key="user.id" class="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-md border border-transparent hover:border-slate-100 transition-colors">
                <div class="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-600 shadow-sm">
                  {{ user.nome.substring(0,2).toUpperCase() }}
                </div>
                <div>
                  <p class="text-sm font-bold text-slate-800">{{ user.nome }}</p>
                  <p class="text-[10px] text-slate-500">{{ user.email }} • {{ user.cargo }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-2">
            <button @click="showMembersModal = false" class="px-4 py-2 bg-slate-800 text-white text-sm rounded-md font-bold hover:bg-slate-900">Fechar</button>
          </div>
        </div>
      </Modal>

      <Modal :is-open="showDeleteModal" title="Excluir" @close="showDeleteModal = false">
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