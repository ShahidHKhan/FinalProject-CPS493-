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

const friendsList = computed(function () {
  if (!currentUser.value) return []
  return availableAccounts.value.filter(function (account) {
    return account.id !== currentUser.value!.id
  })
})

const activityWorkouts = computed(function () {
  return [...workoutStore.workouts].sort(
    function (a, b) {
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    },
  )
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
        <strong>Log in first:</strong> Select an account on the Home page to access Friends.
      </div>

      <template v-else>
        <h1 class="title">Friends</h1>

        <div class="columns is-variable is-6 friends-layout">
          <div class="column is-two-thirds">
            <h2 class="title is-4">Friends Activity</h2>

            <div v-if="activityWorkouts.length === 0" class="notification is-info is-light">
              No workout activity yet. Once anyone publishes a workout, it will appear here.
            </div>

            <div v-else class="content">
              <div v-for="workout in activityWorkouts" :key="workout.id" class="box mb-4">
                <p class="mb-2">
                  <strong>{{ userNameById(workout.userId) }}</strong> published a workout
                </p>
                <h3 class="title is-5 mb-2">{{ workout.title }}</h3>
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
          </div>

          <div class="column is-one-third">
            <h2 class="title is-4">Friends List</h2>

            <div v-if="friendsList.length === 0" class="notification is-info is-light">
              No friends found.
            </div>

            <div v-else class="box">
              <p class="mb-3 has-text-grey">All accounts are friends with each other.</p>
              <ul>
                <li v-for="friend in friendsList" :key="friend.id" class="mb-3 friend-item">
                  <strong>{{ friend.name }}</strong>
                  <span class="tag is-light ml-2">{{ friend.role }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.friends-layout {
  align-items: flex-start;
}

.friend-item {
  align-items: center;
  display: flex;
  justify-content: space-between;
}
</style>
