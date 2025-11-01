<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios';
import logoImage from "../assets/schoolfinders black.png";

const router = useRouter()

// --- STATE ---
const isRegistering = ref(false)

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
      router.push('/dashboard')
    } else {
      loginError.value = 'Login failed: No token received from server.'
    }
  } catch (err) {
    loginError.value = err.response?.data?.message || 'Invalid credentials or server error.'
  }
}

// --- SIGNUP STATE & LOGIC ---
const signupForm = reactive({ email: '', handle: '', password: '' })
const signupMessage = ref('')
const signupError = ref('')

const handleSignup = async () => {
  signupMessage.value = ''
  signupError.value = ''

  if (!signupForm.email || !signupForm.handle || !signupForm.password) {
    signupError.value = 'Please fill out all fields.'
    return
  }

  try {
    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/signup`, {
      email: signupForm.email,
      handle: signupForm.handle,
      password: signupForm.password
    })
    signupMessage.value = 'Account created! You can now sign in.'
    setTimeout(() => {
      toggleForm(false) // Switch to login form
    }, 2000)
  } catch (err) {
    signupError.value = err.response?.data?.message || 'An error occurred during signup.'
  }
}

// --- FORM TOGGLING ---
const toggleForm = (showRegister) => {
  isRegistering.value = showRegister
  if (showRegister) {
    loginError.value = ''
  } else {
    signupError.value = ''
    signupMessage.value = ''
  }
}
</script>

<template>
  <div class="d-flex flex-column align-items-center py-4 mt-5">
    
    <div class="text-center mb-3">
      <img :src="logoImage" alt="Schoolfinders Logo" class="logo">
    </div>

    <main class="form-signin w-100" style="max-width: 400px">
      <transition name="fade" mode="out-in">
        <!-- Login Form -->
        <form v-if="!isRegistering" key="login" @submit.prevent="handleLogin" class="p-4 p-md-5 glass-card dark-text">
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
            <a href="#" @click.prevent="toggleForm(true)">Create one</a>
          </p>
        </form>

        <!-- Signup Form -->
        <form v-else key="signup" @submit.prevent="handleSignup" class="p-4 p-md-5 glass-card">
          <h2 class="mb-4 text-center">Create Account</h2>

          <div class="form-floating mb-3">
            <input
              v-model="signupForm.email"
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
              v-model="signupForm.handle"
              type="text"
              class="form-control"
              id="signup-handle"
              placeholder="Your Handle"
              required
            />
            <label for="signup-handle">Handle</label>
          </div>
          <div class="form-floating mb-3">
            <input v-model="signupForm.password" type="password" class="form-control" id="signup-password" placeholder="Password" required />
            <label for="signup-password">Password</label>
          </div>
          <div v-if="signupError" class="alert alert-danger text-center p-2">{{ signupError }}</div>
          <div v-if="signupMessage" class="alert alert-success text-center p-2">{{ signupMessage }}</div>
          <button class="w-100 btn btn-lg btn-primary" type="submit">Create Account</button>
          <hr class="my-4" />
          <p class="text-center">
            Already have an account?
            <a href="#" @click.prevent="toggleForm(false)">Sign in</a>
          </p>
        </form>
      </transition>
    </main>
  </div>
</template>
