// Centrale Bloom-taxonomie definities en hulpfuncties.
// Importeer altijd vanuit dit bestand — nooit lokaal dupliceren.

export const bloomLevels = [
  { level: 1, label: 'Kennen' },
  { level: 2, label: 'Begrijpen' },
  { level: 3, label: 'Toepassen' },
  { level: 4, label: 'Analyseren' },
  { level: 5, label: 'Evalueren' },
  { level: 6, label: 'Creëren' },
]

const _labels = ['', 'Kennen', 'Begrijpen', 'Toepassen', 'Analyseren', 'Evalueren', 'Creëren']

/** Geeft het Bloom-label terug voor een numeriek niveau. */
export function bloomLabel(n) {
  return _labels[n] ?? `Niveau ${n}`
}

/**
 * Badge-klassen voor compacte weergave (zonder border).
 * Gebruik in MatrixView en ModuleDetailView.
 */
export function bloomBadgeClass(level) {
  const map = {
    1: 'bg-slate-100 text-slate-600',
    2: 'bg-blue-100 text-blue-700',
    3: 'bg-green-100 text-green-700',
    4: 'bg-yellow-100 text-yellow-700',
    5: 'bg-orange-100 text-orange-700',
    6: 'bg-red-100 text-red-700',
  }
  return map[level] ?? 'bg-gray-100 text-gray-600'
}

/**
 * Badge-klassen voor tabelweergave (met border).
 * Gebruik in KeywordsView.
 */
export function bloomTableClass(level) {
  const map = {
    1: 'bg-gray-100 border-gray-300 text-gray-700',
    2: 'bg-blue-50 border-blue-200 text-blue-800',
    3: 'bg-green-50 border-green-200 text-green-800',
    4: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    5: 'bg-orange-50 border-orange-200 text-orange-800',
    6: 'bg-red-50 border-red-200 text-red-800',
  }
  return map[level] ?? 'bg-white border-gray-200 text-gray-500'
}

/**
 * Badge-klassen voor geselecteerde staat in knoppen/modals.
 * Gebruik in KeywordModal.
 */
export function bloomActiveClass(level) {
  const map = {
    1: 'bg-gray-200 border-gray-400 text-gray-800',
    2: 'bg-blue-100 border-blue-400 text-blue-900',
    3: 'bg-green-100 border-green-400 text-green-900',
    4: 'bg-yellow-100 border-yellow-400 text-yellow-900',
    5: 'bg-orange-100 border-orange-400 text-orange-900',
    6: 'bg-red-100 border-red-400 text-red-900',
  }
  return map[level] ?? ''
}

/** Composable voor gebruik in <script setup>. */
export function useBloom() {
  return { bloomLevels, bloomLabel, bloomBadgeClass, bloomTableClass, bloomActiveClass }
}
