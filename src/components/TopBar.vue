<script setup>
import LanguageSwitcher from './LanguageSwitcher.vue'
import ThemeToggle from './ThemeToggle.vue'
</script>

<template>
  <div class="top-bar no-print">
    <LanguageSwitcher />
    <ThemeToggle />
  </div>
</template>

<style scoped>
.top-bar {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
