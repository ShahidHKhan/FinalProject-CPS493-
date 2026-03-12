import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
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
      component: function () {
        return import('../views/ProfilePage.vue')
      },
    },
    {
      path: '/friends',
      name: 'friends',
      component: function () {
        return import('../views/FriendsPage.vue')
      },
    },
    {
      path: '/workouts',
      name: 'workouts',
      component: function () {
        return import('../views/WorkoutsPage.vue')
      },
    },
    {
      path: '/admin',
      name: 'admin',
      component: function () {
        return import('../views/AdminPage.vue')
      },
      beforeEnter: function () {
        const authStore = useAuthStore()

        if (authStore.isAdmin) {
          return true
        }

        return { name: 'home' }
      },
    },
  ],
})

export default router