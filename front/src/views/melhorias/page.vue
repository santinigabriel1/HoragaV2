<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Lightbulb, FileText, Shield, BarChart3, FolderArchive, Languages, 
  Clock 
} from 'lucide-vue-next'
import Sidebar from '@/components/layout/Sidebar.vue'

const router = useRouter()
const sidebarOpen = ref(false)

const handleLogout = () => router.push('/login')

const features = [
  {
    id: 1,
    title: 'Gerar histórico/relatório de alunos em PDF',
    description: 'Funcionalidade para exportar o histórico completo e relatórios detalhados dos alunos em formato PDF, facilitando o compartilhamento e arquivamento de informações acadêmicas.',
    priority: 'Alta',
    status: 'Planejado',
    icon: FileText
  },
  {
    id: 2,
    title: 'Níveis de acesso no sistema',
    description: 'Implementar diferentes níveis de permissão (Admin, Professores, Secretaria) para garantir que cada usuário tenha acesso apenas às funcionalidades relevantes ao seu papel.',
    priority: 'Alta',
    status: 'Planejado',
    icon: Shield
  },
  {
    id: 3,
    title: 'Backend do Dashboard',
    description: 'Desenvolver e integrar o backend completo do dashboard para substituir os dados mockados por informações reais e dinâmicas do sistema.',
    priority: 'Média',
    status: 'Planejado',
    icon: BarChart3
  },
  {
    id: 4,
    title: 'Arquivamento de registros de avaliações',
    description: 'Sistema para armazenar e gerenciar arquivos físicos das avaliações dos alunos, incluindo provas no papel e áudios de provas de listening.',
    priority: 'Média',
    status: 'Planejado',
    icon: FolderArchive
  },
  {
    id: 5,
    title: 'Internacionalização',
    description: 'Internacionalização do sistema para dar suporte a inúmeros idiomas.',
    priority: 'Baixa',
    status: 'Planejado',
    icon: Languages
  }
]

// Cores das prioridades (Mantidas para semântica, mas ajustadas para harmonizar)
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Alta': return 'bg-rose-100 text-rose-700 border-rose-200'
    case 'Média': return 'bg-amber-50 text-amber-700 border-amber-200' // Amber combina bem com o Rose
    case 'Baixa': return 'bg-slate-100 text-slate-600 border-slate-200'
    default: return 'bg-slate-100 text-slate-600'
  }
}
</script>

<template>
  <div class="flex h-screen bg-slate-50">
    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" @logout="handleLogout" />

    <div class="flex-1 flex flex-col overflow-hidden">
      <Header title="Melhorias Futuras" @toggle-sidebar="sidebarOpen = true" />

      <main class="flex-1 overflow-y-auto p-4 md:p-8">
        <div class="max-w-7xl mx-auto">
          
          <div class="mb-8">
            <h1 class="text-3xl md:text-2xl font-bold text-slate-900 mb-2">FEATURES FUTURAS</h1>
            <p class="text-slate-500">Melhorias e funcionalidades planejadas para o sistema.</p>
          </div>

          <div class="bg-rose-50 border border-rose-200 rounded-lg p-5 mb-8 flex gap-4 items-start shadow-sm">
            <div class="bg-[#be123c] p-2 rounded-md text-white shrink-0 shadow-sm">
              <Lightbulb class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-bold text-rose-900 text-base mb-1">Roadmap de Desenvolvimento</h3>
              <p class="text-rose-700 text-sm leading-relaxed">
                Esta página apresenta as funcionalidades que estão no nosso radar para implementação futura. As prioridades podem ser ajustadas conforme as necessidades da instituição.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              v-for="item in features" 
              :key="item.id" 
              class="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all hover:border-rose-100 flex flex-col h-full group"
            >
              <div class="flex gap-4 mb-3">
                <div class="p-3 bg-rose-50 text-[#be123c] rounded-lg h-fit shrink-0 border border-rose-100 group-hover:bg-rose-100 transition-colors">
                  <component :is="item.icon" class="w-6 h-6" />
                </div>
                <div>
                  <h3 class="font-bold text-slate-900 text-lg leading-tight mb-2 group-hover:text-[#be123c] transition-colors">{{ item.title }}</h3>
                  <p class="text-sm text-slate-500 leading-relaxed">{{ item.description }}</p>
                </div>
              </div>

              <div class="mt-auto pt-4 flex gap-3">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
                  <Clock class="w-3 h-3" /> {{ item.status }}
                </span>

                <span 
                  class="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold border"
                  :class="getPriorityColor(item.priority)"
                >
                  Prioridade: {{ item.priority }}
                </span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  </div>
</template>