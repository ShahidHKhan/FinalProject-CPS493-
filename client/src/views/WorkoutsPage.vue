<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'
import { useStretchStore } from '../stores/stretches'
import { useWorkoutStore } from '../stores/workouts'
import Sidebar from '../components/Sidebar.vue'
import type { Workout } from '../stores/types'

const authStore = useAuthStore()
const stretchStore = useStretchStore()
const workoutStore = useWorkoutStore()

const { currentUser } = storeToRefs(authStore)
const { stretches, isLoading, error } = storeToRefs(stretchStore)
const { workouts, isLoading: isLoadingWorkouts, error: workoutError } = storeToRefs(workoutStore)

const currentUserWorkouts = computed(function () {
  if (!currentUser.value) return []
  return workouts.value.filter(function (workout) {
    return workout.userId === currentUser.value?.id
  })
})

const isCreatingWorkout = ref(false)
const isSidebarActive = ref(false)
const showStretchCatalog = ref(false)
const sidebarWidth = 460
const title = ref('')
const workoutTimeMinutes = ref<number | null>(null)
const selectedStretchIds = ref<number[]>([])
const errorMessage = ref('')
const deleteWorkoutError = ref('')
const presetErrorMessage = ref('')

function toggleSidebar() {
  isSidebarActive.value = !isSidebarActive.value
}

function closeSidebar() {
  isSidebarActive.value = false
}

function toggleStretchCatalog() {
  showStretchCatalog.value = !showStretchCatalog.value
}

type PresetWorkout = {
  key: 'upper' | 'lower' | 'full-body' | 'arms'
  title: string
  stretchIds: number[]
}

const presetWorkouts = computed<PresetWorkout[]>(function () {
  const upperStretchIds = stretches.value
    .filter(function (stretch) {
      return stretch.category === 'Upper Body'
    })
    .slice(0, 4)
    .map(function (stretch) {
      return stretch.id
    })

  const lowerStretchIds = stretches.value
    .filter(function (stretch) {
      return stretch.category === 'Lower Body'
    })
    .slice(0, 4)
    .map(function (stretch) {
      return stretch.id
    })

  const fullBodyStretchIds = stretches.value
    .filter(function (stretch) {
      return stretch.category === 'Full Body'
    })
    .slice(0, 3)
    .map(function (stretch) {
      return stretch.id
    })

  const armsStretchIds = stretches.value
    .filter(function (stretch) {
      return stretch.targetMuscles.some(function (muscle) {
        return muscle.toLowerCase() === 'arms'
      })
    })
    .slice(0, 3)
    .map(function (stretch) {
      return stretch.id
    })

  return [
    {
      key: 'upper',
      title: 'Upper Body Preset',
      stretchIds: upperStretchIds,
    },
    {
      key: 'lower',
      title: 'Lower Body Preset',
      stretchIds: lowerStretchIds,
    },
    {
      key: 'full-body',
      title: 'Full Body Preset',
      stretchIds: fullBodyStretchIds,
    },
    {
      key: 'arms',
      title: 'Arms Preset',
      stretchIds: armsStretchIds,
    },
  ]
})

const presetTimeByKey = ref<Record<PresetWorkout['key'], number | null>>({
  upper: null,
  lower: null,
  'full-body': null,
  arms: null,
})

function toggleStretch(stretchId: number) {
  if (selectedStretchIds.value.includes(stretchId)) {
    selectedStretchIds.value = selectedStretchIds.value.filter(function (id) {
      return id !== stretchId
    })
    return
  }

  selectedStretchIds.value = [...selectedStretchIds.value, stretchId]
}

function resetForm() {
  title.value = ''
  workoutTimeMinutes.value = null
  selectedStretchIds.value = []
  errorMessage.value = ''
}

function createWorkout() {
  isCreatingWorkout.value = true
  errorMessage.value = ''
}

function cancelCreate() {
  isCreatingWorkout.value = false
  resetForm()
}

async function publishWorkout() {
  if (!currentUser.value) return

  errorMessage.value = ''

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

  try {
    await workoutStore.publishWorkout({
      userId: currentUser.value.id,
      title: trimmedTitle,
      workoutTimeMinutes: workoutTimeMinutes.value,
      stretchIds: selectedStretchIds.value,
    })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not publish the workout.'
    return
  }

  isCreatingWorkout.value = false
  resetForm()
}

async function publishPresetWorkout(preset: PresetWorkout) {
  if (!currentUser.value) return

  presetErrorMessage.value = ''

  if (preset.stretchIds.length === 0) {
    presetErrorMessage.value = `${preset.title} currently has no mapped stretches.`
    return
  }

  const timeMinutes = presetTimeByKey.value[preset.key]

  if (!timeMinutes || timeMinutes <= 0) {
    presetErrorMessage.value = `Please enter a valid time for ${preset.title}.`
    return
  }

  try {
    await workoutStore.publishWorkout({
      userId: currentUser.value.id,
      title: preset.title,
      workoutTimeMinutes: timeMinutes,
      stretchIds: preset.stretchIds,
    })
  } catch (error) {
    presetErrorMessage.value = error instanceof Error ? error.message : 'Could not publish the preset workout.'
    return
  }

  presetTimeByKey.value[preset.key] = null
  presetErrorMessage.value = ''
}

async function confirmDeleteWorkout(workout: Workout) {
  deleteWorkoutError.value = ''

  if (!window.confirm('confirm delete?')) {
    return
  }

  try {
    await workoutStore.deleteWorkout(workout.id)
  } catch {
    deleteWorkoutError.value = 'Could not delete this workout. Please try again.'
  }
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

function presetStretchNames(stretchIds: number[]) {
  return stretchIds.map(function (stretchId) {
    return stretchNameById(stretchId)
  }).join(', ')
}

onMounted(function () {
  void workoutStore.loadWorkouts()
})

watch(currentUser, function () {
  void workoutStore.loadWorkouts()
})
</script>

<template>
  <section class="section">
    <button
      :class="['sidebar-toggle', { 'is-open': isSidebarActive }]"
      type="button"
      :aria-expanded="isSidebarActive"
      :aria-label="isSidebarActive ? 'Close preset workouts sidebar' : 'Open preset workouts sidebar'"
      :style="{ right: isSidebarActive ? `${sidebarWidth + 16}px` : '16px' }"
      @click="toggleSidebar"
    >
      <span class="sidebar-label">Presets</span>
    </button>
    <div class="container">
      <div v-if="!currentUser" class="notification is-warning is-light">
        <strong>Log in first:</strong> Select an account on the Home page to access Workouts.
      </div>

      <template v-else>
        <h1 class="title">Workouts</h1>

        <div class="box mb-5">
          <h2 class="title is-5 mb-3 heading-emphasis">Your Saved Workouts</h2>

          <div v-if="deleteWorkoutError" class="notification is-danger is-light py-3">
            {{ deleteWorkoutError }}
          </div>

          <div v-if="isLoadingWorkouts" class="notification is-info is-light py-3">
            Loading workouts...
          </div>
          <div v-else-if="workoutError" class="notification is-danger is-light py-3">
            {{ workoutError }}
          </div>
          <div v-else-if="currentUserWorkouts.length === 0" class="has-text-grey">
            No saved workouts yet.
          </div>

          <div v-else class="workout-list">
            <article v-for="workout in currentUserWorkouts" :key="workout.id" class="box workout-card">
              <div class="workout-card-header mb-2">
                <h3 class="title is-6 mb-0 heading-emphasis">{{ workout.title }}</h3>
                <button
                  class="button is-danger is-small workout-delete-button"
                  type="button"
                  @click="confirmDeleteWorkout(workout)"
                >
                  Delete
                </button>
              </div>
              <p class="mb-1 data-line"><strong>Time:</strong> {{ workout.workoutTimeMinutes }} minutes</p>
              <p class="mb-1 data-line"><strong>Stretches:</strong> {{ workout.stretchIds.length }}</p>
              <p class="meta-text">Published: {{ workout.publishedAt }}</p>
            </article>
          </div>
        </div>

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

        <div class="box mb-5">
          <h2 class="title is-5 mb-3">Stretches Catalog</h2>
          <button class="button is-info is-light" type="button" @click="toggleStretchCatalog">
            {{ showStretchCatalog ? 'Hide Stretches' : 'Show Stretches' }}
          </button>

          <div v-if="showStretchCatalog" class="catalog-dropdown mt-3">
            <div v-if="isLoading" class="catalog-item">Loading stretches...</div>
            <div v-else-if="error" class="catalog-item has-text-danger">{{ error }}</div>
            <div v-else-if="stretches.length === 0" class="catalog-item has-text-grey">
              No stretches were returned by the server.
            </div>
            <div v-for="stretch in stretches" :key="`catalog-${stretch.id}`" class="catalog-item">
              <strong class="catalog-name">{{ stretch.name }}</strong>
              <p class="catalog-meta has-text-grey">
                Muscle Group: {{ stretch.targetMuscles.join(', ') }}
              </p>
              <p class="catalog-meta has-text-grey">
                Static-Status: {{ stretch.status }}
              </p>
            </div>
          </div>
        </div>

      </template>
    </div>

    <Sidebar :is-active="isSidebarActive" :width="sidebarWidth">
      <div class="sidebar-content">
        <div class="sidebar-header">
          <h3 class="title is-5 mb-0">Preset Workouts</h3>
          <button class="button is-small is-light sidebar-close-btn" type="button" @click="closeSidebar">Close</button>
        </div>

        <div v-if="presetErrorMessage" class="notification is-danger is-light py-3">
          {{ presetErrorMessage }}
        </div>

        <div class="preset-grid mb-5">
          <div v-for="preset in presetWorkouts" :key="preset.key" class="box preset-box">
            <h4 class="title is-6">{{ preset.title }}</h4>
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

            <button class="button is-link is-small" @click="publishPresetWorkout(preset)">Publish</button>
          </div>
        </div>
      </div>
    </Sidebar>
  </section>
</template>

<style scoped>
.sidebar-toggle {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  z-index: 52;
  border: 2px solid #0a3a2b;
  border-radius: 12px;
  background-color: #0d5a42;
  box-shadow: 0 0 0 2px rgba(13, 90, 66, 0.25), 0 12px 22px rgba(10, 28, 53, 0.32);
  color: #ffffff;
  font-weight: 800;
  font-size: 1rem;
  min-height: 3.15rem;
  min-width: 11rem;
  padding: 0.75rem 1rem;
  transition: right 0.3s ease-in-out, background-color 0.2s ease-in-out, transform 0.2s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  clip-path: polygon(0% 0%, calc(100% - 18px) 0%, 100% 50%, calc(100% - 18px) 100%, 0% 100%);
}

.sidebar-toggle:hover {
  background-color: #0a3a2b;
  transform: translateY(calc(-50% - 1px));
}

.sidebar-toggle .sidebar-label {
  pointer-events: none;
}

.sidebar-toggle.is-open {
  clip-path: polygon(18px 0%, 100% 0%, 100% 100%, 18px 100%, 0% 50%);
}

.sidebar-content {
  height: 100%;
  overflow-y: auto;
  padding: 1rem;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.9rem;
}

.sidebar-close-btn {
  border-color: #cfdad3;
}

@media screen and (max-width: 768px) {
  .sidebar-toggle {
    top: 50%;
    min-width: 9.5rem;
    font-size: 0.92rem;
    padding: 0.65rem 0.8rem;
  }
}

.stretch-grid {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.preset-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

.stretch-option {
  align-items: flex-start;
  display: flex;
  gap: 0.5rem;
}

.preset-box {
  margin-bottom: 0;
}

.workout-list {
  display: grid;
  gap: 1rem;
}

.workout-card {
  margin-bottom: 0;
}

.workout-card-header {
  align-items: flex-start;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.workout-delete-button {
  flex-shrink: 0;
}

.catalog-dropdown {
  border: 1px solid #dce7df;
  border-radius: 0.5rem;
  max-height: 460px;
  overflow-y: auto;
}

.catalog-item {
  padding: 0.85rem 1rem;
}

.catalog-name {
  display: block;
  font-size: 1.02rem;
}

.catalog-meta {
  margin: 0.2rem 0 0;
  font-size: 0.92rem;
}

.catalog-item + .catalog-item {
  border-top: 1px solid #e8eeeb;
}
</style>
