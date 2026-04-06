<template>
  <div class="py-8 max-w-xl mx-auto space-y-8">
    <h1 class="text-2xl font-bold text-gray-800">Instellingen</h1>

    <!-- Data-repository configuratie -->
    <section class="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <h2 class="text-base font-semibold text-gray-700">Data-repository</h2>
      <p class="text-sm text-gray-500">
        Geef de GitHub-repository op die de JSON-databestanden bevat.
        Wijzigingen worden via een pull request naar deze repository gepubliceerd.
      </p>

      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">GitHub-gebruikersnaam of organisatie</label>
          <input
            v-model="owner"
            type="text"
            placeholder="bijv. mmaartijn"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Repository-naam</label>
          <input
            v-model="repo"
            type="text"
            placeholder="bijv. blauwdruk-data"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="flex gap-2">
          <button @click="saveRepoSettings" class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium">
            Opslaan
          </button>
          <button
            v-if="owner && repo"
            @click="handleRefresh"
            :disabled="isRefreshing"
            class="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
          >
            {{ isRefreshing ? 'Vernieuwen…' : 'Vernieuwen' }}
          </button>
        </div>
        <p v-if="repoSaved" class="text-sm text-green-600">Instellingen opgeslagen.</p>
      </div>
    </section>

    <!-- GitHub-authenticatie -->
    <section class="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <h2 class="text-base font-semibold text-gray-700">GitHub-toegangstoken</h2>

      <!-- Ingelogd -->
      <div v-if="auth.isAuthenticated.value" class="space-y-3">
        <div class="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
          <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          Token opgeslagen. Je kunt wijzigingen publiceren via pull requests.
        </div>
        <button @click="auth.logout()" class="px-4 py-2 bg-red-50 text-red-700 border border-red-200 text-sm rounded-lg hover:bg-red-100 font-medium">
          Token verwijderen
        </button>
      </div>

      <!-- Niet ingelogd: instructies + PAT invoer -->
      <div v-else class="space-y-5">

        <!-- Stap-voor-stap instructies -->
        <div class="space-y-3">
          <p class="text-sm font-medium text-gray-700">Hoe maak je een token aan?</p>

          <ol class="space-y-3 text-sm text-gray-600">
            <li class="flex gap-3">
              <span class="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-0.5">1</span>
              <span>
                Ga naar
                <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener" class="text-blue-600 underline">
                  github.com → Settings → Personal access tokens → Fine-grained tokens → Generate new token
                </a>
              </span>
            </li>
            <li class="flex gap-3">
              <span class="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-0.5">2</span>
              <span>
                Kies bij <strong>Repository access</strong> de optie <strong>Only select repositories</strong>
                en selecteer de data-repository die je hierboven hebt ingesteld.
              </span>
            </li>
            <li class="flex gap-3">
              <span class="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-0.5">3</span>
              <div class="space-y-2">
                <p>Stel onder <strong>Repository permissions</strong> de volgende rechten in:</p>
                <table class="w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
                  <thead>
                    <tr class="bg-gray-50 text-gray-500 text-left">
                      <th class="px-3 py-2 font-medium">Permissie</th>
                      <th class="px-3 py-2 font-medium">Niveau</th>
                      <th class="px-3 py-2 font-medium">Waarvoor</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    <tr>
                      <td class="px-3 py-2 font-mono font-medium text-gray-800">Contents</td>
                      <td class="px-3 py-2"><span class="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">Read and write</span></td>
                      <td class="px-3 py-2 text-gray-500">JSON-bestanden lezen en committen</td>
                    </tr>
                    <tr>
                      <td class="px-3 py-2 font-mono font-medium text-gray-800">Pull requests</td>
                      <td class="px-3 py-2"><span class="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">Read and write</span></td>
                      <td class="px-3 py-2 text-gray-500">Pull requests aanmaken</td>
                    </tr>
                    <tr class="bg-gray-50">
                      <td class="px-3 py-2 font-mono font-medium text-gray-500">Metadata</td>
                      <td class="px-3 py-2"><span class="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">Read-only</span></td>
                      <td class="px-3 py-2 text-gray-400">Automatisch vereist</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </li>
            <li class="flex gap-3">
              <span class="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-0.5">4</span>
              <span>Klik op <strong>Generate token</strong> en kopieer het token. Plak het hieronder.</span>
            </li>
          </ol>
        </div>

        <!-- Token invoer -->
        <div class="space-y-2 pt-1 border-t border-gray-100">
          <label class="block text-sm font-medium text-gray-700">Token plakken</label>
          <div class="flex gap-2">
            <input
              v-model="patInput"
              type="password"
              placeholder="github_pat_… of ghp_…"
              class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <button
              @click="savePat"
              :disabled="!patInput"
              class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              Opslaan
            </button>
          </div>
          <p class="text-xs text-gray-400">Het token wordt alleen lokaal in je browser opgeslagen en nergens anders naartoe gestuurd.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGitHubAuth } from '@/composables/useGitHubAuth'
import { useBlauwdrukStore } from '@/stores/blauwdruk'
import { SETTINGS_KEYS } from '@/constants/api'

const auth = useGitHubAuth()
const store = useBlauwdrukStore()

// ── Repo-instellingen ─────────────────────────────────────────────────────
const owner = ref(localStorage.getItem(SETTINGS_KEYS.GH_OWNER) || '')
const repo  = ref(localStorage.getItem(SETTINGS_KEYS.GH_REPO)  || '')
const repoSaved    = ref(false)
const isRefreshing = ref(false)

function saveRepoSettings() {
  localStorage.setItem(SETTINGS_KEYS.GH_OWNER, owner.value.trim())
  localStorage.setItem(SETTINGS_KEYS.GH_REPO,  repo.value.trim())
  repoSaved.value = true
  setTimeout(() => { repoSaved.value = false }, 3000)
}

async function handleRefresh() {
  isRefreshing.value = true
  await store.refreshFromGitHub()
  isRefreshing.value = false
}

// ── PAT ───────────────────────────────────────────────────────────────────
const patInput = ref('')

function savePat() {
  auth.setPatToken(patInput.value)
  patInput.value = ''
}
</script>
