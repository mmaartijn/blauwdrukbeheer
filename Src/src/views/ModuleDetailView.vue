<template>
  <div>
    <!-- Actiebalk (verborgen bij afdrukken) -->
    <div class="no-print flex items-center gap-3 mb-6">
      <RouterLink to="/modules" class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/>
        </svg>
        Terug naar modules
      </RouterLink>
      <div class="flex-1" />
      <button
        @click="window.print()"
        class="px-4 py-2 bg-blue-700 text-white text-sm rounded-lg hover:bg-blue-800 font-medium flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v5a2 2 0 002 2h1v2a1 1 0 001 1h8a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h6v3H7V4zm-1 9a1 1 0 100 2h8a1 1 0 100-2H6zm0 2v2h8v-2H6z" clip-rule="evenodd"/>
        </svg>
        Afdrukken / PDF
      </button>
    </div>

    <!-- Document -->
    <div v-if="module" class="print-document bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-4xl mx-auto">

      <!-- Header -->
      <div class="border-b-2 border-blue-800 pb-5 mb-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold text-blue-700 uppercase tracking-widest mb-1">
              Modulebeschrijving · {{ module.periodeLabel }}
            </p>
            <h1 class="text-2xl font-bold text-gray-900 leading-tight">{{ module.naam }}</h1>
          </div>
          <div v-if="module.ec" class="text-right flex-shrink-0">
            <span class="text-3xl font-bold text-blue-800">{{ module.ec }}</span>
            <span class="text-sm text-gray-500 block">EC</span>
          </div>
        </div>
      </div>

      <!-- Leeruitkomsten -->
      <section class="mb-8">
        <h2 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Leeruitkomsten</h2>

        <div
          v-for="(lu, idx) in module.leeruitkomsten"
          :key="lu.id"
          class="mb-6 pb-6"
          :class="{ 'border-b border-gray-100': idx < module.leeruitkomsten.length - 1 }"
        >
          <div class="flex items-start justify-between gap-3 mb-2">
            <h3 class="font-semibold text-gray-900 text-base">{{ lu.naam }}</h3>
            <span v-if="lu.ec" class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full whitespace-nowrap font-medium flex-shrink-0">
              {{ lu.ec }} EC
            </span>
          </div>

          <p class="text-sm text-gray-700 leading-relaxed mb-4 whitespace-pre-line">{{ lu.omschrijving }}</p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">

            <div v-if="lu.eindkwalificaties?.length">
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Eindkwalificaties</p>
              <ul class="space-y-0.5">
                <li v-for="item in lu.eindkwalificaties" :key="item" class="flex items-start gap-1.5 text-gray-700">
                  <span class="text-blue-400 mt-0.5">›</span>{{ item }}
                </li>
              </ul>
            </div>

            <div v-if="lu.deelstappen?.length">
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Deelstappen</p>
              <ul class="space-y-0.5">
                <li v-for="item in lu.deelstappen" :key="item" class="flex items-start gap-1.5 text-gray-700">
                  <span class="text-blue-400 mt-0.5">›</span>{{ item }}
                </li>
              </ul>
            </div>

            <div v-if="lu.kennis_vaardigheden?.length">
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Kennis &amp; vaardigheden</p>
              <ul class="space-y-0.5">
                <li v-for="item in lu.kennis_vaardigheden" :key="item" class="flex items-start gap-1.5 text-gray-700">
                  <span class="text-blue-400 mt-0.5">›</span>{{ item }}
                </li>
              </ul>
            </div>

            <div v-if="lu.modellen_theorieen?.length">
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Modellen &amp; theorieën</p>
              <ul class="space-y-0.5">
                <li v-for="item in lu.modellen_theorieen" :key="item" class="flex items-start gap-1.5 text-gray-700">
                  <span class="text-blue-400 mt-0.5">›</span>{{ item }}
                </li>
              </ul>
            </div>

            <div v-if="lu.beroepscontext" class="sm:col-span-2">
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Beroepscontext</p>
              <p class="text-gray-700">{{ lu.beroepscontext }}</p>
            </div>

          </div>

          <!-- Toetsmatrijs -->
          <div v-if="lu.toetsmatrijs?.length" class="mt-5">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Toetsmatrijs</p>
            <table class="w-full text-sm border-collapse">
              <thead>
                <tr class="bg-gray-50">
                  <th class="text-left px-3 py-2 font-semibold text-gray-600 border border-gray-200 w-full">Toetsonderdeel / omschrijving</th>
                  <th class="text-right px-3 py-2 font-semibold text-gray-600 border border-gray-200 whitespace-nowrap">Max. punten</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="sectie in lu.toetsmatrijs" :key="sectie.onderdeel">
                  <tr class="bg-blue-50">
                    <td colspan="2" class="px-3 py-1.5 font-semibold text-blue-800 text-xs uppercase tracking-wide border border-gray-200">
                      {{ sectie.onderdeel }}
                    </td>
                  </tr>
                  <template v-for="item in sectie.items" :key="item.omschrijving">
                    <tr>
                      <td class="px-3 py-2 border border-gray-200 align-top text-gray-800">{{ item.omschrijving }}</td>
                      <td class="px-3 py-2 border border-gray-200 text-right font-medium text-gray-900 align-top">{{ item.punten }}</td>
                    </tr>
                    <tr v-if="item.criteria?.length" class="bg-gray-50">
                      <td colspan="2" class="px-3 pb-2 pt-1 border border-gray-200">
                        <ul class="space-y-0.5">
                          <li v-for="criterium in item.criteria" :key="criterium" class="flex items-start gap-1.5 text-gray-600 text-xs">
                            <span class="text-blue-400 mt-0.5 flex-shrink-0">›</span>{{ criterium }}
                          </li>
                        </ul>
                      </td>
                    </tr>
                  </template>
                </template>
                <tr class="bg-gray-100 font-semibold">
                  <td class="px-3 py-2 border border-gray-200 text-gray-700">Totaal</td>
                  <td class="px-3 py-2 border border-gray-200 text-right text-gray-900">
                    {{ lu.toetsmatrijs.flatMap(s => s.items).reduce((sum, i) => sum + i.punten, 0) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </section>

      <!-- Keywords per portefeuille -->
      <section v-if="keywordsPerPortefeuille.length">
        <h2 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Onderwerpen</h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            v-for="pf in keywordsPerPortefeuille"
            :key="pf.id"
            class="border border-gray-100 rounded-lg p-4"
          >
            <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{{ pf.label }}</h3>
            <table class="w-full text-sm">
              <tbody>
                <tr
                  v-for="kw in pf.keywords"
                  :key="kw.id"
                  class="border-t border-gray-50 first:border-0"
                >
                  <td class="py-1 pr-3 text-gray-800">{{ kw.naam }}</td>
                  <td class="py-1 text-right whitespace-nowrap">
                    <span
                      v-if="kw.bloom"
                      class="text-xs px-1.5 py-0.5 rounded font-medium"
                      :class="bloomColor(kw.bloom)"
                    >
                      {{ bloomLabel(kw.bloom) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </div>

    <div v-else class="text-center text-gray-400 py-20">
      Module niet gevonden.
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useBlauwdrukStore } from '@/stores/blauwdruk'

const route = useRoute()
const store = useBlauwdrukStore()

const periodeId = computed(() => decodeURIComponent(route.params.periodeId))

const module = computed(() => {
  const lus = store.leeruitkomsten.filter(lu => lu.periode === periodeId.value)
  if (!lus.length) return null

  const periode = store.periodes.find(p => p.id === periodeId.value)
  const naam = lus[0].module
  const som = lus.reduce((acc, lu) => acc + (lu.ec ?? 0), 0)
  const ec = som > 0 ? som : (naam.match(/\((\d+)\s*EC\)/i)?.[1] ? parseInt(naam.match(/\((\d+)\s*EC\)/i)[1]) : null)

  return { naam, ec, periodeLabel: periode?.label ?? periodeId.value, leeruitkomsten: lus }
})

const keywordsPerPortefeuille = computed(() => {
  if (!module.value) return []
  const kwVoorPeriode = store.keywords.filter(kw => kw.periode === periodeId.value)
  return store.portefeuilles
    .map(pf => ({
      ...pf,
      keywords: kwVoorPeriode.filter(kw => kw.portefeuille === pf.id),
    }))
    .filter(pf => pf.keywords.length > 0)
})

const bloomLabels = ['', 'Kennen', 'Begrijpen', 'Toepassen', 'Analyseren', 'Evalueren', 'Creëren']
const bloomColors = [
  '', 'bg-slate-100 text-slate-600', 'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700', 'bg-yellow-100 text-yellow-700',
  'bg-orange-100 text-orange-700', 'bg-red-100 text-red-700',
]

function bloomLabel(n) { return bloomLabels[n] ?? `Niveau ${n}` }
function bloomColor(n) { return bloomColors[n] ?? 'bg-gray-100 text-gray-600' }

// window beschikbaar maken in template
const window = globalThis.window
</script>

<style>
@media print {
  .no-print { display: none !important; }
  nav { display: none !important; }
  main { padding: 0 !important; max-width: 100% !important; }
  .print-document {
    box-shadow: none !important;
    border: none !important;
    border-radius: 0 !important;
    max-width: 100% !important;
    padding: 0 !important;
  }
  body { background: white !important; }
}
</style>
