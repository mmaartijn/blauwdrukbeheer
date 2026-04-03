import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import KeywordModal from '../KeywordModal.vue'

const portefeuilles = [
  { id: 'databases', label: 'Databases' },
  { id: 'programmeren', label: 'Programmeren' },
]
const periodes = [
  { id: 'p1', label: 'Jaar 1 Blok 1' },
  { id: 'p2', label: 'Jaar 1 Blok 2' },
]

function mountModal(keyword = {}) {
  return mount(KeywordModal, {
    props: { keyword, portefeuilles, periodes },
    attachTo: document.body,
  })
}

// ── isNew ────────────────────────────────────────────────────────────────────

describe('isNew', () => {
  it('toont "Nieuw keyword" als naam leeg is', () => {
    const w = mountModal({ id: 'kw-new', naam: '', bloom: null, portefeuille: 'databases', periode: 'p1', toelichting: '' })
    expect(w.text()).toContain('Nieuw keyword')
  })

  it('toont "Keyword bewerken" als naam gevuld is', () => {
    const w = mountModal({ id: 'kw-1', naam: 'SQL', bloom: 2, portefeuille: 'databases', periode: 'p1', toelichting: '' })
    expect(w.text()).toContain('Keyword bewerken')
  })

  it('verbergt de verwijderknop voor een nieuw keyword', () => {
    const w = mountModal({ id: 'kw-new', naam: '', bloom: null })
    expect(w.find('button.text-red-600').exists()).toBe(false)
  })

  it('toont de verwijderknop voor een bestaand keyword', () => {
    const w = mountModal({ id: 'kw-1', naam: 'SQL', bloom: 2 })
    expect(w.find('button.text-red-600').exists()).toBe(true)
  })
})

// ── submit ───────────────────────────────────────────────────────────────────

describe('submit / opslaan', () => {
  it('emits "save" met de formulierdata bij verzenden', async () => {
    const w = mountModal({ id: 'kw-1', naam: 'SQL', bloom: 2, portefeuille: 'databases', periode: 'p1', toelichting: 'Let op' })
    await w.find('form').trigger('submit')
    expect(w.emitted('save')).toBeTruthy()
    expect(w.emitted('save')[0][0]).toMatchObject({ id: 'kw-1', naam: 'SQL', bloom: 2 })
  })

  it('emits "save" met gewijzigde naam na invoer', async () => {
    const w = mountModal({ id: 'kw-1', naam: 'SQL', bloom: 1, portefeuille: 'databases', periode: 'p1', toelichting: '' })
    await w.find('input[type="text"], input:not([type])').setValue('SQL Gevorderd')
    await w.find('form').trigger('submit')
    expect(w.emitted('save')[0][0].naam).toBe('SQL Gevorderd')
  })
})

// ── close / annuleren ────────────────────────────────────────────────────────

describe('sluiten', () => {
  it('emits "close" bij klik op × knop', async () => {
    const w = mountModal({ id: 'kw-1', naam: 'SQL', bloom: 1 })
    await w.find('button.text-blue-200').trigger('click')
    expect(w.emitted('close')).toBeTruthy()
  })

  it('emits "close" bij klik op Annuleren', async () => {
    const w = mountModal({ id: 'kw-1', naam: 'SQL', bloom: 1 })
    const btns = w.findAll('button')
    const annuleren = btns.find(b => b.text() === 'Annuleren')
    await annuleren.trigger('click')
    expect(w.emitted('close')).toBeTruthy()
  })
})

// ── verwijderen ──────────────────────────────────────────────────────────────

describe('verwijderen', () => {
  it('emits "delete" met het keyword-id', async () => {
    const w = mountModal({ id: 'kw-42', naam: 'SQL', bloom: 1 })
    await w.find('button.text-red-600').trigger('click')
    expect(w.emitted('delete')).toBeTruthy()
    expect(w.emitted('delete')[0][0]).toBe('kw-42')
  })
})

// ── bloom-niveau toggle ──────────────────────────────────────────────────────

describe('bloom toggle', () => {
  it('selecteert een bloom-niveau bij klik', async () => {
    const w = mountModal({ id: 'kw-1', naam: 'SQL', bloom: null, portefeuille: 'databases', periode: 'p1', toelichting: '' })
    const bloomBtns = w.findAll('button[type="button"]')
    await bloomBtns[0].trigger('click') // niveau 1
    await w.find('form').trigger('submit')
    expect(w.emitted('save')[0][0].bloom).toBe(1)
  })

  it('deselecteert een bloom-niveau bij tweede klik (toggle)', async () => {
    const w = mountModal({ id: 'kw-1', naam: 'SQL', bloom: 2, portefeuille: 'databases', periode: 'p1', toelichting: '' })
    const bloomBtns = w.findAll('button[type="button"]')
    await bloomBtns[1].trigger('click') // niveau 2 opnieuw klikken → null
    await w.find('form').trigger('submit')
    expect(w.emitted('save')[0][0].bloom).toBeNull()
  })
})

// ── bloomActiveClass ─────────────────────────────────────────────────────────

describe('bloomActiveClass', () => {
  // Test indirect via de gerenderde knop-classes bij geselecteerd niveau
  it.each([1, 2, 3, 4, 5, 6])('geeft actieve styling voor niveau %i', async (level) => {
    const w = mountModal({ id: 'kw-1', naam: 'SQL', bloom: level, portefeuille: 'databases', periode: 'p1', toelichting: '' })
    // De knop voor het actieve niveau heeft geen 'bg-white' class (inactieve stijl)
    const bloomBtns = w.findAll('button[type="button"]')
    const activeBtn = bloomBtns[level - 1]
    expect(activeBtn.classes()).not.toContain('bg-white')
  })

  it('geeft inactieve styling voor niet-geselecteerde niveaus', () => {
    const w = mountModal({ id: 'kw-1', naam: 'SQL', bloom: 1, portefeuille: 'databases', periode: 'p1', toelichting: '' })
    const bloomBtns = w.findAll('button[type="button"]')
    // Niveau 2 t/m 6 zijn inactief
    for (let i = 1; i < 6; i++) {
      expect(bloomBtns[i].classes()).toContain('bg-white')
    }
  })
})
