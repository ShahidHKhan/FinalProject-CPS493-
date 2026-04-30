<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'
import { useStretchStore } from '../stores/stretches'
import { useWorkoutStore } from '../stores/workouts'

const authStore = useAuthStore()
const stretchStore = useStretchStore()
const workoutStore = useWorkoutStore()

const { currentUser, availableAccounts } = storeToRefs(authStore)
const { stretches } = storeToRefs(stretchStore)

const mostRecentWorkout = computed(function () {
  if (!currentUser.value) return null

  const userWorkouts = workoutStore.workoutsByUser(currentUser.value.id)

  if (userWorkouts.length === 0) {
    return null
  }

  return [...userWorkouts].sort(
    function (a, b) {
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    },
  )[0]
})

const activityWorkouts = computed(function () {
  if (!currentUser.value) return []

  return [...workoutStore.workouts]
    .filter(function (workout) {
      return workout.userId !== currentUser.value!.id
    })
    .sort(function (a, b) {
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    })
})

function userNameById(userId: number) {
  const matchingAccount = availableAccounts.value.find(function (account) {
    return account.id === userId
  })

  if (matchingAccount === undefined || matchingAccount === null) {
    return 'Unknown User'
  }

  return matchingAccount.name
}

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
        <strong>Log in first:</strong> Use the <strong>Log in</strong> button on the right side of the navbar,
        then choose a profile.
      </div>

      <div v-else class="box">
        <h1 class="title mb-4">Welcome, {{ currentUser.name }}!</h1>

        <p class="mb-4">
          Current role:
          <span class="tag is-medium" :class="currentUser.role === 'admin' ? 'is-primary' : 'is-info'">
            {{ currentUser.role }}
          </span>
        </p>

        <div v-if="currentUser.role === 'admin'" class="notification is-warning is-light">
          <strong>Admin View:</strong> You can see admin-only controls.
        </div>

        <div v-else class="notification is-info is-light">
          <strong>Regular View:</strong> You are signed in as a standard user.
        </div>

        <hr class="my-5" />

        <h2 class="title is-4 heading-emphasis">Most Recent Workout</h2>

        <div v-if="!mostRecentWorkout" class="notification is-info is-light">
          You have not published a workout yet. Go to Workouts to create one.
        </div>

        <div v-else class="box">
          <h3 class="title is-5 mb-2 heading-emphasis">{{ mostRecentWorkout.title }}</h3>
          <p class="data-line">
            <strong>Time Workout:</strong> {{ mostRecentWorkout.workoutTimeMinutes }} minutes |
            <strong>Published:</strong> {{ formatPublishedDate(mostRecentWorkout.publishedAt) }}
          </p>
          <p class="meta-text">
            <strong>Stretches:</strong>
            {{ stretchNamesByIds(mostRecentWorkout.stretchIds) }}
          </p>
        </div>

        <hr class="my-5" />

        <h2 class="title is-4 heading-emphasis">Friends Activity</h2>

        <div v-if="activityWorkouts.length === 0" class="notification is-info is-light">
          No friend activity yet. Once friends publish workouts, it will appear here.
        </div>

        <div v-else class="content">
          <div v-for="workout in activityWorkouts" :key="workout.id" class="box mb-4">
            <p class="mb-2">
              <strong>{{ userNameById(workout.userId) }}</strong> published a workout
            </p>
            <h3 class="title is-5 mb-2 heading-emphasis">{{ workout.title }}</h3>
            <p class="data-line">
              <strong>Time Workout:</strong> {{ workout.workoutTimeMinutes }} minutes |
              <strong>Published:</strong> {{ formatPublishedDate(workout.publishedAt) }}
            </p>
            <p class="meta-text">
              <strong>Stretches:</strong>
              {{ stretchNamesByIds(workout.stretchIds) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
