<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'
import { useStretchStore } from '../stores/stretches'

const authStore = useAuthStore()
const stretchStore = useStretchStore()
const { currentUser } = storeToRefs(authStore)
const { stretches } = storeToRefs(stretchStore)
</script>

<template>
  <section class="section">
    <div class="container">
      <div v-if="!currentUser" class="notification is-warning is-light">
        <strong>Log in first:</strong> Select an account on the Home page to access Stretches.
      </div>

      <template v-else>
        <h1 class="title is-1">Stretches List</h1>
        <div class="content">
          <div v-for="stretch in stretches" :key="stretch.id" class="box mb-4">
            <h2 class="title is-4">{{ stretch.name }}</h2>
            <p>
              <strong>Category:</strong> {{ stretch.category }} |
              <strong>Status:</strong> {{ stretch.status }}
            </p>
            <p><strong>Target Muscles:</strong> {{ stretch.targetMuscles.join(', ') }}</p>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>
