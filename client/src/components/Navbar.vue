<template>
  <header class="navbar-min">
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/profile">Profile</RouterLink>
      <RouterLink to="/database">Database</RouterLink>
      <RouterLink to="/friends">Friends</RouterLink>
      <RouterLink to="/workouts">Workouts</RouterLink>
    </nav>
  </header>
</template>

<style scoped>
.navbar-min {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #ddd;
}

nav {
  display: flex;
  gap: 1rem;
}

.router-link-active,
a {
  margin: 0;
  font-weight: 600;
  text-decoration: none;
  color: inherit;
}
</style>