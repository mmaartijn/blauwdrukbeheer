import { defineStore } from 'pinia'
import { ref } from 'vue'
import { API } from '@/constants/api'

export const useBlauwdrukStore = defineStore('blauwdruk', () => {
  const periodes = ref([])
  const portefeuilles = ref([])
  const keywords = ref([])
  const leeruitkomsten = ref([])

  // ── Laadstatus ────────────────────────────────────────────────────────────
  const isLoading = ref(false)
  const hasError = ref(false)

  // Foutmelding die views kunnen tonen als een opslaan mislukt
  const saveError = ref(null)

  // ── Laden ─────────────────────────────────────────────────────────────────
  async function loadAll() {
    isLoading.value = true
    hasError.value = false
    try {
      const [p, pf, kw, lu] = await Promise.all([
        fetch(API.PERIODES).then(r => r.json()),
        fetch(API.PORTEFEUILLES).then(r => r.json()),
        fetch(API.KEYWORDS).then(r => r.json()),
        fetch(API.LEERUITKOMSTEN).then(r => r.json()),
      ])
      periodes.value = p
      portefeuilles.value = pf
      keywords.value = kw
      leeruitkomsten.value = lu
    } catch (e) {
      hasError.value = true
      console.error('Laden van data mislukt', e)
    } finally {
      isLoading.value = false
    }
  }

  // ── Opslaan ───────────────────────────────────────────────────────────────
  function saveKeywords() {
    fetch(API.KEYWORDS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(keywords.value, null, 2),
    }).catch(e => {
      saveError.value = 'Keywords opslaan mislukt. Controleer of de dev-server actief is.'
      console.error('Could not save keywords', e)
    })
  }

  function saveLeeruitkomsten() {
    fetch(API.LEERUITKOMSTEN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leeruitkomsten.value, null, 2),
    }).catch(e => {
      saveError.value = 'Leeruitkomsten opslaan mislukt. Controleer of de dev-server actief is.'
      console.error('Could not save leeruitkomsten', e)
    })
  }

  // ── Keywords ──────────────────────────────────────────────────────────────
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

  // ── Leeruitkomsten ────────────────────────────────────────────────────────
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

  // ── Hulpfuncties ──────────────────────────────────────────────────────────
  function generateId(prefix) {
    return `${prefix}-${Date.now()}`
  }

  return {
    periodes, portefeuilles, keywords, leeruitkomsten,
    isLoading, hasError, saveError,
    loadAll,
    addKeyword, updateKeyword, deleteKeyword,
    addLeeruitkomst, updateLeeruitkomst, deleteLeeruitkomst,
    generateId,
  }
})
