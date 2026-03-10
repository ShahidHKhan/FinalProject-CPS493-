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
        <strong>Log in first:</strong> Select an account on the Home page to access Profile.
      </div>

      <template v-else>
        <h1 class="title">Profile</h1>
        <p>Profile page placeholder for {{ currentUser.name }}.</p>
      </template>
    </div>
  </section>
</template>
