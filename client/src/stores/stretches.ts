import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Stretch } from './types'
import { api } from '../services/myFetch'

export const useStretchStore = defineStore('stretch', function () {
  const stretches = ref<Stretch[]>([])
  const isLoading = ref(false)
  const error = ref('')

  async function loadStretches() {
    isLoading.value = true
    error.value = ''

    try {
      const data = await api<Stretch[]>('/stretches')
      stretches.value = data
    } catch {
      stretches.value = []
      error.value = 'Could not load stretches from the server.'
    } finally {
      isLoading.value = false
    }
  }

  void loadStretches()

  return { stretches, isLoading, error, loadStretches }
})
