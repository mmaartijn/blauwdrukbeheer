<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50" @click.self="$emit('close')">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
      <div class="bg-blue-800 text-white px-5 py-3 flex items-center justify-between">
        <h2 class="font-semibold text-base">{{ isNew ? 'Nieuw keyword' : 'Keyword bewerken' }}</h2>
        <button @click="$emit('close')" class="text-blue-200 hover:text-white text-xl leading-none">&times;</button>
      </div>

      <form @submit.prevent="submit" class="p-5 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Naam <span class="text-red-500">*</span></label>
          <input
            v-model="form.naam"
            required
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Portefeuille</label>
            <select v-model="form.portefeuille" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option v-for="pf in portefeuilles" :key="pf.id" :value="pf.id">{{ pf.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Periode</label>
            <select v-model="form.periode" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option v-for="p in periodes" :key="p.id" :value="p.id">{{ p.label }}</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Bloom-niveau</label>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              v-for="b in bloomLevels"
              :key="b.level"
              @click="form.bloom = form.bloom === b.level ? null : b.level"
              class="px-3 py-1 rounded-full text-xs border transition-colors"
              :class="form.bloom === b.level ? bloomActiveClass(b.level) : 'bg-white border-gray-300 text-gray-500 hover:border-gray-400'"
            >
              {{ b.level }} – {{ b.label }}
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Toelichting</label>
          <textarea
            v-model="form.toelichting"
            rows="3"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Optionele toelichting bij dit keyword..."
          />
        </div>

        <div class="flex justify-between pt-2">
          <button
            v-if="!isNew"
            type="button"
            @click="$emit('delete', form.id)"
            class="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Verwijderen
          </button>
          <div class="flex gap-2 ml-auto">
            <button type="button" @click="$emit('close')" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              Annuleren
            </button>
            <button type="submit" class="px-4 py-2 text-sm bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-medium">
              Opslaan
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { bloomLevels, bloomActiveClass } from '@/composables/useBloom'

const props = defineProps({
  keyword:       { type: Object, required: true },
  portefeuilles: { type: Array,  required: true },
  periodes:      { type: Array,  required: true },
})

const emit = defineEmits(['save', 'delete', 'close'])

const form = reactive({ ...props.keyword })
const isNew = computed(() => !props.keyword?.naam)

function submit() {
  emit('save', { ...form })
}
</script>
