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

## Fase 9 – GitHub Pages + GitHub Data Sync
> Doel: de app volledig statisch hosten via GitHub Pages en JSON-data beheren in een aparte, gebruiker-gekozen GitHub-repo via de GitHub API. Wijzigingen lopen altijd via een feature branch + PR. PDFs worden automatisch gegenereerd door een GitHub Action in de data-repo.

### 9a – Static build & GitHub Pages deployment
- [ ] `vite.config.ts` aanpassen voor correcte `base`-pad op GitHub Pages (bijv. `/blauwdrukbeheer/`)
- [ ] GitHub Actions workflow toevoegen in `.github/workflows/deploy.yml`: bij push naar `main` → `npm run build` → deploy naar `gh-pages` branch
- [ ] Vite data-middleware verwijderen (niet meer nodig in productie)
- [ ] Pinia stores omschrijven: JSON-data niet meer via `POST /data/...` maar via GitHub API + localStorage-cache

### 9b – GitHub OAuth (Device Auth Flow)
- [ ] `config.json` toevoegen aan repo root met `githubClientId` (en eventueel andere instellingen)
- [ ] `GitHubAuthService` composable: implementeer Device Auth Flow (`/login/device/code` → polling `/login/oauth/access_token`)
- [ ] Inlogpagina (`/instellingen` of `/login`): toon device code + verificatie-URL, wacht op autorisatie
- [ ] Token opslaan in localStorage; bij aanwezig token: automatisch ingelogd
- [ ] Uitlogknop + token wissen

### 9c – Data-repo configuratie & JSON synchronisatie
- [ ] Instellingenpagina: gebruiker kan GitHub-gebruikersnaam + repo-naam invoeren en opslaan (localStorage)
- [ ] `GitHubDataService` composable: haal JSON-bestanden op via GitHub Contents API (`GET /repos/:owner/:repo/contents/:path`)
- [ ] Bij opstarten: JSON-data laden vanuit GitHub API → cachen in localStorage (als fallback bij offline)
- [ ] "Vernieuwen"-knop om data opnieuw te fetchen van GitHub

### 9d – Wijzigingen committen via feature branch + PR
- [ ] Wijzigingen in de app worden bijgehouden (dirty tracking per JSON-bestand)
- [ ] "Wijzigingen publiceren"-knop opent een dialoog: branch-naam invoeren + PR-beschrijving
- [ ] App maakt feature branch aan in data-repo via GitHub API
- [ ] Gewijzigde JSON-bestanden worden gecommit naar de feature branch (`PUT /repos/:owner/:repo/contents/:path`)
- [ ] PR aanmaken via GitHub API (`POST /repos/:owner/:repo/pulls`)
- [ ] Na aanmaken PR: app stuurt een `repository_dispatch` event naar deze repo (`mmaartijn/blauwdrukbeheer`) met als payload: PR-branch-naam + lijst van gewijzigde periode-IDs
- [ ] Link naar de aangemaakte PR tonen in de UI

### 9e – Automatische PDF-generatie via GitHub Action (in deze repo)
> De GitHub Action staat in `mmaartijn/blauwdrukbeheer` (`.github/workflows/generate-pdf.yml`). Hij wordt getriggerd door een `repository_dispatch` event vanuit de app (zie 9d). Een PAT of GitHub App token is nodig om te kunnen committen naar de data-repo.
- [ ] `generate-pdf.yml` workflow aanmaken; trigger: `repository_dispatch` met `event-type: generate-module-pdfs`
- [ ] Action leest de payload: feature branch-naam en lijst van gewijzigde periode-IDs
- [ ] Action installeert Puppeteer/Chromium en rendert voor elke gewijzigde module de GitHub Pages URL (`/modules/:periodeId`)
- [ ] Gegenereerde PDFs worden via GitHub API gecommit naar de feature branch in de data-repo
- [ ] PDFs zitten daarmee in de PR en mergen mee naar `main` van de data-repo
