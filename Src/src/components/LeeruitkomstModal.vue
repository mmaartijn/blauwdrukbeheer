<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
      <div class="flex items-center justify-between p-5 border-b border-gray-100">
        <h2 class="text-xl font-semibold text-gray-800">
          {{ isNew ? 'Nieuwe leeruitkomst' : 'Leeruitkomst bewerken' }}
        </h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 focus:outline-none">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <div class="p-5 overflow-y-auto flex-1">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div class="col-span-1 md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Naam</label>
            <input v-model="form.naam" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Periode</label>
            <select v-model="form.periode" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
              <option v-for="p in periodes" :key="p.id" :value="p.id">{{ p.label }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Studiepunten (EC)</label>
            <input v-model.number="form.ec" type="number" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" min="0" step="1" />
          </div>

          <div class="col-span-1 md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Omschrijving / Context</label>
            <textarea v-model="form.omschrijving" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
          </div>
          
          <div class="col-span-1 md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Beroepscontext</label>
            <textarea v-model="form.beroepscontext" rows="2" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
          </div>

          <!-- Lijst velden (1 per regel) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Eindkwalificaties (1 per regel)</label>
            <textarea v-model="strEindkwalificaties" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400" placeholder="Bijv. Concepting..."></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Kennis & Vaardigheden (1 per regel)</label>
            <textarea v-model="strKennis" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400"></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Deelstappen (1 per regel)</label>
            <textarea v-model="strDeelstappen" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400"></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Modellen & Theorieën (1 per regel)</label>
            <textarea v-model="strModellen" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400"></textarea>
          </div>
        </div>
      </div>

      <div class="p-5 border-t border-gray-100 flex items-center justify-between bg-gray-50 rounded-b-xl">
        <button v-if="!isNew" @click="confirmDelete" class="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-2 rounded hover:bg-red-50 transition-colors">
          Verwijderen
        </button>
        <div v-else></div>

        <div class="flex gap-3">
          <button @click="$emit('close')" class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
            Annuleren
          </button>
          <button @click="save" class="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 text-sm font-medium transition-colors disabled:opacity-50" :disabled="!isValid">
            Opslaan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  leeruitkomst: {
    type: Object,
    required: true
  },
  periodes: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['close', 'save', 'delete'])

const isNew = computed(() => !props.leeruitkomst.naam && props.leeruitkomst.naam === '')

// Kopie maken voor het formulier
const form = ref({ ...props.leeruitkomst })

// Helpers voor textareas (arrays <-> string)
const arrayToString = (arr) => Array.isArray(arr) ? arr.join('\n') : ''
const stringToArray = (str) => typeof str === 'string' ? str.split('\n').map(s => s.trim()).filter(s => s.length > 0) : []

const strEindkwalificaties = ref(arrayToString(form.value.eindkwalificaties))
const strKennis = ref(arrayToString(form.value.kennis_vaardigheden))
const strDeelstappen = ref(arrayToString(form.value.deelstappen))
const strModellen = ref(arrayToString(form.value.modellen_theorieen))

const isValid = computed(() => {
  return form.value.naam?.trim().length > 0 && form.value.periode
})

function save() {
  if (!isValid.value) return
  
  // Transform strings back to arrays
  form.value.eindkwalificaties = stringToArray(strEindkwalificaties.value)
  form.value.kennis_vaardigheden = stringToArray(strKennis.value)
  form.value.deelstappen = stringToArray(strDeelstappen.value)
  form.value.modellen_theorieen = stringToArray(strModellen.value)

  emit('save', form.value)
}

function confirmDelete() {
  if (confirm(`Weet je zeker dat je "${form.value.naam}" wilt verwijderen?`)) {
    emit('delete', form.value.id)
  }
}
</script>
