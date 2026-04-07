import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { CACHE_KEYS, DATA_FILES, SETTINGS_KEYS } from '@/constants/api'
import { useGitHubData } from '@/composables/useGitHubData'
import { generateAllModulePdfs } from '@/composables/usePdfExport'

export const useBlauwdrukStore = defineStore('blauwdruk', () => {
  const periodes = ref([])
  const portefeuilles = ref([])
  const keywords = ref([])
  const modules = ref([])

  const leeruitkomsten = computed(() => {
    return modules.value.flatMap(m => m.leeruitkomsten.map(lu => ({
      ...lu,
      module: m.naam,
      periode: m.periode
    })))
  })

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
      // Geen repo geconfigureerd: probeer cache, anders lege staat (geen fout)
      loadFromCache()
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
      const [p, pf, kw, m] = await Promise.all([
        gh.fetchJsonFile(DATA_FILES.PERIODES),
        gh.fetchJsonFile(DATA_FILES.PORTEFEUILLES),
        gh.fetchJsonFile(DATA_FILES.KEYWORDS),
        gh.fetchJsonFile(DATA_FILES.MODULES),
      ])

      // SHA's altijd bijwerken op basis van GitHub (nodig bij latere commits)
      fileShas.value = {
        [DATA_FILES.PERIODES]: p.sha,
        [DATA_FILES.PORTEFEUILLES]: pf.sha,
        [DATA_FILES.KEYWORDS]: kw.sha,
        [DATA_FILES.MODULES]: m.sha,
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
      restore(DATA_FILES.MODULES,       m.data,  CACHE_KEYS.MODULES,       modules)

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

  /**
   * Herstelt mojibake in gecachede data: UTF-8-bytes die abusievelijk als Latin-1 zijn
   * opgeslagen (bijv. ë → Ã«). De charCodes van die Latin-1-chars vormen samen geldige
   * UTF-8; TextDecoder decodeert ze dan terug naar het juiste teken.
   * Strings die al correct zijn (charCode > 127 maar geen geldige UTF-8-reeks) gooien
   * een fout en worden ongewijzigd teruggegeven.
   */
  function repairMojibake(val) {
    if (typeof val === 'string') {
      try {
        const bytes = Uint8Array.from(val, c => c.charCodeAt(0))
        return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
      } catch {
        return val
      }
    }
    if (Array.isArray(val)) return val.map(repairMojibake)
    if (val && typeof val === 'object') {
      return Object.fromEntries(Object.entries(val).map(([k, v]) => [k, repairMojibake(v)]))
    }
    return val
  }

  function loadFromCache() {
    const p  = localStorage.getItem(CACHE_KEYS.PERIODES)
    const pf = localStorage.getItem(CACHE_KEYS.PORTEFEUILLES)
    const kw = localStorage.getItem(CACHE_KEYS.KEYWORDS)
    const m  = localStorage.getItem(CACHE_KEYS.MODULES)
    if (p && pf && kw && m) {
      periodes.value       = repairMojibake(JSON.parse(p))
      portefeuilles.value  = repairMojibake(JSON.parse(pf))
      keywords.value       = repairMojibake(JSON.parse(kw))
      modules.value        = repairMojibake(JSON.parse(m))
      // Dirty state herstellen zodat de badge en publiceer-knop correct zijn na refresh
      const persisted = JSON.parse(localStorage.getItem(CACHE_KEYS.DIRTY_FILES) || '[]')
      dirtyFiles.value = new Set(persisted)
      return true
    }
    return false
  }

  // Haalt de nieuwste versie op van GitHub, maar bewaart lokale dirty wijzigingen.
  async function refreshFromGitHub() {
    isLoading.value = true
    hasError.value = false
    await loadFromGitHub()
    isLoading.value = false
  }

  // Gooit alle lokale wijzigingen weg en laadt de GitHub-versie volledig opnieuw.
  // Alleen aanroepen na expliciete bevestiging door de gebruiker.
  async function discardChanges() {
    dirtyFiles.value = new Set()
    localStorage.removeItem(CACHE_KEYS.DIRTY_FILES)
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

  function saveModules() {
    localStorage.setItem(CACHE_KEYS.MODULES, JSON.stringify(modules.value))
    persistDirty(DATA_FILES.MODULES)
  }

  // ── Publiceren naar GitHub via PR ─────────────────────────────────────────

  /**
   * Publiceert dirty wijzigingen naar een nieuwe feature branch en opent een PR.
   * Genereert ook client-side PDFs voor alle modules en commit die mee.
   * onPdfProgress(current, total, naam) wordt aangeroepen per gegenereerde PDF.
   */
  async function publishChanges(branchName, prTitle, prBody, onPdfProgress = null) {
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

    // 1. Branch aanmaken op basis van HEAD van main
    await gh.createBranch(branchName)

    // 2. Dirty JSON-bestanden committen
    const fileDataMap = {
      [DATA_FILES.KEYWORDS]:      keywords.value,
      [DATA_FILES.MODULES]:       modules.value,
      [DATA_FILES.PERIODES]:      periodes.value,
      [DATA_FILES.PORTEFEUILLES]: portefeuilles.value,
    }

    for (const fileName of dirtyFiles.value) {
      const data = fileDataMap[fileName]
      if (!data) continue
      const { sha } = await gh.fetchJsonFile(fileName, branchName)
      await gh.commitJsonFile(fileName, data, sha, branchName, `chore: update ${fileName}`)
    }

    // 3. PDFs genereren en committen voor alle modules
    //    (keywords kunnen ook gewijzigd zijn en die komen in de PDF, dus altijd alles regenereren)
    const pdfFiles = await generateAllModulePdfs(
      modules.value,
      keywords.value,
      portefeuilles.value,
      periodes.value,
      onPdfProgress
    )

    for (const { filename, base64 } of pdfFiles) {
      const existingSha = await gh.fetchFileSha(filename, branchName)
      await gh.commitFile(filename, base64, existingSha, branchName, `chore: update ${filename}`)
    }

    // 4. PR aanmaken
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

  // ── Leeruitkomsten (via Modules) ─────────────────────────────────────────

  function addLeeruitkomst(lu, moduleNameOrId) {
    // Zoek module op id of naam; val terug op periode als geen expliciete module opgegeven
    let mod = modules.value.find(m => m.id === moduleNameOrId || m.naam === moduleNameOrId)
    if (!mod && lu.periode) {
      mod = modules.value.find(m => m.periode === lu.periode)
    }
    if (mod) {
      // Strip afgeleide velden die de store zelf toevoegt via de computed (module, periode)
      mod.leeruitkomsten.push(omitComputedFields(lu))
      saveModules()
    } else {
      console.error('Kan module niet vinden voor nieuwe leeruitkomst:', moduleNameOrId)
    }
  }

  function updateLeeruitkomst(updated) {
    const mod = modules.value.find(m => m.leeruitkomsten.some(l => l.id === updated.id))
    if (mod) {
      const idx = mod.leeruitkomsten.findIndex(l => l.id === updated.id)
      // Strip afgeleide velden die de store zelf toevoegt via de computed (module, periode)
      mod.leeruitkomsten[idx] = omitComputedFields(updated)
      saveModules()
    }
  }

  // Verwijdert door de computed toegevoegde velden zodat ze niet in modules.json belanden
  function omitComputedFields(lu) {
    const { module, periode, ...rest } = lu
    void module; void periode
    return rest
  }

  function deleteLeeruitkomst(id) {
    const mod = modules.value.find(m => m.leeruitkomsten.some(l => l.id === id))
    if (mod) {
      mod.leeruitkomsten = mod.leeruitkomsten.filter(l => l.id !== id)
      saveModules()
    }
  }

  // ── Modules ──────────────────────────────────────────────────────────────
  function addModule(mod) {
    modules.value.push({
      id: mod.id || generateId('mod'),
      naam: mod.naam,
      periode: mod.periode,
      leeruitkomsten: mod.leeruitkomsten || []
    })
    saveModules()
  }

  function updateModule(updated) {
    const idx = modules.value.findIndex(m => m.id === updated.id)
    if (idx !== -1) modules.value[idx] = updated
    saveModules()
  }

  function deleteModule(id) {
    modules.value = modules.value.filter(m => m.id !== id)
    saveModules()
  }

  // ── Hulpfuncties ──────────────────────────────────────────────────────────
  function generateId(prefix) {
    return `${prefix}-${Date.now()}`
  }

  return {
    periodes, portefeuilles, keywords, modules, leeruitkomsten,
    isLoading, hasError,
    dirtyFiles, hasUpdates, updateStatus,
    loadAll, refreshFromGitHub, discardChanges, checkForUpdates,
    addKeyword, updateKeyword, deleteKeyword,
    addLeeruitkomst, updateLeeruitkomst, deleteLeeruitkomst,
    addModule, updateModule, deleteModule,
    generateId,
    publishChanges,
  }
})
