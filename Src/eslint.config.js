import pluginVue from 'eslint-plugin-vue'
import js from '@eslint/js'

export default [
  js.configs.recommended,
  // Essentieel: vangt echte bugs op (missing v-for key, duplicate keys, etc.)
  ...pluginVue.configs['flat/essential'],
  {
    rules: {
      // ── Vue 3 kwaliteitsregels ──────────────────────────────────────────
      'vue/component-api-style': ['error', ['script-setup']], // altijd <script setup>
      'vue/no-unused-refs': 'error',
      'vue/no-v-html': 'error',           // XSS-preventie
      'vue/prefer-import-from-vue': 'error',
      'vue/no-undef-components': 'error',
      'vue/no-unused-vars': 'error',
      'vue/no-use-v-if-with-v-for': 'error',
      'vue/require-v-for-key': 'error',
      'vue/valid-v-for': 'error',
      'vue/multi-word-component-names': 'off', // views mogen single-word zijn

      // ── Formatting uitschakelen (doet Prettier/handmatig) ───────────────
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      'vue/html-indent': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/attributes-order': 'off',
      'vue/first-attribute-linebreak': 'off',

      // ── JS ──────────────────────────────────────────────────────────────
      'no-console': ['warn', { allow: ['error'] }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    ignores: ['node_modules/**', 'dist/**'],
  },
]
