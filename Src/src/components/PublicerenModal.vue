<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      @mousedown.self="$emit('close')"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-5">
        <h2 class="text-lg font-semibold text-gray-800">Wijzigingen publiceren</h2>

        <p class="text-sm text-gray-500">
          Er worden
          <strong>{{ store.dirtyFiles.size }} bestand{{ store.dirtyFiles.size === 1 ? '' : 'en' }}</strong>
          gecommit naar een nieuwe branch in de data-repository:
          <span class="font-mono text-gray-700">{{ Array.from(store.dirtyFiles).join(', ') }}</span>
        </p>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Branch-naam</label>
            <input
              v-model="branchName"
              type="text"
              placeholder="bijv. update/keywords-2026-04"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">PR-titel</label>
            <input
              v-model="prTitle"
              type="text"
              placeholder="Wijzigingen blauwdruk …"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Omschrijving (optioneel)</label>
            <textarea
              v-model="prBody"
              rows="3"
              placeholder="Wat is er gewijzigd en waarom?"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        <!-- Foutmelding -->
        <p v-if="error" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {{ error }}
        </p>

        <!-- Succes: PR-link -->
        <div v-if="prUrl" class="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 space-y-1">
          <p class="font-medium">Pull request aangemaakt!</p>
          <a :href="prUrl" target="_blank" rel="noopener" class="text-blue-600 underline break-all">{{ prUrl }}</a>
        </div>

        <div class="flex gap-2 pt-1">
          <button
            v-if="!prUrl"
            @click="publish"
            :disabled="publishing || !branchName || !prTitle"
            class="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            {{ publishing ? 'Bezig met publiceren…' : 'Publiceren' }}
          </button>
          <button
            @click="$emit('close')"
            class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 font-medium"
          >
            {{ prUrl ? 'Sluiten' : 'Annuleren' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { useBlauwdrukStore } from '@/stores/blauwdruk'

defineEmits(['close'])

const store = useBlauwdrukStore()

const today = new Date().toISOString().slice(0, 10)
const branchName = ref(`update/blauwdruk-${today}`)
const prTitle    = ref(`Blauwdruk update ${today}`)
const prBody     = ref('')
const publishing = ref(false)
const error      = ref(null)
const prUrl      = ref(null)

async function publish() {
  publishing.value = true
  error.value = null
  try {
    prUrl.value = await store.publishChanges(branchName.value, prTitle.value, prBody.value)
  } catch (e) {
    error.value = e.message
  } finally {
    publishing.value = false
  }
}
</script>
