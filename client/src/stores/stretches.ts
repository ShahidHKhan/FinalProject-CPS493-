import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Stretch } from './types'
import { getStretches } from '../services/stretches'

type LoadStretchOptions = {
  page?: number
  pageSize?: number
  search?: string
}

export const useStretchStore = defineStore('stretch', function () {
  const stretches = ref<Stretch[]>([])
  const isLoading = ref(false)
  const error = ref('')

  async function loadStretches(options: LoadStretchOptions = {}) {
    isLoading.value = true
    error.value = ''

    try {
      const response = await getStretches(options)
      stretches.value = response.data
    } catch {
      stretches.value = []
      error.value = 'Could not load stretches from the server.'
    } finally {
      isLoading.value = false
    }
  }

  return { stretches, isLoading, error, loadStretches }
})
