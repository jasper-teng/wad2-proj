<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import logoImage from "../assets/schoolfinders black.png"

const router = useRouter()

// --- LOGIN STATE & LOGIC ---
const loginForm = reactive({ email: '', password: '' })
const loginError = ref('')

const handleLogin = async () => {
  loginError.value = ''
  if (!loginForm.email || !loginForm.password) {
    loginError.value = 'Please enter your credentials.'
    return
  }
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/signin`, {
      emailOrHandle: loginForm.email,
      password: loginForm.password
    })

    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      router.push('/simple-dashboard')
    } else {
      loginError.value = 'Login failed: No token received from server.'
    }
  } catch (err) {
    loginError.value = err.response?.data?.message || 'Invalid credentials or server error.'
  }
}
</script>

<template>
  <div class="d-flex flex-column align-items-center py-4 mt-5">
    <div class="text-center mb-3">
      <img :src="logoImage" alt="Schoolfinders Logo" class="logo">
    </div>

    <main class="form-signin w-100" style="max-width: 400px">
      <form @submit.prevent="handleLogin" class="p-4 p-md-5 glass-card dark-text">
        <h2 class="mb-4 text-center">Sign In</h2>

        <div class="form-floating mb-3">
          <input
            v-model="loginForm.email"
            type="text"
            class="form-control"
            id="email-address"
            placeholder="name@example.com"
            required
          />
          <label for="email-address">Email or Handle</label>
        </div>

        <div class="form-floating mb-3">
          <input
            v-model="loginForm.password"
            type="password"
            class="form-control"
            id="password"
            placeholder="Password"
            required
          />
          <label for="password">Password</label>
        </div>

        <div v-if="loginError" class="alert alert-danger text-center p-2">{{ loginError }}</div>
        <button class="w-100 btn btn-lg btn-primary" type="submit">Sign in</button>

        <p class="text-center mt-4">
          Don't have an account?
          <router-link to="/signup">Create one</router-link>
        </p>
      </form>
    </main>
  </div>
</template>

<style scoped>
.logo {
  max-width: 300px;
  height: auto;
  margin-bottom: 1rem;
}
</style>