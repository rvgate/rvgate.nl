<script setup>
import ProjectCard from './ProjectCard.vue'

defineProps({ projects: { type: Array, required: true } })
</script>

<template>
  <ul class="cards projects">
    <ProjectCard v-for="(project, i) in projects" :key="i" :project="project" />
  </ul>
</template>

<style scoped>
/* two wide columns instead of three narrow ones */
.projects { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }

@media (max-width: 600px) {
  .projects { grid-template-columns: 1fr; }
}
</style>
