<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const form = reactive({ email: '', password: '' })
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  if (!form.email || !form.password) {
    error.value = 'Please enter your credentials.'
    return
  }
  try {
    // Make API call to the signin endpoint
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/signin`, {
      emailOrHandle: form.email,
      password: form.password
    })

    // Check if we received a token
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token)
      // You can also store user info if needed
      localStorage.setItem('user', JSON.stringify(response.data.user))
      router.push('/dashboard')
    } else {
      error.value = 'Login failed: No token received from server.'
    }
  } catch (err) {
    // Handle login errors (e.g., wrong password)
    error.value = err.response?.data?.message || 'Invalid credentials or server error.'
  }
}
</script>

<template>
  <div class="d-flex align-items-center py-4 bg-body-tertiary">
    <main class="form-signin w-100 m-auto" style="max-width: 400px">
      <form @submit.prevent="handleLogin" class="p-4 p-md-5 border rounded-3 bg-light">
        <h2 class="fw-bold mb-4 text-center">Sign in to your account</h2>

        <div class="form-floating mb-3">
          <input
            v-model="form.email"
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
            v-model="form.password"
            type="password"
            class="form-control"
            id="password"
            placeholder="Password"
            required
          />
          <label for="password">Password</label>
        </div>

        <div v-if="error" class="alert alert-danger text-center p-2">{{ error }}</div>

        <button class="w-100 btn btn-lg btn-primary" type="submit">Sign in</button>
        <hr class="my-4" />
        <p class="text-center text-body-secondary">
          Don't have an account?
          <router-link to="/signup">Create one</router-link>
        </p>
      </form>
    </main>
  </div>
</template>

<style scoped>
.form-signin {
  padding: 1rem;
}
</style>

