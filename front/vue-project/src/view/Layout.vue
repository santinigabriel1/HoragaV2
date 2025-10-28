<!-- src/views/Layout.vue -->
<template>
  <div class="app-layout">
    <HeaderApp />
    <div class="main-area">
      <Sidebar />
      <main class="content">
        <router-view /> <!-- Aqui carrega HomeView, SalasView, etc. -->
      </main>
    </div>
  </div>
</template>

<script>
import HeaderApp from '../components/HeaderApp.vue'
import Sidebar from '../components/Sidebar.vue'

export default {
  name: 'Layout',
  components: {
    HeaderApp,
    Sidebar
  }
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-area {
  display: flex;
  flex: 1;
}

.content {
  flex: 1;
  margin-left: 250px; /* largura da sidebar */
  padding: 24px;
  color: white;
}
</style>