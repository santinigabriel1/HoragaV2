<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { Menu, Bell, User, X, Camera, Loader2 } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import Modal from '@/components/ui/Modal.vue'

defineProps<{
  title?: string
}>()

defineEmits(['toggleSidebar'])

const authStore = useAuthStore()
const showProfileModal = ref(false)
const isSaving = ref(false)

// --- 1. LÓGICA DAS INICIAIS ---
const userInitials = computed(() => {
  const name = authStore.user?.nome || 'Usuario'
  const parts = name.trim().split(' ')
  
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  // Pega a primeira letra do primeiro nome e do último
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
})

// --- 2. EDIÇÃO DE PERFIL ---
const formData = reactive({
  nome: '',
  email: '',
  avatar: '' // Se sua API aceitar URL de foto
})

const openProfile = () => {
  // Preenche o formulário com os dados atuais do Pinia
  if (authStore.user) {
    formData.nome = authStore.user.nome
    formData.email = authStore.user.email
    formData.avatar = authStore.user.avatar || ''
  }
  showProfileModal.value = true
}

const handleUpdateProfile = async () => {
  isSaving.value = true
  try {
    if (!authStore.user?.id) return

    // Chama a API para atualizar (PATCH /usuario/:id)
    const { data } = await api.patch(`/usuario/${authStore.user.id}`, {
      nome: formData.nome,
      email: formData.email,
      avatar: formData.avatar // Envia se o backend suportar
    })

    if (data.success) {
      alert('Perfil atualizado com sucesso!')
      
      // IMPORTANTE: Atualiza o Pinia e o LocalStorage com os novos dados
      // para refletir na tela sem precisar relogar
      const updatedUser = { ...authStore.user, ...data.data } // Mescla dados antigos com novos
      authStore.user = updatedUser
      localStorage.setItem('horaga_user', JSON.stringify(updatedUser))
      
      showProfileModal.value = false
    }
  } catch (error: any) {
    console.error(error)
    alert('Erro ao atualizar: ' + (error.response?.data?.mensagem || error.message))
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 z-30 flex-shrink-0">
    
    <div class="flex items-center gap-4">
      <button @click="$emit('toggleSidebar')" class="md:hidden text-slate-600 hover:bg-slate-100 p-2 rounded-md">
        <Menu class="w-6 h-6" />
      </button>
      <h2 class="text-lg font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-none">
        {{ title || `Olá, ${authStore.user?.nome?.split(' ')[0]}` }}
      </h2>
    </div>
    
    <div class="flex items-center gap-4">
      <button class="text-slate-500 hover:bg-slate-100 p-2 rounded-full relative transition-colors">
        <Bell class="w-5 h-5" />
        <span class="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
      </button>
      
      <button 
        @click="openProfile"
        class="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-800 font-bold text-sm border border-rose-200 hover:ring-2 hover:ring-rose-200 transition-all cursor-pointer overflow-hidden"
        title="Meu Perfil"
      >
        <img v-if="authStore.user?.avatar && authStore.user.avatar.startsWith('http')" :src="authStore.user.avatar" alt="Avatar" class="w-full h-full object-cover" />
        <span v-else>{{ userInitials }}</span>
      </button>
    </div>

    <Modal :is-open="showProfileModal" title="Editar Perfil" @close="showProfileModal = false">
      <form @submit.prevent="handleUpdateProfile" class="space-y-5">
        
        <div class="flex flex-col items-center gap-3 mb-2">
          <div class="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300 text-slate-400 relative overflow-hidden group">
             <img v-if="formData.avatar && formData.avatar.startsWith('http')" :src="formData.avatar" class="w-full h-full object-cover" />
             <User v-else class="w-8 h-8" />
             
             <div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
               <Camera class="w-6 h-6 text-white" />
             </div>
          </div>
          <p class="text-xs text-slate-500">Clique para alterar a foto (URL)</p>
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">Nome Completo</label>
          <input v-model="formData.nome" type="text" required class="w-full h-10 px-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">E-mail</label>
          <input v-model="formData.email" type="email" required class="w-full h-10 px-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">URL do Avatar (Opcional)</label>
          <input v-model="formData.avatar" type="text" placeholder="https://..." class="w-full h-10 px-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
        </div>

        <div class="flex gap-3 pt-2">
          <button type="button" @click="showProfileModal = false" class="flex-1 h-10 rounded-md border border-slate-300 font-medium text-slate-700 hover:bg-slate-50">Cancelar</button>
          <button type="submit" :disabled="isSaving" class="flex-1 h-10 rounded-md bg-[#be123c] text-white font-bold hover:bg-[#9f1239] disabled:opacity-50 flex items-center justify-center gap-2">
            <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
            <span v-else>Salvar Alterações</span>
          </button>
        </div>
      </form>
    </Modal>

  </header>
</template>