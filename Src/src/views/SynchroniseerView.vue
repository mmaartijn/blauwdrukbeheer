<template>
  <div class="py-8 max-w-xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold text-gray-800">Synchroniseer</h1>

    <!-- Niet geconfigureerd -->
    <div v-if="!isConfigured" class="bg-amber-50 border border-amber-200 rounded-xl p-6 space-y-3">
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        <div class="space-y-1">
          <p class="text-sm font-semibold text-amber-800">Geen data-repository ingesteld</p>
          <p class="text-sm text-amber-700">
            Om te synchroniseren moet je eerst een GitHub-repository en toegangstoken instellen.
          </p>
        </div>
      </div>
      <RouterLink
        to="/instellingen"
        class="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 underline"
      >
        Ga naar Instellingen
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </RouterLink>
    </div>

    <!-- Geconfigureerd -->
    <template v-else>

      <!-- Wijzigingen publiceren -->
      <div v-if="store.dirtyFiles.size > 0" class="rounded-xl border border-blue-200 bg-blue-50 p-6 space-y-4">
        <div class="space-y-1">
          <p class="text-sm font-semibold text-blue-800">Wijzigingen publiceren</p>
          <p class="text-sm text-blue-700">
            Je lokale wijzigingen worden via een pull request gepubliceerd naar de data-repository.
          </p>
        </div>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Naam wijziging</label>
            <input
              v-model="prTitle"
              type="text"
              placeholder="Bijv. Keywords periode 2 bijgewerkt"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Omschrijving <span class="text-gray-400 font-normal">(optioneel)</span></label>
            <textarea
              v-model="prBody"
              rows="3"
              placeholder="Wat is er gewijzigd en waarom?"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
            />
          </div>
        </div>

        <!-- Foutmelding -->
        <p v-if="publishError" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {{ publishError }}
        </p>

        <!-- Succes: PR-link -->
        <div v-if="prUrl" class="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 space-y-1">
          <p class="font-medium">Pull request aangemaakt!</p>
          <a :href="prUrl" target="_blank" rel="noopener" class="text-blue-600 underline break-all">{{ prUrl }}</a>
        </div>

        <div v-if="!prUrl" class="space-y-2">
          <button
            @click="publish"
            :disabled="publishing || !prTitle.trim()"
            class="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {{ publishing ? 'Bezig met publiceren…' : 'Publiceren' }}
          </button>
          <p v-if="pdfProgress" class="text-xs text-blue-600 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 animate-spin flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            {{ pdfProgress }}
          </p>
        </div>
      </div>

      <!-- Status-kaart (GitHub sync) -->
      <div
        class="rounded-xl border p-6 space-y-4"
        :class="statusCardClass"
      >
        <!-- Laden -->
        <div v-if="checking" class="flex items-center gap-3 text-sm text-gray-500">
          <svg class="w-5 h-5 animate-spin text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          Controleren op updates…
        </div>

        <!-- Nooit gesynchroniseerd -->
        <div v-else-if="neverSynced" class="space-y-1">
          <p class="text-sm font-semibold text-gray-700">Nog niet gesynchroniseerd</p>
          <p class="text-sm text-gray-500">
            Er is nog geen lokale versie van de data opgeslagen.
            Haal de laatste versie op om te beginnen.
          </p>
        </div>

        <!-- Up-to-date -->
        <div v-else-if="!store.hasUpdates" class="flex items-center gap-2">
          <svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <p class="text-sm font-semibold text-green-700">Je hebt de meest recente versie</p>
        </div>

        <!-- Updates beschikbaar -->
        <div v-else class="space-y-3">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7zm-1 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
            </svg>
            <p class="text-sm font-semibold text-amber-700">Er is een nieuwere versie beschikbaar op GitHub</p>
          </div>

          <!-- Per-bestand status -->
          <ul class="space-y-1.5">
            <li
              v-for="(status, file) in store.updateStatus"
              :key="file"
              class="flex items-center gap-2 text-xs"
            >
              <span
                class="inline-block w-2 h-2 rounded-full flex-shrink-0"
                :class="status.hasUpdate ? 'bg-amber-400' : 'bg-green-400'"
              ></span>
              <span class="font-mono text-gray-700">{{ file }}</span>
              <span :class="status.hasUpdate ? 'text-amber-600' : 'text-green-600'">
                {{ status.hasUpdate ? 'gewijzigd op GitHub' : 'up-to-date' }}
              </span>
            </li>
          </ul>
        </div>

        <!-- Knoppen -->
        <div v-if="!checking" class="pt-1 space-y-3">
          <div class="flex items-center gap-3">
            <button
              @click="syncFromGitHub"
              :disabled="syncing || discarding"
              class="px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              :class="store.hasUpdates || neverSynced
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'"
            >
              {{ syncing ? 'Ophalen…' : 'Laatste versie ophalen' }}
            </button>
            <button
              v-if="!syncing && !discarding"
              @click="runCheck"
              class="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Opnieuw controleren
            </button>
          </div>

          <!-- Wijzigingen weggooien — alleen tonen als er dirty bestanden zijn -->
          <div v-if="store.dirtyFiles.size > 0 && !syncing">
            <div v-if="!confirmDiscard" class="flex items-center gap-2">
              <button
                @click="confirmDiscard = true"
                class="text-xs text-red-500 hover:text-red-700 underline"
              >
                Lokale wijzigingen weggooien
              </button>
            </div>
            <div v-else class="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <span class="text-xs text-red-700 font-medium">Zeker weten? Lokale wijzigingen gaan permanent verloren.</span>
              <button
                @click="doDiscard"
                :disabled="discarding"
                class="text-xs font-semibold text-red-700 hover:text-red-900 underline disabled:opacity-50"
              >
                {{ discarding ? 'Bezig…' : 'Ja, weggooien' }}
              </button>
              <button @click="confirmDiscard = false" class="text-xs text-gray-500 hover:text-gray-700 underline">
                Annuleren
              </button>
            </div>
          </div>
        </div>

        <p v-if="syncError" class="text-sm text-red-600">{{ syncError }}</p>
      </div>

      <!-- Repo-info -->
      <p class="text-xs text-gray-400">
        Repository:
        <span class="font-mono text-gray-600">{{ owner }}/{{ repo }}</span>
      </p>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useBlauwdrukStore } from '@/stores/blauwdruk'
import { SETTINGS_KEYS, CACHE_KEYS } from '@/constants/api'

const store = useBlauwdrukStore()

const owner = localStorage.getItem(SETTINGS_KEYS.GH_OWNER) || ''
const repo  = localStorage.getItem(SETTINGS_KEYS.GH_REPO)  || ''

const isConfigured = computed(() => !!(owner && repo))
const neverSynced  = computed(() => {
  const shas = localStorage.getItem(CACHE_KEYS.SHAS)
  return !shas || Object.keys(JSON.parse(shas)).length === 0
})

const checking       = ref(false)
const syncing        = ref(false)
const discarding     = ref(false)
const confirmDiscard = ref(false)
const syncError      = ref(null)

// Publiceren
const today    = new Date().toISOString().slice(0, 10)
const prTitle  = ref(`Blauwdruk update ${today}`)
const prBody   = ref('')
const publishing   = ref(false)
const publishError = ref(null)
const prUrl        = ref(null)
const pdfProgress  = ref(null)

// Branchnaam automatisch afgeleid van de PR-titel
const branchName = computed(() => {
  const slug = prTitle.value
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // verwijder diakritische tekens
    .replace(/[^a-z0-9\s-]/g, '')                     // alleen letters, cijfers, spaties en koppeltekens
    .trim()
    .replace(/\s+/g, '-')                              // spaties → koppelteken
    .replace(/-+/g, '-')                               // meerdere koppeltekens samenvoegen
    .slice(0, 50)                                      // max branch-lengte
  return `update/${slug}`
})

const statusCardClass = computed(() => {
  if (checking.value)                         return 'border-gray-200 bg-white'
  if (neverSynced.value)                      return 'border-gray-200 bg-gray-50'
  if (store.hasUpdates)                       return 'border-amber-200 bg-amber-50'
  return 'border-green-200 bg-green-50'
})

async function runCheck() {
  checking.value = true
  await store.checkForUpdates()
  checking.value = false
}

async function syncFromGitHub() {
  syncing.value = true
  syncError.value = null
  try {
    await store.refreshFromGitHub()
    await store.checkForUpdates()
  } catch (e) {
    syncError.value = e.message
  } finally {
    syncing.value = false
  }
}

async function doDiscard() {
  discarding.value = true
  syncError.value = null
  try {
    await store.discardChanges()
    confirmDiscard.value = false
    await store.checkForUpdates()
  } catch (e) {
    syncError.value = e.message
  } finally {
    discarding.value = false
  }
}

async function publish() {
  publishing.value = true
  publishError.value = null
  pdfProgress.value = null
  try {
    prUrl.value = await store.publishChanges(
      branchName.value,
      prTitle.value,
      prBody.value,
      (current, total, naam) => { pdfProgress.value = `PDF genereren ${current}/${total}: ${naam}` }
    )
  } catch (e) {
    publishError.value = e.message
  } finally {
    publishing.value = false
    pdfProgress.value = null
  }
}

onMounted(async () => {
  if (isConfigured.value) {
    await runCheck()
  }
})
</script>
