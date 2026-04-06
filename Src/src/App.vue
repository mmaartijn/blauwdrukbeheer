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

        <div class="ml-auto flex items-center gap-3">
          <!-- Dirty-badge + publiceer-knop -->
          <button
            v-if="store.dirtyFiles.size > 0"
            @click="publicerenOpen = true"
            class="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
          >
            <span class="inline-block w-2 h-2 rounded-full bg-white animate-pulse"></span>
            {{ store.dirtyFiles.size }} wijziging{{ store.dirtyFiles.size === 1 ? '' : 'en' }}
          </button>

          <!-- Synchroniseer-link met badge als er updates zijn -->
          <RouterLink
            to="/synchroniseer"
            class="relative text-sm font-medium hover:text-blue-200 transition-colors"
            active-class="text-white border-b-2 border-blue-300 pb-0.5"
          >
            Synchroniseer
            <span
              v-if="store.hasUpdates"
              class="absolute -top-1.5 -right-2.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse"
            ></span>
          </RouterLink>

          <!-- Instellingen-link -->
          <RouterLink
            to="/instellingen"
            class="text-sm font-medium hover:text-blue-200 transition-colors"
            active-class="text-white border-b-2 border-blue-300 pb-0.5"
          >
            Instellingen
          </RouterLink>
        </div>
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
        <p class="text-red-500 text-sm mb-4">
          Controleer je internetverbinding of configureer een data-repository via <RouterLink to="/instellingen" class="underline">Instellingen</RouterLink>.
        </p>
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

    <!-- Publiceren-modal (9d) -->
    <PublicerenModal v-if="publicerenOpen" @close="publicerenOpen = false" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useBlauwdrukStore } from '@/stores/blauwdruk'
import PublicerenModal from '@/components/PublicerenModal.vue'

const store = useBlauwdrukStore()
const publicerenOpen = ref(false)

const navLinks = [
  { to: '/matrix', label: 'Matrix' },
  { to: '/keywords', label: 'Keywords' },
]

onMounted(async () => {
  await store.loadAll()
  // Update-check op de achtergrond (stil bij geen internetverbinding/config)
  store.checkForUpdates()
})

</script>

