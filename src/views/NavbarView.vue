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
      <router-link class="navbar-brand" to="/dashboard">My Dashboard</router-link>
      <ul class="navbar-nav ms-auto">
        <li class="nav-item">
          <button @click="handleLogout" class="btn btn-outline-light">Sign out</button>
        </li>
      </ul>
    </div>
  </nav>
</template>
