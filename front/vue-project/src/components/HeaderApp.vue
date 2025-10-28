<!-- src/components/HeaderApp.vue -->
<template>
  <header class="header-app">
    <h2>HORAGÁ - Controle de Agendamentos</h2>
  </header>
</template>

<script>
export default {
  name: 'HeaderApp'
}
</script>

<style scoped>
.header-app {
  background: rgba(172, 132, 220, 0.25);
  color: white;
  padding: 16px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  position: sticky;
  top: 0;
  z-index: 100;
}
</style>