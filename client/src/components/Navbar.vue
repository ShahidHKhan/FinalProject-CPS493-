<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import type { User } from '../stores/types'

const authStore = useAuthStore()
const { availableAccounts, currentUser, isAdmin } = storeToRefs(authStore)
const { loginAs, logout } = authStore

const showLoginMenu = ref(false)
const showMobileMenu = ref(false)

const userInitials = computed(function () {
  if (!currentUser.value) {
    return ''
  }

  return currentUser.value.name
    .split(' ')
    .filter(function (part) {
      return part.length > 0
    })
    .slice(0, 2)
    .map(function (part) {
      return part[0].toUpperCase()
    })
    .join('')
})

function closeMenus() {
  showMobileMenu.value = false
  showLoginMenu.value = false
}

function toggleMobileMenu() {
  showMobileMenu.value = !showMobileMenu.value
}

function handleLogin(user: User) {
  loginAs(user)
  closeMenus()
}

function handleLogout() {
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
          <RouterLink to="/" active-class="is-active" class="navbar-item nav-link" @click="closeMenus">Home</RouterLink>
          <RouterLink to="/profile" active-class="is-active" class="navbar-item nav-link" @click="closeMenus">Profile</RouterLink>
          <RouterLink to="/workouts" active-class="is-active" class="navbar-item nav-link" @click="closeMenus">Workouts</RouterLink>
          <div v-if="isAdmin" class="navbar-item has-dropdown is-hoverable nav-admin-dropdown">
            <span class="navbar-link nav-link nav-admin-link">Admin</span>
            <div class="navbar-dropdown is-right">
              <RouterLink to="/admin" active-class="is-active" class="navbar-item" @click="closeMenus">
                Dashboard
              </RouterLink>
              <RouterLink to="/workouts" active-class="is-active" class="navbar-item" @click="closeMenus">
                Manage Workouts
              </RouterLink>
            </div>
          </div>
          <span v-else class="navbar-item nav-link is-disabled" aria-disabled="true">Admin</span>
        </div>

        <div class="navbar-end is-align-items-center">
          <div v-if="currentUser" class="navbar-item has-text-white user-chip">
            <span class="user-avatar" aria-hidden="true">{{ userInitials }}</span>
            <div class="user-meta">
              <span class="user-name">{{ currentUser.name }}</span>
              <span class="user-role">{{ currentUser.role }}</span>
            </div>
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
  padding-inline: 0.5in;
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

.nav-link.is-active,
.router-link-active.nav-link {
  background-color: #c56a00;
  box-shadow: inset 0 -3px 0 #fff1de;
  color: #ffffff;
}

.nav-admin-dropdown .navbar-dropdown {
  border-top: 0;
}

.nav-admin-link {
  color: #f7f9ff;
  min-height: 4.25rem;
  display: flex;
  align-items: center;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.user-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  background: #fff1de;
  color: #8e4f00;
  font-size: 0.8rem;
  font-weight: 800;
}

.user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.user-name {
  font-size: 1.05rem;
  font-weight: 800;
}

.user-role {
  font-size: 0.8rem;
  text-transform: capitalize;
  opacity: 0.9;
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

.nav-admin-dropdown .navbar-item.is-active,
.nav-admin-dropdown .router-link-active {
  background-color: rgba(197, 106, 0, 0.14);
  font-weight: 700;
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