import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfilePage.vue'),
    },
    {
      path: '/database',
      name: 'database',
      component: () => import('../views/DatabasePage.vue'),
    },
    {
      path: '/friends',
      name: 'friends',
      component: () => import('../views/FriendsPage.vue'),
    },
    {
      path: '/workouts',
      name: 'workouts',
      component: () => import('../views/WorkoutsPage.vue'),
    },
  ],
})

export default router