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

      <!-- View mode knoppen -->
      <template v-if="!isEditing">
        <button
          @click="startEdit"
          class="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
          </svg>
          Bewerken
        </button>
        <button
          @click="doPrint"
          class="px-4 py-2 bg-blue-700 text-white text-sm rounded-lg hover:bg-blue-800 font-medium flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v5a2 2 0 002 2h1v2a1 1 0 001 1h8a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h6v3H7V4zm-1 9a1 1 0 100 2h8a1 1 0 100-2H6zm0 2v2h8v-2H6z" clip-rule="evenodd"/>
          </svg>
          Afdrukken / PDF
        </button>
      </template>

      <!-- Edit mode knoppen -->
      <template v-else>
        <button
          @click="cancelEdit"
          class="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 font-medium"
        >
          Annuleren
        </button>
        <button
          @click="saveEdit"
          class="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          Opslaan
        </button>
      </template>
    </div>

    <!-- Edit mode banner -->
    <div v-if="isEditing" class="no-print mb-4 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
      </svg>
      Je bewerkt nu deze module. Klik <strong class="font-semibold">Opslaan</strong> om wijzigingen vast te leggen, of <strong class="font-semibold">Annuleren</strong> om terug te gaan.
    </div>

    <!-- Document -->
    <div v-if="module || isEditing" class="print-document bg-white rounded-xl border border-gray-200 p-8 max-w-4xl mx-auto"
      :class="isEditing ? 'shadow-none ring-2 ring-amber-300' : 'shadow-sm'"
    >

      <!-- Header -->
      <div class="border-b-2 border-blue-800 pb-5 mb-6">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <p class="text-xs font-semibold text-blue-700 uppercase tracking-widest mb-1">
              Modulebeschrijving · {{ module?.periodeLabel }}
            </p>
            <!-- View -->
            <h1 v-if="!isEditing" class="text-2xl font-bold text-gray-900 leading-tight">{{ module.naam }}</h1>
            <!-- Edit -->
            <input
              v-else
              v-model="editData.moduleNaam"
              class="edit-input text-2xl font-bold text-gray-900 w-full"
              placeholder="Modulenaam"
            />
          </div>
          <div v-if="!isEditing && module.ec" class="text-right flex-shrink-0">
            <span class="text-3xl font-bold text-blue-800">{{ module.ec }}</span>
            <span class="text-sm text-gray-500 block">EC</span>
          </div>
        </div>
      </div>

      <!-- Leeruitkomsten -->
      <section class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm font-bold text-gray-400 uppercase tracking-widest">Leeruitkomsten</h2>
          <button
            v-if="isEditing"
            @click="addLeeruitkomst"
            class="edit-add-btn"
          >
            + Leeruitkomst toevoegen
          </button>
        </div>

        <div
          v-for="(lu, luIdx) in isEditing ? editData.leeruitkomsten : module.leeruitkomsten"
          :key="lu.id"
          class="mb-6 pb-6"
          :class="[
            luIdx < (isEditing ? editData.leeruitkomsten : module.leeruitkomsten).length - 1
              ? 'border-b border-gray-100' : '',
            isEditing ? 'relative' : ''
          ]"
        >
          <!-- Verwijder-knop leeruitkomst (edit) -->
          <button
            v-if="isEditing"
            @click="removeLeeruitkomst(luIdx)"
            class="no-print absolute top-0 right-0 text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 rounded px-2 py-0.5"
          >
            Leeruitkomst verwijderen
          </button>

          <!-- Naam + EC -->
          <div class="flex items-start gap-3 mb-2" :class="isEditing ? 'pr-36' : ''">
            <h3 v-if="!isEditing" class="font-semibold text-gray-900 text-base flex-1">{{ lu.naam }}</h3>
            <input
              v-else
              v-model="lu.naam"
              class="edit-input font-semibold text-gray-900 text-base flex-1"
              placeholder="Naam leeruitkomst"
            />
            <span v-if="!isEditing && lu.ec" class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full whitespace-nowrap font-medium flex-shrink-0">
              {{ lu.ec }} EC
            </span>
            <div v-if="isEditing" class="flex items-center gap-1 flex-shrink-0">
              <input
                v-model.number="lu.ec"
                type="number"
                min="0"
                class="edit-input w-16 text-center text-sm"
                placeholder="EC"
              />
              <span class="text-xs text-gray-400">EC</span>
            </div>
          </div>

          <!-- Omschrijving -->
          <p v-if="!isEditing" class="text-sm text-gray-700 leading-relaxed mb-4 whitespace-pre-line">{{ lu.omschrijving }}</p>
          <textarea
            v-else
            v-model="lu.omschrijving"
            rows="4"
            class="edit-textarea text-sm text-gray-700 leading-relaxed mb-4 w-full"
            placeholder="Omschrijving"
          />

          <!-- Meta-velden grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">

            <template v-for="field in arrayFields" :key="field.key">
              <div v-if="!isEditing ? lu[field.key]?.length : true">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{{ field.label }}</p>
                <!-- View -->
                <ul v-if="!isEditing" class="space-y-0.5">
                  <li v-for="item in lu[field.key]" :key="item" class="flex items-start gap-1.5 text-gray-700">
                    <span class="text-blue-400 mt-0.5">›</span>{{ item }}
                  </li>
                </ul>
                <!-- Edit -->
                <div v-else class="space-y-1">
                  <div v-for="(item, idx) in lu[field.key]" :key="idx" class="flex gap-1">
                    <input
                      v-model="lu[field.key][idx]"
                      class="edit-input text-sm flex-1"
                      :placeholder="field.label"
                    />
                    <button @click="lu[field.key].splice(idx, 1)" class="edit-remove-btn" title="Verwijderen">×</button>
                  </div>
                  <button @click="lu[field.key].push('')" class="edit-add-btn text-xs mt-1">+ {{ field.label }} toevoegen</button>
                </div>
              </div>
            </template>

            <div v-if="!isEditing ? lu.beroepscontext : true" class="sm:col-span-2">
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Beroepscontext</p>
              <p v-if="!isEditing" class="text-gray-700">{{ lu.beroepscontext }}</p>
              <input v-else v-model="lu.beroepscontext" class="edit-input text-sm w-full" placeholder="Beroepscontext" />
            </div>

          </div>

          <!-- Toetsmatrijs -->
          <div class="mt-5" v-if="!isEditing ? lu.toetsmatrijs?.length : true">
            <div class="flex items-center justify-between mb-3">
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Toetsmatrijs</p>
              <button v-if="isEditing" @click="addSectie(lu)" class="edit-add-btn text-xs">+ Sectie toevoegen</button>
            </div>

            <!-- View mode tabel -->
            <table v-if="!isEditing && lu.toetsmatrijs?.length" class="w-full text-sm border-collapse">
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
                    {{ lu.toetsmatrijs.flatMap(s => s.items).reduce((sum, i) => sum + (i.punten ?? 0), 0) }}
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Edit mode toetsmatrijs -->
            <div v-if="isEditing" class="space-y-4">
              <div
                v-for="(sectie, sIdx) in (lu.toetsmatrijs ?? [])"
                :key="sIdx"
                class="border border-gray-200 rounded-lg p-4"
              >
                <!-- Sectienaam -->
                <div class="flex items-center gap-2 mb-3">
                  <input v-model="sectie.onderdeel" class="edit-input text-sm font-semibold flex-1" placeholder="Sectienaam (bijv. Frontend)" />
                  <button @click="lu.toetsmatrijs.splice(sIdx, 1)" class="edit-remove-btn text-xs px-2">Sectie verwijderen</button>
                </div>

                <!-- Items -->
                <div class="space-y-3">
                  <div
                    v-for="(item, iIdx) in sectie.items"
                    :key="iIdx"
                    class="bg-gray-50 rounded p-3 space-y-2"
                  >
                    <!-- Omschrijving + punten -->
                    <div class="flex gap-2">
                      <textarea v-model="item.omschrijving" rows="2" class="edit-textarea text-sm flex-1" placeholder="Omschrijving toetsonderdeel" />
                      <div class="flex flex-col items-center gap-1 flex-shrink-0">
                        <input v-model.number="item.punten" type="number" min="0" class="edit-input w-16 text-center text-sm" placeholder="Ptn" />
                        <span class="text-xs text-gray-400">punten</span>
                      </div>
                    </div>

                    <!-- Criteria -->
                    <div class="space-y-1 pl-2 border-l-2 border-blue-200">
                      <div v-for="(crit, cIdx) in item.criteria" :key="cIdx" class="flex gap-1">
                        <input v-model="item.criteria[cIdx]" class="edit-input text-xs flex-1" placeholder="Criterium" />
                        <button @click="item.criteria.splice(cIdx, 1)" class="edit-remove-btn" title="Verwijderen">×</button>
                      </div>
                      <button @click="item.criteria.push('')" class="edit-add-btn text-xs">+ Criterium</button>
                    </div>

                    <button @click="sectie.items.splice(iIdx, 1)" class="text-xs text-red-400 hover:text-red-600">Item verwijderen</button>
                  </div>
                </div>

                <button @click="addToetsItem(sectie)" class="edit-add-btn text-xs mt-3">+ Item toevoegen</button>
              </div>

              <p v-if="!lu.toetsmatrijs?.length" class="text-xs text-gray-400 italic">Geen toetsmatrijs. Voeg een sectie toe om te beginnen.</p>
            </div>
          </div>

        </div>
      </section>

      <!-- Keywords per portefeuille (alleen view) -->
      <section v-if="!isEditing && keywordsPerPortefeuille.length">
        <h2 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Onderwerpen</h2>
        <div class="grid grid-cols-1 gap-4">
          <div
            v-for="pf in keywordsPerPortefeuille"
            :key="pf.id"
            class="border border-gray-100 rounded-lg p-4"
          >
            <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{{ pf.label }}</h3>
            <table class="w-full text-sm">
              <tbody>
                <tr v-for="kw in pf.keywords" :key="kw.id" class="border-t border-gray-50 first:border-0">
                  <td class="py-1 pr-3 text-gray-800 break-words min-w-0 max-w-0 w-full">
                    {{ kw.naam }}
                    <span v-if="kw.toelichting" class="block text-xs text-gray-400 italic font-normal break-words">{{ kw.toelichting }}</span>
                  </td>
                  <td class="py-1 text-right whitespace-nowrap">
                    <span v-if="kw.bloom" class="text-xs px-1.5 py-0.5 rounded font-medium" :class="bloomColor(kw.bloom)">
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

    <div v-else class="text-center text-gray-400 py-20">Module niet gevonden.</div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
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
    .map(pf => ({ ...pf, keywords: kwVoorPeriode.filter(kw => kw.portefeuille === pf.id) }))
    .filter(pf => pf.keywords.length > 0)
})

// ── Edit mode ──────────────────────────────────────────────
const isEditing = ref(false)
const editData = ref(null)

const arrayFields = [
  { key: 'eindkwalificaties', label: 'Eindkwalificaties' },
  { key: 'deelstappen', label: 'Deelstappen' },
  { key: 'kennis_vaardigheden', label: 'Kennis & vaardigheden' },
  { key: 'modellen_theorieen', label: 'Modellen & theorieën' },
]

function deepClone(obj) { return JSON.parse(JSON.stringify(obj)) }

function startEdit() {
  editData.value = {
    moduleNaam: module.value.naam,
    leeruitkomsten: deepClone(module.value.leeruitkomsten).map(lu => ({
      ...lu,
      eindkwalificaties: lu.eindkwalificaties ?? [],
      deelstappen: lu.deelstappen ?? [],
      kennis_vaardigheden: lu.kennis_vaardigheden ?? [],
      modellen_theorieen: lu.modellen_theorieen ?? [],
      toetsmatrijs: lu.toetsmatrijs ?? [],
    }))
  }
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
  editData.value = null
}

function saveEdit() {
  const naamModule = editData.value.moduleNaam

  // Verwijderde leeruitkomsten opsporen en wissen
  const editIds = new Set(editData.value.leeruitkomsten.map(l => l.id))
  const origIds = module.value.leeruitkomsten.map(l => l.id)
  origIds.forEach(id => { if (!editIds.has(id)) store.deleteLeeruitkomst(id) })

  // Opslaan / aanmaken
  editData.value.leeruitkomsten.forEach(lu => {
    const updated = { ...lu, module: naamModule }
    // Lege strings uit arrays filteren
    arrayFields.forEach(f => { updated[f.key] = (updated[f.key] ?? []).filter(v => v.trim() !== '') })
    // Lege criteria filteren
    if (updated.toetsmatrijs) {
      updated.toetsmatrijs.forEach(s => {
        s.items.forEach(i => { i.criteria = (i.criteria ?? []).filter(c => c.trim() !== '') })
      })
    }

    if (store.leeruitkomsten.some(l => l.id === lu.id)) {
      store.updateLeeruitkomst(updated)
    } else {
      store.addLeeruitkomst(updated)
    }
  })

  isEditing.value = false
  editData.value = null
}

function addLeeruitkomst() {
  editData.value.leeruitkomsten.push({
    id: store.generateId('lu'),
    periode: periodeId.value,
    module: editData.value.moduleNaam,
    naam: '',
    ec: null,
    omschrijving: '',
    eindkwalificaties: [],
    deelberoepsprestaties: [],
    deelstappen: [],
    kennis_vaardigheden: [],
    modellen_theorieen: [],
    beroepscontext: '',
    toetsmatrijs: [],
  })
}

function removeLeeruitkomst(idx) {
  editData.value.leeruitkomsten.splice(idx, 1)
}

function addSectie(lu) {
  if (!lu.toetsmatrijs) lu.toetsmatrijs = []
  lu.toetsmatrijs.push({ onderdeel: '', items: [] })
}

function addToetsItem(sectie) {
  sectie.items.push({ omschrijving: '', punten: 0, criteria: [] })
}

// ── Bloom ──────────────────────────────────────────────────
const bloomLabels = ['', 'Kennen', 'Begrijpen', 'Toepassen', 'Analyseren', 'Evalueren', 'Creëren']
const bloomColors = [
  '', 'bg-slate-100 text-slate-600', 'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700', 'bg-yellow-100 text-yellow-700',
  'bg-orange-100 text-orange-700', 'bg-red-100 text-red-700',
]
function bloomLabel(n) { return bloomLabels[n] ?? `Niveau ${n}` }
function bloomColor(n) { return bloomColors[n] ?? 'bg-gray-100 text-gray-600' }

function doPrint() { window.print() }
</script>

<style>
@reference "tailwindcss";

/* Edit form elementen */
.edit-input {
  @apply border border-amber-300 rounded px-2 py-1 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400;
}
.edit-textarea {
  @apply border border-amber-300 rounded px-2 py-1 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y block;
}
.edit-add-btn {
  @apply text-blue-600 hover:text-blue-800 text-xs font-medium border border-blue-200 hover:border-blue-400 rounded px-2 py-0.5 bg-white;
}
.edit-remove-btn {
  @apply text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 rounded px-1.5 py-0.5 text-xs bg-white flex-shrink-0;
}

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
