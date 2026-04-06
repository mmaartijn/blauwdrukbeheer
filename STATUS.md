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
- [x] EC-berekening gecorrigeerd: som van alle leeruitkomst-ECs, fallback op parsing modulenaam.
- [x] Toetsmatrijs toegevoegd aan leeruitkomsten.json en getoond in ModuleDetailView.
- [x] Tabblad "Leeruitkomsten" verwijderd uit navigatie.

## Fase 8 – Edit mode via contextmenu
- [x] Contextmenu (rechtsklik) op modulenaam → naam bewerken.
- [x] Contextmenu op leeruitkomst → inline bewerken (alle velden incl. toetsmatrijs) of verwijderen.
- [x] Contextmenu op keyword-rij → bewerken/verwijderen via KeywordModal (zelfde data als matrix).
- [x] Contextmenu op portefeuille-header → nieuw keyword toevoegen.
- [x] Info-hint boven de kaart legt rechtermuisklik-interactie uit.
- [x] Bug opgelost: contextmenu sloot te vroeg door `mousedown`-timing; opgelost met `@mousedown.stop`.
- [x] Matrix: portefeuilles standaard uit, categorieën standaard uitgeklapt; vaste labelbreedtes; dash/vinkje toggle in portefeuilleклeur; Bloom-badges zonder gekleurde itemranden.

## Fase 9 – GitHub Pages + GitHub Data Sync (Huidig)
> Doel: de app volledig statisch hosten via GitHub Pages en JSON-data beheren in een aparte, gebruiker-gekozen GitHub-repo via de GitHub API. Wijzigingen lopen altijd via een feature branch + PR. PDFs worden automatisch gegenereerd door een GitHub Action in de data-repo.

### 9a – Static build & GitHub Pages deployment
- [x] `vite.config.js` aanpassen voor correcte `base`-pad op GitHub Pages (`/blauwdrukbeheer/`), alleen bij `build`
- [x] `copyDataPlugin` in `vite.config.js`: kopieert `/Data/*.json` naar `dist/data/` bij `npm run build`
- [x] GitHub Actions workflow `.github/workflows/deploy.yml`: bij push naar `main` → build → deploy via `actions/deploy-pages`
- [x] Vite data-middleware blijft dev-only (zat al in `configureServer`, niet aangepast)
- [x] Pinia store omgeschreven: dev → Vite middleware; productie → GitHub API + localStorage-cache + statische fallback

### 9b – GitHub OAuth (Device Auth Flow)
- [x] `Src/public/config.json` aangemaakt met `githubClientId` (leeg; in te vullen door gebruiker)
- [x] `useGitHubAuth` composable: Device Auth Flow (`startDeviceFlow` + `pollForToken`) én PAT-fallback (`setPatToken`)
- [x] `InstellingenView` (`/instellingen`): toon device code + verificatie-URL, wacht op autorisatie
- [x] Token opgeslagen in localStorage (`gh_token`); bij aanwezig token: automatisch ingelogd
- [x] Uitlogknop + token wissen
- **Let op:** GitHub stuurt geen CORS-headers naar `login/oauth/access_token` voor browser-requests. Als Device Flow mislukt wegens CORS, kan de gebruiker een PAT invoeren als alternatief.

### 9c – Data-repo configuratie & JSON synchronisatie
- [x] `InstellingenView`: gebruiker kan GitHub-gebruikersnaam + repo-naam invoeren (opgeslagen in localStorage)
- [x] `useGitHubData` composable: `fetchJsonFile`, `commitJsonFile`, `createBranch`, `createPR` via GitHub Contents API
- [x] Bij opstarten: JSON-data geladen vanuit GitHub API → SHA's bewaard voor commits; gecached in localStorage
- [x] Fallback-volgorde: GitHub API → localStorage-cache → statische JSON-bestanden in build
- [x] "Vernieuwen"-knop (`refreshFromGitHub`) in `InstellingenView`

### 9d – Wijzigingen committen via feature branch + PR
- [x] Dirty tracking in store: `dirtyFiles` (Set van bestandsnamen) per JSON-bestand
- [x] Amber badge in navigatie met aantal wijzigingen opent `PublicerenModal`
- [x] `PublicerenModal`: branch-naam + PR-titel + omschrijving invullen → publiceren
- [x] `publishChanges()` in store: branch aanmaken → dirty bestanden committen → PR aanmaken
- [x] PR-URL getoond in modal na succes

### 9e – Client-side PDF-generatie en committen naar data-repo
> Volledig in de browser, geen GitHub Actions. De app-repo hoeft de data-repo niet te kennen. PDFs worden gegenereerd vóór het aanmaken van de PR en meegecommit in dezelfde feature branch.
- [x] `html2canvas` + `jsPDF` installeren als dependencies
- [x] `usePdfExport` composable: bouwt inline-gestijlde HTML per module en genereert PDF als base64-string via `html2canvas` + `jsPDF`
- [x] `generateAllModulePdfs(modules, keywords, portefeuilles, periodes, onProgress)` exporteert alle PDFs
- [x] `commitFile(path, base64, sha, branch, msg)` en `fetchFileSha(path, branch)` toegevoegd aan `useGitHubData`
- [x] `publishChanges()` in store genereert PDFs en commit ze samen met de JSONs naar de feature branch
- [x] `SynchroniseerView` toont voortgang per PDF ("PDF genereren 2/5: Modulenaam…") tijdens publiceren
- [x] Geen GitHub Actions, geen koppeling tussen de repos