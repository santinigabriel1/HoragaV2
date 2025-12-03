Bem observado\! O cálculo matemático automático (`* 1.15` ou `* 0.85`) quebrava o padrão visual dos preços terminados em **,90** (ficava algo como R$ 22,88).

Para resolver isso e deixar tudo profissional, defini **preços fixos** para cada ciclo, garantindo que todos terminem com aquele visual comercial agradável (19,90, 24,90, etc.).

Aqui está o código completo corrigido de **`src/views/Home.vue`**:

### O que mudou:

1.  **Lógica de Preços:** Substituí a fórmula matemática por uma tabela (`pricingTable`) onde defini manualmente valores "bonitos" para 6 meses, 1 ano e 2 anos.
2.  **Manutenção das Animações:** A lógica de *Scroll Reveal* continua lá.

<!-- end list -->

```html
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Menu, X, Calendar, Users, BarChart3, 
  Zap, Check, ArrowRight, Bell
} from 'lucide-vue-next'

const router = useRouter()
const menuOpen = ref(false)
const activeFeatureIndex = ref(0)
const billingCycle = ref<'6meses' | '1ano' | '2anos'>('1ano')

// --- LÓGICA DE ANIMAÇÃO DE SCROLL ---
let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
      } else {
        entry.target.classList.remove('is-visible')
      }
    })
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  })

  setTimeout(() => {
    const elements = document.querySelectorAll('.animate-on-scroll')
    elements.forEach((el) => observer?.observe(el))
  }, 100)
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})

const navigateTo = (path: string) => {
  router.push(path)
  menuOpen.value = false
}

// --- TABELA DE PREÇOS FIXOS (Tudo terminando em ,90) ---
// Definimos valores manuais para garantir o visual "Psicológico"
const pricingTable: Record<string, Record<string, number>> = {
  'Starter': {
    '6meses': 24.90, // Um pouco mais caro
    '1ano': 19.90,   // Base
    '2anos': 17.90   // Desconto
  },
  'Standard': {
    '6meses': 59.90,
    '1ano': 49.90,
    '2anos': 39.90
  },
  'Pro': {
    '6meses': 99.90,
    '1ano': 79.90,
    '2anos': 69.90
  }
}

const getPrice = (planName: string) => {
  if (planName === 'Free') return 'R$ 0'
  
  // Busca o valor exato na tabela
  const price = pricingTable[planName][billingCycle.value]
  
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const getPeriodText = () => {
  if (billingCycle.value === '6meses') return '/mês (semestral)'
  if (billingCycle.value === '2anos') return '/mês (bienal)'
  return '/mês'
}

const plans = [
  { 
    name: 'Free', 
    desc: 'Para quem está começando e quer testar.', 
    features: ['1 Instituição', 'Até 3 Salas de Aula', '5 Usuários Admin', 'Suporte via Comunidade', 'Histórico de 30 dias'], 
    button: 'Começar Agora', 
    highlight: false 
  },
  { 
    name: 'Starter', 
    desc: 'Para pequenos times e escolas locais.', 
    features: ['2 Instituições', '10 Salas de Aula', '15 Usuários Admin', 'Relatórios Básicos', 'Suporte via E-mail', 'Histórico de 6 meses'], 
    button: 'Testar Grátis', 
    highlight: false 
  },
  { 
    name: 'Standard', 
    desc: 'Para escolas em crescimento rápido.', 
    features: ['Instituições Ilimitadas', 'Salas Ilimitadas', 'Usuários Ilimitados', 'Relatórios Avançados', 'Suporte Prioritário', 'Histórico Ilimitado', 'Gestão de Conflitos'], 
    button: 'Testar Grátis', 
    highlight: true, 
    tag: 'O MAIS POPULAR'
  },
  { 
    name: 'Pro', 
    desc: 'Gestão completa e personalizada.', 
    features: ['Tudo do Standard', 'API Dedicada', 'SSO (Single Sign-On)', 'SLA Garantido 99.9%', 'Gestor de Conta', 'Treinamento Incluso', 'Backup Diário'], 
    button: 'Testar Grátis', 
    highlight: false 
  },
]

const interactiveFeatures = [
  {
    title: 'Gerenciamento de Calendário',
    desc: 'Veja todos os agendamentos, aulas e manutenções em um lugar só.',
    image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?q=80&w=2539&auto=format&fit=crop',
    icon: Calendar
  },
  {
    title: 'Gestão de Equipes',
    desc: 'Coordene professores e coordenadores com controle total de acesso.',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2664&auto=format&fit=crop',
    icon: Users
  },
  {
    title: 'Relatórios e Análise',
    desc: 'Descubra laboratórios subutilizados e tome decisões baseadas em dados.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop',
    icon: BarChart3
  },
  {
    title: 'Notificações Automáticas',
    desc: 'Avisos sobre conflitos e manutenções. Ninguém perde viagem.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2670&auto=format&fit=crop',
    icon: Bell
  }
]
</script>

<template>
  <div class="w-full min-h-screen bg-white font-sans text-slate-600">
    
    <nav class="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="flex items-center gap-2 cursor-pointer" @click="navigateTo('/')">
            <img src="/logo-horaga.png" alt="Logo" class="w-8 h-8 rounded-lg" />
            <span class="text-xl font-bold text-slate-900 tracking-tight">HORAGÁ</span>
          </div>
          <div class="hidden md:flex items-center gap-8">
            <a href="#funcionalidades" class="text-sm font-medium hover:text-[#be123c] transition-colors">Funcionalidades</a>
            <a href="#precos" class="text-sm font-medium hover:text-[#be123c] transition-colors">Planos</a>
            <div class="flex items-center gap-4 ml-4">
              <button @click="navigateTo('/login')" class="text-sm font-bold text-slate-700 hover:text-[#be123c]">Entrar</button>
              <button @click="navigateTo('/register')" class="bg-[#be123c] hover:bg-[#9f1239] text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-rose-200 hover:shadow-rose-300 hover:-translate-y-0.5">
                Criar Conta Grátis
              </button>
            </div>
          </div>
          <button class="md:hidden p-2 text-slate-600" @click="menuOpen = !menuOpen">
            <Menu v-if="!menuOpen" class="w-6 h-6" />
            <X v-else class="w-6 h-6" />
          </button>
        </div>
      </div>
      <div v-if="menuOpen" class="md:hidden bg-white border-t border-slate-100 p-4 space-y-4 absolute w-full shadow-xl">
        <a href="#funcionalidades" class="block font-medium hover:text-[#be123c]" @click="menuOpen = false">Funcionalidades</a>
        <a href="#precos" class="block font-medium hover:text-[#be123c]" @click="menuOpen = false">Planos</a>
        <div class="pt-4 border-t border-slate-100 flex flex-col gap-3">
          <button @click="navigateTo('/login')" class="w-full py-3 rounded-lg border border-slate-200 font-bold text-slate-700 hover:text-[#be123c] hover:border-rose-200">Entrar</button>
          <button @click="navigateTo('/register')" class="w-full py-3 rounded-lg bg-[#be123c] text-white font-bold hover:bg-[#9f1239]">Criar Conta</button>
        </div>
      </div>
    </nav>

    <section class="pt-32 pb-16 lg:pt-44 lg:pb-24 overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-on-scroll">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-wide mb-6 border border-rose-100">
          <span class="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
          Novo: Integração via API
        </div>
        <h1 class="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
          Economize tempo com uma <br />
          <span class="text-[#be123c]">agenda online inteligente</span>
        </h1>
        <p class="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Simplifique a gestão de laboratórios e salas de aula. Elimine conflitos de horário e centralize o controle da sua instituição em uma única plataforma.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button @click="navigateTo('/register')" class="w-full sm:w-auto px-8 py-4 bg-[#be123c] text-white rounded-lg font-bold text-lg shadow-xl shadow-rose-200 hover:shadow-2xl hover:bg-[#9f1239] transition-all flex items-center justify-center gap-2 hover:-translate-y-1">
            Começar Agora <ArrowRight class="w-5 h-5" />
          </button>
          <button class="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-lg font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:text-[#be123c]">
            Saiba Mais
          </button>
        </div>
      </div>
    </section>

    <section id="funcionalidades" class="py-16 bg-white animate-on-scroll">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-slate-50 rounded-2xl p-6 md:p-10 border border-slate-100">
          <div class="grid lg:grid-cols-2 gap-8 items-center">
            <div class="space-y-2">
              <div v-for="(feature, index) in interactiveFeatures" :key="index" @click="activeFeatureIndex = index" class="cursor-pointer p-4 rounded-lg transition-all duration-300 border-l-[3px]" :class="activeFeatureIndex === index ? 'bg-white shadow-sm border-[#be123c]' : 'bg-transparent border-transparent hover:bg-white/50 opacity-80 hover:opacity-100'">
                <h3 class="text-lg font-bold mb-1 flex items-center gap-2" :class="activeFeatureIndex === index ? 'text-[#be123c]' : 'text-slate-700'">
                   <component :is="feature.icon" class="w-4 h-4" /> {{ feature.title }}
                </h3>
                <p class="text-xs leading-relaxed" :class="activeFeatureIndex === index ? 'text-slate-600' : 'text-slate-400'">{{ feature.desc }}</p>
              </div>
            </div>
            <div class="relative h-[300px] md:h-[380px] rounded-xl overflow-hidden shadow-md border-2 border-white bg-slate-200">
              <TransitionGroup name="fade">
                <div v-for="(feature, index) in interactiveFeatures" :key="feature.title" v-show="activeFeatureIndex === index" class="absolute inset-0 w-full h-full">
                  <img :src="feature.image" :alt="feature.title" class="w-full h-full object-cover" />
                  <div class="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent"></div>
                </div>
              </TransitionGroup>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="precos" class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="text-center mb-20 animate-on-scroll">
          <h2 class="text-4xl font-extrabold text-slate-900 mb-8">Plano para empresas de qualquer porte</h2>
          <div class="inline-flex bg-slate-100 p-1.5 rounded-lg relative shadow-inner">
            <button @click="billingCycle = '6meses'" class="px-6 py-2 rounded-md text-sm font-bold transition-all relative z-10" :class="billingCycle === '6meses' ? 'bg-white text-[#be123c] shadow-sm' : 'text-slate-500 hover:text-slate-900'">6 meses</button>
            <button @click="billingCycle = '1ano'" class="px-6 py-2 rounded-md text-sm font-bold transition-all relative z-10" :class="billingCycle === '1ano' ? 'bg-[#be123c] text-white shadow-md' : 'text-slate-500 hover:text-slate-900'">1 ano</button>
            <button @click="billingCycle = '2anos'" class="px-6 py-2 rounded-md text-sm font-bold transition-all relative z-10" :class="billingCycle === '2anos' ? 'bg-white text-[#be123c] shadow-sm' : 'text-slate-500 hover:text-slate-900'">2 anos</button>
            <span v-show="billingCycle === '1ano'" class="absolute -top-8 left-1/2 -translate-x-1/2 w-max bg-slate-800 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg animate-bounce">
              Ganhe 3 meses grátis 🎁
            </span>
          </div>
        </div>

        <div class="flex flex-col md:flex-row max-w-6xl mx-auto border border-slate-200 rounded-2xl shadow-xl overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-200 animate-on-scroll">
          
          <div 
            v-for="plan in plans" 
            :key="plan.name" 
            class="relative flex flex-col p-8 transition-all duration-300 group flex-1 bg-white"
            :class="plan.highlight ? 'z-10' : 'hover:bg-slate-50'"
          >
            
            <div v-if="plan.highlight" class="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-rose-500 to-orange-500"></div>
            <div v-if="plan.highlight" class="absolute top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[9px] font-bold px-3 py-1 rounded-b-md uppercase tracking-widest shadow-md">
              <Zap class="w-3 h-3 inline-block mr-1 mb-0.5" /> {{ plan.tag }}
            </div>

            <div class="mb-6 pt-4">
              <h3 class="text-2xl font-bold text-slate-900">{{ plan.name }}</h3>
              <p class="text-xs text-slate-500 mt-2 leading-relaxed min-h-[40px]">{{ plan.desc }}</p>
            </div>

            <div class="mb-8">
              <div class="flex items-baseline gap-1">
                <span class="text-4xl font-extrabold text-slate-900 tracking-tight">{{ getPrice(plan.name) }}</span>
              </div>
              <span class="text-xs text-slate-400 font-medium block mt-1">{{ getPeriodText() }}</span>
              
              <div v-if="plan.name !== 'Free'" class="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-100">
                <span>🎉</span> + 1 mês grátis
              </div>
              <div v-else class="mt-3 h-[26px]"></div>
            </div>

            <button 
              class="w-full py-3 rounded-lg font-bold text-sm transition-all mb-8 border shadow-sm transform active:scale-95"
              :class="plan.highlight 
                ? 'bg-[#be123c] text-white border-transparent hover:bg-[#9f1239] hover:shadow-md' 
                : 'bg-white text-[#be123c] border-rose-200 hover:bg-rose-50 hover:border-rose-300'"
            >
              {{ plan.button }}
            </button>

            <div class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Recursos</div>

            <ul class="flex-1 space-y-3">
              <li v-for="feat in plan.features" :key="feat" class="flex items-start gap-3 text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                <Check class="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <span class="leading-tight text-xs font-medium">{{ feat }}</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </section>

    <footer class="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 animate-on-scroll">
      <div class="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8 mb-8">
        <div class="col-span-1 md:col-span-2">
          <div class="flex items-center gap-2 text-white mb-4">
            <Calendar class="w-6 h-6 text-[#be123c]" />
            <span class="text-xl font-bold">HORAGÁ</span>
          </div>
          <p class="text-sm max-w-xs leading-relaxed">
            A solução completa para agendamento de salas e laboratórios. Feito com ❤️ por Gabriel Santini.
          </p>
        </div>
        
        <div>
          <h4 class="text-white font-bold mb-4">Produto</h4>
          <ul class="space-y-2 text-sm">
            <li><a href="#funcionalidades" class="hover:text-white transition-colors">Funcionalidades</a></li>
            <li><a href="#precos" class="hover:text-white transition-colors">Planos</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Atualizações</a></li>
          </ul>
        </div>

        <div>
          <h4 class="text-white font-bold mb-4">Legal</h4>
          <ul class="space-y-2 text-sm">
            <li><a href="#" class="hover:text-white transition-colors">Termos de Uso</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Privacidade</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Contato</a></li>
          </ul>
        </div>
      </div>
      
      <div class="max-w-7xl mx-auto px-4 pt-8 border-t border-slate-800 text-center text-xs">
        &copy; 2025 Horagá Sistemas. Todos os direitos reservados.
      </div>
    </footer>

  </div>
</template>

<style scoped>
html { scroll-behavior: smooth; }

/* Transições para o Carousel de Funcionalidades */
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ANIMAÇÃO DE SCROLL (Scroll Reveal) */
.animate-on-scroll {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s ease-out, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: opacity, transform;
}

.animate-on-scroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
```