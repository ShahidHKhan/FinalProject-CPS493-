<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import type { User } from '../stores/types'

const authStore = useAuthStore()
const { availableAccounts, currentUser, isAdmin } = storeToRefs(authStore)
const { loginAs, logout } = authStore

const showLoginMenu = ref(false)

const handleLogin = (user: User) => {
  loginAs(user)
  showLoginMenu.value = false
}
</script>

<template>
  <nav class="navbar is-link" role="navigation" aria-label="main navigation">
    <div class="container">
      <div class="navbar-menu is-active">
        <div class="navbar-start is-flex is-flex-wrap-wrap">
          <RouterLink to="/" class="navbar-item nav-link">Home</RouterLink>
          <RouterLink to="/profile" class="navbar-item nav-link">Profile</RouterLink>
          <RouterLink to="/database" class="navbar-item nav-link">Stretches</RouterLink>
          <RouterLink to="/friends" class="navbar-item nav-link">Friends</RouterLink>
          <RouterLink to="/workouts" class="navbar-item nav-link">Workouts</RouterLink>
          <RouterLink v-if="isAdmin" to="/admin" class="navbar-item nav-link">Admin</RouterLink>
          <span v-else class="navbar-item nav-link is-disabled" aria-disabled="true">Admin</span>
        </div>

        <div class="navbar-end is-align-items-center">
          <div v-if="currentUser" class="navbar-item has-text-white user-label">
            {{ currentUser.name }} ({{ currentUser.role }})
          </div>

          <div class="navbar-item" v-if="!currentUser">
            <div class="dropdown is-right" :class="{ 'is-active': showLoginMenu }">
              <div class="dropdown-trigger">
                <button
                  class="button is-light is-small"
                  aria-haspopup="true"
                  aria-controls="login-menu"
                  @click="showLoginMenu = !showLoginMenu"
                >
                  <span>Log in</span>
                </button>
              </div>

              <div id="login-menu" class="dropdown-menu" role="menu">
                <div class="dropdown-content">
                  <button
                    v-for="account in availableAccounts"
                    :key="account.id"
                    class="dropdown-item profile-option"
                    @click="handleLogin(account)"
                  >
                    {{ account.name }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="navbar-item" v-else>
            <button class="button is-danger is-light is-small" @click="logout">Log out</button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  border-bottom: 3px solid #2b4bc9;
}

.nav-link {
  font-size: 1.05rem;
  font-weight: 700;
  color: #f7f9ff;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.18);
  color: #ffffff;
}

.router-link-active.nav-link {
  background-color: rgba(255, 255, 255, 0.28);
  color: #ffffff;
}

.is-disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.profile-option {
  width: 100%;
  text-align: left;
  border: 0;
  background: transparent;
}

.user-label {
  font-weight: 700;
}
</style>