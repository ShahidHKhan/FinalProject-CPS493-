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
  padding: 0.9rem 1rem;
  border-top: 1px solid rgba(163, 192, 101, 0.35);
  background: linear-gradient(100deg, #0a1c35 0%, #0d5a42 86%);
  margin-top: auto;
}

p {
  margin: 0;
  color: #e8f1ec;
  font-weight: 600;
}
</style>