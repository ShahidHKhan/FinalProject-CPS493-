<script setup lang="ts">
import { computed } from 'vue'
import { ref } from 'vue'
import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'
import { useStretchStore } from '../stores/stretches'
import { useWorkoutStore } from '../stores/workouts'
import BodySchematic from '../components/BodySchematic.vue'

const authStore = useAuthStore()
const stretchStore = useStretchStore()
const workoutStore = useWorkoutStore()

const { currentUser, availableAccounts } = storeToRefs(authStore)
const { stretches } = storeToRefs(stretchStore)

const muscleGroupOptions = [
  'Shoulders',
  'Chest',
  'Back',
  'Arms',
  'Core',
  'Glutes',
  'Hip Flexors',
  'Quadriceps',
  'Hamstrings',
  'Calves',
] as const

const selectedHealingMuscles = ref<string[]>([])
const saveError = ref('')
const isSavingFocus = ref(false)

watch(
  currentUser,
  function (user) {
    selectedHealingMuscles.value = [...(user?.preferredMuscleGroups ?? [])]
    saveError.value = ''
  },
  { immediate: true },
)

async function toggleMuscle(muscle: string) {
  if (!currentUser.value) {
    return
  }

  const previousSelection = [...selectedHealingMuscles.value]

  const index = selectedHealingMuscles.value.indexOf(muscle)
  if (index > -1) {
    selectedHealingMuscles.value.splice(index, 1)
  } else {
    selectedHealingMuscles.value.push(muscle)
  }

  const nextSelection = [...selectedHealingMuscles.value]
  saveError.value = ''
  isSavingFocus.value = true

  try {
    await authStore.savePreferredMuscleGroups(nextSelection)
  } catch {
    selectedHealingMuscles.value = previousSelection
    saveError.value = 'Could not save your focus muscles. Please try again.'
  } finally {
    isSavingFocus.value = false
  }
}

const friendsList = computed(function () {
  if (!currentUser.value) return []
  return availableAccounts.value.filter(function (account) {
    return account.id !== currentUser.value!.id
  })
})
</script>

<template>
  <section class="section">
    <div class="container">
      <div v-if="!currentUser" class="notification is-warning is-light">
        <strong>Log in first:</strong> Select an account on the Home page to access Profile.
      </div>

      <template v-else>
        <h1 class="title">Profile</h1>
        <p class="mb-5">Workout activity for {{ currentUser.name }}.</p>

        <div class="columns is-variable is-6 profile-layout">
          <!-- Left Column: Friends List -->
          <div class="column is-one-third">
            <h2 class="title is-4">Friends List</h2>

            <div v-if="friendsList.length === 0" class="notification is-info is-light">
              No friends found.
            </div>

            <div v-else class="box mb-5">
              <p class="mb-3 has-text-grey">All accounts are friends with each other.</p>
              <ul>
                <li v-for="friend in friendsList" :key="friend.id" class="mb-3 friend-item">
                  <strong>{{ friend.name }}</strong>
                  <span class="tag is-light ml-2">{{ friend.role }}</span>
                </li>
              </ul>
            </div>

            <h2 class="title is-4 heading-emphasis mt-6">Select muscles for focus</h2>

            <p class="help has-text-grey mb-3">
              {{ isSavingFocus ? 'Saving focus muscles...' : 'Changes save automatically to your profile.' }}
            </p>

            <div v-if="saveError" class="notification is-danger is-light py-2">
              {{ saveError }}
            </div>

            <div class="muscle-selection-box">
              <div class="muscle-pills">
                <button
                  v-for="muscleGroup in muscleGroupOptions"
                  :key="muscleGroup"
                  @click="toggleMuscle(muscleGroup)"
                  :class="['pill-button', { 'pill-button-active': selectedHealingMuscles.includes(muscleGroup) }]"
                >
                  {{ muscleGroup }}
                </button>
              </div>
            </div>
          </div>

          <!-- Right Column: Recovery Focus + Body Schematic -->
          <div class="column is-two-thirds">
            <h2 class="title is-4 heading-emphasis">Recovery Focus</h2>

            <div class="recovery-focus-box">
              <!-- Body Schematic -->
              <div class="body-schematic-wrapper">
                <BodySchematic
                  :active-muscles="selectedHealingMuscles"
                  @toggle-muscle="toggleMuscle"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.profile-layout {
  align-items: flex-start;
}

.published-workout-card {
  max-width: 44rem;
  width: 100%;
}

.friend-item {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.recovery-focus-box {
  background: #f8fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
}

.muscle-selection-box {
  background: #f8fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;
}

.muscle-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.pill-button {
  background-color: #e5e7eb;
  border: 2px solid #d1d5db;
  border-radius: 999px;
  color: var(--text-heading, #333);
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.6rem 1.2rem;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.15s ease,
    box-shadow 0.2s ease;
}

.pill-button:hover {
  background-color: #d1d5db;
  border-color: #9ca3af;
  transform: translateY(-2px);
}

.pill-button-active {
  background-color: #60a5fa;
  border-color: #2563eb;
  color: white;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.pill-button-active:hover {
  background-color: #3b82f6;
  border-color: #1d4ed8;
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
}

.body-schematic-wrapper {
  margin: 2rem 0;
  padding: 1.5rem 0;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .profile-layout {
    flex-direction: column;
  }

  .column {
    width: 100% !important;
  }

  .muscle-pills {
    gap: 0.5rem;
  }

  .pill-button {
    font-size: 0.85rem;
    padding: 0.5rem 1rem;
  }
}
</style>
