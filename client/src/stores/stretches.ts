import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Stretch } from './types'

export const useStretchStore = defineStore('stretch', () => {
  const stretches = ref<Stretch[]>([
    {
      id: 1,
      name: 'Standing Quad Stretch',
      category: 'Lower Body',
      status: 'Static',
      targetMuscles: ['Quadriceps', 'Hip Flexors'],
    },
    {
      id: 2,
      name: 'Seated Hamstring Reach',
      category: 'Lower Body',
      status: 'Static',
      targetMuscles: ['Hamstrings', 'Calves'],
    },
    {
      id: 3,
      name: 'Doorway Chest Opener',
      category: 'Upper Body',
      status: 'Static',
      targetMuscles: ['Pectorals', 'Anterior Deltoids'],
    },
    {
      id: 4,
      name: 'Cat-Cow Flow',
      category: 'Core',
      status: 'Dynamic',
      targetMuscles: ['Lower Back', 'Abdominals'],
    },
    {
      id: 5,
      name: 'World\'s Greatest Stretch',
      category: 'Full Body',
      status: 'Dynamic',
      targetMuscles: ['Hip Flexors', 'Glutes', 'Thoracic Spine'],
    },
  ])

  return { stretches }
})
