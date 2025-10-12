<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogout = () => {
  // Clear all authentication data from local storage
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/dashboard">My App</router-link>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <button @click="handleLogout" class="btn btn-outline-light">Sign out</button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
