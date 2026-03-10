<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import type { User } from '../stores/types'

const authStore = useAuthStore()
const { availableAccounts, currentUser, isAdmin } = storeToRefs(authStore)
const { loginAs, logout } = authStore

const showLoginMenu = ref(false)
const showMobileMenu = ref(false)

const closeMenus = () => {
  showMobileMenu.value = false
  showLoginMenu.value = false
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const handleLogin = (user: User) => {
  loginAs(user)
  closeMenus()
}

const handleLogout = () => {
  logout()
  closeMenus()
}
</script>

<template>
  <nav class="navbar site-navbar" role="navigation" aria-label="main navigation">
    <div class="container navbar-container-full">
      <div class="navbar-brand">
        <button
          class="navbar-burger"
          :class="{ 'is-active': showMobileMenu }"
          type="button"
          aria-label="menu"
          :aria-expanded="showMobileMenu"
          @click="toggleMobileMenu"
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </button>
      </div>

      <div class="navbar-menu" :class="{ 'is-active': showMobileMenu }">
        <div class="navbar-start">
          <RouterLink to="/" class="navbar-item nav-link" @click="closeMenus">Home</RouterLink>
          <RouterLink to="/profile" class="navbar-item nav-link" @click="closeMenus">Profile</RouterLink>
          <RouterLink to="/database" class="navbar-item nav-link" @click="closeMenus">Stretches</RouterLink>
          <RouterLink to="/friends" class="navbar-item nav-link" @click="closeMenus">Friends</RouterLink>
          <RouterLink to="/workouts" class="navbar-item nav-link" @click="closeMenus">Workouts</RouterLink>
          <RouterLink v-if="isAdmin" to="/admin" class="navbar-item nav-link" @click="closeMenus">Admin</RouterLink>
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
                  class="button is-light nav-account-button"
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
            <button class="button is-danger is-light nav-account-button" @click="handleLogout">Log out</button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.site-navbar {
  background-color: #f39c12;
  border-bottom: 5px solid #c56a00;
  min-height: 5rem;
}

.navbar-container-full {
  max-width: 100% !important;
  padding-inline: 0;
  width: 100%;
}

.site-navbar .navbar-menu,
.site-navbar .navbar-start,
.site-navbar .navbar-end {
  background-color: #f39c12;
}

.navbar-burger {
  color: #ffffff;
  margin-left: auto;
}

.nav-link {
  font-size: 1.4rem;
  font-weight: 700;
  color: #f7f9ff;
  min-height: 4.25rem;
  padding-inline: 1.35rem;
}

.nav-link:hover {
  background-color: rgba(197, 106, 0, 0.24);
  color: #ffffff;
}

.router-link-active.nav-link {
  background-color: #c56a00;
  box-shadow: inset 0 -3px 0 #fff1de;
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
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.2;
}

.nav-account-button {
  font-size: 1.15rem;
  font-weight: 700;
  min-height: 3.1rem;
  padding-inline: 1.1rem;
}

.site-navbar .navbar-item {
  padding-block: 1.05rem;
}

@media screen and (max-width: 1023px) {
  .nav-link {
    font-size: 1.3rem;
    min-height: 3.9rem;
  }
}

@media screen and (min-width: 1024px) {
  .navbar-burger {
    display: none;
  }

  .navbar-menu {
    display: flex;
  }
}
</style>