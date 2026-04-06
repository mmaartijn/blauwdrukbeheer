import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, it, expect, vi } from 'vitest'
import { useBlauwdrukStore } from '../blauwdruk'
import { CACHE_KEYS, DATA_FILES, SETTINGS_KEYS } from '@/constants/api'

// Helpers om GitHub API-responses te simuleren
function makeGitHubFileResponse(data, sha = 'abc123') {
  const content = btoa(JSON.stringify(data))
  return { ok: true, json: () => Promise.resolve({ content, sha }) }
}


const mockFetch = vi.fn()

beforeEach(() => {
  setActivePinia(createPinia())
  vi.stubGlobal('fetch', mockFetch)
  mockFetch.mockReset()
  localStorage.clear()
})

// ── addKeyword ───────────────────────────────────────────────────────────────

describe('addKeyword', () => {
  it('voegt een keyword toe aan de lijst', () => {
    const store = useBlauwdrukStore()
    const kw = { id: 'kw-1', naam: 'SQL', bloom: 2, portefeuille: 'databases', periode: 'p1' }
    store.addKeyword(kw)
    expect(store.keywords).toHaveLength(1)
    expect(store.keywords[0]).toEqual(kw)
  })

  it('markeert keywords.json als dirty', () => {
    const store = useBlauwdrukStore()
    store.addKeyword({ id: 'kw-1', naam: 'SQL', bloom: 2 })
    expect(store.dirtyFiles.has(DATA_FILES.KEYWORDS)).toBe(true)
  })

  it('slaat de keywords op in de localStorage-cache', () => {
    const store = useBlauwdrukStore()
    store.addKeyword({ id: 'kw-1', naam: 'SQL' })
    const cached = JSON.parse(localStorage.getItem(CACHE_KEYS.KEYWORDS))
    expect(cached).toHaveLength(1)
    expect(cached[0].naam).toBe('SQL')
  })

  it('meerdere keywords worden allemaal bewaard', () => {
    const store = useBlauwdrukStore()
    store.addKeyword({ id: 'kw-1', naam: 'SQL' })
    store.addKeyword({ id: 'kw-2', naam: 'NoSQL' })
    expect(store.keywords).toHaveLength(2)
  })

  it('bewaart keyword met alle optionele velden null', () => {
    const store = useBlauwdrukStore()
    const kw = { id: 'kw-1', naam: 'SQL', bloom: null, toelichting: null }
    store.addKeyword(kw)
    expect(store.keywords[0].bloom).toBeNull()
    expect(store.keywords[0].toelichting).toBeNull()
  })
})

// ── updateKeyword ────────────────────────────────────────────────────────────

describe('updateKeyword', () => {
  it('wijzigt het juiste keyword op basis van id', () => {
    const store = useBlauwdrukStore()
    store.keywords = [
      { id: 'kw-1', naam: 'SQL', bloom: 2 },
      { id: 'kw-2', naam: 'NoSQL', bloom: 1 },
    ]
    store.updateKeyword({ id: 'kw-1', naam: 'SQL Advanced', bloom: 4 })
    expect(store.keywords[0]).toEqual({ id: 'kw-1', naam: 'SQL Advanced', bloom: 4 })
    expect(store.keywords[1].naam).toBe('NoSQL')
  })

  it('vervangt het volledige object, niet alleen gewijzigde velden', () => {
    const store = useBlauwdrukStore()
    store.keywords = [{ id: 'kw-1', naam: 'SQL', bloom: 2, toelichting: 'oud' }]
    store.updateKeyword({ id: 'kw-1', naam: 'SQL', bloom: 2 })
    expect(store.keywords[0].toelichting).toBeUndefined()
  })

  it('doet niets als het id niet bestaat', () => {
    const store = useBlauwdrukStore()
    store.keywords = [{ id: 'kw-1', naam: 'SQL' }]
    store.updateKeyword({ id: 'kw-999', naam: 'Onbekend' })
    expect(store.keywords).toHaveLength(1)
    expect(store.keywords[0].naam).toBe('SQL')
  })

  it('markeert keywords.json als dirty na bewerken', () => {
    const store = useBlauwdrukStore()
    store.keywords = [{ id: 'kw-1', naam: 'SQL' }]
    store.updateKeyword({ id: 'kw-1', naam: 'SQL Advanced' })
    expect(store.dirtyFiles.has(DATA_FILES.KEYWORDS)).toBe(true)
  })

  it('slaat de bijgewerkte lijst op in de cache', () => {
    const store = useBlauwdrukStore()
    store.keywords = [
      { id: 'kw-1', naam: 'SQL' },
      { id: 'kw-2', naam: 'NoSQL' },
    ]
    store.updateKeyword({ id: 'kw-1', naam: 'SQL Advanced' })
    const cached = JSON.parse(localStorage.getItem(CACHE_KEYS.KEYWORDS))
    expect(cached).toHaveLength(2)
    expect(cached[0].naam).toBe('SQL Advanced')
    expect(cached[1].naam).toBe('NoSQL')
  })
})

// ── deleteKeyword ────────────────────────────────────────────────────────────

describe('deleteKeyword', () => {
  it('verwijdert het keyword met het opgegeven id', () => {
    const store = useBlauwdrukStore()
    store.keywords = [
      { id: 'kw-1', naam: 'SQL' },
      { id: 'kw-2', naam: 'NoSQL' },
    ]
    store.deleteKeyword('kw-1')
    expect(store.keywords).toHaveLength(1)
    expect(store.keywords[0].id).toBe('kw-2')
  })

  it('doet niets als het id niet bestaat', () => {
    const store = useBlauwdrukStore()
    store.keywords = [{ id: 'kw-1', naam: 'SQL' }]
    store.deleteKeyword('kw-999')
    expect(store.keywords).toHaveLength(1)
  })

  it('verwijdert het laatste keyword en laat een lege lijst achter', () => {
    const store = useBlauwdrukStore()
    store.keywords = [{ id: 'kw-1', naam: 'SQL' }]
    store.deleteKeyword('kw-1')
    expect(store.keywords).toHaveLength(0)
  })

  it('crasht niet op een lege lijst', () => {
    const store = useBlauwdrukStore()
    store.keywords = []
    expect(() => store.deleteKeyword('kw-1')).not.toThrow()
  })

  it('slaat de bijgewerkte lege lijst op in de cache', () => {
    const store = useBlauwdrukStore()
    store.keywords = [{ id: 'kw-1', naam: 'SQL' }]
    store.deleteKeyword('kw-1')
    const cached = JSON.parse(localStorage.getItem(CACHE_KEYS.KEYWORDS))
    expect(cached).toEqual([])
  })
})

// ── addLeeruitkomst ──────────────────────────────────────────────────────────

describe('addLeeruitkomst', () => {
  it('voegt een leeruitkomst toe', () => {
    const store = useBlauwdrukStore()
    const lu = { id: 'lu-1', naam: 'Full Stack', ec: 15, periode: 'p2122-3' }
    store.addLeeruitkomst(lu)
    expect(store.leeruitkomsten).toHaveLength(1)
    expect(store.leeruitkomsten[0]).toEqual(lu)
  })

  it('markeert leeruitkomsten.json als dirty', () => {
    const store = useBlauwdrukStore()
    store.addLeeruitkomst({ id: 'lu-1', naam: 'Test' })
    expect(store.dirtyFiles.has(DATA_FILES.LEERUITKOMSTEN)).toBe(true)
  })

  it('slaat de leeruitkomsten op in de cache', () => {
    const store = useBlauwdrukStore()
    store.addLeeruitkomst({ id: 'lu-1', naam: 'Test', ec: 10 })
    const cached = JSON.parse(localStorage.getItem(CACHE_KEYS.LEERUITKOMSTEN))
    expect(cached[0].ec).toBe(10)
  })

  it('bewaart leeruitkomst met lege arrays voor optionele velden', () => {
    const store = useBlauwdrukStore()
    const lu = { id: 'lu-1', naam: 'Test', eindkwalificaties: [], deelstappen: [] }
    store.addLeeruitkomst(lu)
    expect(store.leeruitkomsten[0].eindkwalificaties).toEqual([])
  })
})

// ── updateLeeruitkomst ───────────────────────────────────────────────────────

describe('updateLeeruitkomst', () => {
  it('wijzigt de juiste leeruitkomst', () => {
    const store = useBlauwdrukStore()
    store.leeruitkomsten = [
      { id: 'lu-1', naam: 'Full Stack', ec: 15 },
      { id: 'lu-2', naam: 'Security', ec: 10 },
    ]
    store.updateLeeruitkomst({ id: 'lu-1', naam: 'Full Stack Pro', ec: 20 })
    expect(store.leeruitkomsten[0]).toEqual({ id: 'lu-1', naam: 'Full Stack Pro', ec: 20 })
    expect(store.leeruitkomsten[1].naam).toBe('Security')
  })

  it('doet niets als id niet bestaat', () => {
    const store = useBlauwdrukStore()
    store.leeruitkomsten = [{ id: 'lu-1', naam: 'Test' }]
    store.updateLeeruitkomst({ id: 'lu-999', naam: 'Onbekend' })
    expect(store.leeruitkomsten[0].naam).toBe('Test')
  })

  it('slaat de bijgewerkte lijst op in de cache', () => {
    const store = useBlauwdrukStore()
    store.leeruitkomsten = [
      { id: 'lu-1', naam: 'Full Stack', ec: 15 },
      { id: 'lu-2', naam: 'Security', ec: 10 },
    ]
    store.updateLeeruitkomst({ id: 'lu-1', naam: 'Full Stack Pro', ec: 20 })
    const cached = JSON.parse(localStorage.getItem(CACHE_KEYS.LEERUITKOMSTEN))
    expect(cached).toHaveLength(2)
    expect(cached[0].naam).toBe('Full Stack Pro')
    expect(cached[1].naam).toBe('Security')
  })
})

// ── deleteLeeruitkomst ───────────────────────────────────────────────────────

describe('deleteLeeruitkomst', () => {
  it('verwijdert de leeruitkomst met het opgegeven id', () => {
    const store = useBlauwdrukStore()
    store.leeruitkomsten = [
      { id: 'lu-1', naam: 'A' },
      { id: 'lu-2', naam: 'B' },
    ]
    store.deleteLeeruitkomst('lu-1')
    expect(store.leeruitkomsten).toHaveLength(1)
    expect(store.leeruitkomsten[0].id).toBe('lu-2')
  })

  it('verwijdert het laatste item en laat lege lijst achter', () => {
    const store = useBlauwdrukStore()
    store.leeruitkomsten = [{ id: 'lu-1', naam: 'A' }]
    store.deleteLeeruitkomst('lu-1')
    expect(store.leeruitkomsten).toHaveLength(0)
  })

  it('crasht niet op een lege lijst', () => {
    const store = useBlauwdrukStore()
    store.leeruitkomsten = []
    expect(() => store.deleteLeeruitkomst('lu-1')).not.toThrow()
  })
})

// ── loadAll ──────────────────────────────────────────────────────────────────

describe('loadAll', () => {
  it('zet hasError als geen repo geconfigureerd en geen cache beschikbaar', async () => {
    const store = useBlauwdrukStore()
    await store.loadAll()
    expect(store.hasError).toBe(true)
  })

  it('laadt vanuit cache als repo niet geconfigureerd maar cache beschikbaar is', async () => {
    localStorage.setItem(CACHE_KEYS.PERIODES,       JSON.stringify([{ id: 'p1' }]))
    localStorage.setItem(CACHE_KEYS.PORTEFEUILLES,  JSON.stringify([]))
    localStorage.setItem(CACHE_KEYS.KEYWORDS,       JSON.stringify([]))
    localStorage.setItem(CACHE_KEYS.LEERUITKOMSTEN, JSON.stringify([]))

    const store = useBlauwdrukStore()
    await store.loadAll()

    expect(store.periodes).toEqual([{ id: 'p1' }])
    expect(store.hasError).toBe(false)
  })

  it('laadt van GitHub als repo geconfigureerd', async () => {
    localStorage.setItem(SETTINGS_KEYS.GH_OWNER, 'testowner')
    localStorage.setItem(SETTINGS_KEYS.GH_REPO,  'testrepo')

    const periodes      = [{ id: 'p1', label: 'Jaar 1 Blok 1' }]
    const portefeuilles = [{ id: 'db', label: 'Databases' }]
    const keywords      = [{ id: 'kw-1', naam: 'SQL' }]
    const leeruitkomsten = [{ id: 'lu-1', naam: 'Full Stack' }]

    mockFetch
      .mockResolvedValueOnce(makeGitHubFileResponse(periodes,       'sha-p'))
      .mockResolvedValueOnce(makeGitHubFileResponse(portefeuilles,  'sha-pf'))
      .mockResolvedValueOnce(makeGitHubFileResponse(keywords,       'sha-kw'))
      .mockResolvedValueOnce(makeGitHubFileResponse(leeruitkomsten, 'sha-lu'))

    const store = useBlauwdrukStore()
    await store.loadAll()

    expect(store.periodes).toEqual(periodes)
    expect(store.portefeuilles).toEqual(portefeuilles)
    expect(store.keywords).toEqual(keywords)
    expect(store.leeruitkomsten).toEqual(leeruitkomsten)
    expect(store.hasError).toBe(false)
  })

  it('slaat geladen SHA\'s op in localStorage na GitHub-laad', async () => {
    localStorage.setItem(SETTINGS_KEYS.GH_OWNER, 'testowner')
    localStorage.setItem(SETTINGS_KEYS.GH_REPO,  'testrepo')

    mockFetch
      .mockResolvedValueOnce(makeGitHubFileResponse([], 'sha-p'))
      .mockResolvedValueOnce(makeGitHubFileResponse([], 'sha-pf'))
      .mockResolvedValueOnce(makeGitHubFileResponse([], 'sha-kw'))
      .mockResolvedValueOnce(makeGitHubFileResponse([], 'sha-lu'))

    const store = useBlauwdrukStore()
    await store.loadAll()

    const shas = JSON.parse(localStorage.getItem(CACHE_KEYS.SHAS))
    expect(shas[DATA_FILES.KEYWORDS]).toBe('sha-kw')
    expect(shas[DATA_FILES.LEERUITKOMSTEN]).toBe('sha-lu')
  })

  it('valt terug op cache als GitHub mislukt', async () => {
    localStorage.setItem(SETTINGS_KEYS.GH_OWNER,       'testowner')
    localStorage.setItem(SETTINGS_KEYS.GH_REPO,        'testrepo')
    localStorage.setItem(CACHE_KEYS.PERIODES,           JSON.stringify([{ id: 'cached' }]))
    localStorage.setItem(CACHE_KEYS.PORTEFEUILLES,      JSON.stringify([]))
    localStorage.setItem(CACHE_KEYS.KEYWORDS,           JSON.stringify([]))
    localStorage.setItem(CACHE_KEYS.LEERUITKOMSTEN,     JSON.stringify([]))

    mockFetch.mockRejectedValueOnce(new Error('Netwerk onbeschikbaar'))

    const store = useBlauwdrukStore()
    await store.loadAll()

    expect(store.periodes).toEqual([{ id: 'cached' }])
    expect(store.hasError).toBe(false)
  })

  it('zet hasError als GitHub mislukt en geen cache beschikbaar', async () => {
    localStorage.setItem(SETTINGS_KEYS.GH_OWNER, 'testowner')
    localStorage.setItem(SETTINGS_KEYS.GH_REPO,  'testrepo')

    mockFetch.mockRejectedValueOnce(new Error('Netwerk onbeschikbaar'))

    const store = useBlauwdrukStore()
    await store.loadAll()

    expect(store.hasError).toBe(true)
  })
})

// ── generateId ───────────────────────────────────────────────────────────────

describe('generateId', () => {
  it('bevat het opgegeven prefix', () => {
    const store = useBlauwdrukStore()
    expect(store.generateId('kw')).toMatch(/^kw-/)
    expect(store.generateId('lu')).toMatch(/^lu-/)
  })

  it('genereert unieke ids bij opeenvolgende aanroepen', () => {
    const store = useBlauwdrukStore()
    vi.useFakeTimers()
    const id1 = store.generateId('kw')
    vi.advanceTimersByTime(1)
    const id2 = store.generateId('kw')
    expect(id1).not.toBe(id2)
    vi.useRealTimers()
  })

  it('bevat een numeriek tijdstempel na het prefix', () => {
    const store = useBlauwdrukStore()
    const id = store.generateId('kw')
    const deel = id.replace('kw-', '')
    expect(Number(deel)).toBeGreaterThan(0)
  })

  it('werkt met willekeurige prefixes', () => {
    const store = useBlauwdrukStore()
    expect(store.generateId('sectie')).toMatch(/^sectie-\d+$/)
    expect(store.generateId('item')).toMatch(/^item-\d+$/)
  })
})
