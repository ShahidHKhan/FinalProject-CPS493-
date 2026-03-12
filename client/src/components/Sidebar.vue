<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    isActive: boolean
    width?: number
  }>(),
  {
    width: 250,
  },
)
</script>

<template>
  <div
    class="side-bar"
    :class="{ 'is-active': props.isActive }"
    :style="{
      '--sidebar-width': `${props.width}px`,
      '--sidebar-offset': props.isActive ? '0' : '90%',
    }"
  >
    <slot />
  </div>
</template>

<style scoped>
.side-bar {
  width: var(--sidebar-width);
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  border-left: 1px solid #ccc;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
  transform: translateX(var(--sidebar-offset));
  transition: transform 0.3s ease-in-out;
  background: #fff;
  z-index: 40;
}

.side-bar.is-active {
  transform: translateX(0);
}
</style>
