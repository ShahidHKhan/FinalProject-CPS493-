<script setup lang="ts">
const footerLineText = 'CPS 493 - Midterm - Shahid Khan - 2026'
</script>

<template>
  <footer class="footer-min">
    <p>{{ footerLineText }}</p>
  </footer>
</template>

<style scoped>
.footer-min {
  padding: 0.75rem 1rem;
  border-top: 1px solid #ddd;
}

p {
  margin: 0;
}
</style>