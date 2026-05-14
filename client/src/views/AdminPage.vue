<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const { availableAccounts, currentUser, isAdmin } = storeToRefs(authStore)
</script>

<template>
  <section class="section">
    <div class="container">
      <div
        v-if="!currentUser"
        class="notification is-warning is-light"
      >
        <strong>Log in first:</strong> Use the Log in button in the navbar.
      </div>

      <div
        v-else-if="!isAdmin"
        class="notification is-danger is-light"
      >
        <strong>Access denied:</strong> Admin access is required for this page.
      </div>

      <div v-else>
        <h1 class="title">Admin</h1>
        <p class="subtitle">User List</p>

        <div class="table-container">
          <table class="table is-fullwidth is-striped is-hoverable">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="user in availableAccounts"
                :key="user.id"
              >
                <td>{{ user.id }}</td>
                <td>{{ user.name }}</td>
                <td>
                  <span
                    class="tag"
                    :class="user.role === 'admin' ? 'is-primary' : 'is-info is-light'"
                  >
                    {{ user.role }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>