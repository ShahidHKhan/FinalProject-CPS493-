import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import userData from '../data/users.json'
import type { User } from './types'

export const useAuthStore = defineStore('auth', function () {
  const accountOptions = ref<User[]>(userData as User[])
  const currentUser = ref<User | null>(null)

  const isLoggedIn = computed(function () {
    return currentUser.value !== null
  })
  const isAdmin = computed(function () {
    if (currentUser.value === null) {
      return false
    }

    return currentUser.value.role === 'admin'
  })

  function loginAs(user: User) {
    currentUser.value = user
  }

  function logout() {
    currentUser.value = null
  }

  return {
    availableAccounts: accountOptions,
    currentUser,
    isLoggedIn,
    isAdmin,
    loginAs,
    logout,
  }
})