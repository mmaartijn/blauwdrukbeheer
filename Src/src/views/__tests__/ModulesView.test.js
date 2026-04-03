import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { describe, it, expect, vi } from 'vitest'
import ModulesView from '../ModulesView.vue'
import { useBlauwdrukStore } from '@/stores/blauwdruk'

// RouterLink stub om vue-router buiten scope te houden
const RouterLink = { template: '<a :href="to"><slot /></a>', props: ['to'] }

function mountView(leeruitkomsten = [], periodes = []) {
  const wrapper = mount(ModulesView, {
    global: {
      plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })],
      stubs: { RouterLink },
    },
  })
  const store = useBlauwdrukStore()
  store.leeruitkomsten = leeruitkomsten
  store.periodes = periodes
  return wrapper
}

// ── moduleEc ─────────────────────────────────────────────────────────────────

describe('moduleEc (via gerenderd EC-badge)', () => {
  it('toont de som van alle EC-waarden', async () => {
    const w = mountView(
      [
        { id: 'lu-1', periode: 'p1', module: 'Full Stack', ec: 15 },
        { id: 'lu-2', periode: 'p1', module: 'Full Stack', ec: 15 },
      ],
      [{ id: 'p1', label: 'Jaar 1 Blok 1', jaar: 1 }],
    )
    await w.vm.$nextTick()
    expect(w.text()).toContain('30 EC')
  })

  it('valt terug op EC-vermelding in modulenaam als ECs null zijn', async () => {
    const w = mountView(
      [{ id: 'lu-1', periode: 'p1', module: 'Databases (20 EC)', ec: null }],
      [{ id: 'p1', label: 'Jaar 1 Blok 1', jaar: 1 }],
    )
    await w.vm.$nextTick()
    expect(w.text()).toContain('20 EC')
  })

  it('valt terug case-insensitief (bijv. "20 ec")', async () => {
    const w = mountView(
      [{ id: 'lu-1', periode: 'p1', module: 'Test (20 ec)', ec: null }],
      [{ id: 'p1', label: 'Jaar 1 Blok 1', jaar: 1 }],
    )
    await w.vm.$nextTick()
    expect(w.text()).toContain('20 EC')
  })

  it('toont geen EC-badge als er geen EC-informatie is', async () => {
    const w = mountView(
      [{ id: 'lu-1', periode: 'p1', module: 'Test', ec: null }],
      [{ id: 'p1', label: 'Jaar 1 Blok 1', jaar: 1 }],
    )
    await w.vm.$nextTick()
    expect(w.text()).not.toContain('EC')
  })

  it('behandelt EC = 0 als geen EC (valt terug op modulenaam)', async () => {
    const w = mountView(
      [{ id: 'lu-1', periode: 'p1', module: 'Test (10 EC)', ec: 0 }],
      [{ id: 'p1', label: 'Jaar 1 Blok 1', jaar: 1 }],
    )
    await w.vm.$nextTick()
    expect(w.text()).toContain('10 EC')
  })

  it('telt alleen niet-null EC-waarden mee', async () => {
    const w = mountView(
      [
        { id: 'lu-1', periode: 'p1', module: 'Test', ec: 10 },
        { id: 'lu-2', periode: 'p1', module: 'Test', ec: null },
      ],
      [{ id: 'p1', label: 'Jaar 1 Blok 1', jaar: 1 }],
    )
    await w.vm.$nextTick()
    expect(w.text()).toContain('10 EC')
  })
})

// ── modules computed ─────────────────────────────────────────────────────────

describe('modules (groupering per periode)', () => {
  it('groepeert leeruitkomsten van dezelfde periode als één module', async () => {
    const w = mountView(
      [
        { id: 'lu-1', periode: 'p1', module: 'Full Stack', ec: 15 },
        { id: 'lu-2', periode: 'p1', module: 'Full Stack', ec: 15 },
      ],
      [{ id: 'p1', label: 'Jaar 1 Blok 1', jaar: 1 }],
    )
    await w.vm.$nextTick()
    // Slechts één module-kaart verwacht
    expect(w.text().match(/Full Stack/g)).toHaveLength(1)
  })

  it('maakt aparte modules voor verschillende periodes', async () => {
    const w = mountView(
      [
        { id: 'lu-1', periode: 'p1', module: 'Module A', ec: 10 },
        { id: 'lu-2', periode: 'p2', module: 'Module B', ec: 10 },
      ],
      [
        { id: 'p1', label: 'Jaar 1 Blok 1', jaar: 1 },
        { id: 'p2', label: 'Jaar 1 Blok 2', jaar: 1 },
      ],
    )
    await w.vm.$nextTick()
    expect(w.text()).toContain('Module A')
    expect(w.text()).toContain('Module B')
  })

  it('toont "Jaar 0" als de periode niet bestaat in periodes', async () => {
    const w = mountView(
      [{ id: 'lu-1', periode: 'onbekend', module: 'Wees', ec: null }],
      [],
    )
    await w.vm.$nextTick()
    expect(w.text()).toContain('Jaar 0')
  })

  it('toont niets als er geen leeruitkomsten zijn', async () => {
    const w = mountView([], [])
    await w.vm.$nextTick()
    expect(w.findAll('a').length).toBe(0)
  })
})

// ── jaren computed ────────────────────────────────────────────────────────────

describe('jaren', () => {
  it('toont unieke jaren gesorteerd', async () => {
    const w = mountView(
      [
        { id: 'lu-1', periode: 'p3', module: 'C', ec: 5 },
        { id: 'lu-2', periode: 'p1', module: 'A', ec: 5 },
        { id: 'lu-3', periode: 'p2', module: 'B', ec: 5 },
      ],
      [
        { id: 'p1', label: 'J1B1', jaar: 1 },
        { id: 'p2', label: 'J2B1', jaar: 2 },
        { id: 'p3', label: 'J3B1', jaar: 3 },
      ],
    )
    await w.vm.$nextTick()
    const jaarHeaders = w.findAll('h2').map(h => h.text())
    expect(jaarHeaders).toEqual(['Jaar 1', 'Jaar 2', 'Jaar 3'])
  })

  it('toont elk jaar slechts één keer, ook bij meerdere modules', async () => {
    const w = mountView(
      [
        { id: 'lu-1', periode: 'p1', module: 'A', ec: 5 },
        { id: 'lu-2', periode: 'p2', module: 'B', ec: 5 },
      ],
      [
        { id: 'p1', label: 'J1B1', jaar: 1 },
        { id: 'p2', label: 'J1B2', jaar: 1 },
      ],
    )
    await w.vm.$nextTick()
    const jaarHeaders = w.findAll('h2').filter(h => h.text().startsWith('Jaar'))
    expect(jaarHeaders).toHaveLength(1)
  })
})

// ── periodeLabel ──────────────────────────────────────────────────────────────

describe('periodeLabel', () => {
  it('toont het label van de periode', async () => {
    const w = mountView(
      [{ id: 'lu-1', periode: 'p1', module: 'Full Stack', ec: 10 }],
      [{ id: 'p1', label: 'Jaar 2 Blok 3', jaar: 2 }],
    )
    await w.vm.$nextTick()
    expect(w.text()).toContain('Jaar 2 Blok 3')
  })

  it('gebruikt de periodeId als label-fallback', async () => {
    const w = mountView(
      [{ id: 'lu-1', periode: 'onbekend-periode', module: 'Test', ec: null }],
      [],
    )
    await w.vm.$nextTick()
    expect(w.text()).toContain('onbekend-periode')
  })
})

// ── sortering ────────────────────────────────────────────────────────────────

describe('sortering', () => {
  it('sorteert modules op jaar en daarna op periodeId', async () => {
    const w = mountView(
      [
        { id: 'lu-1', periode: 'p-b', module: 'B', ec: 5 },
        { id: 'lu-2', periode: 'p-a', module: 'A', ec: 5 },
      ],
      [
        { id: 'p-a', label: 'A', jaar: 1 },
        { id: 'p-b', label: 'B', jaar: 1 },
      ],
    )
    await w.vm.$nextTick()
    const links = w.findAll('a')
    expect(links[0].text()).toContain('A')
    expect(links[1].text()).toContain('B')
  })
})
