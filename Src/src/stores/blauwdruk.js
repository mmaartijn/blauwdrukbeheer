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

  /**
   * Laadt van GitHub. Dirty bestanden (lokale wijzigingen nog niet gepubliceerd)
   * worden NIET overschreven — de localStorage-versie blijft leidend voor die bestanden.
   * SHA's worden altijd bijgehouden op basis van de GitHub-versie (nodig voor commits).
   *
   * discardDirty: true → wis dirty state vóór laden (gebruikt door refreshFromGitHub)
   */
  async function loadFromGitHub({ discardDirty = false } = {}) {
    const gh = useGitHubData()
    try {
      const [p, pf, kw, lu] = await Promise.all([
        gh.fetchJsonFile(DATA_FILES.PERIODES),
        gh.fetchJsonFile(DATA_FILES.PORTEFEUILLES),
        gh.fetchJsonFile(DATA_FILES.KEYWORDS),
        gh.fetchJsonFile(DATA_FILES.LEERUITKOMSTEN),
      ])

      // SHA's altijd bijwerken op basis van GitHub (nodig bij latere commits)
      fileShas.value = {
        [DATA_FILES.PERIODES]: p.sha,
        [DATA_FILES.PORTEFEUILLES]: pf.sha,
        [DATA_FILES.KEYWORDS]: kw.sha,
        [DATA_FILES.LEERUITKOMSTEN]: lu.sha,
      }
      localStorage.setItem(CACHE_KEYS.SHAS, JSON.stringify(fileShas.value))

      const persisted = discardDirty
        ? new Set()
        : new Set(JSON.parse(localStorage.getItem(CACHE_KEYS.DIRTY_FILES) || '[]'))

      // Niet-dirty bestanden: overschrijven met GitHub-versie
      // Dirty bestanden: lokale cache-versie bewaren
      const restore = (file, githubData, cacheKey, ref) => {
        if (persisted.has(file)) {
          const cached = localStorage.getItem(cacheKey)
          if (cached) ref.value = JSON.parse(cached)
        } else {
          ref.value = githubData
          localStorage.setItem(cacheKey, JSON.stringify(githubData))
        }
      }

      restore(DATA_FILES.PERIODES,      p.data,  CACHE_KEYS.PERIODES,      periodes)
      restore(DATA_FILES.PORTEFEUILLES, pf.data, CACHE_KEYS.PORTEFEUILLES, portefeuilles)
      restore(DATA_FILES.KEYWORDS,      kw.data, CACHE_KEYS.KEYWORDS,      keywords)
      restore(DATA_FILES.LEERUITKOMSTEN, lu.data, CACHE_KEYS.LEERUITKOMSTEN, leeruitkomsten)

      dirtyFiles.value = persisted
      if (discardDirty) localStorage.removeItem(CACHE_KEYS.DIRTY_FILES)

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
      periodes.value       = JSON.parse(p)
      portefeuilles.value  = JSON.parse(pf)
      keywords.value       = JSON.parse(kw)
      leeruitkomsten.value = JSON.parse(lu)
      // Dirty state herstellen zodat de badge en publiceer-knop correct zijn na refresh
      const persisted = JSON.parse(localStorage.getItem(CACHE_KEYS.DIRTY_FILES) || '[]')
      dirtyFiles.value = new Set(persisted)
      return true
    }
    return false
  }

  // "Laatste versie ophalen" — wist bewust lokale wijzigingen en laadt vers van GitHub
  async function refreshFromGitHub() {
    isLoading.value = true
    hasError.value = false
    await loadFromGitHub({ discardDirty: true })
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

  function persistDirty(file) {
    dirtyFiles.value = new Set([...dirtyFiles.value, file])
    localStorage.setItem(CACHE_KEYS.DIRTY_FILES, JSON.stringify([...dirtyFiles.value]))
  }

  function saveKeywords() {
    localStorage.setItem(CACHE_KEYS.KEYWORDS, JSON.stringify(keywords.value))
    persistDirty(DATA_FILES.KEYWORDS)
  }

  function saveLeeruitkomsten() {
    localStorage.setItem(CACHE_KEYS.LEERUITKOMSTEN, JSON.stringify(leeruitkomsten.value))
    persistDirty(DATA_FILES.LEERUITKOMSTEN)
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
    localStorage.removeItem(CACHE_KEYS.DIRTY_FILES)
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
