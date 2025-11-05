<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import logoImage from '../assets/schoolfinders black.png'

const router = useRouter()

const handleLogout = () => {
  // Clear all authentication data from local storage
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
  router.push('/login')
}

const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const navigateTo = (path) => {
  router.push(path)
  isMobileMenuOpen.value = false
}

const navigateHome = () => {
  router.push('/simple-dashboard')
}

// --- CONFIGURABLE APP STRUCTURE ---
const appGroups = ref([
  {
    name: 'School Comparison Tools',
    apps: [
      {
        name: 'School Comparison',
        path: '/comparison',
      },
      {
        name: 'School CCA Comparison',
        path: '/cca-finder',
      },
      {
        name: 'Unique Programmes',
        path: '/distinctProgramme',
      },
    ]
  },
  {
    name: 'Graduate Employment Survey (GES)',
    apps: [
      {
        name: 'Graduate Employment Survey',
        path: '/ges',
      },
      {
        name: 'News Management',
        path: '/news',
      },
    ],
  },
  {
    name: 'Distance Tracking Map',
    apps: [
      {
        name: 'Map Viewer',
        path: '/map',
      },
    ],
  },
])
</script>

<template>
  <header class="top-header">
    <!-- Logo -->
    <a href="#" class="navbar-brand logo-container" @click.prevent="navigateHome">
      <img :src="logoImage" alt="Schoolfinders Logo" class="navbar-logo" />
    </a>

    <!-- Desktop Navigation -->
    <nav class="navbar navbar-expand-lg desktop-nav">
      <div class="container-fluid">
        <div class="navbar-collapse">
          <ul class="navbar-nav">
            <template v-for="group in appGroups" :key="group.name">
              <li v-if="group.apps.length > 1" class="nav-item dropdown" @mouseenter="$event.currentTarget.classList.add('show')" @mouseleave="$event.currentTarget.classList.remove('show')">
                <a class="nav-link dropdown-toggle" href="#" role="button" @click.prevent>
                  {{ group.name }}
                </a>
                <ul class="dropdown-menu">
                  <li v-for="app in group.apps" :key="app.name">
                    <a class="dropdown-item" href="#" @click.prevent="navigateTo(app.path)">
                      {{ app.name }}
                    </a>
                  </li>
                </ul>
              </li>
              <li v-else class="nav-item">
                <a class="nav-link" href="#" @click.prevent="navigateTo(group.apps[0].path)">{{ group.name }}</a>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Sign Out Button (Always Visible) -->
    <button @click="handleLogout" class="btn btn-outline sign-out-btn">Sign Out</button>

    <!-- Mobile Menu Toggle -->
    <button @click="toggleMobileMenu" class="mobile-menu-toggle" aria-label="Toggle menu">
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>
  </header>

  <!-- Mobile Slide-out Menu -->
  <transition name="slide">
    <div v-if="isMobileMenuOpen" class="mobile-menu-overlay" @click="toggleMobileMenu">
      <div class="mobile-menu" @click.stop>
        <div class="mobile-menu-header">
          <button @click="toggleMobileMenu" class="close-btn" aria-label="Close menu">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
            </svg>
          </button>
        </div>

        <div class="mobile-menu-content">
          <div v-for="group in appGroups" :key="group.name" class="mobile-menu-group">
            <h3 class="mobile-menu-group-title">{{ group.name }}</h3>
            <ul class="mobile-menu-list">
              <li v-for="app in group.apps" :key="app.name">
                <a href="#" @click.prevent="navigateTo(app.path)" class="mobile-menu-link">
                  {{ app.name }}
                </a>
              </li>
            </ul>
          </div>

          <div class="mobile-menu-footer">
            <button @click="handleLogout" class="btn btn-outline w-100">Sign Out</button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

