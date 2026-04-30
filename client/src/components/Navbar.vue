<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import type { User } from '../stores/types'

const authStore = useAuthStore()
const { availableAccounts, currentUser, isAdmin, isLoadingAccounts, accountLoadError } = storeToRefs(authStore)
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
                  <div v-if="isLoadingAccounts" class="dropdown-item is-size-7 has-text-grey">
                    Loading accounts...
                  </div>
                  <div v-else-if="accountLoadError" class="dropdown-item is-size-7 has-text-danger">
                    {{ accountLoadError }}
                  </div>
                  <div v-else-if="availableAccounts.length === 0" class="dropdown-item is-size-7 has-text-grey">
                    No accounts found.
                  </div>
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
  background: linear-gradient(100deg, #0a1c35 0%, #0d5a42 86%);
  border-bottom: 1px solid rgba(163, 192, 101, 0.45);
  box-shadow: 0 10px 20px rgba(10, 28, 53, 0.32);
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
  background: transparent;
}

.navbar-burger {
  color: #f4f8f5;
  margin-left: auto;
}

.nav-link {
  font-size: 1.16rem;
  font-weight: 700;
  color: #f2f7f2;
  min-height: 4.25rem;
  padding-inline: 1.35rem;
}

.nav-link:hover {
  background-color: rgba(163, 192, 101, 0.16);
  color: #ffffff;
}

.nav-link.is-active,
.router-link-active.nav-link {
  background-color: rgba(163, 192, 101, 0.24);
  box-shadow: inset 0 -3px 0 var(--brand-lime);
  color: #ffffff;
}

.nav-admin-dropdown .navbar-dropdown {
  border-top: 0;
}

.nav-admin-link {
  color: #f2f7f2;
  min-height: 4.25rem;
  display: flex;
  align-items: center;
}

/* Ensure the dropdown arrow doesn't overlap the text */
.nav-admin-link {
  position: relative;
  padding-right: 1.35rem;
}

.nav-admin-link::after {
  display: none;
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
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  background: #ffffff;
  color: #000000;
  font-size: 0.88rem;
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(10, 28, 53, 0.12);
  border: 1px solid rgba(13, 90, 66, 0.06);
}

.user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.user-name {
  font-size: 1.05rem;
  font-weight: 800;
  color: #ffffff;
}

.user-role {
  font-size: 0.8rem;
  text-transform: capitalize;
  color: #d4e4da;
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
  background-color: rgba(163, 192, 101, 0.24);
  font-weight: 700;
}

.nav-account-button {
  font-size: 1rem;
  font-weight: 700;
  min-height: 2.8rem;
  padding-inline: 1.1rem;
}

.button.nav-account-button {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.35);
  color: #ffffff;
}

.button.nav-account-button:hover {
  background-color: rgba(163, 192, 101, 0.22);
  color: #ffffff;
}

.button.is-danger.is-light.nav-account-button {
  background-color: var(--brand-lime);
  border-color: #8ca956;
  color: #ffffff;
  box-shadow: 0 0 0 2px rgba(163, 192, 101, 0.28), 0 10px 18px rgba(10, 28, 53, 0.34);
  font-weight: 800;
  letter-spacing: 0.01em;
}

.button.is-danger.is-light.nav-account-button:hover {
  background-color: #93b15c;
  border-color: #789246;
  color: #ffffff;
  box-shadow: 0 0 0 2px rgba(163, 192, 101, 0.42), 0 14px 24px rgba(10, 28, 53, 0.42);
  transform: translateY(-1px);
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