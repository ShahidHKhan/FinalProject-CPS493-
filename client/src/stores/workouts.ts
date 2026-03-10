import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Workout } from './types'

const STORAGE_KEY = 'mock-workouts'

const loadStoredWorkouts = (): Workout[] => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as Workout[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const persistWorkouts = (workouts: Workout[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts))
}

export const useWorkoutStore = defineStore('workout', () => {
  const workouts = ref<Workout[]>(loadStoredWorkouts())

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
    persistWorkouts(workouts.value)
  }

  const workoutsByUser = (userId: number) =>
    workouts.value.filter((workout) => workout.userId === userId)

  return {
    workouts,
    publishWorkout,
    workoutsByUser,
  }
})
