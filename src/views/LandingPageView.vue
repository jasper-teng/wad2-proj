<script setup>
import { useRouter } from 'vue-router'
import logoImage from '@/assets/schoolfinders black.png'

const router = useRouter()

const goLogin = () => router.push('/login')
const goSignup = () => router.push('/signup')
</script>

<template>
  <div class="landing d-flex flex-column align-items-center justify-content-center vh-100 text-center p-4">
    <img :src="logoImage" alt="Schoolfinders logo" class="logo mb-4" />

    <h1 class="display-6 fw-bold mb-2 float-text">Welcome to SchoolFinders</h1>
    <p class="lead mb-4 text-muted float-text" style="max-width:720px">
      Explore schools, compare programs and track travel distances — all in one place.
      Create an account or sign in to get started.
    </p>

    <div class="d-flex gap-3 flex-wrap justify-content-center">
      <button class="btn btn-primary btn-lg" @click="goSignup">Create Account</button>
      <button class="btn btn-outline btn-lg" @click="goLogin">Sign In</button>
    </div>

    <p class="small text-muted mt-4 float-text">From the lovely developers of Group 5!</p>
  </div>
</template>

<style scoped>
.landing {
  background: transparent;
  min-height: 100vh;
  box-sizing: border-box;
}

.logo {
  max-width: 720px;
  width: 88%;
  height: auto;
  filter: none;
  margin-top: 1rem;
}

.display-6, .lead {
  color: #313131;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
/* Floating text effect */
.float-text {
  text-shadow: 2px 3px 4px rgba(0, 0, 0, 0.25);
  transition: transform 0.3s ease, text-shadow 0.3s ease;
}

.btn-primary {
  padding: 0.75rem 1.6rem;
  font-weight: 600;
}

.btn-outline {
  border: 2px solid #FFA18D;
  background: #fff;
  color: #FFA18D;
  padding: 0.7rem 1.5rem;
  font-weight: 600;
}

@media (min-width: 992px) {
  .logo { max-width: 900px; width: 70%; }
}
</style>
