<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import logoImage from "../assets/schoolfinders black.png"

const router = useRouter()
const form = reactive({ email: '', handle: '', password: '' })
const signupMessage = ref('')
const signupError = ref('')

const handleSignup = async () => {
  signupMessage.value = ''
  signupError.value = ''

  if (!form.email || !form.handle || !form.password) {
    signupError.value = 'Please fill out all fields.'
    return
  }

  try {
    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/signup`, {
      email: form.email,
      handle: form.handle,
      password: form.password
    })
    signupMessage.value = 'Account created! Redirecting to login...'
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (err) {
    signupError.value = err.response?.data?.message || 'An error occurred during signup.'
  }
}
</script>

<template>
  <div class="d-flex flex-column align-items-center py-4 mt-5">
    <div class="text-center mb-3">
      <img :src="logoImage" alt="Schoolfinders Logo" class="logo">
    </div>

    <main class="form-signup w-100" style="max-width: 400px">
      <form @submit.prevent="handleSignup" class="p-4 p-md-5 glass-card">
        <h2 class="mb-4 text-center">Create Account</h2>

        <div class="form-floating mb-3">
          <input
            v-model="form.email"
            type="email"
            class="form-control"
            id="signup-email"
            placeholder="name@example.com"
            required
          />
          <label for="signup-email">Email address</label>
        </div>

        <div class="form-floating mb-3">
          <input
            v-model="form.handle"
            type="text"
            class="form-control"
            id="signup-handle"
            placeholder="Your Handle"
            required
          />
          <label for="signup-handle">Handle</label>
        </div>

        <div class="form-floating mb-3">
          <input 
            v-model="form.password" 
            type="password" 
            class="form-control" 
            id="signup-password" 
            placeholder="Password" 
            required 
          />
          <label for="signup-password">Password</label>
        </div>

        <div v-if="signupError" class="alert alert-danger text-center p-2">{{ signupError }}</div>
        <div v-if="signupMessage" class="alert alert-success text-center p-2">{{ signupMessage }}</div>

        <button class="w-100 btn btn-lg btn-primary" type="submit">Create Account</button>
        <hr class="my-4" />
        <p class="text-center">
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

.logo {
  max-width: 300px;
  height: auto;
  margin-bottom: 1rem;
}
</style>