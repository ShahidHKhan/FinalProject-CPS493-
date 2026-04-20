import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Stretch } from './types'
import { getStretches } from '../services/stretches'

export const useStretchStore = defineStore('stretch', function () {
  const stretches = ref<Stretch[]>([])
  const isLoading = ref(false)
  const error = ref('')

  async function loadStretches() {
    isLoading.value = true
    error.value = ''

    try {
      const response = await getStretches()
      stretches.value = response.data
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
