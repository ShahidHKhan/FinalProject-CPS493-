<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useStretchStore } from '../stores/stretches'

const stretchStore = useStretchStore()
const { stretches } = storeToRefs(stretchStore)
</script>

<template>
  <section class="section">
    <div class="container">
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
    </div>
  </section>
</template>
