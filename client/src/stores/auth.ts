import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { api } from '../services/myFetch'
import type { User } from './types'

type UserListResponse = {
  data: User[]
  isSuccess: boolean
  total: number
  message?: string
}

export const useAuthStore = defineStore('auth', function () {
  const accountOptions = ref<User[]>([])
  const currentUser = ref<User | null>(null)
  const isLoadingAccounts = ref(false)
  const accountLoadError = ref('')

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

  async function loadAccounts() {
    isLoadingAccounts.value = true
    accountLoadError.value = ''

    try {
      const response = await api<UserListResponse>('/users')
      accountOptions.value = response.data
    } catch {
      accountLoadError.value = 'Unable to load accounts from the server.'
    } finally {
      isLoadingAccounts.value = false
    }
  }

  void loadAccounts()

  return {
    availableAccounts: accountOptions,
    currentUser,
    isLoggedIn,
    isAdmin,
    isLoadingAccounts,
    accountLoadError,
    loadAccounts,
    loginAs,
    logout,
  }
})