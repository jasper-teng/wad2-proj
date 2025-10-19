<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const article = ref(null)
const status = ref({ message: '', type: '' })

// Computes the total word count of the description for the formula
const totalWords = computed(() => {
  if (article.value && article.value.description) {
    // Splits by one or more whitespace characters
    return article.value.description.trim().split(/\s+/).length;
  }
  return 0;
});

const getApiConfig = () => {
  const token = localStorage.getItem('authToken')
  if (!token) {
    status.value = { message: 'Authentication token is missing.', type: 'danger' }
    return null
  }
  return {
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
    headers: { Authorization: `Bearer ${token}` }
  }
}

const getSentimentClass = (comparative) => {
  if (comparative > 0.1) return 'text-success fw-bold'
  if (comparative < -0.1) return 'text-danger fw-bold'
  return 'text-muted'
}

onMounted(async () => {
  const articleId = route.params.id
  const config = getApiConfig()
  if (!config || !articleId) return

  try {
    status.value = { message: 'Loading article...', type: 'info' }
    const response = await axios.get(`/news/${articleId}`, config)
    article.value = response.data.data
    status.value = { message: '', type: '' }
  } catch (error) {
    status.value = { message: error.response?.data?.message || 'Failed to fetch article details.', type: 'danger' }
  }
})
</script>

<template>
  <div class="container py-5">
    <!-- Top Navigation Bar -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <button @click="router.push('/news')" class="btn btn-outline-secondary">
        &larr; Back to News List
      </button>
       <a v-if="article" :href="article.url" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
          Read Full Article
        </a>
    </div>

    <!-- Status Message -->
    <div v-if="status.message && !article" :class="`alert alert-${status.type}`" role="alert">
      {{ status.message }}
    </div>

    <!-- Article Details Card -->
    <div v-if="article" class="card shadow-sm">
      <div class="card-header bg-light">
        <!-- Title and Source Info -->
        <div>
            <h1 class="card-title h3 mb-1">{{ article.title }}</h1>
            <h6 class="card-subtitle text-muted">
                From: {{ article.source_name || 'Unknown Source' }} | Published: {{ new Date(article.publishedAt).toLocaleString() }}
            </h6>
        </div>

        <!-- Sentiment Analysis Info -->
        <div v-if="article.sentiment_score !== undefined" class="mt-3 pt-3 border-top">
            <div class="row">
                <div class="col-sm-6">
                    <strong>Sentiment Score:</strong> {{ article.sentiment_score }}
                </div>
                <div class="col-sm-6">
                    <strong>Comparative:</strong> 
                    <span :class="getSentimentClass(article.sentiment_comparative)">
                        {{ article.sentiment_comparative.toFixed(4) }}
                    </span>
                    <small class="text-muted"> ({{article.sentiment_score}} / {{ totalWords }} words)</small>
                </div>
            </div>
        </div>
      </div>
      <div class="card-body">
        <p class="card-text" style="white-space: pre-wrap;">{{ article.description }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-text {
    font-size: 1.1rem;
    line-height: 1.6;
}
.flex-shrink-0 {
    flex-shrink: 0;
}
</style>


