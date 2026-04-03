<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-blue-800 text-white shadow-md">
      <div class="max-w-7xl mx-auto px-4 flex items-center gap-6 h-14">
        <span class="font-bold text-lg tracking-tight">Blauwdrukbeheer</span>
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="text-sm font-medium hover:text-blue-200 transition-colors"
          active-class="text-white border-b-2 border-blue-300 pb-0.5"
        >
          {{ link.label }}
        </RouterLink>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto px-4 py-6">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useBlauwdrukStore } from '@/stores/blauwdruk'

const store = useBlauwdrukStore()

const navLinks = [
  { to: '/matrix', label: 'Matrix' },
  { to: '/modules', label: 'Modules' },
  { to: '/leeruitkomsten', label: 'Leeruitkomsten' },
  { to: '/keywords', label: 'Keywords' },
]

onMounted(async () => {
  await store.loadAll()
})
</script>
