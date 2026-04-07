# Blauwdrukbeheer

Webapplicatie voor het beheren en visualiseren van de onderwijsblauwdruk HBO Informatica Software Ontwikkeling (Avans Hogeschool).

De app is volledig statisch en draait via **GitHub Pages**. Data wordt opgeslagen in een **aparte GitHub-repository** (de "data-repo") en gesynchroniseerd via de GitHub API — geen backend nodig.

---

## Functies

- **Matrixoverzicht** — visuele jaar × blok matrix met kleurgecodeerde portefeuilles en uitklapbare modules
- **Keywords beheren** — per portefeuille en periode, met Bloom-niveau (1–6) en toelichting
- **Leeruitkomsten beheren** — CRUD voor leeruitkomsten binnen modules, inclusief EC, eindkwalificaties, toetsmatrijs en deelstappen
- **Modulebeschrijvingen** — detailpagina per module, print-klaar en volledig bewerkbaar via rechtsklik-contextmenu
- **PDF-export** — client-side generatie van modulebeschrijvingen als PDF (html2canvas + jsPDF)
- **GitHub-synchronisatie** — wijzigingen worden gepubliceerd als feature branch + pull request naar de data-repo

---

## Technologiestack

| Onderdeel | Technologie |
|-----------|-------------|
| Framework | Vue 3 (Composition API) |
| State | Pinia |
| Routing | Vue Router 4 |
| Styling | Tailwind CSS v4 |
| Build | Vite |
| PDF | html2canvas + jsPDF |
| Data | GitHub Contents API (REST) |
| Hosting | GitHub Pages |

---

## Architectuur

```
┌─────────────────────────────┐
│   GitHub Pages              │
│   (deze repo → /Src/dist)   │
│                             │
│   Vue 3 SPA                 │
│   ┌─────────────────────┐   │
│   │ Pinia store         │   │
│   │ localStorage cache  │   │
│   └────────┬────────────┘   │
└────────────┼────────────────┘
             │ GitHub API (REST)
             ▼
┌─────────────────────────────┐
│   Data-repo (aparte repo)   │
│   periodes.json             │
│   portefeuilles.json        │
│   keywords.json             │
│   modules.json              │
└─────────────────────────────┘
```

Wijzigingen worden lokaal bijgehouden (`localStorage`) en gepubliceerd als een pull request naar de data-repo. De app kan offline werken dankzij de lokale cache.

---

## Data-repo inrichten

Je hebt een aparte GitHub-repository nodig die als databron dient. Deze repo bevat vier JSON-bestanden in de root.

### Stap 1 — Repository aanmaken

Maak een nieuwe **publieke** GitHub-repository aan (bijv. `blauwdruk-data`). De repo mag volledig leeg zijn — de app start met lege lijsten en maakt de JSON-bestanden automatisch aan bij de eerste publicatie.

### Stap 2 — Personal Access Token aanmaken

De app heeft schrijfrechten nodig op de data-repo om wijzigingen te publiceren.

1. Ga naar [github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new)
2. Kies **Fine-grained token**
3. Stel in:
   - **Repository access**: Only select repositories → kies jouw data-repo
   - **Repository permissions**:
     - Contents: **Read and write**
     - Pull requests: **Read and write**
     - Metadata: Read-only (automatisch)
4. Kopieer het gegenereerde token (begint met `github_pat_`)

> Het token wordt uitsluitend opgeslagen in `localStorage` van jouw browser en nooit naar een server verstuurd.

---

## De app koppelen aan jouw data-repo

1. Open de app en ga naar **Instellingen**
2. Vul bij *Data-repository* in:
   - GitHub-gebruikersnaam (of organisatienaam)
   - Repository-naam (bijv. `blauwdruk-data`)
3. Klik op **Opslaan**
4. Klik op **GitHub-token instellen** en plak je PAT
5. Klik op **Vernieuwen** — de app laadt nu de JSON-bestanden uit jouw repo

---

## Lokaal ontwikkelen

```bash
# Installeer dependencies (in de Src map)
cd Src
npm install --legacy-peer-deps

# Start development server
npm run dev
# → http://localhost:5173

# Linting
npm run lint:check   # controle
npm run lint         # auto-fix

# Tests
npm run test         # eenmalig
npm run test:watch   # watch-modus

# Production build
npm run build
# → dist/ (geserveerd als /blauwdrukbeheer/ op GitHub Pages)
```

---

## Deployen via GitHub Pages

De app wordt automatisch gedeployed via GitHub Actions bij elke push naar `main`.

### Eerste keer instellen

1. Fork of clone deze repository
2. Ga naar **Settings → Pages** in jouw GitHub-repo
3. Stel in:
   - Source: **Deploy from a branch**
   - Branch: `gh-pages` (wordt automatisch aangemaakt door de workflow)
4. Push naar `main` — de workflow bouwt en deployt automatisch
5. De app is beschikbaar op `https://[jouw-gebruikersnaam].github.io/blauwdrukbeheer/`

> De `base`-URL in `vite.config.js` staat ingesteld op `/blauwdrukbeheer/`. Als jouw repository een andere naam heeft, pas dit aan.

### Handmatig triggeren

Via GitHub → **Actions** → *Deploy naar GitHub Pages* → **Run workflow**.

---

## Mappenstructuur

```
Blauwdrukbeheer/
├── Src/                          # Vue-applicatie
│   ├── src/
│   │   ├── composables/          # useGitHubData, useGitHubAuth, usePdfExport, useBloom
│   │   ├── stores/blauwdruk.js   # Centrale Pinia store
│   │   ├── views/                # MatrixView, ModulesView, ModuleDetailView,
│   │   │                         # KeywordsView, InstellingenView, SynchroniseerView
│   │   └── components/           # Modals, gedeelde UI-componenten
│   ├── public/config.json        # githubClientId (optioneel, voor OAuth)
│   └── vite.config.js
├── .github/workflows/
│   ├── deploy.yml                # Deploy naar GitHub Pages
│   └── ci.yml                    # Linting en tests
├── CLAUDE.md                     # Projectrichtlijnen voor AI-assistenten
├── STATUS.md                     # Functiestatus per fase
└── README.md                     # Dit bestand
```

---

## Synchronisatieworkflow

1. Maak wijzigingen in de app (keywords, leeruitkomsten, modules)
2. Gewijzigde bestanden worden bijgehouden (amber badge in de navigatie)
3. Klik op **Publiceren** in het Synchroniseer-scherm
4. De app maakt een feature branch aan in de data-repo, commit de gewijzigde JSON-bestanden, en opent automatisch een pull request
5. Review en merge de PR in GitHub
6. De wijzigingen zijn live

---

## Licentie

Intern project — Avans Hogeschool, opleiding HBO Informatica Software Ontwikkeling.
