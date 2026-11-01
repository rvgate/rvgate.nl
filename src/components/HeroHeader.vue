<script setup>
defineProps({
  profile: { type: Object, required: true },
})
</script>

<template>
  <header class="hero">
    <img :src="profile.avatar" :alt="profile.name" class="avatar" width="120" height="120">
    <h1>{{ profile.name }}</h1>
    <p class="role">{{ profile.role }}</p>
    <p v-if="profile.intro" class="intro">{{ profile.intro }}</p>
  </header>
</template>

<style scoped>
.hero {
  max-width: 760px;
  margin: 0 auto;
  padding: 96px 24px 32px;
  text-align: center;
}

.avatar {
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid var(--border);
  box-shadow:
    0 0 0 6px color-mix(in srgb, var(--accent) 14%, transparent),
    0 20px 40px var(--shadow);
}

h1 {
  margin: 24px 0 4px;
  font-size: clamp(2.2rem, 6vw, 3.4rem);
  line-height: 1.1;
  letter-spacing: -.02em;
}

.role {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  background: linear-gradient(90deg, var(--blue), var(--teal));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.intro {
  max-width: 560px;
  margin: 20px auto 0;
  color: var(--muted);
}

@media (max-width: 600px) {
  .hero { padding-top: 64px; }
}

@media print {
  .hero { padding: 0 0 16px; }
  .role { color: var(--accent); background: none; }
}

@media print {
  .hero { max-width: none; padding: 0 0 6px; }
  .avatar { width: 72px; height: 72px; box-shadow: none; }
  h1 { margin-top: 8px; font-size: 1.9rem; }
  .intro { margin-top: 8px; max-width: none; }
}
</style>
