<script setup>
import { computed, watch } from 'vue'
import { useLanguage } from './composables/useLanguage.js'
import { useSkillFilter } from './composables/useSkillFilter.js'

import NetworkBackground from './components/NetworkBackground.vue'
import TopBar from './components/TopBar.vue'
import HeroHeader from './components/HeroHeader.vue'
import SectionNav from './components/SectionNav.vue'
import SectionTitle from './components/SectionTitle.vue'
import SkillsSection from './components/SkillsSection.vue'
import ExperienceSection from './components/ExperienceSection.vue'
import ProjectsSection from './components/ProjectsSection.vue'
import ServicesSection from './components/ServicesSection.vue'
import ContactSection from './components/ContactSection.vue'
import FavoritesSection from './components/FavoritesSection.vue'

// all content, already translated to the current language
const { cv, lang, locale } = useLanguage()

// a highlighted skill may not exist under the same name in another language
const { clear } = useSkillFilter()
watch(lang, clear)

// Which component renders each section id from content.js, and its props.
const registry = {
  skills: { component: SkillsSection, props: (c) => ({ skills: c.skills, categories: c.skillCategories, timelines: c.timelines, projects: c.projects }) },
  experience: { component: ExperienceSection, props: (c) => ({ timelines: c.timelines, locale: locale.value, labels: c.labels, effects: c.effects }) },
  projects: { component: ProjectsSection, props: (c) => ({ projects: c.projects }) },
  services: { component: ServicesSection, props: (c) => ({ services: c.services }) },
  'about-me': { component: FavoritesSection, props: (c) => ({ favorites: c.favorites }) },
  contact: { component: ContactSection, props: (c) => ({ contact: c.contact }) },
}

const sections = computed(() =>
  cv.value.sections
    .filter((s) => !s.hidden && registry[s.id])
    .map((s, i) => ({ ...s, number: i + 1, ...registry[s.id], props: registry[s.id].props(cv.value) })),
)

const footer = computed(() => cv.value.footer?.replace('{year}', new Date().getFullYear()))
</script>

<template>
  <NetworkBackground />
  <TopBar />

  <HeroHeader :profile="cv.profile" />
  <SectionNav :items="sections" />

  <main>
    <section
      v-for="section in sections"
      :id="section.id"
      :key="section.id"
      class="section"
      :class="{ 'no-print': section.print === false }"
    >
      <SectionTitle :number="section.number" :title="section.title" />
      <component :is="section.component" v-bind="section.props" />
    </section>
  </main>

  <footer v-if="footer" class="copyright">{{ footer }}</footer>
</template>

<style scoped>
.copyright {
  padding: 8px 24px 48px;
  text-align: center;
  font-size: .85rem;
  color: var(--muted);
}

@media print {
  .copyright { padding: 4px 0 0; }
}
</style>
