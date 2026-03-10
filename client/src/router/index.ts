import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'

const isStoredAdmin = (): boolean => {
  const raw = localStorage.getItem('mock-current-user')
  if (!raw) return false

  try {
    const parsed = JSON.parse(raw) as { role?: string }
    return parsed.role === 'admin'
  } catch {
    return false
  }
}

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
      component: () => import('../views/StretchList.vue'),
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
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminPage.vue'),
      beforeEnter: () => {
        if (isStoredAdmin()) {
          return true
        }

        return { name: 'home' }
      },
    },
  ],
})

export default router