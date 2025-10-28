<!-- src/components/Sidebar.vue -->
<template>
  <aside class="sidebar">
    <div class="logo-section">
      <h2>HORAGÁ</h2>
    </div>
    <nav class="menu">
      <router-link to="/app" class="menu-item" active-class="menu-item--active">
        <span>📊 Dashboard</span>
      </router-link>
      <router-link to="/app/salas" class="menu-item" active-class="menu-item--active">
        <span>🚪 Salas</span>
      </router-link>
      <router-link to="/app/agendamentos" class="menu-item" active-class="menu-item--active">
        <span>📅 Agendamentos</span>
      </router-link>
      <router-link to="/app/usuarios" class="menu-item" active-class="menu-item--active">
        <span>👥 Usuários</span>
      </router-link>
      <router-link to="/app/configuracoes" class="menu-item" active-class="menu-item--active">
        <span>⚙️ Configurações</span>
      </router-link>
    </nav>
  </aside>
</template>

<script>
export default {
  name: 'Sidebar'
}
</script>

<style scoped>
.sidebar {
  width: 250px;
  background: rgba(172, 132, 220, 0.15);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.15);
  height: calc(100vh - 60px); /* altura total menos o header (60px) */
  position: fixed;
  top: 60px;
  left: 0;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  z-index: 90;
}

.logo-section {
  padding: 0 20px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
}

.logo-section h2 {
  color: white;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.5px;
}

.menu {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.menu-item {
  padding: 14px 20px;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 16px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  border-left: 4px solid transparent;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.menu-item--active {
  background: rgba(172, 132, 220, 0.4);
  color: white;
  font-weight: 600;
  border-left: 4px solid #ac84dc;
}
</style>