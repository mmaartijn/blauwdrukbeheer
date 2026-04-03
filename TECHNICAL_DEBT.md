# Technical Debt

Bijgehouden per audit-moment. Voeg bevindingen toe zodra ze ontdekt worden; vink af zodra ze opgelost zijn.

**Formaat:** `[ ]` open · `[x]` opgelost · `[~]` in uitvoering
**Ernst:** 🔴 Hoog · 🟡 Middel · 🟢 Laag

---

## Audit: 2026-04-03

### P0 – Direct actie vereist

- [ ] 🔴 **Fetch zonder error handling in `loadAll()`** (`stores/blauwdruk.js`)
  `Promise.all([...])` heeft geen `.catch()`. Bij een netwerk- of 404-fout crasht de app stil en de gebruiker merkt niets.
  _Oplossing: try/catch om `loadAll()` + toon foutmelding in de UI._

---

### P1 – Hoge prioriteit

- [ ] 🔴 **Bloom-logica 4× gedupliceerd** (`MatrixView.vue`, `KeywordsView.vue`, `ModuleDetailView.vue`, `KeywordModal.vue`)
  `bloomLabel()`, `bloomBadgeClass()`/`bloomColor()` en de bijbehorende arrays staan in vier bestanden. Inconsistentierisico bij elke aanpassing (bijv. label "Kennen" vs "Onthouden").
  _Oplossing: extraheer naar `composables/useBloom.js`._

- [ ] 🔴 **Views en componenten zijn niet getest**
  `MatrixView.vue`, `KeywordsView.vue`, `ModuleDetailView.vue`, `KeywordModal.vue` hebben nul tests. Business-logica (filtering, module-aggregatie, bloom-mapping) is volledig ongedekt.
  _Oplossing: `@vue/test-utils`-tests per view toevoegen._

- [ ] 🔴 **Dead code: `loadFromStorage()`** (`stores/blauwdruk.js` r. 39-41)
  Functie is leeg en gedeactiveerd maar wel gepubliceerd in de store-API. Verwarrend en misleidend.
  _Oplossing: verwijderen (inclusief `return`-statement)._

---

### P2 – Middel

- [ ] 🟡 **Geen gebruikersfeedback bij save-fouten** (`stores/blauwdruk.js`)
  `saveKeywords()` en `saveLeeruitkomsten()` loggen fouten alleen via `console.error()`. De gebruiker weet niet of zijn wijzigingen zijn opgeslagen.
  _Oplossing: toast/banner bij save-fout._

- [ ] 🟡 **Portefeuille-kleuren hardcoded in MatrixView** (`MatrixView.vue`)
  De `colorClasses`-array is niet herbruikbaar in andere views. Bij een nieuwe portefeuille moet dit op meerdere plekken worden bijgewerkt.
  _Oplossing: verplaats naar `composables/usePortefeuille.js` of store._

- [ ] 🟡 **`keywordsVoorPf()` heeft O(n²) complexiteit** (`ModuleDetailView.vue` r. 455-457)
  Functie wordt per iteratie van een `v-for` aangeroepen en filtert elke keer de volledige keywords-array. Bij grote datasets merkbaar.
  _Oplossing: vervang door een `computed` die de resultaten groepeert per portefeuille._

- [ ] 🟡 **Geen loading/error states in views**
  Geen visuele feedback terwijl data laadt of bij een fetch-fout. Gebruiker ziet een lege pagina.
  _Oplossing: `isLoading`/`hasError` ref in store + skeleton of error-banner in views._

- [ ] 🟡 **Prop-validatie ontbreekt** (`KeywordModal.vue`)
  Props `keyword`, `portefeuilles` en `periodes` zijn alleen als type gedeclareerd, zonder `required` of validator.
  _Oplossing: voeg validators toe._

- [ ] 🟡 **Magic numbers: 4 jaren × 4 blokken** (`MatrixView.vue` r. 325-327)
  Hardcoded `<= 4` voor zowel jaren als blokken. Bij curriculumwijziging moet dit handmatig aangepast worden.
  _Oplossing: afleiden uit `store.periodes`._

- [ ] 🟡 **Ontbrekende null-check op `module.value`** (`ModuleDetailView.vue` r. 522)
  `startEditModuleNaam()` leest `module.value.naam` zonder te controleren of `module.value` niet null is.
  _Oplossing: guard clause toevoegen._

---

### P3 – Laag / Nice-to-have

- [ ] 🟢 **Modal state pattern 3× herhaald**
  `modalOpen`, `activeItem`, `openItem()`, `saveItem()` staat vrijwel identiek in `KeywordsView`, `ModuleDetailView` en elders.
  _Oplossing: `composables/useModal.js`._

- [ ] 🟢 **API-paden hardcoded in store** (`stores/blauwdruk.js` r. 12-15)
  Alle `/data/*.json` paden staan letterlijk in de store. Bij structuurwijziging moeten ze op meerdere plekken worden aangepast.
  _Oplossing: constanten in `src/constants/api.js`._

- [ ] 🟢 **`loadAll()` in store mist try/catch-blok** (`stores/blauwdruk.js`)
  Async functie zonder omhullende try/catch; Promise-afwijzingen worden niet onderschept.

- [ ] 🟢 **Kleur als enige visuele indicator (a11y)** (`MatrixView.vue`)
  Portefeuille-blokken onderscheiden zich alleen door kleur. Screen readers zien geen verschil.
  _Oplossing: `aria-label` per blok toevoegen._

- [ ] 🟢 **Sorteertabel mist keyboard-toegankelijkheid** (`KeywordsView.vue`)
  `<th @click="toggleSort(...)">` heeft geen `tabindex`, `role="button"` of `aria-sort`.

- [ ] 🟢 **Contextmenu niet bereikbaar via toetsenbord** (`ModuleDetailView.vue`)
  Right-click-menu heeft geen fallback voor keyboard-gebruikers.

- [ ] 🟢 **Router-routes missen `meta`-velden** (`router/index.js`)
  Geen paginatitels, breadcrumb-info of permissie-metadata op routes.
