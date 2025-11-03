<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router' // Import useRoute
import logoImage from '../assets/schoolfinders black.png'

const router = useRouter()
const route = useRoute() // Get the current route object

const handleLogout = () => {
  // Clear all authentication data from local storage
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
  router.push('/login')
}

const isOverlayVisible = ref(false)

// Modified function to navigate home or toggle overlay
const toggleOverlay = () => {
  // If we are on any page OTHER than /simple-dashboard, navigate there
  if (route.path !== '/simple-dashboard') {
    router.push('/simple-dashboard')
    isOverlayVisible.value = false // Ensure overlay is closed
  } else {
    // If we are ALREADY on /simple-dashboard, just toggle the overlay
    isOverlayVisible.value = !isOverlayVisible.value
  }
}

const navigateTo = (path) => {
  router.push(path)
  isOverlayVisible.value = false
}

// --- CONFIGURABLE APP STRUCTURE ---
// Copied from DashboardView for the overlay menu
const appGroups = ref([
  {
    name: 'School Comparison Tools',
    apps: [
      {
        name: 'School Comparison',
        description: 'Compare schools side-by-side based on various criteria.',
        path: '/comparison',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-layout-split" viewBox="0 0 16 16"><path d="M0 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm8.5-1v12H14a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1zM7.5 2V14H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/></svg>`,
      },
      {
        name: 'School CCA Comparison',
        description: 'CCA Comparison across all schools.',
        path: '/cca-finder',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-people-fill" viewBox="0 0 16 16"><path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/></svg>`,
      },
      {
        name: 'Unique Programmes',
        description: 'Explore the unique programmes each school has.',
        path: '/distinctProgramme',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-award-fill" viewBox="0 0 16 16"><path d="m8 0 1.669.864 1.858.282.842 1.68 1.337 1.32L13.4 6l.306 1.854-1.337 1.32-.842 1.68-1.858.282L8 12l-1.669-.864-1.858-.282-.842-1.68-1.337-1.32L2.6 6l-.306-1.854 1.337-1.32.842-1.68L6.331.864z"/><path d="M4 11.794V16l4-1 4 1v-4.206l-2.018.306L8 13.126 6.018 12.1z"/></svg>`,
      },
    ]
  },
  {
    name: 'Graduate Employment Survey (GES)',
    apps: [
      {
        name: 'Graduate Employment Survey',
        description: 'Explore GES statistics for local universities.',
        path: '/ges',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-mortarboard-fill" viewBox="0 0 16 16"><path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917l-7.5-3.5Z"/><path d="M4.176 9.032a.5.5 0 0 0-.656.327l-.5 1.7a.5.5 0 0 0 .294.605l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0 .294-.605l-.5-1.7a.5.5 0 0 0-.656-.327L8 10.466z"/></svg>`,
      },
      {
        name: 'News Management',
        description: 'Upload, analyze, and manage news articles. Used for job sentiment analysis.',
        path: '/news',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-newspaper" viewBox="0 0 16 16"><path d="M0 2.5A1.5 1.5 0 0 1 1.5 1h11A1.5 1.5 0 0 1 14 2.5v10.528c0 .3-.05.654-.238.972h.738a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 1 1 0v9a1.5 1.5 0 0 1-1.5 1.5H1.497A1.497 1.497 0 0 1 0 13.5z"/><path d="M2 3h10v2H2zm0 3h4v3H2zm0 4h4v1H2zm0 2h4v1H2zm5-6h2v1H7zm3 0h2v1h-2zM7 8h2v1H7zm3 0h2v1h-2zm-3 2h2v1H7zm3 0h2v1h-2z"/></svg>`,
      },
    ],
  },
  {
    name: 'Distance Tracking Map',
    apps: [
      {
        name: 'Map Viewer',
        description: 'Visualize and track distances on an interactive map.',
        path: '/map',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-geo-alt-fill" viewBox="0 0 16 16"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/></svg>`
      },
    ],
  },
])
</script>

<template>
  <header class="top-header">
    <!-- Logo is now inside the header container -->
    <a href="#" class="navbar-brand logo-container" @click.prevent="toggleOverlay">
      <img :src="logoImage" alt="Schoolfinders Logo" class="navbar-logo" />
    </a>

    <nav class="navbar navbar-expand-lg">
      <div class="container-fluid">
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item" :class="{ 'invisible': !isOverlayVisible }">
              <button @click="handleLogout" class="btn btn-outline">Sign Out</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>

  <!-- Fullscreen Overlay -->
  <transition name="fade">
    <div v-if="isOverlayVisible" class="overlay-menu">
      <div class="container py-5 mt-5">

        <div v-for="group in appGroups" :key="group.name" class="mb-5">
          <h2 class="mb-3 fw-bolder">{{ group.name }}</h2>
          <div class="row gx-4 gx-lg-5 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 justify-content-start">
            <div v-for="app in group.apps" :key="app.name" class="col ">
              <div class="glass-card h-100 shadow-sm app-card " @click="navigateTo(app.path)">
                <div class="card-body p-4 text-center">
                  <div v-html="app.icon" class="navbaricon mb-4"></div>
                  <h5 class="fw-bolder">{{ app.name }}</h5>
                  <p>{{ app.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

