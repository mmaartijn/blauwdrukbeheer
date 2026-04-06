import { defineStore } from 'pinia'
import { ref } from 'vue'
import { CACHE_KEYS, DATA_FILES, SETTINGS_KEYS } from '@/constants/api'
import { useGitHubData } from '@/composables/useGitHubData'

export const useBlauwdrukStore = defineStore('blauwdruk', () => {
  const periodes = ref([])
  const portefeuilles = ref([])
  const keywords = ref([])
  const leeruitkomsten = ref([])

  // ── Laadstatus ────────────────────────────────────────────────────────────
  const isLoading = ref(false)
  const hasError = ref(false)

  // ── SHA's bijhouden voor GitHub commits ───────────────────────────────────
  const fileShas = ref({})

  // ── Dirty tracking ────────────────────────────────────────────────────────
  const dirtyFiles = ref(new Set())

  // ── Update-detectie ───────────────────────────────────────────────────────
  const hasUpdates = ref(false)
  const updateStatus = ref({})

  // ── Laden ─────────────────────────────────────────────────────────────────

  async function loadAll() {
    isLoading.value = true
    hasError.value = false

    const { owner, repo } = useGitHubData().settings()
    if (owner && repo) {
      await loadFromGitHub()
    } else {
      // Geen repo geconfigureerd: probeer cache
      if (!loadFromCache()) {
        hasError.value = true
      }
    }

    isLoading.value = false
  }

  async function loadFromGitHub() {
    const gh = useGitHubData()
    try {
      const [p, pf, kw, lu] = await Promise.all([
        gh.fetchJsonFile(DATA_FILES.PERIODES),
        gh.fetchJsonFile(DATA_FILES.PORTEFEUILLES),
        gh.fetchJsonFile(DATA_FILES.KEYWORDS),
        gh.fetchJsonFile(DATA_FILES.LEERUITKOMSTEN),
      ])
      periodes.value = p.data
      portefeuilles.value = pf.data
      keywords.value = kw.data
      leeruitkomsten.value = lu.data

      fileShas.value = {
        [DATA_FILES.PERIODES]: p.sha,
        [DATA_FILES.PORTEFEUILLES]: pf.sha,
        [DATA_FILES.KEYWORDS]: kw.sha,
        [DATA_FILES.LEERUITKOMSTEN]: lu.sha,
      }

      saveToCache()
      localStorage.setItem(CACHE_KEYS.SHAS, JSON.stringify(fileShas.value))
      dirtyFiles.value = new Set()
      hasUpdates.value = false
      updateStatus.value = {}
    } catch (e) {
      console.error('GitHub laden mislukt, terugvallen op cache', e)
      if (!loadFromCache()) {
        hasError.value = true
      }
    }
  }

  function loadFromCache() {
    const p  = localStorage.getItem(CACHE_KEYS.PERIODES)
    const pf = localStorage.getItem(CACHE_KEYS.PORTEFEUILLES)
    const kw = localStorage.getItem(CACHE_KEYS.KEYWORDS)
    const lu = localStorage.getItem(CACHE_KEYS.LEERUITKOMSTEN)
    if (p && pf && kw && lu) {
      periodes.value      = JSON.parse(p)
      portefeuilles.value = JSON.parse(pf)
      keywords.value      = JSON.parse(kw)
      leeruitkomsten.value = JSON.parse(lu)
      return true
    }
    return false
  }

  function saveToCache() {
    localStorage.setItem(CACHE_KEYS.PERIODES,      JSON.stringify(periodes.value))
    localStorage.setItem(CACHE_KEYS.PORTEFEUILLES, JSON.stringify(portefeuilles.value))
    localStorage.setItem(CACHE_KEYS.KEYWORDS,      JSON.stringify(keywords.value))
    localStorage.setItem(CACHE_KEYS.LEERUITKOMSTEN, JSON.stringify(leeruitkomsten.value))
  }

  async function refreshFromGitHub() {
    isLoading.value = true
    hasError.value = false
    await loadFromGitHub()
    isLoading.value = false
  }

  // ── Update-detectie ───────────────────────────────────────────────────────

  async function checkForUpdates() {
    const gh = useGitHubData()
    const { owner, repo } = gh.settings()
    if (!owner || !repo) return

    const storedShas = JSON.parse(localStorage.getItem(CACHE_KEYS.SHAS) || '{}')
    if (Object.keys(storedShas).length === 0) {
      hasUpdates.value = true
      return
    }

    try {
      const remoteShas = await gh.getTreeShas()
      const trackedFiles = Object.values(DATA_FILES)
      const status = {}
      let anyUpdate = false

      for (const file of trackedFiles) {
        const localSha  = storedShas[file] || null
        const remoteSha = remoteShas[file] || null
        const hasUpdate = !!(localSha && remoteSha && localSha !== remoteSha)
        if (hasUpdate) anyUpdate = true
        status[file] = { hasUpdate, localSha, remoteSha }
      }

      updateStatus.value = status
      hasUpdates.value = anyUpdate
    } catch (e) {
      console.error('Update-check mislukt:', e.message)
    }
  }

  // ── Opslaan (cache + dirty tracking) ─────────────────────────────────────

  function saveKeywords() {
    dirtyFiles.value = new Set([...dirtyFiles.value, DATA_FILES.KEYWORDS])
    localStorage.setItem(CACHE_KEYS.KEYWORDS, JSON.stringify(keywords.value))
  }

  function saveLeeruitkomsten() {
    dirtyFiles.value = new Set([...dirtyFiles.value, DATA_FILES.LEERUITKOMSTEN])
    localStorage.setItem(CACHE_KEYS.LEERUITKOMSTEN, JSON.stringify(leeruitkomsten.value))
  }

  // ── Publiceren naar GitHub via PR ─────────────────────────────────────────

  async function publishChanges(branchName, prTitle, prBody) {
    const gh = useGitHubData()

    if (!localStorage.getItem(SETTINGS_KEYS.GH_TOKEN)) {
      throw new Error('Je bent niet ingelogd. Ga naar Instellingen om in te loggen.')
    }
    const { owner, repo } = gh.settings()
    if (!owner || !repo) {
      throw new Error('Geen data-repository geconfigureerd. Ga naar Instellingen.')
    }
    if (dirtyFiles.value.size === 0) {
      throw new Error('Er zijn geen wijzigingen om te publiceren.')
    }

    await gh.createBranch(branchName)

    const fileDataMap = {
      [DATA_FILES.KEYWORDS]:      keywords.value,
      [DATA_FILES.LEERUITKOMSTEN]: leeruitkomsten.value,
    }

    for (const fileName of dirtyFiles.value) {
      const data = fileDataMap[fileName]
      if (!data) continue
      const { sha } = await gh.fetchJsonFile(fileName, branchName)
      await gh.commitJsonFile(fileName, data, sha, branchName, `chore: update ${fileName}`)
    }

    const pr = await gh.createPR(prTitle, prBody || '', branchName)
    dirtyFiles.value = new Set()
    return pr.html_url
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
    isLoading, hasError,
    dirtyFiles, hasUpdates, updateStatus,
    loadAll, refreshFromGitHub, checkForUpdates,
    addKeyword, updateKeyword, deleteKeyword,
    addLeeruitkomst, updateLeeruitkomst, deleteLeeruitkomst,
    generateId,
    publishChanges,
  }
})
