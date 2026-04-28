<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'
import { useStretchStore } from '../stores/stretches'
import { useWorkoutStore } from '../stores/workouts'
import Sidebar from '../components/Sidebar.vue'

const authStore = useAuthStore()
const stretchStore = useStretchStore()
const workoutStore = useWorkoutStore()

const { currentUser } = storeToRefs(authStore)
const { stretches, isLoading, error } = storeToRefs(stretchStore)

const isCreatingWorkout = ref(false)
const isSidebarActive = ref(false)
const showStretchCatalog = ref(false)
const sidebarWidth = 460
const title = ref('')
const workoutTimeMinutes = ref<number | null>(null)
const selectedStretchIds = ref<number[]>([])
const errorMessage = ref('')
const presetErrorMessage = ref('')

function toggleSidebar() {
  isSidebarActive.value = !isSidebarActive.value
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

function publishWorkout() {
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

function publishPresetWorkout(preset: PresetWorkout) {
  if (!currentUser.value) return

  if (preset.stretchIds.length === 0) {
    presetErrorMessage.value = `${preset.title} currently has no mapped stretches.`
    return
  }

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
</script>

<template>
  <section class="section">
    <button
      class="sidebar-toggle"
      type="button"
      :aria-expanded="isSidebarActive"
      :style="{ right: isSidebarActive ? `${sidebarWidth}px` : '0px' }"
      @click="toggleSidebar"
    >
      Presets
    </button>
    <div class="container">
      <div v-if="!currentUser" class="notification is-warning is-light">
        <strong>Log in first:</strong> Select an account on the Home page to access Workouts.
      </div>

      <template v-else>
        <h1 class="title">Workouts</h1>

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
        <h3 class="title is-5">Preset Workouts</h3>

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
  z-index: 45;
  border: 1px solid #c56a00;
  border-right: 0;
  border-radius: 10px 0 0 10px;
  background: #f39c12;
  color: #ffffff;
  font-weight: 700;
  padding: 0.7rem 0.9rem;
  transition: right 0.3s ease-in-out;
}

.sidebar-content {
  height: 100%;
  overflow-y: auto;
  padding: 1rem;
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

.catalog-dropdown {
  border: 1px solid #ddd;
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
  border-top: 1px solid #eee;
}
</style>
