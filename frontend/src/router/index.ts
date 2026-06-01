import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/branches',
    name: 'branches',
    component: () => import('../views/BranchesView.vue')
  },
  {
    path: '/stocks',
    name: 'stocks',
    component: () => import('../views/StocksView.vue')
  },
  {
    path: '/deliveries',
    name: 'deliveries',
    component: () => import('../views/DeliveriesView.vue')
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router