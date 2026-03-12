<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'
import { useStretchStore } from '../stores/stretches'
import { useWorkoutStore } from '../stores/workouts'

const authStore = useAuthStore()
const stretchStore = useStretchStore()
const workoutStore = useWorkoutStore()

const { currentUser } = storeToRefs(authStore)
const { stretches } = storeToRefs(stretchStore)

const userWorkouts = computed(function () {
  if (!currentUser.value) return []
  return workoutStore.workoutsByUser(currentUser.value.id)
})

function stretchNameById(stretchId: number) {
  const matchingStretch = stretches.value.find(function (stretch) {
    return stretch.id === stretchId
  })

  if (matchingStretch === undefined || matchingStretch === null) {
    return 'Unknown Stretch'
  }

  return matchingStretch.name
}

function formatPublishedDate(isoDate: string) {
  return new Date(isoDate).toLocaleString()
}

function stretchNamesByIds(stretchIds: number[]) {
  return stretchIds.map(function (stretchId) {
    return stretchNameById(stretchId)
  }).join(', ')
}
</script>

<template>
  <section class="section">
    <div class="container">
      <div v-if="!currentUser" class="notification is-warning is-light">
        <strong>Log in first:</strong> Select an account on the Home page to access Profile.
      </div>

      <template v-else>
        <h1 class="title">Profile</h1>
        <p class="mb-5">Workout activity for {{ currentUser.name }}.</p>

        <h2 class="title is-4">Published Workouts</h2>

        <div v-if="userWorkouts.length === 0" class="notification is-info is-light">
          No workouts published yet. Go to Workouts to create and publish one.
        </div>

        <div v-else class="content">
          <div v-for="workout in userWorkouts" :key="workout.id" class="box mb-4">
            <h3 class="title is-5">{{ workout.title }}</h3>
            <p>
              <strong>Time Workout:</strong> {{ workout.workoutTimeMinutes }} minutes |
              <strong>Published:</strong> {{ formatPublishedDate(workout.publishedAt) }}
            </p>
            <p>
              <strong>Stretches:</strong>
              {{ stretchNamesByIds(workout.stretchIds) }}
            </p>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>
