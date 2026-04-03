# Feature Status

## Legenda
- [ ] Niet begonnen
- [~] In uitvoering
- [x] Afgerond

---

## Fase 0 – Fundament
- [x] CLAUDE.md aanmaken met projectregels
- [x] Vue 3 + Vite project opzetten in `/Src`
- [x] TailwindCSS configureren
- [x] Vue Router + Pinia installeren
- [x] Basisnavigatie en layout-component

## Fase 1 – Data importeren
- [x] Bronbestanden analyseren en omzetten naar JSON in `/Data`
  - [x] periodes.json
  - [x] portefeuilles.json
  - [x] keywords.json (vanuit Excel)
  - [x] leeruitkomsten.json (vanuit Word-bestanden)

## Fase 2 – Keywords beheren
- [x] Overzichtsscherm keywords (gefilterd op periode + portefeuille)
- [x] Keyword toevoegen (naam, Bloom-niveau, toelichting, periode, portefeuille)
- [x] Keyword bewerken
- [x] Keyword verwijderen

## Fase 3 – Leeruitkomsten beheren
- [x] Overzichtsscherm leeruitkomsten per periode
- [x] Leeruitkomst toevoegen/bewerken/verwijderen
- [x] Velden: naam, EC, omschrijving, eindkwalificaties, deelstappen, kennis/vaardigheden, modellen/theorieën, beroepscontext

## Fase 4 – Matrix-overzicht
- [x] Visuele 4x4 Jaar × Blok matrix (met auto-colspan ondersteuning voor module-beslag)
- [x] Gekleurde tags per portefeuille als visueel container element
- [x] Filter / Toggles bovenaan voor de portefeuilles, inclusief styling
- [x] Doorklikken naar keywords per cel en nieuwe keywords aanmaken

## Fase 5 – Native Opslagconfiguratie
- [x] Custom Vite data-middleware configureren (`/data` API endpoint)
- [x] POST request interceptor in scope brengen om bestanden over te schrijven
- [x] Pinia stores updaten om localStorage te vervangen door directe HTTP POSTs (bestandssynchronisatie)

## Fase 6 – Verfijningen UI & Data
- [x] Matrix voorzien van in- en uitklapbare (collapsable) modules, inclusief "Alles (in/uit)klappen" acties per categorie.
- [x] Foutieve data-invoer uit de bron (Excel) getransformeerd via een python snippet naar de correcte JSON datastructuur, inclusief splitstactiek voor trefwoord vs toelichting.
- [x] Keywords-tabel omgebouwd tot een overzichtelijke tabel met geïntegreerde, inline headers voor filteren en sorteren.

## Fase 7 – Modulebeschrijvingen (Huidig)
- [x] ModulesView: overzichtspagina met alle modules als klikbare kaarten, gegroepeerd per jaar.
- [x] ModuleDetailView: volledige modulebeschrijving met leeruitkomsten en keywords per portefeuille; print-klaar via @media print + "Afdrukken / PDF" knop.
- [x] Router uitgebreid met `/modules` en `/modules/:periodeId`.
- [x] Navigatie in App.vue aangevuld met "Modules".
