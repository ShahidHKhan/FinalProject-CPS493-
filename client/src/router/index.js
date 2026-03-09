import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import ProfilePage from '../views/ProfilePage.vue'
import DatabasePage from '../views/DatabasePage.vue'
import FriendsPage from '../views/FriendsPage.vue'
import WorkoutsPage from '../views/WorkoutsPage.vue'

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/profile', name: 'profile', component: ProfilePage },
  { path: '/database', name: 'database', component: DatabasePage },
  { path: '/friends', name: 'friends', component: FriendsPage },
  { path: '/workouts', name: 'workouts', component: WorkoutsPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
