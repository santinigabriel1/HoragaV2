<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { Menu, Bell, User, X, Camera, Loader2, Upload } from 'lucide-vue-next'
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

// Referência para o input de arquivo invisível
const fileInput = ref<HTMLInputElement | null>(null)

// --- 1. LÓGICA DAS INICIAIS ---
const userInitials = computed(() => {
  const name = authStore.user?.nome || 'Usuario'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
})

// --- 2. EDIÇÃO DE PERFIL ---
const formData = reactive({
  nome: '',
  email: '',
  avatar: '' 
})

const openProfile = () => {
  if (authStore.user) {
    formData.nome = authStore.user.nome
    formData.email = authStore.user.email
    formData.avatar = authStore.user.avatar || ''
  }
  showProfileModal.value = true
}

// Função para acionar o clique no input escondido
const triggerFileInput = () => {
  fileInput.value?.click()
}

// Função para processar o arquivo selecionado
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    
    // Validação de tamanho (ex: máx 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 2MB.')
      return
    }

    // Converter para Base64 (para enviar via JSON)
    const reader = new FileReader()
    reader.onload = (e) => {
      // O resultado é uma string longa: "data:image/png;base64,iVBOR..."
      formData.avatar = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handleUpdateProfile = async () => {
  isSaving.value = true
  try {
    if (!authStore.user?.id) return

    // Envia o JSON normal (agora com a string Base64 no avatar se foi alterado)
    const { data } = await api.patch(`/usuario/${authStore.user.id}`, {
      nome: formData.nome,
      email: formData.email,
      avatar: formData.avatar 
    })

    if (data.success) {
      alert('Perfil atualizado com sucesso!')
      
      // Atualiza o Store e LocalStorage
      const updatedUser = { ...authStore.user, ...data.data }
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
        <img v-if="authStore.user?.avatar && authStore.user.avatar.length > 10" :src="authStore.user.avatar" alt="Avatar" class="w-full h-full object-cover" />
        <span v-else>{{ userInitials }}</span>
      </button>
    </div>

    <Modal :is-open="showProfileModal" title="Editar Perfil" @close="showProfileModal = false">
      <form @submit.prevent="handleUpdateProfile" class="space-y-5">
        
        <div class="flex flex-col items-center gap-3 mb-2">
          <div 
            @click="triggerFileInput"
            class="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center border-2 border-dashed border-slate-300 text-slate-400 relative overflow-hidden group cursor-pointer hover:border-rose-400 transition-colors"
          >
             <img v-if="formData.avatar && formData.avatar.length > 10" :src="formData.avatar" class="w-full h-full object-cover" />
             <User v-else class="w-8 h-8" />
             
             <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <Camera class="w-8 h-8 text-white" />
             </div>
          </div>
          
          <input 
            type="file" 
            ref="fileInput" 
            class="hidden" 
            accept="image/*" 
            @change="handleFileChange" 
          />
          
          <button type="button" @click="triggerFileInput" class="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1">
            <Upload class="w-3 h-3" /> Alterar Foto
          </button>
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">Nome Completo</label>
          <input v-model="formData.nome" type="text" required class="w-full h-10 px-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">E-mail</label>
          <input v-model="formData.email" type="email" required class="w-full h-10 px-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
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