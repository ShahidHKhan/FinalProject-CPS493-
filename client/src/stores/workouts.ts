import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Workout } from './types'

export const useWorkoutStore = defineStore('workout', () => {
  const workouts = ref<Workout[]>([])

  const nextWorkoutId = computed(() => {
    if (workouts.value.length === 0) return 1
    return Math.max(...workouts.value.map((workout) => workout.id)) + 1
  })

  const publishWorkout = (payload: {
    userId: number
    title: string
    workoutTimeMinutes: number
    stretchIds: number[]
  }) => {
    const workout: Workout = {
      id: nextWorkoutId.value,
      userId: payload.userId,
      title: payload.title,
      workoutTimeMinutes: payload.workoutTimeMinutes,
      stretchIds: payload.stretchIds,
      publishedAt: new Date().toISOString(),
    }

    workouts.value.unshift(workout)
  }

  const workoutsByUser = (userId: number) =>
    workouts.value.filter((workout) => workout.userId === userId)

  return {
    workouts,
    publishWorkout,
    workoutsByUser,
  }
})
