<template>
  <div>
    <!-- Actiebalk -->
    <div class="no-print flex items-center gap-3 mb-4">
      <RouterLink to="/modules" class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/>
        </svg>
        Terug naar modules
      </RouterLink>
      <div class="flex-1" />
      <button @click="doPrint" class="px-4 py-2 bg-blue-700 text-white text-sm rounded-lg hover:bg-blue-800 font-medium flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v5a2 2 0 002 2h1v2a1 1 0 001 1h8a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h6v3H7V4zm-1 9a1 1 0 100 2h8a1 1 0 100-2H6zm0 2v2h8v-2H6z" clip-rule="evenodd"/>
        </svg>
        Afdrukken / PDF
      </button>
    </div>

    <!-- Info hint -->
    <p class="no-print flex items-center gap-1.5 text-xs text-gray-400 italic mb-3 select-none">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
      </svg>
      Klik met de rechtermuisknop op de modulenaam of een leeruitkomst om te bewerken of verwijderen.
    </p>

    <div v-if="module" class="print-document bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-4xl mx-auto">

      <!-- ── Header ── -->
      <div
        class="border-b-2 border-blue-800 pb-5 mb-6"
        @contextmenu.prevent="openContextMenu($event, 'naam', null)"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <p class="text-xs font-semibold text-blue-700 uppercase tracking-widest mb-1">
              Modulebeschrijving · {{ module.periodeLabel }}
            </p>

            <h1 v-if="!editingModuleNaam" class="text-2xl font-bold text-gray-900 leading-tight">{{ module.naam }}</h1>

            <div v-else class="flex items-center gap-2">
              <input v-model="editModuleNaamValue" autofocus
                class="text-2xl font-bold text-gray-900 border-b-2 border-blue-400 bg-transparent focus:outline-none flex-1 pb-0.5"
                @keyup.enter="saveModuleNaam"
                @keyup.escape="editingModuleNaam = false"
              />
              <button @click="saveModuleNaam" class="p-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </button>
              <button @click="editingModuleNaam = false" class="p-1.5 rounded-md text-gray-500 hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>
          <div v-if="module.ec" class="text-right flex-shrink-0">
            <span class="text-3xl font-bold text-blue-800">{{ module.ec }}</span>
            <span class="text-sm text-gray-500 block">EC</span>
          </div>
        </div>
      </div>

      <!-- ── Leeruitkomsten ── -->
      <section class="mb-8">
        <h2 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Leeruitkomsten</h2>

        <div
          v-for="(lu, luIdx) in module.leeruitkomsten"
          :key="lu.id"
          class="mb-6 pb-6"
          :class="luIdx < module.leeruitkomsten.length - 1 ? 'border-b border-gray-100' : ''"
          @contextmenu.prevent="openContextMenu($event, 'lu', lu)"
        >
          <!-- VIEW -->
          <template v-if="editingLuId !== lu.id">
            <div class="flex items-start gap-3 mb-2">
              <h3 class="font-semibold text-gray-900 text-base flex-1">{{ lu.naam }}</h3>
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
                      <td colspan="2" class="px-3 py-1.5 font-semibold text-blue-800 text-xs uppercase tracking-wide border border-gray-200">{{ sectie.onderdeel }}</td>
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
            </div>
          </template>

          <!-- EDIT -->
          <template v-else>
            <div class="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-5 space-y-4">
              <div class="flex gap-3 items-start">
                <div class="flex-1">
                  <label class="field-label">Naam</label>
                  <input v-model="editLuData.naam" class="field-input font-semibold" placeholder="Naam leeruitkomst" />
                </div>
                <div class="w-20 flex-shrink-0">
                  <label class="field-label">EC</label>
                  <input v-model.number="editLuData.ec" type="number" min="0" class="field-input text-center" placeholder="–" />
                </div>
              </div>

              <div>
                <label class="field-label">Omschrijving</label>
                <textarea v-model="editLuData.omschrijving" rows="4" class="field-input resize-y" placeholder="Omschrijving" />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div v-for="field in arrayFields" :key="field.key">
                  <label class="field-label">{{ field.label }}</label>
                  <div class="space-y-1.5">
                    <div v-for="(_, idx) in editLuData[field.key]" :key="idx" class="flex gap-1.5">
                      <input v-model="editLuData[field.key][idx]" class="field-input flex-1 text-sm" :placeholder="field.label" />
                      <button @click="editLuData[field.key].splice(idx, 1)"
                        class="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                        </svg>
                      </button>
                    </div>
                    <button @click="editLuData[field.key].push('')" class="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 py-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"/>
                      </svg>
                      Toevoegen
                    </button>
                  </div>
                </div>
                <div class="sm:col-span-2">
                  <label class="field-label">Beroepscontext</label>
                  <input v-model="editLuData.beroepscontext" class="field-input" placeholder="Beroepscontext" />
                </div>
              </div>

              <!-- Toetsmatrijs -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="field-label mb-0">Toetsmatrijs</label>
                  <button @click="addSectie(editLuData)" class="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"/>
                    </svg>
                    Sectie toevoegen
                  </button>
                </div>
                <div class="space-y-3">
                  <div v-for="(sectie, sIdx) in (editLuData.toetsmatrijs ?? [])" :key="sIdx"
                    class="border border-gray-200 rounded-lg bg-white overflow-hidden">
                    <div class="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
                      <input v-model="sectie.onderdeel" class="field-input text-sm font-semibold flex-1 bg-white" placeholder="Sectienaam" />
                      <button @click="editLuData.toetsmatrijs.splice(sIdx, 1)"
                        class="text-xs text-gray-400 hover:text-red-500 whitespace-nowrap px-2 py-1 hover:bg-red-50 rounded transition-colors">
                        Verwijderen
                      </button>
                    </div>
                    <div class="p-3 space-y-3">
                      <div v-for="(item, iIdx) in sectie.items" :key="iIdx"
                        class="rounded-lg bg-gray-50 border border-gray-100 p-3 space-y-2">
                        <div class="flex gap-2 items-start">
                          <textarea v-model="item.omschrijving" rows="2" class="field-input text-sm flex-1 resize-none" placeholder="Omschrijving" />
                          <div class="flex-shrink-0 text-center w-16">
                            <input v-model.number="item.punten" type="number" min="0" class="field-input text-center text-sm w-full" placeholder="0" />
                            <span class="text-[10px] text-gray-400">punten</span>
                          </div>
                        </div>
                        <div class="space-y-1 pl-3 border-l-2 border-blue-100">
                          <div v-for="(_, cIdx) in item.criteria" :key="cIdx" class="flex gap-1.5">
                            <input v-model="item.criteria[cIdx]" class="field-input text-xs flex-1" placeholder="Criterium" />
                            <button @click="item.criteria.splice(cIdx, 1)"
                              class="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                              </svg>
                            </button>
                          </div>
                          <button @click="item.criteria.push('')" class="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 pt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"/>
                            </svg>
                            Criterium
                          </button>
                        </div>
                        <button @click="sectie.items.splice(iIdx, 1)" class="text-xs text-gray-400 hover:text-red-500 transition-colors">
                          Item verwijderen
                        </button>
                      </div>
                      <button @click="addToetsItem(sectie)" class="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"/>
                        </svg>
                        Item toevoegen
                      </button>
                    </div>
                  </div>
                  <p v-if="!editLuData.toetsmatrijs?.length" class="text-xs text-gray-400 italic">
                    Geen toetsmatrijs — voeg een sectie toe om te beginnen.
                  </p>
                </div>
              </div>

              <!-- Acties -->
              <div class="flex items-center justify-between pt-3 border-t border-slate-200">
                <button @click="deleteLu(lu.id)" class="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                  Leeruitkomst verwijderen
                </button>
                <div class="flex items-center gap-2">
                  <button @click="cancelEditLu" class="px-3 py-1.5 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                    Annuleren
                  </button>
                  <button @click="saveEditLu" class="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
                    Opslaan
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>

        <button @click="addNewLu" class="no-print mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1.5 py-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"/>
          </svg>
          Leeruitkomst toevoegen
        </button>
      </section>

      <!-- ── Onderwerpen ── -->
      <section v-if="keywordsPerPortefeuille.length">
        <h2 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Onderwerpen</h2>
        <div class="grid grid-cols-1 gap-4">
          <div v-for="pf in keywordsPerPortefeuille" :key="pf.id" class="border border-gray-100 rounded-lg p-4">
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

    <!-- ── Contextmenu ── -->
    <Teleport to="body">
      <div
        v-if="ctxMenu.visible"
        class="no-print fixed z-50 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 min-w-44 text-sm"
        :style="{ top: ctxMenu.y + 'px', left: ctxMenu.x + 'px' }"
      >
        <template v-if="ctxMenu.type === 'lu'">
          <button @click="ctxEdit" class="ctx-item">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
            </svg>
            Bewerken
          </button>
          <div class="border-t border-gray-100 my-1" />
          <button @click="ctxDelete" class="ctx-item text-red-500 hover:bg-red-50">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            Verwijderen
          </button>
        </template>

        <template v-else-if="ctxMenu.type === 'naam'">
          <button @click="ctxEditNaam" class="ctx-item">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
            </svg>
            Modulenaam bewerken
          </button>
        </template>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
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

// ── Contextmenu ─────────────────────────────────────────────
const ctxMenu = ref({ visible: false, x: 0, y: 0, type: null, lu: null })

function openContextMenu(event, type, lu) {
  const x = Math.min(event.clientX, window.innerWidth - 200)
  const y = Math.min(event.clientY, window.innerHeight - 120)
  ctxMenu.value = { visible: true, x, y, type, lu }
}

function closeContextMenu() { ctxMenu.value.visible = false }

function ctxEdit() { startEditLu(ctxMenu.value.lu); closeContextMenu() }
function ctxDelete() { deleteLu(ctxMenu.value.lu.id); closeContextMenu() }
function ctxEditNaam() { startEditModuleNaam(); closeContextMenu() }

onMounted(() => {
  document.addEventListener('mousedown', closeContextMenu)
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeContextMenu() })
})
onUnmounted(() => {
  document.removeEventListener('mousedown', closeContextMenu)
})

// ── Modulenaam edit ─────────────────────────────────────────
const editingModuleNaam = ref(false)
const editModuleNaamValue = ref('')

function startEditModuleNaam() {
  editModuleNaamValue.value = module.value.naam
  editingModuleNaam.value = true
}

function saveModuleNaam() {
  const newNaam = editModuleNaamValue.value.trim()
  if (!newNaam) return
  module.value.leeruitkomsten.forEach(lu => store.updateLeeruitkomst({ ...lu, module: newNaam }))
  editingModuleNaam.value = false
}

// ── Leeruitkomst edit ───────────────────────────────────────
const editingLuId = ref(null)
const editLuData = ref(null)

const arrayFields = [
  { key: 'eindkwalificaties', label: 'Eindkwalificaties' },
  { key: 'deelstappen', label: 'Deelstappen' },
  { key: 'kennis_vaardigheden', label: 'Kennis & vaardigheden' },
  { key: 'modellen_theorieen', label: 'Modellen & theorieën' },
]

function deepClone(obj) { return JSON.parse(JSON.stringify(obj)) }

function startEditLu(lu) {
  editLuData.value = {
    ...deepClone(lu),
    eindkwalificaties: lu.eindkwalificaties ?? [],
    deelstappen: lu.deelstappen ?? [],
    kennis_vaardigheden: lu.kennis_vaardigheden ?? [],
    modellen_theorieen: lu.modellen_theorieen ?? [],
    toetsmatrijs: deepClone(lu.toetsmatrijs ?? []),
  }
  editingLuId.value = lu.id
}

function cancelEditLu() { editingLuId.value = null; editLuData.value = null }

function saveEditLu() {
  const updated = { ...editLuData.value }
  arrayFields.forEach(f => { updated[f.key] = (updated[f.key] ?? []).filter(v => v.trim() !== '') })
  if (updated.toetsmatrijs) {
    updated.toetsmatrijs.forEach(s => {
      s.items.forEach(i => { i.criteria = (i.criteria ?? []).filter(c => c.trim() !== '') })
    })
  }
  if (store.leeruitkomsten.some(l => l.id === updated.id)) {
    store.updateLeeruitkomst(updated)
  } else {
    store.addLeeruitkomst(updated)
  }
  cancelEditLu()
}

function deleteLu(id) { store.deleteLeeruitkomst(id); cancelEditLu() }

function addNewLu() {
  const newLu = {
    id: store.generateId('lu'),
    periode: periodeId.value,
    module: module.value.naam,
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
  }
  store.addLeeruitkomst(newLu)
  startEditLu(newLu)
}

function addSectie(lu) {
  if (!lu.toetsmatrijs) lu.toetsmatrijs = []
  lu.toetsmatrijs.push({ onderdeel: '', items: [] })
}

function addToetsItem(sectie) { sectie.items.push({ omschrijving: '', punten: 0, criteria: [] }) }

// ── Bloom ───────────────────────────────────────────────────
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

.field-label {
  @apply block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1;
}
.field-input {
  @apply block w-full border border-gray-200 rounded-lg px-3 py-1.5 text-gray-800 bg-white
         focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
         placeholder-gray-300 transition-shadow;
}
.ctx-item {
  @apply w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors;
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
