<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const form = reactive({ email: '', handle: '', password: '' })
const message = ref('')
const error = ref('')

const handleSignup = async () => {
  // Clear previous messages
  message.value = ''
  error.value = ''

  if (!form.email || !form.handle || !form.password) {
    error.value = 'Please fill out all fields.'
    return
  }

  try {
    // Make API call to the signup endpoint
    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/signup`, {
      email: form.email,
      handle: form.handle,
      password: form.password
    })

    // On success
    message.value = 'Account created successfully! Redirecting to login...'
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (err) {
    // On failure
    error.value = err.response?.data?.message || 'An error occurred during signup.'
  }
}
</script>

<template>
  <div class="d-flex align-items-center py-4 bg-body-tertiary">
    <main class="form-signup w-100 m-auto" style="max-width: 400px">
      <form @submit.prevent="handleSignup" class="p-4 p-md-5 border rounded-3 bg-light">
        <h2 class="fw-bold mb-4 text-center">Create a new account</h2>

        <div class="form-floating mb-3">
          <input
            v-model="form.email"
            type="email"
            class="form-control"
            id="email-address"
            placeholder="name@example.com"
            required
          />
          <label for="email-address">Email address</label>
        </div>

        <div class="form-floating mb-3">
          <input
            v-model="form.handle"
            type="text"
            class="form-control"
            id="handle"
            placeholder="Your Handle"
            required
          />
          <label for="handle">Handle</label>
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
        <div v-if="message" class="alert alert-success text-center p-2">{{ message }}</div>

        <button class="w-100 btn btn-lg btn-primary" type="submit">Create Account</button>
        <hr class="my-4" />
        <p class="text-center text-body-secondary">
          Already have an account?
          <router-link to="/login">Sign in</router-link>
        </p>
      </form>
    </main>
  </div>
</template>

<style scoped>
.form-signup {
  padding: 1rem;
}
</style>

