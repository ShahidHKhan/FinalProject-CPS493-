import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Workout } from './types'
import { api } from '../services/myFetch'
import { getWorkouts } from '../services/workouts'

export const useWorkoutStore = defineStore('workout', function () {
  const workouts = ref<Workout[]>([])

  const nextWorkoutId = computed(function () {
    if (workouts.value.length === 0) return 1
    return Math.max(...workouts.value.map(function (workout) {
      return workout.id
    })) + 1
  })

  const isLoading = ref(false)
  const error = ref('')

  async function loadWorkouts() {
    isLoading.value = true
    error.value = ''

    try {
      const response = await getWorkouts({ page: 1, pageSize: 1000 })
      workouts.value = response.data
    } catch {
      workouts.value = []
      error.value = 'Could not load workouts from the server.'
    } finally {
      isLoading.value = false
    }
  }

  async function publishWorkout(workoutstorage: {
    userId: number
    title: string
    workoutTimeMinutes: number
    stretchIds: number[]
  }) {
    // send to server for persistence
    try {
      const payload = {
        userId: workoutstorage.userId,
        title: workoutstorage.title,
        workoutTimeMinutes: workoutstorage.workoutTimeMinutes,
        stretchIds: workoutstorage.stretchIds,
      }

      const created = await api<Workout>('/workouts', payload, { method: 'POST' })

      // server returns the created workout with id and publishedAt
      workouts.value.unshift(created)
    } catch (err) {
      // fallback to local-only if server fails
      const workout: Workout = {
        id: nextWorkoutId.value,
        userId: workoutstorage.userId,
        title: workoutstorage.title,
        workoutTimeMinutes: workoutstorage.workoutTimeMinutes,
        stretchIds: workoutstorage.stretchIds,
        publishedAt: new Date().toISOString(),
      }

      workouts.value.unshift(workout)
    }
  }

  function workoutsByUser(userId: number) {
    return workouts.value.filter(function (workout) {
      return workout.userId === userId
    })
  }

  return {
    workouts,
    isLoading,
    error,
    loadWorkouts,
    publishWorkout,
    workoutsByUser,
  }
})
