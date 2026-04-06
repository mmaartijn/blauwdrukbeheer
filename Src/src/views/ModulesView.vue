<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Modules</h1>

    <div v-for="jaar in jaren" :key="jaar" class="mb-8">
      <h2 class="text-base font-semibold text-gray-500 uppercase tracking-wide mb-3 border-b border-gray-200 pb-1">
        Jaar {{ jaar }}
      </h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="module in modulesVoorJaar(jaar)"
          :key="module.periodeId"
          :to="`/modules/${encodeURIComponent(module.periodeId)}`"
          class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group block"
        >
          <div class="flex items-start justify-between gap-3 mb-2">
            <h3 class="font-semibold text-gray-800 text-sm leading-snug group-hover:text-blue-700 transition-colors">
              {{ module.naam }}
            </h3>
            <span v-if="module.ec" class="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full whitespace-nowrap font-medium flex-shrink-0">
              {{ module.ec }} EC
            </span>
          </div>
          <p class="text-xs text-gray-400 font-medium mb-3">{{ module.periodeLabel }}</p>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="lu in module.leeruitkomsten"
              :key="lu.id"
              class="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full"
            >
              {{ lu.naam }}
            </span>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useBlauwdrukStore } from '@/stores/blauwdruk'

const store = useBlauwdrukStore()

// Gebruik modules direct vanuit de store, verrijkt met labels en jaar-info
const modules = computed(() => {
  return store.modules.map(mod => {
    const periode = store.periodes.find(p => p.id === mod.periode)
    return {
      ...mod,
      periodeId: mod.periode,
      periodeLabel: periode?.label ?? mod.periode,
      jaar: periode?.jaar ?? 0,
      ec: moduleEc(mod.leeruitkomsten, mod.naam)
    }
  }).sort((a, b) => a.jaar - b.jaar || a.periodeId.localeCompare(b.periodeId))
})

function moduleEc(lus, moduleName) {
  const som = lus.reduce((acc, lu) => acc + (lu.ec ?? 0), 0)
  if (som > 0) return som
  const match = moduleName?.match(/\((\d+)\s*EC\)/i)
  return match ? parseInt(match[1]) : null
}

const jaren = computed(() => [...new Set(modules.value.map(m => m.jaar))].sort())

function modulesVoorJaar(jaar) {
  return modules.value.filter(m => m.jaar === jaar)
}
</script>
