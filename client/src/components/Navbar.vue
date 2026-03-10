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
</style>