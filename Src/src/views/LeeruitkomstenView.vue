<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Leeruitkomsten</h1>
      <button @click="newLeeruitkomst" class="px-4 py-2 bg-blue-700 text-white text-sm rounded-lg hover:bg-blue-800 font-medium">
        + Nieuwe leeruitkomst
      </button>
    </div>

    <!-- Filter -->
    <div class="flex gap-3 mb-5">
      <select v-model="filterPeriode" class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">Alle periodes</option>
        <option v-for="p in store.periodes" :key="p.id" :value="p.id">{{ p.label }}</option>
      </select>
      <input
        v-model="filterText"
        placeholder="Zoeken op naam..."
        class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-64"
      />
    </div>

    <!-- Kaarten per periode -->
    <div v-for="periode in filteredPeriodes" :key="periode.id" class="mb-8">
      <h2 class="text-base font-semibold text-gray-600 mb-3 border-b border-gray-200 pb-1">
        {{ periode.label }}
      </h2>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="lu in leeruitkomstenVoorPeriode(periode.id)"
          :key="lu.id"
          class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md cursor-pointer transition-shadow"
          @click="openLu(lu)"
        >
          <div class="flex items-start justify-between gap-2">
            <h3 class="font-semibold text-gray-800 text-sm leading-tight">{{ lu.naam }}</h3>
            <span v-if="lu.ec" class="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full whitespace-nowrap font-medium">
              {{ lu.ec }} EC
            </span>
          </div>
          <p class="text-xs text-gray-500 mt-1 line-clamp-3">{{ lu.omschrijving }}</p>
          <div class="mt-2 flex flex-wrap gap-1">
            <span
              v-for="eq in lu.eindkwalificaties"
              :key="eq"
              class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
            >
              {{ eq }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <p v-if="filteredPeriodes.length === 0" class="text-center text-gray-400 py-12">
      Geen leeruitkomsten gevonden.
    </p>

    <LeeruitkomstModal
      v-if="modalOpen"
      :leeruitkomst="activeLu"
      :periodes="store.periodes"
      @save="saveLu"
      @delete="deleteLu"
      @close="modalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBlauwdrukStore } from '@/stores/blauwdruk'
import LeeruitkomstModal from '@/components/LeeruitkomstModal.vue'

const store = useBlauwdrukStore()
const modalOpen = ref(false)
const activeLu = ref(null)
const filterPeriode = ref('')
const filterText = ref('')

const filteredPeriodes = computed(() => {
  return store.periodes.filter(p => {
    if (filterPeriode.value && p.id !== filterPeriode.value) return false
    return leeruitkomstenVoorPeriode(p.id).length > 0
  })
})

function leeruitkomstenVoorPeriode(periodeId) {
  return store.leeruitkomsten.filter(lu => {
    if (lu.periode !== periodeId) return false
    if (filterText.value && !lu.naam.toLowerCase().includes(filterText.value.toLowerCase())) return false
    return true
  })
}

function openLu(lu) {
  activeLu.value = JSON.parse(JSON.stringify(lu))
  modalOpen.value = true
}

function newLeeruitkomst() {
  activeLu.value = {
    id: store.generateId('lu'),
    periode: store.periodes[0]?.id ?? '',
    module: '',
    naam: '',
    ec: null,
    omschrijving: '',
    eindkwalificaties: [],
    deelberoepsprestaties: [],
    deelstappen: [],
    kennis_vaardigheden: [],
    modellen_theorieen: [],
    beroepscontext: '',
  }
  modalOpen.value = true
}

function saveLu(lu) {
  const exists = store.leeruitkomsten.find(l => l.id === lu.id)
  if (exists) store.updateLeeruitkomst(lu)
  else store.addLeeruitkomst(lu)
  modalOpen.value = false
}

function deleteLu(id) {
  store.deleteLeeruitkomst(id)
  modalOpen.value = false
}
</script>
