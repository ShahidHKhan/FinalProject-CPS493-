<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const { currentUser } = storeToRefs(authStore)
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
      </div>
    </div>
  </section>
</template>
