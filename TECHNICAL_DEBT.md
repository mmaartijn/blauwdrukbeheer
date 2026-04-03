# Technical Debt

Bijgehouden per audit-moment. Voeg bevindingen toe zodra ze ontdekt worden; vink af zodra ze opgelost zijn.
Per nieuwe audit-ronde een nieuwe sectie toevoegen, met de datum van de audit. Zorg er dus voor dat de oude secties niet worden overschreven.

**Formaat:** `[ ]` open · `[x]` opgelost · `[~]` in uitvoering
**Ernst:** 🔴 Hoog · 🟡 Middel · 🟢 Laag

---

## Audit: 2026-04-03

### P0 – Direct actie vereist

- [x] 🔴 **Fetch zonder error handling in `loadAll()`** (`stores/blauwdruk.js`) _(opgelost 2026-04-03)_
  try/catch toegevoegd; `isLoading`, `hasError` en `saveError` in store; laadscherm + foutscherm in App.vue; save-fout-toast met auto-dismiss.

---

### P1 – Hoge prioriteit

- [x] 🔴 **Bloom-logica 4× gedupliceerd** _(opgelost 2026-04-03)_
  Geëxtraheerd naar `composables/useBloom.js` met `bloomLabel`, `bloomBadgeClass`, `bloomTableClass`, `bloomActiveClass`. Labels geünificeerd op 'Kennen' (niveau 1). Alle vier views/componenten importeren nu vanuit de composable.

- [x] 🔴 **Views en componenten zijn niet getest** _(opgelost 2026-04-03)_
  101 tests over 5 bestanden: store (edge cases + loadAll), KeywordModal, LeeruitkomstModal, ModulesView, ModuleDetailView. `MatrixView` en `KeywordsView` hebben geen pure unit-logica die niet via de store getest wordt.

- [x] 🔴 **Dead code: `loadFromStorage()`** (`stores/blauwdruk.js`) _(opgelost 2026-04-03)_
  Functie en return-vermelding verwijderd uit de store.

---

### P2 – Middel

- [x] 🟡 **Geen gebruikersfeedback bij save-fouten** _(opgelost 2026-04-03)_
  `saveError` ref in store; App.vue toont rode toast met auto-dismiss na 5s en handmatige sluitknop.

- [x] 🟡 **Portefeuille-kleuren hardcoded in MatrixView** _(opgelost 2026-04-03)_
  Geëxtraheerd naar `composables/usePortefeuille.js` met `pfColor(index)`. MatrixView importeert nu vanuit de composable.

- [x] 🟡 **`keywordsVoorPf()` heeft O(n²) complexiteit** (`ModuleDetailView.vue`) _(opgelost 2026-04-03)_
  Vervangen door `keywordsPerPfMap` computed die de keywords éénmalig groepeert; `keywordsVoorPf()` doet nu een O(1) map-lookup.

- [x] 🟡 **Geen loading/error states in views** _(opgelost 2026-04-03)_
  App.vue toont laadspinner tijdens `isLoading`, foutscherm met "Opnieuw proberen" bij `hasError`.

- [x] 🟡 **Prop-validatie ontbreekt** (`KeywordModal.vue`) _(opgelost 2026-04-03)_
  Alle drie props (`keyword`, `portefeuilles`, `periodes`) zijn nu `required: true`.

- [x] 🟡 **Magic numbers: 4 jaren × 4 blokken** (`MatrixView.vue`) _(opgelost 2026-04-03)_
  `maxJaar` en `maxBlok` worden dynamisch afgeleid uit `store.periodes`.

- [x] 🟡 **Ontbrekende null-check op `module.value`** (`ModuleDetailView.vue`) _(opgelost 2026-04-03)_
  Guard clause `if (!module.value) return` toegevoegd aan `startEditModuleNaam()`.

---

### P3 – Laag / Nice-to-have

- [ ] 🟢 **Modal state pattern 3× herhaald**
  `modalOpen`, `activeItem`, `openItem()`, `saveItem()` staat vrijwel identiek in `KeywordsView`, `ModuleDetailView` en elders.
  _Oplossing: `composables/useModal.js`._

- [x] 🟢 **API-paden hardcoded in store** _(opgelost 2026-04-03)_
  Gecentraliseerd in `src/constants/api.js`; store importeert vanuit `API.*`.

- [x] 🟢 **`loadAll()` in store mist try/catch-blok** _(opgelost 2026-04-03)_
  Gedekt door de P0-fix.

- [x] 🟢 **Kleur als enige visuele indicator (a11y)** (`MatrixView.vue`) _(opgelost 2026-04-03)_
  `role="region"` en `aria-label` toegevoegd aan elke portefeuille-sectie; toggle-header heeft `role="button"`, `tabindex="0"` en `aria-expanded`.

- [x] 🟢 **Sorteertabel mist keyboard-toegankelijkheid** (`KeywordsView.vue`) _(opgelost 2026-04-03)_
  Alle sorteerbare `<th>`-koppen hebben `tabindex="0"`, `role="button"`, `aria-sort` en `@keydown.enter.space`.

- [ ] 🟢 **Contextmenu niet bereikbaar via toetsenbord** (`ModuleDetailView.vue`)
  Right-click-menu heeft geen fallback voor keyboard-gebruikers.

- [x] 🟢 **Router-routes missen `meta`-velden** _(opgelost 2026-04-03)_
  Alle routes hebben nu een `meta.title` veld.
