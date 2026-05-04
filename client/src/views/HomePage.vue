<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'
import { useStretchStore } from '../stores/stretches'
import { useWorkoutStore } from '../stores/workouts'
import { useSessionStore } from '../stores/session'

const authStore = useAuthStore()
const sessionStore = useSessionStore()
const stretchStore = useStretchStore()
const workoutStore = useWorkoutStore()

const { currentUser, availableAccounts } = storeToRefs(authStore)
const { user: googleUser } = storeToRefs(sessionStore)
const { stretches } = storeToRefs(stretchStore)

function initialsFromName(name: string) {
  return name
    .split(' ')
    .filter(function (part) {
      return part.length > 0
    })
    .slice(0, 2)
    .map(function (part) {
      return part[0].toUpperCase()
    })
    .join('')
}

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
    .slice(0, 2)
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

function userInitialsById(userId: number) {
  const matchingAccount = availableAccounts.value.find(function (account) {
    return account.id === userId
  })

  if (matchingAccount === undefined || matchingAccount === null) {
    return '??'
  }

  return initialsFromName(matchingAccount.name)
}

function activityAvatarClass(userId: number) {
  const palette = ['avatar-tone-a', 'avatar-tone-b', 'avatar-tone-c', 'avatar-tone-d']

  return palette[userId % palette.length]
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

function selectAccount(account: (typeof availableAccounts.value)[number]) {
  authStore.loginAs(account)
}
</script>

<template>
  <section class="section">
    <div class="container">
      <div v-if="!currentUser && !googleUser" class="notification is-warning is-light">
        <strong>Log in first:</strong> Use the <strong>Log in</strong> button on the right side of the navbar.
        Then choose a profile.
      </div>

      <div v-else-if="!currentUser && googleUser" class="notification is-warning is-light mb-5">
        <strong>Signed in with Google:</strong> {{ googleUser.name }}.
        No matching app profile is linked to this account, so the app cannot switch profiles.
      </div>

      <div v-if="!currentUser && googleUser" class="box profile-picker mb-5">
        <h2 class="title is-4 mb-2">Choose a profile</h2>
        <p class="mb-4">
          Pick the local app account you want to use after Google sign-in.
        </p>

        <div v-if="availableAccounts.length === 0" class="notification is-info is-light">
          No accounts are available yet.
        </div>

        <div v-else class="profile-grid">
          <button
            v-for="account in availableAccounts"
            :key="account.id"
            class="button is-light profile-card"
            @click="selectAccount(account)"
          >
            <span class="profile-name">{{ account.name }}</span>
            <span class="tag is-small is-info is-light">{{ account.role }}</span>
          </button>
        </div>
      </div>

      <template v-else>
        <div v-if="currentUser" class="box">
          <h1 class="title mb-4">Welcome, {{ currentUser.name }}!</h1>

          <p class="mb-4">
            Current role:
            <span class="tag is-medium" :class="currentUser.role === 'admin' ? 'is-primary' : 'is-info'">
              {{ currentUser.role }}
            </span>
          </p>

          <div v-if="currentUser.role === 'admin'" class="notification is-info is-light admin-view-banner">
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
            <div v-for="workout in activityWorkouts" :key="workout.id" class="box mb-4 activity-card">
              <div class="activity-header">
                <span class="activity-avatar" :class="activityAvatarClass(workout.userId)">
                  {{ userInitialsById(workout.userId) }}
                </span>
                <div>
                  <p class="activity-lead mb-1">
                    <strong>{{ userNameById(workout.userId) }}</strong>
                    published a workout
                  </p>
                  <p class="meta-text mb-0">Shared with the crew just now.</p>
                </div>
              </div>
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
      </template>
    </div>
  </section>
</template>

<style scoped>
.profile-picker {
  border: 1px solid #d9e6dd;
  box-shadow: 0 16px 30px rgba(10, 28, 53, 0.08);
}

.profile-grid {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.profile-card {
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: auto;
  justify-content: center;
  padding: 1rem 1.1rem;
  text-align: left;
}

.profile-name {
  font-size: 1rem;
  font-weight: 700;
}

.admin-view-banner {
  border: 1px solid #c4d8ec;
  border-radius: 999px;
  color: #184d7d;
  background: linear-gradient(180deg, #eff6fd 0%, #e6f0fb 100%);
  padding-inline: 1.1rem;
}

.activity-card {
  padding: 1rem 1.1rem;
}

.activity-header {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin-bottom: 0.9rem;
}

.activity-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 50%;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  box-shadow: 0 6px 16px rgba(10, 28, 53, 0.14);
}

.activity-lead {
  color: var(--text-body);
}

.avatar-tone-a {
  background: linear-gradient(135deg, #0d5a42 0%, #1c8a66 100%);
}

.avatar-tone-b {
  background: linear-gradient(135deg, #184d7d 0%, #4579ad 100%);
}

.avatar-tone-c {
  background: linear-gradient(135deg, #7a5d1c 0%, #c08b24 100%);
}

.avatar-tone-d {
  background: linear-gradient(135deg, #5c3c78 0%, #8f67a9 100%);
}
</style>
