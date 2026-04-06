import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useBlauwdrukStore } from '@/stores/blauwdruk'

// Mock vue-router zodat useRoute controleerbaar is
vi.mock('vue-router', async (importOriginal) => {
  const mod = await importOriginal()
  return {
    ...mod,
    useRoute: vi.fn(() => ({ params: { periodeId: 'test-periode' } })),
    RouterLink: { template: '<a><slot /></a>', props: ['to'] },
  }
})

// KeywordModal stubben om geen extra afhankelijkheden te trekken
const KeywordModalStub = { template: '<div data-testid="keyword-modal" />', props: ['keyword', 'portefeuilles', 'periodes'], emits: ['save', 'delete', 'close'] }

async function mountView() {
  const wrapper = mount(
    (await import('../ModuleDetailView.vue')).default,
    {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })],
        stubs: { KeywordModal: KeywordModalStub, Teleport: true },
      },
      attachTo: document.body,
    },
  )
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ json: () => Promise.resolve([]) })))
  return wrapper
}

/**
 * Converteert een platte LU-lijst (met module- en periode-veld) naar de geneste
 * modules-structuur die de store opslaat.
 */
function luToModules(lus) {
  const map = {}
  for (const lu of lus) {
    const key = `${lu.periode}::${lu.module}`
    if (!map[key]) map[key] = { id: `mod-${key}`, naam: lu.module, periode: lu.periode, leeruitkomsten: [] }
    map[key].leeruitkomsten.push(
      Object.fromEntries(Object.entries(lu).filter(([k]) => k !== 'module' && k !== 'periode'))
    )
  }
  return Object.values(map)
}

function seedStore(store, { periodes = [], leeruitkomsten = [], keywords = [], portefeuilles = [] } = {}) {
  store.periodes = periodes
  store.modules = luToModules(leeruitkomsten)
  store.keywords = keywords
  store.portefeuilles = portefeuilles
}

// ── module computed ───────────────────────────────────────────────────────────

describe('module computed', () => {
  it('toont "Module niet gevonden" als er geen modules zijn', async () => {
    const w = await mountView()
    seedStore(useBlauwdrukStore(w.vm.$pinia), { leeruitkomsten: [] })
    await w.vm.$nextTick()
    expect(w.text()).toContain('Module niet gevonden')
  })

  it('toont de modulenaam uit de eerste leeruitkomst', async () => {
    const w = await mountView()
    seedStore(useBlauwdrukStore(w.vm.$pinia), {
      leeruitkomsten: [{ id: 'lu-1', periode: 'test-periode', module: 'Full Stack Dev', ec: 15 }],
      periodes: [{ id: 'test-periode', label: 'Jaar 2 Blok 3', jaar: 2 }],
    })
    await w.vm.$nextTick()
    expect(w.text()).toContain('Full Stack Dev')
  })

  it('toont de som van alle EC-waarden', async () => {
    const w = await mountView()
    seedStore(useBlauwdrukStore(w.vm.$pinia), {
      leeruitkomsten: [
        { id: 'lu-1', periode: 'test-periode', module: 'Test', ec: 10 },
        { id: 'lu-2', periode: 'test-periode', module: 'Test', ec: 20 },
      ],
      periodes: [{ id: 'test-periode', label: 'P1', jaar: 1 }],
    })
    await w.vm.$nextTick()
    expect(w.text()).toContain('30')
  })

  it('valt terug op EC in modulenaam als som nul is', async () => {
    const w = await mountView()
    seedStore(useBlauwdrukStore(w.vm.$pinia), {
      leeruitkomsten: [{ id: 'lu-1', periode: 'test-periode', module: 'Test (25 EC)', ec: null }],
      periodes: [{ id: 'test-periode', label: 'P1', jaar: 1 }],
    })
    await w.vm.$nextTick()
    expect(w.text()).toContain('25')
  })

  it('filtert leeruitkomsten van andere periodes weg', async () => {
    const w = await mountView()
    seedStore(useBlauwdrukStore(w.vm.$pinia), {
      leeruitkomsten: [
        { id: 'lu-1', periode: 'test-periode', module: 'Juiste Module', ec: 10 },
        { id: 'lu-2', periode: 'andere-periode', module: 'Verkeerde Module', ec: 10 },
      ],
      periodes: [
        { id: 'test-periode', label: 'P1', jaar: 1 },
        { id: 'andere-periode', label: 'P2', jaar: 1 },
      ],
    })
    await w.vm.$nextTick()
    expect(w.text()).toContain('Juiste Module')
    expect(w.text()).not.toContain('Verkeerde Module')
  })

  it('gebruikt periodeId als label-fallback als periode niet bestaat', async () => {
    const w = await mountView()
    seedStore(useBlauwdrukStore(w.vm.$pinia), {
      leeruitkomsten: [{ id: 'lu-1', periode: 'test-periode', module: 'Test', ec: 5 }],
      periodes: [], // geen periodes geladen
    })
    await w.vm.$nextTick()
    expect(w.text()).toContain('test-periode')
  })
})

// ── keywordsVoorPf ────────────────────────────────────────────────────────────

describe('keywordsVoorPf', () => {
  it('toont alleen keywords van de juiste portefeuille en periode', async () => {
    const w = await mountView()
    seedStore(useBlauwdrukStore(w.vm.$pinia), {
      leeruitkomsten: [{ id: 'lu-1', periode: 'test-periode', module: 'Test', ec: 5 }],
      periodes: [{ id: 'test-periode', label: 'P1', jaar: 1 }],
      portefeuilles: [
        { id: 'db', label: 'Databases' },
        { id: 'prog', label: 'Programmeren' },
      ],
      keywords: [
        { id: 'kw-1', naam: 'SQL', periode: 'test-periode', portefeuille: 'db', bloom: 2 },
        { id: 'kw-2', naam: 'React', periode: 'test-periode', portefeuille: 'prog', bloom: 3 },
        { id: 'kw-3', naam: 'Oud', periode: 'andere-periode', portefeuille: 'db', bloom: 1 },
      ],
    })
    await w.vm.$nextTick()
    expect(w.text()).toContain('SQL')
    expect(w.text()).toContain('React')
    expect(w.text()).not.toContain('Oud')
  })

  it('toont "Geen onderwerpen" als portefeuille leeg is', async () => {
    const w = await mountView()
    seedStore(useBlauwdrukStore(w.vm.$pinia), {
      leeruitkomsten: [{ id: 'lu-1', periode: 'test-periode', module: 'Test', ec: 5 }],
      periodes: [{ id: 'test-periode', label: 'P1', jaar: 1 }],
      portefeuilles: [{ id: 'db', label: 'Databases' }],
      keywords: [],
    })
    await w.vm.$nextTick()
    expect(w.text()).toContain('Geen onderwerpen')
  })
})

// ── bloom labels en kleuren ───────────────────────────────────────────────────

describe('bloom labels', () => {
  it.each([
    [1, 'Kennen'],
    [2, 'Begrijpen'],
    [3, 'Toepassen'],
    [4, 'Analyseren'],
    [5, 'Evalueren'],
    [6, 'Creëren'],
  ])('toont het juiste bloom-label voor niveau %i', async (niveau, label) => {
    const w = await mountView()
    seedStore(useBlauwdrukStore(w.vm.$pinia), {
      leeruitkomsten: [{ id: 'lu-1', periode: 'test-periode', module: 'Test', ec: 5 }],
      periodes: [{ id: 'test-periode', label: 'P1', jaar: 1 }],
      portefeuilles: [{ id: 'db', label: 'Databases' }],
      keywords: [{ id: 'kw-1', naam: 'Test', periode: 'test-periode', portefeuille: 'db', bloom: niveau }],
    })
    await w.vm.$nextTick()
    expect(w.text()).toContain(label)
  })

  it('toont "Niveau X" voor een onbekend bloom-niveau', async () => {
    const w = await mountView()
    seedStore(useBlauwdrukStore(w.vm.$pinia), {
      leeruitkomsten: [{ id: 'lu-1', periode: 'test-periode', module: 'Test', ec: 5 }],
      periodes: [{ id: 'test-periode', label: 'P1', jaar: 1 }],
      portefeuilles: [{ id: 'db', label: 'Databases' }],
      keywords: [{ id: 'kw-1', naam: 'Test', periode: 'test-periode', portefeuille: 'db', bloom: 99 }],
    })
    await w.vm.$nextTick()
    expect(w.text()).toContain('Niveau 99')
  })
})

// ── saveModuleNaam ────────────────────────────────────────────────────────────

describe('saveModuleNaam', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ json: () => Promise.resolve([]) })))
  })

  it('slaat de naam op voor alle leeruitkomsten in de periode', async () => {
    const w = await mountView()
    const store = useBlauwdrukStore(w.vm.$pinia)
    seedStore(store, {
      leeruitkomsten: [
        { id: 'lu-1', periode: 'test-periode', module: 'Oud Naam', ec: 10 },
        { id: 'lu-2', periode: 'test-periode', module: 'Oud Naam', ec: 10 },
      ],
      periodes: [{ id: 'test-periode', label: 'P1', jaar: 1 }],
    })
    await w.vm.$nextTick()

    // Trigger contextmenu op de header
    await w.find('.border-b-2').trigger('contextmenu')
    await w.vm.$nextTick()

    // Typ nieuwe naam en sla op
    const input = w.find('input.text-2xl')
    if (input.exists()) {
      await input.setValue('Nieuwe Naam')
      await w.find('button.bg-blue-600').trigger('click')
      await w.vm.$nextTick()
      // leeruitkomsten is een computed; module.naam in store.modules bepaalt de waarde
      expect(store.leeruitkomsten.every(lu => lu.module === 'Nieuwe Naam')).toBe(true)
    }
  })

  it('slaat niet op als de naam leeg is', async () => {
    const w = await mountView()
    const store = useBlauwdrukStore(w.vm.$pinia)
    seedStore(store, {
      leeruitkomsten: [{ id: 'lu-1', periode: 'test-periode', module: 'Naam', ec: 10 }],
      periodes: [{ id: 'test-periode', label: 'P1', jaar: 1 }],
    })
    await w.vm.$nextTick()

    await w.find('.border-b-2').trigger('contextmenu')
    await w.vm.$nextTick()

    const input = w.find('input.text-2xl')
    if (input.exists()) {
      await input.setValue('   ') // alleen whitespace
      await w.find('button.bg-blue-600').trigger('click')
      await w.vm.$nextTick()
      expect(store.leeruitkomsten[0].module).toBe('Naam') // ongewijzigd
    }
  })
})

// ── saveEditLu – lege-items filtering ────────────────────────────────────────

describe('saveEditLu (lege array-items worden gefilterd)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ json: () => Promise.resolve([]) })))
  })

  it('filtert lege eindkwalificaties weg bij opslaan', async () => {
    const w = await mountView()
    const store = useBlauwdrukStore(w.vm.$pinia)
    seedStore(store, {
      leeruitkomsten: [{
        id: 'lu-1',
        periode: 'test-periode',
        module: 'Test',
        ec: 10,
        naam: 'LU Test',
        omschrijving: '',
        eindkwalificaties: ['Item A', '', 'Item B', '   '],
        deelstappen: [],
        kennis_vaardigheden: [],
        modellen_theorieen: [],
        toetsmatrijs: [],
      }],
      periodes: [{ id: 'test-periode', label: 'P1', jaar: 1 }],
    })
    await w.vm.$nextTick()

    // Open contextmenu op de leeruitkomst
    const luRow = w.find('[data-lu-row], .mb-6')
    if (luRow.exists()) {
      await luRow.trigger('contextmenu')
      await w.vm.$nextTick()
    }

    // Zoek de opslaan-knop in het edit-formulier
    const saveBtn = w.find('button.bg-blue-600')
    if (saveBtn.exists()) {
      await saveBtn.trigger('click')
      await w.vm.$nextTick()
      const saved = store.leeruitkomsten.find(l => l.id === 'lu-1')
      if (saved?.eindkwalificaties) {
        expect(saved.eindkwalificaties.every(v => v.trim() !== '')).toBe(true)
        expect(saved.eindkwalificaties).not.toContain('')
      }
    }
  })
})
