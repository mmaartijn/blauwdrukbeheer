# Blauwdrukbeheer – Regels voor Claude

## Projectdoel
Webapplicatie voor het beheren van de onderwijsblauwdruk HBO Informatica Software Ontwikkeling (Avans).
Bronbestanden staan in `/Bronbestanden`. Geïmporteerde en beheerde data staat in `/Data` als JSON.

## Mappenstructuur
```
/Bronbestanden   – originele Word/Excel-bronbestanden (niet aanpassen)
/Data            – alle applicatiedata als JSON-bestanden
/Src             – alle broncode van de webapplicatie
```

## Tech stack
- **Frontend:** Vue 3 (Composition API) + Vite
- **State management:** Pinia
- **Routing:** Vue Router
- **Styling:** TailwindCSS v4 (via `@tailwindcss/vite` plugin) — gebruik altijd `@reference "tailwindcss";` als eerste regel in elk `<style>`-blok dat `@apply` gebruikt
- **Data:** JSON-bestanden in `/Data`, geen aparte backend/database
- **Taal UI:** Nederlands

## Codestandaarden
- Vue SFC-bestanden (`.vue`) met `<script setup>` syntax
- Componenten in PascalCase, bestanden in kebab-case
- Gebruik `composables/` voor herbruikbare logica
- Valideer gebruikersinput aan de kant van het formulier
- Geen backend/database nodig — lees/schrijf JSON-bestanden direct via de browser naar de `/Data` map middels een custom Vite-middleware POST-endpoint (voorkom het gebruik van localStorage als 'single source of truth').

## Datamodel (JSON)
Zie `/Data` voor de actuele bestanden. Hoofdentiteiten:
- **periodes.json** – alle onderwijsperiodes incl. het jaar en welke blokken (bijv. 1 t/m 4) ze beslaan
- **leeruitkomsten.json** – leeruitkomsten per periode
- **portefeuilles.json** – portefeuille-categorieën (ABV, Databases, etc.)
- **keywords.json** – keywords per portefeuille+periode, met Bloom-niveau en toelichting

## Functies (zie ook `STATUS.md`)
1. **Keywords beheren** – toevoegen/bewerken/verwijderen van keywords; per keyword: naam, Bloom-niveau (1–6), toelichting, periode, portefeuille
2. **Leeruitkomsten beheren** – CRUD voor leeruitkomsten met alle velden uit de bronbestanden
3. **Overzicht/matrix** – visuele 4x4 Jaar × Blok matrix met colspan, opgedeeld en kleurgecodeerd in portefeuilles
4. **Modulebeschrijvingen** – overzichtspagina (`/modules`) en detailpagina (`/modules/:periodeId`) met leeruitkomsten, toetsmatrijs en onderwerpen per portefeuille; print-klaar via `@media print`; volledig bewerkbaar via rechtsklik-contextmenu (leeruitkomsten, modulenaam, keywords)

## Werkwijze
- **Vraag bij onduidelijkheden altijd aan de gebruiker wat hij wil.** Maak geen aannames over scope of ontwerp.
- **VIER-EENHEID DOCUMENTATIE (CRUCIAAL):** Je MOET te allen tijde rekening houden met de bestanden `CLAUDE.md`, `FOUTEN.md`, `STATUS.md` en `TECHNICAL_DEBT.md`. Lees ze, hou hun regels in acht en wees proactief in het updaten ervan als je een taak of iteratie afrondt.
  - Houd `CLAUDE.md` up-to-date indien projectregels of de stack veranderen.
  - Vink in `STATUS.md` altijd netjes af wat je zojuist hebt voltooid (en voeg scopes toe als dat nodig is).
  - Loopt er iets stuk of is er een belangrijke les geleerd qua architectuur/interpretatie? Gelijk en zonder pardon vastleggen in `FOUTEN.md` ter herinnering.
  - **Doe na elke taak een mini-audit:** controleer of de gewijzigde of aangrenzende code nieuwe technical debt introduceert of bestaande schuld oplost. Werk `TECHNICAL_DEBT.md` bij: vink opgeloste items af en voeg nieuwe bevindingen toe met datum.
- **Voer altijd `npm run test` en `npm run lint:check` uit (vanuit `/Src`) vóórdat je code commit.** Commit nooit als er testfouten of lint-errors zijn.
- Lees altijd bestaande bestanden vóór je ze aanpast.
- Maak geen extra bestanden tenzij strikt noodzakelijk.
- Voeg geen features toe die niet gevraagd zijn.
- Schrijf commentaar alleen waar de logica niet vanzelfsprekend is.
