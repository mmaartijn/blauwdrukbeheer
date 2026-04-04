<template>
  <div>
    <!-- Sticky header: titel + portefeuille toggles -->
    <div class="sticky top-0 z-10 bg-gray-50 pt-6 pb-4">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold text-gray-800">Jaar × Blok matrix</h1>
    </div>

    <!-- Portefeuille Toggles -->
    <div class="flex flex-wrap gap-2 justify-between items-center">
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(pf, index) in store.portefeuilles"
          :key="pf.id"
          class="flex items-center rounded-full border transition-all shadow-sm overflow-hidden"
          :class="[
             isVisible(pf.id) ? `${pfColor(index).bg} ${pfColor(index).border}` 
                              : 'bg-white border-gray-200 opacity-75 hover:opacity-100'
          ]"
        >
          <button
            @click="togglePortefeuille(pf.id)"
            class="w-44 px-3 py-1.5 text-[11px] font-medium flex items-center gap-1.5"
            :class="[pfColor(index).text, !isVisible(pf.id) && 'opacity-40']"
          >
            <!-- Vinkje: aangevinkt = gevuld, uitgevinkt = outline -->
            <svg v-if="isVisible(pf.id)" xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" d="M5 10h10"/>
            </svg>
            {{ pf.label }}
          </button>
          
          <button
            @click.stop="isVisible(pf.id) && expandCategoryAll(pf.id)"
            :disabled="!isVisible(pf.id)"
            class="px-1.5 py-1.5 border-l text-[11px]"
            :class="isVisible(pf.id) ? [pfColor(index).border, pfColor(index).text, 'hover:bg-white/50'] : 'border-gray-200 text-gray-300 cursor-not-allowed'"
            title="Alle blokken voor deze categorie uitklappen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
          </button>

          <button
            @click.stop="isVisible(pf.id) && collapseCategoryAll(pf.id)"
            :disabled="!isVisible(pf.id)"
            class="px-1.5 py-1.5 border-l text-[11px]"
            :class="isVisible(pf.id) ? [pfColor(index).border, pfColor(index).text, 'hover:bg-white/50'] : 'border-gray-200 text-gray-300 cursor-not-allowed'"
            title="Alle blokken voor deze categorie inklappen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <div class="flex gap-1.5 ml-auto">
        <button
          @click="expandAll"
          class="px-2 py-1.5 rounded border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 flex items-center transition-colors shadow-sm"
          title="Alles uitklappen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
        </button>
        <button
          @click="collapseAll"
          class="px-2 py-1.5 rounded border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 flex items-center transition-colors shadow-sm"
          title="Alles inklappen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
    </div><!-- /sticky header -->

    <!-- Matrix -->
    <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
      <table class="text-sm border-collapse w-full min-w-[1000px]">
        <thead>
          <tr class="bg-blue-800 text-white">
            <th class="px-3 py-3 text-left font-semibold sticky left-0 bg-blue-800 z-10 w-24 border-r border-blue-700">
              Jaar
            </th>
            <th class="px-4 py-3 text-center font-semibold w-1/4 border-l border-blue-700">Blok 1</th>
            <th class="px-4 py-3 text-center font-semibold w-1/4 border-l border-blue-700">Blok 2</th>
            <th class="px-4 py-3 text-center font-semibold w-1/4 border-l border-blue-700">Blok 3</th>
            <th class="px-4 py-3 text-center font-semibold w-1/4 border-l border-blue-700">Blok 4</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, i) in tableRows"
            :key="row.jaar"
            :class="i % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
          >
            <td class="px-3 py-4 font-bold text-gray-700 sticky left-0 z-10 border-b border-r border-gray-200 whitespace-nowrap"
                :class="i % 2 === 0 ? 'bg-white' : 'bg-gray-50'">
              Jaar {{ row.jaar }}
            </td>
            <td
              v-for="(cell, cIdx) in row.cells"
              :key="cIdx"
              :colspan="cell.colspan"
              class="px-3 py-4 align-top border-l border-b border-gray-200 relative"
            >
              <div v-if="cell.periode" class="flex flex-col h-full">
                <div class="text-center mb-3 pb-2 border-b border-gray-200">
                  <router-link
                    :to="{ name: 'module-detail', params: { periodeId: cell.periode.id } }"
                    class="font-bold text-blue-700 hover:text-blue-900 hover:underline text-sm leading-tight"
                  >{{ moduleNaam(cell.periode.id) || cell.periode.label }}</router-link>
                  <div v-if="moduleNaam(cell.periode.id)" class="text-xs text-gray-400 mt-0.5">{{ cell.periode.label }}</div>
                </div>
                
                <div class="flex flex-col flex-1">
                  <!-- Group keywords by portefeuille -->
                  <div
                    v-for="(pf, index) in store.portefeuilles"
                    :key="pf.id"
                  >
                    <template v-if="isVisible(pf.id) && keywordsFor(pf.id, cell.periode.id).length > 0">
                      <div
                        class="px-2.5 py-2 rounded-lg mb-2.5 border"
                        :class="[pfColor(index).bg, pfColor(index).border]"
                        role="region"
                        :aria-label="pf.label"
                      >
                        <div
                          class="text-[10px] font-bold uppercase tracking-widest flex items-center justify-between cursor-pointer"
                          :class="[pfColor(index).text, isExpanded(pf.id, cell.periode.id) ? 'mb-2' : '']"
                          role="button"
                          tabindex="0"
                          :aria-expanded="isExpanded(pf.id, cell.periode.id)"
                          @click="toggleCategory(pf.id, cell.periode.id)"
                          @keydown.enter.space.prevent="toggleCategory(pf.id, cell.periode.id)"
                        >
                          <div class="flex items-center gap-1.5">
                            <span class="w-1.5 h-1.5 rounded-full" :class="pfColor(index).dot"></span>
                            <span>{{ pf.label }}</span>
                          </div>
                          <div class="flex items-center gap-1.5">
                            <span v-if="!isExpanded(pf.id, cell.periode.id)" class="text-[9px] opacity-75 normal-case tracking-normal font-medium">
                              {{ keywordsFor(pf.id, cell.periode.id).length }} onderwerp{{ keywordsFor(pf.id, cell.periode.id).length !== 1 ? 'en' : '' }}
                            </span>
                            <span class="opacity-80 hover:opacity-100 transition-opacity">
                              <svg v-if="!isExpanded(pf.id, cell.periode.id)" xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                              </svg>
                              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd" />
                              </svg>
                            </span>
                          </div>
                        </div>
                        <div v-if="isExpanded(pf.id, cell.periode.id)" class="flex flex-col gap-1.5">
                          <button
                            v-for="kw in keywordsFor(pf.id, cell.periode.id)"
                            :key="kw.id"
                            class="text-left text-xs px-2 py-1.5 rounded border border-gray-200 text-gray-700 transition-shadow hover:shadow-md w-full bg-white opacity-95 hover:opacity-100 flex items-center justify-between gap-1"
                            @click="openKeyword(kw)"
                            :title="kw.toelichting || kw.naam"
                          >
                            <span>{{ kw.naam }}</span>
                            <span v-if="kw.bloom" class="text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0" :class="bloomBadgeClass(kw.bloom)">
                              {{ bloomLabel(kw.bloom) }}
                            </span>
                          </button>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>

                <div class="mt-4 pt-3 border-t border-dashed border-gray-200 text-center">
                  <button
                    class="text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 rounded hover:bg-blue-50 transition-colors"
                    @click="newKeywordForPeriode(cell.periode.id)"
                  >
                    + Keyword toevoegen
                  </button>
                </div>
              </div>
              <div v-else class="flex items-center justify-center h-full min-h-[100px] text-gray-300 italic">
                Geen invulling
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Bloom legenda (sticky footer) -->
    <div class="sticky bottom-0 z-10 bg-gray-50 pt-3 pb-5 mt-5 flex flex-wrap gap-2 text-xs items-center">
      <span class="font-medium text-gray-600 mr-1 py-0.5">Bloom-niveau:</span>
      <span v-for="b in bloomLevels" :key="b.level" class="px-2 py-0.5 rounded font-medium" :class="bloomBadgeClass(b.level)">
        {{ b.label }}
      </span>
      <span class="px-2 py-0.5 rounded border border-gray-200 text-gray-400 bg-white">niet ingesteld</span>
    </div>

    <!-- Keyword modal -->
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
import { ref, computed, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useBlauwdrukStore } from '@/stores/blauwdruk'
import KeywordModal from '@/components/KeywordModal.vue'
import { bloomLevels, bloomLabel, bloomBadgeClass } from '@/composables/useBloom'
import { pfColor } from '@/composables/usePortefeuille'

const store = useBlauwdrukStore()
const modalOpen = ref(false)
const activeKeyword = ref(null)

const hiddenPortefeuilles = ref(new Set())
const expandedCategories = ref(new Set())

// Standaard: alle portefeuilles uit, alle categorieën uitgeklapt
let initialized = false
watch(
  [() => store.portefeuilles, () => store.periodes],
  ([pfs, periodes]) => {
    if (initialized || !pfs.length || !periodes.length) return
    initialized = true
    hiddenPortefeuilles.value = new Set(pfs.map(p => p.id))
    const keys = new Set()
    periodes.forEach(p => pfs.forEach(pf => keys.add(`${p.id}-${pf.id}`)))
    expandedCategories.value = keys
  },
  { immediate: true }
)

function toggleCategory(pfId, periodeId) {
  const key = `${periodeId}-${pfId}`
  if (expandedCategories.value.has(key)) {
    expandedCategories.value.delete(key)
  } else {
    expandedCategories.value.add(key)
  }
}

function isExpanded(pfId, periodeId) {
  return expandedCategories.value.has(`${periodeId}-${pfId}`)
}

function expandAll() {
  store.periodes.forEach(p => {
    store.portefeuilles.forEach(pf => {
      expandedCategories.value.add(`${p.id}-${pf.id}`)
    })
  })
}

function collapseAll() {
  expandedCategories.value.clear()
}

function expandCategoryAll(pfId) {
  store.periodes.forEach(p => {
    expandedCategories.value.add(`${p.id}-${pfId}`)
  })
}

function collapseCategoryAll(pfId) {
  store.periodes.forEach(p => {
    expandedCategories.value.delete(`${p.id}-${pfId}`)
  })
}

// pfColor komt uit @/composables/usePortefeuille

function togglePortefeuille(id) {
  if (hiddenPortefeuilles.value.has(id)) {
    hiddenPortefeuilles.value.delete(id)
  } else {
    hiddenPortefeuilles.value.add(id)
  }
}

function isVisible(id) {
  return !hiddenPortefeuilles.value.has(id)
}

// bloomLevels, bloomLabel, bloomBadgeClass komen uit @/composables/useBloom

// Bepaal het maximum jaar en blok dynamisch vanuit de data
const maxJaar = computed(() => Math.max(0, ...store.periodes.map(p => p.jaar)))
const maxBlok = computed(() => Math.max(0, ...store.periodes.flatMap(p => p.blokken)))

const tableRows = computed(() => {
  const rows = []
  for (let jaar = 1; jaar <= maxJaar.value; jaar++) {
    const cells = []
    let skipUntil = 0
    for (let blok = 1; blok <= maxBlok.value; blok++) {
      if (blok < skipUntil) continue
      
      const periode = store.periodes.find(p => p.jaar === jaar && p.blokken.includes(blok))
      if (periode) {
        cells.push({
          periode,
          colspan: periode.blokken.length
        })
        skipUntil = blok + periode.blokken.length
      } else {
        cells.push({
          periode: null,
          colspan: 1
        })
        skipUntil = blok + 1
      }
    }
    rows.push({ jaar, cells })
  }
  return rows
})

const moduleNaamMap = computed(() => {
  const map = {}
  store.leeruitkomsten.forEach(lu => {
    if (lu.periode && lu.module && !map[lu.periode]) map[lu.periode] = lu.module
  })
  return map
})

function moduleNaam(periodeId) {
  return moduleNaamMap.value[periodeId] || null
}

function keywordsFor(portefeuilleId, periodeId) {
  return store.keywords.filter(k => k.portefeuille === portefeuilleId && k.periode === periodeId)
}


function openKeyword(kw) {
  activeKeyword.value = { ...kw }
  modalOpen.value = true
}

function newKeywordForPeriode(periodeId) {
  activeKeyword.value = {
    id: store.generateId('kw'),
    portefeuille: store.portefeuilles.length > 0 ? store.portefeuilles[0].id : '',
    periode: periodeId,
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
