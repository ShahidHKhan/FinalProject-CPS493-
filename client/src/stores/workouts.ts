import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Workout } from './types'
import { api } from '../services/myFetch'
import { deleteWorkout as deleteWorkoutRequest, getWorkouts } from '../services/workouts'

export const useWorkoutStore = defineStore('workout', function () {
  const workouts = ref<Workout[]>([])

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
    const payload = {
      userId: workoutstorage.userId,
      title: workoutstorage.title,
      workoutTimeMinutes: workoutstorage.workoutTimeMinutes,
      stretchIds: workoutstorage.stretchIds,
    }

    const created = await api<Workout>('/workouts', payload, { method: 'POST' })

    // server returns the created workout with id and publishedAt
    workouts.value.unshift(created)
  }

  async function deleteWorkout(id: number) {
    await deleteWorkoutRequest(id)
    workouts.value = workouts.value.filter(function (workout) {
      return workout.id !== id
    })
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
    deleteWorkout,
    workoutsByUser,
  }
})
