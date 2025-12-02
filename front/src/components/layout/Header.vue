<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue' // <--- Adicione onUnmounted
import { 
  Menu, Bell, User, Camera, Loader2, Upload 
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import Modal from '@/components/ui/Modal.vue'
import { useNotificationStore } from '@/stores/notification'

defineProps<{ title?: string }>()
const emit = defineEmits(['toggleSidebar'])

const authStore = useAuthStore()
const notification = useNotificationStore()

const fileInput = ref<HTMLInputElement | null>(null)
const showProfileModal = ref(false)
const showNotifications = ref(false)
const isSaving = ref(false)
const notifications = ref<any[]>([])

// --- 1. NOTIFICAÇÕES INTELIGENTES ---
const generateNotifications = async () => {

  try {
    const { data } = await api.get('/agendamentos') 
    if (data.success) {
      const userId = authStore.user?.id
      
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      
      const upcoming = data.data.filter((booking: any) => {
        const isMine = Number(booking.fk_usuario_id) === Number(userId)
        const bookingDateStr = booking.data_agendamento || booking.data
        if (!bookingDateStr) return false

        const [y, m, d] = bookingDateStr.split('T')[0].split('-').map(Number)
        const bookingDate = new Date(y, m - 1, d)
        
        // Verifica se é amanhã (compara timestamps do dia)
        const isTomorrow = bookingDate.getTime() === tomorrow.getTime()
        return isMine && isTomorrow
      })

      upcoming.forEach((booking: any) => {
        let time = 'Horário a confirmar'
        if (booking.horario_inicio) time = booking.horario_inicio.substring(0, 5)
        else if (booking.horarios?.[0]?.inicio) time = booking.horarios[0].inicio.substring(0, 5)

        notifications.value.push({
          id: booking.id,
          title: 'Agendamento Amanhã!',
          message: `Lembrete: Você tem uma reserva em ${booking.sala?.nome || 'uma sala'} às ${time}.`,
          type: 'info',
          time: 'Lembrete'
        })
      })
    }
  } catch (error) {
    console.error('Erro ao buscar notificações', error)
  }
}

// ... (CÓDIGO DE PERFIL MANTIDO IGUAL - OMITIDO PARA BREVIDADE) ...
// (Pode manter o restante do código do perfil exatamente como você já tem)

const formData = reactive({
  nome: '',
  email: '',
  avatar: '' 
})

const userInitials = computed(() => {
  const name = authStore.user?.nome || 'Usuario'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
})

const openProfile = () => {
  if (authStore.user) {
    formData.nome = authStore.user.nome
    formData.email = authStore.user.email
    formData.avatar = authStore.user.avatar || ''
  }
  showProfileModal.value = true
  showNotifications.value = false
}

const triggerFileInput = () => fileInput.value?.click()

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    if (file.size > 2 * 1024 * 1024) return notification.showError('A imagem deve ter no máximo 2MB.')

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = document.createElement('img')
      img.src = e.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const MAX_WIDTH = 300
        const scaleSize = MAX_WIDTH / img.width
        canvas.width = MAX_WIDTH
        canvas.height = img.height * scaleSize
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
        formData.avatar = canvas.toDataURL('image/jpeg', 0.7)
      }
    }
    reader.readAsDataURL(file)
  }
}

const handleUpdateProfile = async () => {
  isSaving.value = true
  try {
    if (!authStore.user?.id) return
    const { data } = await api.patch(`/usuario/${authStore.user.id}`, {
      nome: formData.nome, avatar: formData.avatar 
    })
    if (data.success) {
      const updatedUser = { ...authStore.user, ...data.data }
      authStore.user = updatedUser
      localStorage.setItem('horaga_user', JSON.stringify(updatedUser))
      showProfileModal.value = false
      notification.showSuccess('Perfil atualizado com sucesso!', () => window.location.reload())
    }
  } catch (error: any) {
    notification.showError('Erro ao atualizar: ' + (error.response?.data?.message || error.message))
  } finally {
    isSaving.value = false
  }
}

// --- ESCUTANDO O EVENTO GLOBAL ---
onMounted(() => {
  generateNotifications()
  // Adiciona o ouvinte: Sempre que 'booking:updated' for disparado, roda generateNotifications
  window.addEventListener('booking:updated', generateNotifications)
})

onUnmounted(() => {
  // Limpeza de memória ao destruir o componente
  window.removeEventListener('booking:updated', generateNotifications)
})
</script>

<template>
  <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 z-30 flex-shrink-0 relative">
    
    <div class="flex items-center gap-4">
      <button @click="$emit('toggleSidebar')" class="md:hidden text-slate-600 hover:bg-slate-100 p-2 rounded-md">
        <Menu class="w-6 h-6" />
      </button>
      <h2 class="text-lg font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-none">
        {{ title || `Olá, ${authStore.user?.nome ? authStore.user.nome.split(' ')[0] : 'Visitante'}` }}
      </h2>
    </div>
    
    <div class="flex items-center gap-4">
      
      <div class="relative">
        <button 
          @click.stop="showNotifications = !showNotifications"
          class="text-slate-500 hover:bg-slate-100 p-2 rounded-full relative transition-colors"
          :class="{'bg-slate-100 text-rose-600': showNotifications}"
        >
          <Bell class="w-5 h-5" />
          <span v-if="notifications.length > 0" class="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white animate-pulse"></span>
        </button>

        <div 
          v-if="showNotifications"
          class="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in origin-top-right"
        >
          <div class="p-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 class="font-bold text-sm text-slate-800">Notificações</h3>
            <span class="text-xs text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">{{ notifications.length }} novas</span>
          </div>
          
          <div class="max-h-[300px] overflow-y-auto">
            <div v-if="notifications.length === 0" class="p-8 text-center text-slate-400 text-sm">
              Nenhuma notificação no momento.
            </div>
            
            <div 
              v-for="notif in notifications" 
              :key="notif.id"
              class="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 items-start last:border-0"
            >
              <div 
                class="mt-0.5 w-2 h-2 rounded-full shrink-0"
                :class="notif.type === 'warning' ? 'bg-amber-500 shadow-amber-200 shadow-sm' : 'bg-blue-500 shadow-blue-200 shadow-sm'"
              ></div>
              
              <div>
                <p class="text-xs font-bold text-slate-800 mb-0.5">{{ notif.title }}</p>
                <p class="text-xs text-slate-500 leading-relaxed">{{ notif.message }}</p>
                <p class="text-[10px] text-slate-400 mt-1 font-medium">{{ notif.time }}</p>
              </div>
            </div>
          </div>
          
          <div class="fixed inset-0 z-[-1]" @click="showNotifications = false"></div>
        </div>
      </div>
      
      <button 
        @click="openProfile"
        class="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-800 font-bold text-sm border border-rose-200 hover:ring-2 hover:ring-rose-200 transition-all cursor-pointer overflow-hidden"
        title="Meu Perfil"
      >
        <img v-if="authStore.user?.avatar && authStore.user.avatar.length > 20" :src="authStore.user.avatar" alt="Avatar" class="w-full h-full object-cover" />
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
             <img v-if="formData.avatar && formData.avatar.length > 20" :src="formData.avatar" class="w-full h-full object-cover" />
             <User v-else class="w-8 h-8" />
             
             <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <Camera class="w-8 h-8 text-white" />
             </div>
          </div>
          
          <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFileChange" />
          
          <button type="button" @click="triggerFileInput" class="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1">
            <Upload class="w-3 h-3" /> Alterar Foto
          </button>
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">Nome Completo</label>
          <input v-model="formData.nome" type="text" required class="w-full h-10 px-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all" />
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">E-mail</label>
          <input 
            v-model="formData.email" 
            type="email" 
            disabled 
            class="w-full h-10 px-3 rounded-md border border-slate-200 bg-slate-100 text-slate-500 text-sm cursor-not-allowed select-none"
            title="Não é possível alterar o e-mail cadastrado."
          />
          <p class="text-[10px] text-slate-400 mt-1">O e-mail não pode ser alterado.</p>
        </div>

        <div class="flex gap-3 pt-2">
          <button type="button" @click="showProfileModal = false" class="flex-1 h-10 rounded-md border border-slate-300 font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancelar</button>
          <button type="submit" :disabled="isSaving" class="flex-1 h-10 rounded-md bg-[#be123c] text-white font-bold hover:bg-[#9f1239] disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm">
            <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
            <span v-else>Salvar Alterações</span>
          </button>
        </div>
      </form>
    </Modal>

  </header>
</template>