<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavbarView from './views/NavbarView.vue'

const route = useRoute()
const isAuthPage = computed(() => route.path === '/login' || route.path === '/signup')
</script>

<template>
  <NavbarView v-if="!isAuthPage" />
  <main class="flex-shrink-0">
    <!-- 
      By adding the :key="route.fullPath", we are telling Vue to treat each route as a unique component.
      This forces a complete remount of the component when the route changes, fixing the navigation issue.
    -->
    <router-view :key="route.fullPath" v-slot="{ Component }">
        <transition name="fade" mode="out-in">
            <component :is="Component" />
        </transition>
    </router-view>
  </main>
</template>

<style>
/* A little custom transition for smoother route changes */
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
    opacity: 0;
}
body, #app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}
.flex-shrink-0 {
    flex-shrink: 0;
}
</style>

