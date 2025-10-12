<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavbarView from './views/NavbarView.vue'

const route = useRoute()

// This computed property will hide the navbar on the login and signup routes
const showNavbar = computed(() => {
  return !['/login', '/signup'].includes(route.path)
})
</script>

<template>
  <!-- The NavbarView will only be rendered if showNavbar is true -->
  <NavbarView v-if="showNavbar" />

  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style>
/* Global styles for smooth transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Ensure the app takes full height */
html,
body,
#app {
  height: 100%;
}
#app > div {
  /* Target the direct child rendered by the router */
  height: 100%;
}
</style>

