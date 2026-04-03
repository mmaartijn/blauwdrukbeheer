import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBlauwdrukStore = defineStore('blauwdruk', () => {
  const periodes = ref([])
  const portefeuilles = ref([])
  const keywords = ref([])
  const leeruitkomsten = ref([])

  async function loadAll() {
    const [p, pf, kw, lu] = await Promise.all([
      fetch('/data/periodes.json').then(r => r.json()),
      fetch('/data/portefeuilles.json').then(r => r.json()),
      fetch('/data/keywords.json').then(r => r.json()),
      fetch('/data/leeruitkomsten.json').then(r => r.json()),
    ])
    periodes.value = p
    portefeuilles.value = pf
    keywords.value = kw
    leeruitkomsten.value = lu
  }

  function saveKeywords() {
    fetch('/data/keywords.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(keywords.value, null, 2)
    }).catch(e => console.error("Could not save keywords", e))
  }

  function saveLeeruitkomsten() {
    fetch('/data/leeruitkomsten.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leeruitkomsten.value, null, 2)
    }).catch(e => console.error("Could not save leeruitkomsten", e))
  }

  function loadFromStorage() {
    // Gedeactiveerd o.b.v. nieuwe werkwijze: we lezen/schrijven nu direct naar systeembestanden via de dev-server.
  }

  // Keywords
  function addKeyword(keyword) {
    keywords.value.push(keyword)
    saveKeywords()
  }

  function updateKeyword(updated) {
    const idx = keywords.value.findIndex(k => k.id === updated.id)
    if (idx !== -1) keywords.value[idx] = updated
    saveKeywords()
  }

  function deleteKeyword(id) {
    keywords.value = keywords.value.filter(k => k.id !== id)
    saveKeywords()
  }

  // Leeruitkomsten
  function addLeeruitkomst(lu) {
    leeruitkomsten.value.push(lu)
    saveLeeruitkomsten()
  }

  function updateLeeruitkomst(updated) {
    const idx = leeruitkomsten.value.findIndex(l => l.id === updated.id)
    if (idx !== -1) leeruitkomsten.value[idx] = updated
    saveLeeruitkomsten()
  }

  function deleteLeeruitkomst(id) {
    leeruitkomsten.value = leeruitkomsten.value.filter(l => l.id !== id)
    saveLeeruitkomsten()
  }

  function generateId(prefix) {
    return `${prefix}-${Date.now()}`
  }

  return {
    periodes, portefeuilles, keywords, leeruitkomsten,
    loadAll, loadFromStorage,
    addKeyword, updateKeyword, deleteKeyword,
    addLeeruitkomst, updateLeeruitkomst, deleteLeeruitkomst,
    generateId,
  }
})
