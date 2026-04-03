import { createRouter, createWebHashHistory } from 'vue-router'
import MatrixView from '@/views/MatrixView.vue'
import LeeruitkomstenView from '@/views/LeeruitkomstenView.vue'
import KeywordsView from '@/views/KeywordsView.vue'
import ModulesView from '@/views/ModulesView.vue'
import ModuleDetailView from '@/views/ModuleDetailView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/matrix' },
    { path: '/matrix',              component: MatrixView,        name: 'matrix',        meta: { title: 'Jaar × Blok matrix' } },
    { path: '/leeruitkomsten',      component: LeeruitkomstenView, name: 'leeruitkomsten', meta: { title: 'Leeruitkomsten' } },
    { path: '/keywords',            component: KeywordsView,      name: 'keywords',      meta: { title: 'Keywords' } },
    { path: '/modules',             component: ModulesView,       name: 'modules',       meta: { title: 'Modules' } },
    { path: '/modules/:periodeId',  component: ModuleDetailView,  name: 'module-detail', meta: { title: 'Modulebeschrijving' } },
  ],
})

export default router
