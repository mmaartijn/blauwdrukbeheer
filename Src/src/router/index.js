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
    { path: '/matrix', component: MatrixView, name: 'matrix' },
    { path: '/leeruitkomsten', component: LeeruitkomstenView, name: 'leeruitkomsten' },
    { path: '/keywords', component: KeywordsView, name: 'keywords' },
    { path: '/modules', component: ModulesView, name: 'modules' },
    { path: '/modules/:periodeId', component: ModuleDetailView, name: 'module-detail' },
  ],
})

export default router
