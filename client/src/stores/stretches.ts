import { defineStore } from 'pinia'
import { ref } from 'vue'
import stretchData from '../data/stretches.json'
import type { Stretch } from './types'

export const useStretchStore = defineStore('stretch', function () {
  const stretches = ref<Stretch[]>(stretchData as Stretch[])

  return { stretches }
})
