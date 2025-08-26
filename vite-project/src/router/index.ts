import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../pages/(home).vue')
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import('../pages/chat.vue')
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../pages/dashboard.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 