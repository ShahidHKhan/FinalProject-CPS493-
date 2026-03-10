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
        <strong>Log in first:</strong> Select an account on the Home page to access Friends.
      </div>

      <template v-else>
        <h1 class="title">Friends</h1>
        <p>Friends page placeholder.</p>
      </template>
    </div>
  </section>
</template>
