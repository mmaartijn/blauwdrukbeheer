<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Keywords</h1>
      <button @click="newKeyword" class="px-4 py-2 bg-blue-700 text-white text-sm rounded-lg hover:bg-blue-800 font-medium">
        + Nieuw keyword
      </button>
    </div>



    <!-- Tabel -->
    <div class="rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-100 text-gray-700">
          <tr>
            <th class="px-4 py-3 text-left font-semibold cursor-pointer hover:bg-gray-200 select-none group" tabindex="0" role="button" :aria-sort="sortKey==='naam' ? (sortAsc ? 'ascending' : 'descending') : 'none'" @click="toggleSort('naam')" @keydown.enter.space.prevent="toggleSort('naam')">
              <div class="flex items-center justify-between">
                Naam
                <span :class="{'opacity-100': sortKey === 'naam', 'opacity-0 group-hover:opacity-30': sortKey !== 'naam'}" class="text-xs transition-opacity">{{ sortKey === 'naam' && !sortAsc ? '▼' : '▲' }}</span>
              </div>
            </th>
            <th class="px-4 py-3 text-left font-semibold cursor-pointer hover:bg-gray-200 select-none group" tabindex="0" role="button" :aria-sort="sortKey==='portefeuille' ? (sortAsc ? 'ascending' : 'descending') : 'none'" @click="toggleSort('portefeuille')" @keydown.enter.space.prevent="toggleSort('portefeuille')">
              <div class="flex items-center justify-between">
                Portefeuille
                <span :class="{'opacity-100': sortKey === 'portefeuille', 'opacity-0 group-hover:opacity-30': sortKey !== 'portefeuille'}" class="text-xs transition-opacity">{{ sortKey === 'portefeuille' && !sortAsc ? '▼' : '▲' }}</span>
              </div>
            </th>
            <th class="px-4 py-3 text-left font-semibold cursor-pointer hover:bg-gray-200 select-none group" tabindex="0" role="button" :aria-sort="sortKey==='periode' ? (sortAsc ? 'ascending' : 'descending') : 'none'" @click="toggleSort('periode')" @keydown.enter.space.prevent="toggleSort('periode')">
              <div class="flex items-center justify-between">
                Periode
                <span :class="{'opacity-100': sortKey === 'periode', 'opacity-0 group-hover:opacity-30': sortKey !== 'periode'}" class="text-xs transition-opacity">{{ sortKey === 'periode' && !sortAsc ? '▼' : '▲' }}</span>
              </div>
            </th>
            <th class="px-4 py-3 text-left font-semibold cursor-pointer hover:bg-gray-200 select-none group whitespace-nowrap" tabindex="0" role="button" :aria-sort="sortKey==='bloom' ? (sortAsc ? 'ascending' : 'descending') : 'none'" @click="toggleSort('bloom')" @keydown.enter.space.prevent="toggleSort('bloom')">
              <div class="flex items-center justify-between">
                Bloom
                <span :class="{'opacity-100': sortKey === 'bloom', 'opacity-0 group-hover:opacity-30': sortKey !== 'bloom'}" class="text-xs transition-opacity">{{ sortKey === 'bloom' && !sortAsc ? '▼' : '▲' }}</span>
              </div>
            </th>
            <th class="px-4 py-3 text-left font-semibold">Toelichting</th>
          </tr>
          <!-- Filter headers -->
          <tr class="bg-gray-50 border-t border-gray-200">
            <th class="px-2 py-2 font-normal align-top">
              <input v-model="filterText" placeholder="Zoeken..." class="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-normal" />
            </th>
            <th class="px-2 py-2 font-normal align-top">
              <select v-model="filterPortefeuille" class="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-normal text-gray-700">
                <option value="">Alle portefeuilles</option>
                <option v-for="pf in store.portefeuilles" :key="pf.id" :value="pf.id">{{ pf.label }}</option>
              </select>
            </th>
            <th class="px-2 py-2 font-normal align-top">
              <select v-model="filterPeriode" class="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-normal text-gray-700">
                <option value="">Alle periodes</option>
                <option v-for="p in store.periodes" :key="p.id" :value="p.id">{{ p.label }}</option>
              </select>
            </th>
            <th class="px-2 py-2 font-normal align-top">
              <select v-model="filterBloom" class="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-normal text-gray-700">
                <option value="">Alle niveaus</option>
                <option value="null">Niet ingevuld</option>
                <option v-for="b in bloomLevels" :key="b.level" :value="b.level">{{ b.level }}</option>
              </select>
            </th>
            <th class="px-2 py-2 text-xs text-gray-400 font-normal align-top pt-3 italic">
               Filtertabel
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(kw, i) in filtered"
            :key="kw.id"
            class="cursor-pointer hover:bg-blue-50 transition-colors"
            :class="i % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
            @click="openKeyword(kw)"
          >
            <td class="px-4 py-2 font-medium text-gray-800">{{ kw.naam }}</td>
            <td class="px-4 py-2 text-gray-600">{{ portefeuilleLabel(kw.portefeuille) }}</td>
            <td class="px-4 py-2 text-gray-600">{{ periodeLabel(kw.periode) }}</td>
            <td class="px-4 py-2">
              <span v-if="kw.bloom" class="px-2 py-0.5 rounded-full text-xs border" :class="bloomClass(kw.bloom)">
                {{ kw.bloom }} – {{ bloomLabel(kw.bloom) }}
              </span>
              <span v-else class="text-gray-400 text-xs">–</span>
            </td>
            <td class="px-4 py-2 text-gray-500 max-w-xs truncate">{{ kw.toelichting || '–' }}</td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="5" class="px-4 py-8 text-center text-gray-400">Geen keywords gevonden.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="text-xs text-gray-400 mt-2">{{ filtered.length }} van {{ store.keywords.length }} keywords</p>

    <KeywordModal
      v-if="modalOpen"
      :keyword="activeKeyword"
      :portefeuilles="store.portefeuilles"
      :periodes="store.periodes"
      @save="saveKeyword"
      @delete="deleteKeyword"
      @close="modalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBlauwdrukStore } from '@/stores/blauwdruk'
import KeywordModal from '@/components/KeywordModal.vue'
import { bloomLevels, bloomLabel, bloomTableClass } from '@/composables/useBloom'

const store = useBlauwdrukStore()
const modalOpen = ref(false)
const activeKeyword = ref(null)
const filterPortefeuille = ref('')
const filterPeriode = ref('')
const filterBloom = ref('')
const filterText = ref('')

// bloomLevels, bloomLabel, bloomTableClass komen uit @/composables/useBloom

const sortKey = ref('naam')
const sortAsc = ref(true)

function toggleSort(key) {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value
  } else {
    sortKey.value = key
    sortAsc.value = true
  }
}

const filtered = computed(() => {
  let result = store.keywords.filter(kw => {
    if (filterPortefeuille.value && kw.portefeuille !== filterPortefeuille.value) return false
    if (filterPeriode.value && kw.periode !== filterPeriode.value) return false
    if (filterBloom.value === 'null' && kw.bloom !== null) return false
    if (filterBloom.value && filterBloom.value !== 'null' && kw.bloom !== Number(filterBloom.value)) return false
    if (filterText.value && !kw.naam.toLowerCase().includes(filterText.value.toLowerCase())) return false
    return true
  })

  result.sort((a, b) => {
    let valA = a[sortKey.value]
    let valB = b[sortKey.value]

    if (sortKey.value === 'portefeuille') {
      valA = portefeuilleLabel(valA)
      valB = portefeuilleLabel(valB)
    } else if (sortKey.value === 'periode') {
      valA = periodeLabel(valA)
      valB = periodeLabel(valB)
    }

    if (valA === valB) return 0
    if (valA === null || valA === undefined) return sortAsc.value ? 1 : -1
    if (valB === null || valB === undefined) return sortAsc.value ? -1 : 1

    if (typeof valA === 'string') {
      return sortAsc.value ? valA.localeCompare(valB) : valB.localeCompare(valA)
    }
    
    return sortAsc.value ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1)
  })

  return result
})

function portefeuilleLabel(id) {
  return store.portefeuilles.find(p => p.id === id)?.label ?? id
}

function periodeLabel(id) {
  return store.periodes.find(p => p.id === id)?.label ?? id
}

// bloomLabel en bloomTableClass komen uit @/composables/useBloom
const bloomClass = bloomTableClass

function openKeyword(kw) {
  activeKeyword.value = { ...kw }
  modalOpen.value = true
}

function newKeyword() {
  activeKeyword.value = {
    id: store.generateId('kw'),
    portefeuille: store.portefeuilles[0]?.id ?? '',
    periode: store.periodes[0]?.id ?? '',
    naam: '',
    bloom: null,
    toelichting: '',
  }
  modalOpen.value = true
}

function saveKeyword(kw) {
  const exists = store.keywords.find(k => k.id === kw.id)
  if (exists) store.updateKeyword(kw)
  else store.addKeyword(kw)
  modalOpen.value = false
}

function deleteKeyword(id) {
  store.deleteKeyword(id)
  modalOpen.value = false
}
</script>
