// Bestandsnamen voor de GitHub Contents API (root van de data-repo)
export const DATA_FILES = {
  PERIODES: 'periodes.json',
  PORTEFEUILLES: 'portefeuilles.json',
  KEYWORDS: 'keywords.json',
  LEERUITKOMSTEN: 'leeruitkomsten.json',
}

// localStorage-sleutels voor gecachede JSON-data
export const CACHE_KEYS = {
  PERIODES: 'blauwdruk_cache_periodes',
  PORTEFEUILLES: 'blauwdruk_cache_portefeuilles',
  KEYWORDS: 'blauwdruk_cache_keywords',
  LEERUITKOMSTEN: 'blauwdruk_cache_leeruitkomsten',
  // Blob-SHA's van de bestanden die we als laatste van GitHub hebben geladen.
  // Formaat: JSON-object { 'keywords.json': 'abc123', ... }
  SHAS: 'blauwdruk_cache_shas',
  // Bestanden met lokale wijzigingen die nog niet gepubliceerd zijn.
  // Formaat: JSON-array ['keywords.json', ...]
  DIRTY_FILES: 'blauwdruk_dirty_files',
}

// localStorage-sleutels voor GitHub-instellingen
export const SETTINGS_KEYS = {
  GH_TOKEN: 'gh_token',
  GH_OWNER: 'gh_owner',
  GH_REPO: 'gh_repo',
}
