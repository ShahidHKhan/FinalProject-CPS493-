import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { User } from './types'

const STORAGE_KEY = 'mock-current-user'

const availableAccounts: User[] = [
  { id: 1, name: 'Admin Alice', role: 'admin' },
  { id: 2, name: 'Regular Bob', role: 'regular' },
  { id: 3, name: 'Regular Charlie', role: 'regular' },
]

const loadStoredUser = (): User | null => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as User
    return availableAccounts.find((account) => account.id === parsed.id) ?? null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const accountOptions = ref<User[]>(availableAccounts)
  const currentUser = ref<User | null>(loadStoredUser())

  const isLoggedIn = computed(() => currentUser.value !== null)
  const isAdmin = computed(() => currentUser.value?.role === 'admin')

  const loginAs = (user: User) => {
    currentUser.value = user
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  }

  const logout = () => {
    currentUser.value = null
    localStorage.removeItem(STORAGE_KEY)
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