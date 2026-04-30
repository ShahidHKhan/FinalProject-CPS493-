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
      const response = await api<UserListResponse>('/users/account-options')
      accountOptions.value = response.data
    } catch {
      accountLoadError.value = 'Unable to load accounts from the server.'
    } finally {
      isLoadingAccounts.value = false
    }
  }

  async function savePreferredMuscleGroups(preferredMuscleGroups: string[]) {
    if (currentUser.value === null) {
      throw new Error('You must be logged in to save muscle focus.')
    }

    const updatedUser = await api<User>(
      `/users/${currentUser.value.id}/focus-muscles`,
      { preferredMuscleGroups },
      { method: 'PATCH' },
    )

    currentUser.value = updatedUser
    accountOptions.value = accountOptions.value.map(function (account) {
      if (account.id === updatedUser.id) {
        return updatedUser
      }

      return account
    })
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
    savePreferredMuscleGroups,
  }
})