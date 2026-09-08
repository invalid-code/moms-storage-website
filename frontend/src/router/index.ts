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
  {
    path: '/delivery/:deliveryId',
    name: 'delivery',
    component: () => import('../views/DeliveryView.vue')
  },
  {
    path: '/sales',
    name: 'sales',
    component: () => import('../views/SalesView.vue')
  },
  {
    path: '/sale/:saleId',
    name: 'sale',
    component: () => import('../views/SaleView.vue')
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router