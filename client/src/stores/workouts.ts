import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Workout } from './types'

export const useWorkoutStore = defineStore('workout', function () {
  const workouts = ref<Workout[]>([])

  const nextWorkoutId = computed(function () {
    if (workouts.value.length === 0) return 1
    return Math.max(...workouts.value.map(function (workout) {
      return workout.id
    })) + 1
  })

  function publishWorkout(workoutstorage: {
    userId: number
    title: string
    workoutTimeMinutes: number
    stretchIds: number[]
  }) {
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

  function workoutsByUser(userId: number) {
    return workouts.value.filter(function (workout) {
      return workout.userId === userId
    })
  }

  return {
    workouts,
    publishWorkout,
    workoutsByUser,
  }
})
