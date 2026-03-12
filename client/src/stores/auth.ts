import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { User } from './types'

const availableAccounts: User[] = [
  { id: 1, name: 'Admin Alice', role: 'admin' },
  { id: 2, name: 'Regular Bob', role: 'regular' },
  { id: 3, name: 'Regular Charlie', role: 'regular' },
]

export const useAuthStore = defineStore('auth', function () {
  const accountOptions = ref<User[]>(availableAccounts)
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