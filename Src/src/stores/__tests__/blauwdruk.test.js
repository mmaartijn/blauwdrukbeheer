import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, it, expect, vi } from 'vitest'
import { useBlauwdrukStore } from '../blauwdruk'

// Stub fetch zodat saveKeywords/saveLeeruitkomsten niet crashen
const mockFetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve([]) }))

beforeEach(() => {
  setActivePinia(createPinia())
  vi.stubGlobal('fetch', mockFetch)
  mockFetch.mockClear()
})

// ── Keywords ────────────────────────────────────────────────────────────────

describe('addKeyword', () => {
  it('voegt een keyword toe aan de lijst', () => {
    const store = useBlauwdrukStore()
    const kw = { id: 'kw-1', naam: 'SQL', bloom: 2, portefeuille: 'databases', periode: 'p1' }
    store.addKeyword(kw)
    expect(store.keywords).toHaveLength(1)
    expect(store.keywords[0]).toEqual(kw)
  })

  it('slaat op via fetch na toevoegen', () => {
    const store = useBlauwdrukStore()
    store.addKeyword({ id: 'kw-1', naam: 'SQL', bloom: 2 })
    expect(mockFetch).toHaveBeenCalledWith(
      '/data/keywords.json',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('meerdere keywords worden allemaal bewaard', () => {
    const store = useBlauwdrukStore()
    store.addKeyword({ id: 'kw-1', naam: 'SQL' })
    store.addKeyword({ id: 'kw-2', naam: 'NoSQL' })
    expect(store.keywords).toHaveLength(2)
  })
})

describe('updateKeyword', () => {
  it('wijzigt het juiste keyword op basis van id', () => {
    const store = useBlauwdrukStore()
    store.keywords = [
      { id: 'kw-1', naam: 'SQL', bloom: 2 },
      { id: 'kw-2', naam: 'NoSQL', bloom: 1 },
    ]
    store.updateKeyword({ id: 'kw-1', naam: 'SQL Advanced', bloom: 4 })
    expect(store.keywords[0]).toEqual({ id: 'kw-1', naam: 'SQL Advanced', bloom: 4 })
    expect(store.keywords[1].naam).toBe('NoSQL') // andere ongewijzigd
  })

  it('doet niets als het id niet bestaat', () => {
    const store = useBlauwdrukStore()
    store.keywords = [{ id: 'kw-1', naam: 'SQL' }]
    store.updateKeyword({ id: 'kw-999', naam: 'Onbekend' })
    expect(store.keywords).toHaveLength(1)
    expect(store.keywords[0].naam).toBe('SQL')
  })

  it('slaat op via fetch na bewerken', () => {
    const store = useBlauwdrukStore()
    store.keywords = [{ id: 'kw-1', naam: 'SQL' }]
    store.updateKeyword({ id: 'kw-1', naam: 'SQL Advanced' })
    expect(mockFetch).toHaveBeenCalledWith(
      '/data/keywords.json',
      expect.objectContaining({ method: 'POST' }),
    )
  })
})

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
})

// ── Leeruitkomsten ───────────────────────────────────────────────────────────

describe('addLeeruitkomst', () => {
  it('voegt een leeruitkomst toe', () => {
    const store = useBlauwdrukStore()
    const lu = { id: 'lu-1', naam: 'Full Stack', ec: 15, periode: 'p2122-3' }
    store.addLeeruitkomst(lu)
    expect(store.leeruitkomsten).toHaveLength(1)
    expect(store.leeruitkomsten[0]).toEqual(lu)
  })

  it('slaat op via fetch na toevoegen', () => {
    const store = useBlauwdrukStore()
    store.addLeeruitkomst({ id: 'lu-1', naam: 'Test' })
    expect(mockFetch).toHaveBeenCalledWith(
      '/data/leeruitkomsten.json',
      expect.objectContaining({ method: 'POST' }),
    )
  })
})

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
})

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
})

// ── loadAll ──────────────────────────────────────────────────────────────────

describe('loadAll', () => {
  it('laadt alle data in de store-refs', async () => {
    const periodes = [{ id: 'p1', label: 'Jaar 1 Blok 1' }]
    const portefeuilles = [{ id: 'db', label: 'Databases' }]
    const keywords = [{ id: 'kw-1', naam: 'SQL' }]
    const leeruitkomsten = [{ id: 'lu-1', naam: 'Full Stack' }]

    mockFetch
      .mockResolvedValueOnce({ json: () => Promise.resolve(periodes) })
      .mockResolvedValueOnce({ json: () => Promise.resolve(portefeuilles) })
      .mockResolvedValueOnce({ json: () => Promise.resolve(keywords) })
      .mockResolvedValueOnce({ json: () => Promise.resolve(leeruitkomsten) })

    const store = useBlauwdrukStore()
    await store.loadAll()

    expect(store.periodes).toEqual(periodes)
    expect(store.portefeuilles).toEqual(portefeuilles)
    expect(store.keywords).toEqual(keywords)
    expect(store.leeruitkomsten).toEqual(leeruitkomsten)
  })

  it('zet hasError op true wanneer een fetch mislukt', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Netwerk onbeschikbaar'))
    const store = useBlauwdrukStore()
    await store.loadAll()
    expect(store.hasError).toBe(true)
  })

  it('zet isLoading op false na afloop, ook bij fout', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Timeout'))
    const store = useBlauwdrukStore()
    await store.loadAll()
    expect(store.isLoading).toBe(false)
  })

  it('reset hasError bij herlaad na eerdere fout', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Eerste fout'))
    const store = useBlauwdrukStore()
    await store.loadAll()
    expect(store.hasError).toBe(true)

    mockFetch
      .mockResolvedValueOnce({ json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ json: () => Promise.resolve([]) })
    await store.loadAll()
    expect(store.hasError).toBe(false)
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
    // Gebruik fake timers zodat Date.now() oploopt
    vi.useFakeTimers()
    const id1 = store.generateId('kw')
    vi.advanceTimersByTime(1)
    const id2 = store.generateId('kw')
    expect(id1).not.toBe(id2)
    vi.useRealTimers()
  })
})
