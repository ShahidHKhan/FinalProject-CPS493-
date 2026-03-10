<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'
import { useStretchStore } from '../stores/stretches'
import { useWorkoutStore } from '../stores/workouts'

const authStore = useAuthStore()
const stretchStore = useStretchStore()
const workoutStore = useWorkoutStore()

const { currentUser } = storeToRefs(authStore)
const { stretches } = storeToRefs(stretchStore)

const isCreatingWorkout = ref(false)
const title = ref('')
const workoutTimeMinutes = ref<number | null>(null)
const selectedStretchIds = ref<number[]>([])
const errorMessage = ref('')
const presetErrorMessage = ref('')

type PresetWorkout = {
  key: 'upper' | 'lower' | 'full-body' | 'arms'
  title: string
  stretchIds: number[]
}

const presetWorkouts: PresetWorkout[] = [
  {
    key: 'upper',
    title: 'Upper Body Preset',
    stretchIds: [4, 5, 6, 7],
  },
  {
    key: 'lower',
    title: 'Lower Body Preset',
    stretchIds: [12, 14, 16, 18],
  },
  {
    key: 'full-body',
    title: 'Full Body Preset',
    stretchIds: [19, 20, 21],
  },
  {
    key: 'arms',
    title: 'Arms Preset',
    stretchIds: [1, 2, 3],
  },
]

const presetTimeByKey = ref<Record<PresetWorkout['key'], number | null>>({
  upper: null,
  lower: null,
  'full-body': null,
  arms: null,
})

const toggleStretch = (stretchId: number) => {
  if (selectedStretchIds.value.includes(stretchId)) {
    selectedStretchIds.value = selectedStretchIds.value.filter((id) => id !== stretchId)
    return
  }

  selectedStretchIds.value = [...selectedStretchIds.value, stretchId]
}

const resetForm = () => {
  title.value = ''
  workoutTimeMinutes.value = null
  selectedStretchIds.value = []
  errorMessage.value = ''
}

const createWorkout = () => {
  isCreatingWorkout.value = true
  errorMessage.value = ''
}

const cancelCreate = () => {
  isCreatingWorkout.value = false
  resetForm()
}

const publishWorkout = () => {
  if (!currentUser.value) return

  const trimmedTitle = title.value.trim()

  if (!trimmedTitle) {
    errorMessage.value = 'Please enter a workout title.'
    return
  }

  if (!workoutTimeMinutes.value || workoutTimeMinutes.value <= 0) {
    errorMessage.value = 'Please enter a valid workout time in minutes.'
    return
  }

  if (selectedStretchIds.value.length === 0) {
    errorMessage.value = 'Please select at least one stretch.'
    return
  }

  workoutStore.publishWorkout({
    userId: currentUser.value.id,
    title: trimmedTitle,
    workoutTimeMinutes: workoutTimeMinutes.value,
    stretchIds: selectedStretchIds.value,
  })

  isCreatingWorkout.value = false
  resetForm()
}

const publishPresetWorkout = (preset: PresetWorkout) => {
  if (!currentUser.value) return

  const timeMinutes = presetTimeByKey.value[preset.key]

  if (!timeMinutes || timeMinutes <= 0) {
    presetErrorMessage.value = `Please enter a valid time for ${preset.title}.`
    return
  }

  workoutStore.publishWorkout({
    userId: currentUser.value.id,
    title: preset.title,
    workoutTimeMinutes: timeMinutes,
    stretchIds: preset.stretchIds,
  })

  presetTimeByKey.value[preset.key] = null
  presetErrorMessage.value = ''
}

const stretchNameById = (stretchId: number) => {
  return stretches.value.find((stretch) => stretch.id === stretchId)?.name ?? 'Unknown Stretch'
}

const presetStretchNames = (stretchIds: number[]) => {
  return stretchIds.map((stretchId) => stretchNameById(stretchId)).join(', ')
}
</script>

<template>
  <section class="section">
    <div class="container">
      <div v-if="!currentUser" class="notification is-warning is-light">
        <strong>Log in first:</strong> Select an account on the Home page to access Workouts.
      </div>

      <template v-else>
        <h1 class="title">Workouts</h1>

        <h2 class="title is-4">Preset Workouts</h2>

        <div v-if="presetErrorMessage" class="notification is-danger is-light py-3">
          {{ presetErrorMessage }}
        </div>

        <div class="preset-grid mb-5">
          <div v-for="preset in presetWorkouts" :key="preset.key" class="box">
            <h3 class="title is-5">{{ preset.title }}</h3>
            <p class="mb-3">
              <strong>Includes:</strong>
              {{ presetStretchNames(preset.stretchIds) }}
            </p>

            <div class="field">
              <label class="label" :for="`preset-time-${preset.key}`">Time (minutes)</label>
              <div class="control">
                <input
                  :id="`preset-time-${preset.key}`"
                  v-model.number="presetTimeByKey[preset.key]"
                  class="input"
                  type="number"
                  min="1"
                  placeholder="20"
                />
              </div>
            </div>

            <button class="button is-link" @click="publishPresetWorkout(preset)">Publish</button>
          </div>
        </div>

        <hr class="my-5" />

        <h2 class="title is-4">Custom Workout</h2>

        <div v-if="!isCreatingWorkout" class="mb-5">
          <button class="button is-primary" @click="createWorkout">Create Workout</button>
        </div>

        <div v-else class="box mb-5">
          <h2 class="title is-4">Create Workout</h2>

          <div v-if="errorMessage" class="notification is-danger is-light py-3">
            {{ errorMessage }}
          </div>

          <div class="field">
            <label class="label" for="workout-title">Workout Title</label>
            <div class="control">
              <input
                id="workout-title"
                v-model="title"
                class="input"
                type="text"
                placeholder="Example: Morning Mobility Session"
              />
            </div>
          </div>

          <div class="field">
            <label class="label" for="workout-time">Workout Time (minutes)</label>
            <div class="control">
              <input
                id="workout-time"
                v-model.number="workoutTimeMinutes"
                class="input"
                type="number"
                min="1"
                placeholder="30"
              />
            </div>
          </div>

          <div class="field">
            <label class="label">Select Stretches Completed</label>
            <div class="stretch-grid">
              <label
                v-for="stretch in stretches"
                :key="stretch.id"
                class="checkbox stretch-option"
              >
                <input
                  type="checkbox"
                  :checked="selectedStretchIds.includes(stretch.id)"
                  @change="toggleStretch(stretch.id)"
                />
                <span>
                  {{ stretch.name }}
                  <small class="has-text-grey">({{ stretch.category }})</small>
                </span>
              </label>
            </div>
          </div>

          <div class="buttons mt-4">
            <button class="button is-success" @click="publishWorkout">Publish</button>
            <button class="button is-light" @click="cancelCreate">Cancel</button>
          </div>
        </div>

      </template>
    </div>
  </section>
</template>

<style scoped>
.stretch-grid {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.preset-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}

.stretch-option {
  align-items: flex-start;
  display: flex;
  gap: 0.5rem;
}
</style>
