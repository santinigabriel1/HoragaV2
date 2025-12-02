<script setup lang="ts">
import { RouterView } from 'vue-router'
import SuccessModal from '@/components/ui/SuccessModal.vue' 
</script>

<template>
  <SuccessModal />
  
  <RouterView />
</template>

<style>
body, html {
  height: 100%;
  margin: 0;
}
</style>