# Blauwdrukbeheer
Project voor het beheren en visualiseren van de onderwijsblauwdruk HBO Informatica Software Ontwikkeling.

## Technologiestack
- **Frontend:** Vue 3 (Composition API), Vite, Pinia (State Management), Tailwind CSS v4, Vue Router
- **Data:** JSON bestanden in `/Data` (GitHub als bron/persistenz)
- **Synchronisatie:** GitHub API (`Octokit`-like implementatie in `Src/src/composables/useGitHubData.js`)

## Ontwikkelcommando's (in `/Src`)
- `npm install` – installeer dependencies
- `npm run dev` – start development server (incl. vite-plugin-data-proxy voor JSON opslag)
- `npm run build` – bouw voor productie (naar `/dist`)

## Mappenstructuur
- `/Src` – de Vue frontend applicatie
  - `/src/stores/blauwdruk.js` – Centrale Pinia store (beheer van alle blauwdrukdata)
  - `/src/views` – Belangrijkste pagina's (Matrix, Modules, Instellingen)
  - `/src/components` – Herbruikbare componenten (Modals, Toggles)

## Datamodel (JSON)
Zie `/Data` for de actuele bestanden. Hoofdentiteiten:
- **periodes.json** – alle onderwijsperiodes incl. het jaar en welke blokken (bijv. 1 t/m 4) ze beslaan
- **portefeuilles.json** – portefeuille-categorieën (ABV, Databases, etc.)
- **keywords.json** – keywords per portefeuille+periode, met Bloom-niveau en toelichting
- **modules.json** – hiërarchische structuur met modules en geneste leeruitkomsten. Duplicate data van modulenaam en periode is hieruit verwijderd.

## Functies (zie ook `STATUS.md`)
1. **Keywords beheren** – toevoegen/bewerken/verwijderen van keywords; per keyword: naam, Bloom-niveau (1–6), toelichting, periode, portefeuille
2. **Leeruitkomsten beheren** – CRUD voor leeruitkomsten binnen de context van een module (in `modules.json`)
3. **Overzicht/matrix** – visuele 4x4 Jaar × Blok matrix met colspan, opgedeeld en kleurgecodeerd in portefeuilles
4. **Modulebeschrijvingen** – overzichtspagina (`/modules`) en detailpagina (`/modules/:periodeId`) met leeruitkomsten, toetsmatrijs en onderwerpen per portefeuille; print-klaar via `@media print`; volledig bewerkbaar via rechtsklik-contextmenu (leeruitkomsten, modulenaam, keywords)

## Richtlijnen
- **Tailwind v4:** Gebruik `@reference "tailwindcss";` bovenaan `<style>` blokken voor `@apply`.
- **Data Opslag:** Wijzigingen in de store worden via `saveModules()`, `saveKeywords()` etc. weggeschreven naar `/Data/*.json` (lokaal) of gepusht naar GitHub.
- **Naamgeving:** Gebruik Nederlandse termen voor domein-gerelateerde velden (bijv. `leeruitkomsten`, `portefeuille`) en Engelse termen voor technische zaken (`id`, `label`, `settings`).
