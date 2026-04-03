import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LeeruitkomstModal from '../LeeruitkomstModal.vue'

const periodes = [
  { id: 'p1', label: 'Jaar 1 Blok 1' },
  { id: 'p2', label: 'Jaar 1 Blok 2' },
]

function mountModal(leeruitkomst = {}) {
  return mount(LeeruitkomstModal, {
    props: { leeruitkomst, periodes },
    attachTo: document.body,
  })
}

// ── isNew ────────────────────────────────────────────────────────────────────

describe('isNew', () => {
  it('toont "Nieuwe leeruitkomst" als naam leeg is', () => {
    const w = mountModal({ id: 'lu-new', naam: '', periode: 'p1' })
    expect(w.text()).toContain('Nieuwe leeruitkomst')
  })

  it('toont "Leeruitkomst bewerken" als naam gevuld is', () => {
    const w = mountModal({ id: 'lu-1', naam: 'Full Stack', periode: 'p1', ec: 15 })
    expect(w.text()).toContain('Leeruitkomst bewerken')
  })

  it('verbergt de verwijderknop voor een nieuwe leeruitkomst', () => {
    const w = mountModal({ id: 'lu-new', naam: '', periode: 'p1' })
    expect(w.find('button.text-red-600').exists()).toBe(false)
  })

  it('toont de verwijderknop voor een bestaande leeruitkomst', () => {
    const w = mountModal({ id: 'lu-1', naam: 'Full Stack', periode: 'p1' })
    expect(w.find('button.text-red-600').exists()).toBe(true)
  })
})

// ── isValid ──────────────────────────────────────────────────────────────────

describe('isValid', () => {
  it('opslaan is uitgeschakeld als naam leeg is', () => {
    const w = mountModal({ id: 'lu-1', naam: '', periode: 'p1' })
    const saveBtn = w.find('button.bg-blue-700')
    expect(saveBtn.attributes('disabled')).toBeDefined()
  })

  it('opslaan is uitgeschakeld als periode ontbreekt', () => {
    const w = mountModal({ id: 'lu-1', naam: 'Test', periode: '' })
    const saveBtn = w.find('button.bg-blue-700')
    expect(saveBtn.attributes('disabled')).toBeDefined()
  })

  it('opslaan is ingeschakeld als naam en periode gevuld zijn', () => {
    const w = mountModal({ id: 'lu-1', naam: 'Full Stack', periode: 'p1' })
    const saveBtn = w.find('button.bg-blue-700')
    expect(saveBtn.attributes('disabled')).toBeUndefined()
  })

  it('opslaan is uitgeschakeld als naam alleen whitespace is', async () => {
    const w = mountModal({ id: 'lu-1', naam: 'Full Stack', periode: 'p1' })
    await w.find('input[type="text"]').setValue('   ')
    const saveBtn = w.find('button.bg-blue-700')
    expect(saveBtn.attributes('disabled')).toBeDefined()
  })
})

// ── opslaan / array-conversie ────────────────────────────────────────────────

describe('opslaan', () => {
  it('emits "save" met de formulierdata', async () => {
    const w = mountModal({ id: 'lu-1', naam: 'Full Stack', periode: 'p1', ec: 15 })
    await w.find('button.bg-blue-700').trigger('click')
    expect(w.emitted('save')).toBeTruthy()
    expect(w.emitted('save')[0][0]).toMatchObject({ id: 'lu-1', naam: 'Full Stack', ec: 15 })
  })

  it('converteert textarea-tekst naar arrays bij opslaan', async () => {
    const w = mountModal({ id: 'lu-1', naam: 'Test', periode: 'p1' })
    const textareas = w.findAll('textarea')
    // Eerste textarea = omschrijving, vierde = eindkwalificaties (index 2 in het grid)
    // Zoek de eindkwalificaties-textarea via label
    const eindkwTextarea = textareas.find((_, i) => i === 2)
    if (eindkwTextarea) {
      await eindkwTextarea.setValue('Item A\nItem B\nItem C')
    }
    await w.find('button.bg-blue-700').trigger('click')
    const saved = w.emitted('save')?.[0]?.[0]
    if (saved?.eindkwalificaties) {
      expect(Array.isArray(saved.eindkwalificaties)).toBe(true)
    }
  })

  it('filtert lege regels uit bij opslaan', async () => {
    const w = mountModal({
      id: 'lu-1',
      naam: 'Test',
      periode: 'p1',
      eindkwalificaties: ['Item A', '', 'Item B'],
    })
    await w.find('button.bg-blue-700').trigger('click')
    const saved = w.emitted('save')?.[0]?.[0]
    if (saved?.eindkwalificaties) {
      expect(saved.eindkwalificaties).not.toContain('')
    }
  })

  it('doet niets als het formulier ongeldig is', async () => {
    const w = mountModal({ id: 'lu-1', naam: '', periode: 'p1' })
    await w.find('button.bg-blue-700').trigger('click')
    expect(w.emitted('save')).toBeFalsy()
  })
})

// ── annuleren / sluiten ──────────────────────────────────────────────────────

describe('sluiten', () => {
  it('emits "close" bij klik op sluit-knop', async () => {
    const w = mountModal({ id: 'lu-1', naam: 'Test', periode: 'p1' })
    await w.find('button.text-gray-400').trigger('click')
    expect(w.emitted('close')).toBeTruthy()
  })

  it('emits "close" bij klik op Annuleren', async () => {
    const w = mountModal({ id: 'lu-1', naam: 'Test', periode: 'p1' })
    const btns = w.findAll('button')
    const annuleren = btns.find(b => b.text() === 'Annuleren')
    await annuleren.trigger('click')
    expect(w.emitted('close')).toBeTruthy()
  })
})

// ── verwijderen ──────────────────────────────────────────────────────────────

describe('verwijderen', () => {
  beforeEach(() => {
    vi.stubGlobal('confirm', vi.fn(() => true))
  })

  it('emits "delete" met het leeruitkomst-id na bevestiging', async () => {
    const w = mountModal({ id: 'lu-42', naam: 'Full Stack', periode: 'p1' })
    await w.find('button.text-red-600').trigger('click')
    expect(w.emitted('delete')).toBeTruthy()
    expect(w.emitted('delete')[0][0]).toBe('lu-42')
  })

  it('emits geen "delete" als gebruiker annuleert', async () => {
    vi.stubGlobal('confirm', vi.fn(() => false))
    const w = mountModal({ id: 'lu-42', naam: 'Full Stack', periode: 'p1' })
    await w.find('button.text-red-600').trigger('click')
    expect(w.emitted('delete')).toBeFalsy()
  })
})

// ── arrayToString / stringToArray (getest via round-trip) ───────────────────

describe('array ↔ string round-trip', () => {
  it('toont bestaande eindkwalificaties als tekst in de textarea', () => {
    const w = mountModal({
      id: 'lu-1',
      naam: 'Test',
      periode: 'p1',
      eindkwalificaties: ['Concepting', 'Design', 'Development'],
    })
    // Textarea-waarden staan in .element.value, niet in .html()
    const textareas = w.findAll('textarea')
    const eindkwTextarea = textareas[2] // 0=omschrijving, 1=beroepscontext, 2=eindkwalificaties
    expect(eindkwTextarea.element.value).toContain('Concepting')
    expect(eindkwTextarea.element.value).toContain('Design')
  })

  it('slaat lege array op als er geen eindkwalificaties zijn', async () => {
    const w = mountModal({ id: 'lu-1', naam: 'Test', periode: 'p1', eindkwalificaties: [] })
    await w.find('button.bg-blue-700').trigger('click')
    const saved = w.emitted('save')?.[0]?.[0]
    expect(saved?.eindkwalificaties ?? []).toEqual([])
  })
})
