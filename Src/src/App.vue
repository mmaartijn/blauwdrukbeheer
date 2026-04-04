<template>
  <div class="h-screen flex flex-col bg-gray-50 overflow-hidden">
    <nav class="bg-blue-800 text-white shadow-md">
      <div class="max-w-7xl mx-auto px-4 flex items-center gap-6 h-14">
        <RouterLink to="/" class="font-bold text-lg tracking-tight hover:text-blue-200 transition-colors">Blauwdrukbeheer</RouterLink>
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

    <!-- Laadscherm -->
    <div v-if="store.isLoading" class="flex-1 flex flex-col items-center justify-center gap-4 text-gray-400">
      <svg class="w-8 h-8 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
      </svg>
      <span class="text-sm">Data laden…</span>
    </div>

    <!-- Foutscherm bij laden -->
    <div v-else-if="store.hasError" class="flex-1 flex items-start justify-center pt-16 px-4">
      <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p class="text-red-700 font-semibold mb-1">Laden mislukt</p>
        <p class="text-red-500 text-sm mb-4">Controleer of de dev-server actief is en de <code>/Data</code>-map beschikbaar is.</p>
        <button @click="store.loadAll()" class="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 font-medium">
          Opnieuw proberen
        </button>
      </div>
    </div>

    <main v-else class="flex-1 min-h-0 overflow-y-auto">
      <div class="max-w-7xl mx-auto px-4">
        <RouterView />
      </div>
    </main>

    <!-- Save-fout toast -->
    <Transition name="toast">
      <div
        v-if="store.saveError"
        class="fixed bottom-5 right-5 z-50 bg-red-600 text-white text-sm px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 max-w-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        <span>{{ store.saveError }}</span>
        <button @click="store.saveError = null" class="ml-auto text-red-200 hover:text-white flex-shrink-0">✕</button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useBlauwdrukStore } from '@/stores/blauwdruk'

const store = useBlauwdrukStore()

const navLinks = [
  { to: '/matrix', label: 'Matrix' },
  { to: '/keywords', label: 'Keywords' },
]

onMounted(async () => {
  await store.loadAll()
})

// Verberg de save-fout-toast automatisch na 5 seconden
watch(() => store.saveError, (val) => {
  if (val) setTimeout(() => { store.saveError = null }, 5000)
})
</script>

<style>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(0.5rem); }
</style>
