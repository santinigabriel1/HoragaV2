import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  const isVisible = ref(false)
  const message = ref('')
  const type = ref<'success' | 'error'>('success')
  const onAfterClose = ref<(() => void) | null>(null)

  // Ação para chamar o sucesso
  function showSuccess(msg: string, callback?: () => void) {
    message.value = msg
    type.value = 'success'
    onAfterClose.value = callback || null
    isVisible.value = true
  }

  // Ação para chamar erro
  function showError(msg: string) {
    message.value = msg
    type.value = 'error'
    onAfterClose.value = null
    isVisible.value = true
  }

  // Fecha e executa o callback (ex: recarregar lista)
  function close() {
    isVisible.value = false
    if (onAfterClose.value) {
      onAfterClose.value() // Executa a função de recarregar/atualizar
    }
    // Limpa após um tempo para a animação terminar
    setTimeout(() => {
      onAfterClose.value = null
    }, 300)
  }

  return { isVisible, message, type, showSuccess, showError, close }
})