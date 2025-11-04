<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { Modal } from 'bootstrap'
import { Line as LineChart, getElementAtEvent } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Filler } from 'chart.js'

// Register the necessary components for Chart.js including Filler for gradient
ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Filler)


// --- STATE MANAGEMENT ---
const articles = ref([])
const newArticle = reactive({ title: '', description: '', url: '', source_name: '', publishedAt: '' })
const status = reactive({ message: '', type: '' })
const articleToDelete = ref(null)
const searchQuery = ref('')
const filterOption = ref('all') // 'all', 'analyzed', 'not_analyzed'
const chartRef = ref(null) // Ref for the chart component

const router = useRouter()

// --- MODAL INSTANCES ---
let uploadModalInstance = null
let deleteModalInstance = null
const uploadModalEl = ref(null)
const deleteModalEl = ref(null)

// --- COMPUTED PROPERTIES ---
const filteredArticles = computed(() => {
  return articles.value.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    let matchesFilter = true;
    if (filterOption.value === 'analyzed') {
      matchesFilter = article.sentiment_score !== undefined
    } else if (filterOption.value === 'not_analyzed') {
      matchesFilter = article.sentiment_score === undefined
    }

    return matchesSearch && matchesFilter
  })
})

// Computed property to format data specifically for the chart
const chartData = computed(() => {
  const analyzableArticles = filteredArticles.value
    .filter(a => a.sentiment_comparative !== undefined && a.publishedAt)
    .sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));

  return {
    datasets: [{
      label: 'Sentiment Comparative Score',
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(13, 110, 253, 0.2)');
        gradient.addColorStop(1, 'rgba(13, 110, 253, 0.02)');
        return gradient;
      },
      borderColor: 'rgba(13, 110, 253, 1)',
      data: analyzableArticles.map(article => ({
        x: new Date(article.publishedAt).toLocaleDateString('en-SG', { year: 'numeric', month: 'short', day: 'numeric' }),
        y: article.sentiment_comparative,
        article: article // Attach full article object for interactivity
      })),
      fill: true,
      tension: 0.2
    }]
  };
});

// Configuration options for the chart
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        title: (context) => truncate(context[0]?.raw?.article?.title, 50),
        label: (context) => `Score: ${context.parsed.y.toFixed(4)} | Source: ${context.raw?.article?.source_name}`
      }
    }
  },
  scales: {
    x: { title: { display: true, text: 'Publication Date' } },
    y: { title: { display: true, text: 'Sentiment Comparative' } }
  }
};

// --- LIFECYCLE HOOKS ---
onMounted(() => {
  if (uploadModalEl.value) uploadModalInstance = new Modal(uploadModalEl.value)
  if (deleteModalEl.value) deleteModalInstance = new Modal(deleteModalEl.value)
  fetchNews()
})

onBeforeUnmount(() => {
  if (uploadModalInstance) uploadModalInstance.dispose()
  if (deleteModalInstance) deleteModalInstance.dispose()
})

// --- UTILITY & HELPER FUNCTIONS ---
const getApiConfig = () => {
  const token = localStorage.getItem('authToken')
  if (!token) {
    setStatus('Authentication token is missing. Please log in again.', 'danger')
    return null
  }
  return {
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  }
}

function setStatus(message, type = 'info', duration = 5000) {
  status.message = message
  status.type = type
  if (duration > 0) {
    setTimeout(() => { status.message = '' }, duration)
  }
}

function truncate(text, length) {
  return text && text.length > length ? text.substring(0, length) + '...' : text
}

const getSentimentClass = (comparative) => {
  if (comparative > 0.1) return 'text-success'
  if (comparative < -0.1) return 'text-danger'
  return 'text-muted'
}

// --- API CALLS & BUSINESS LOGIC ---
async function fetchNews() {
  const config = getApiConfig()
  if (!config) return
  try {
    const response = await axios.get('/news', config)
    articles.value = response.data.data
  } catch (error) {
    setStatus(error.response?.data?.message || 'Failed to fetch articles.', 'danger')
  }
}

async function handleUpload() {
  const config = getApiConfig()
  if (!config) return
  const { title, url, publishedAt } = newArticle
  if (!title || !url || !publishedAt) {
    setStatus('Title, URL, and Published Date are required.', 'danger', 0)
    return
  }
  try {
    const payload = [{ ...newArticle, publishedAt: new Date(newArticle.publishedAt).toISOString() }]
    const response = await axios.post('/news/upload', payload, config)
    setStatus(response.data.message, 'success')
    Object.assign(newArticle, { title: '', description: '', url: '', source_name: '', publishedAt: '' })
    uploadModalInstance.hide()
    fetchNews()
  } catch (error) {
    setStatus(error.response?.data?.message || 'Failed to upload article.', 'danger', 0)
  }
}

function confirmDelete(articleId) {
  articleToDelete.value = articleId
  deleteModalInstance.show()
}

async function executeDelete() {
  if (!articleToDelete.value) return
  const config = getApiConfig()
  if (!config) return
  try {
    const response = await axios.delete(`/news/${articleToDelete.value}`, config)
    setStatus(response.data.message, 'success')
    fetchNews()
  } catch (error) {
    setStatus(error.response?.data?.message || 'Failed to delete article.', 'danger')
  } finally {
    articleToDelete.value = null
    deleteModalInstance.hide()
  }
}

async function runSentimentAnalysis(articleId) {
    const config = getApiConfig()
    if (!config) return
    setStatus(`Analyzing sentiment for article ID: ${articleId}...`, 'info', 0)
    try {
        const response = await axios.get(`/sentiment/analyze/${articleId}`, config)
        setStatus(response.data.message || 'Sentiment analysis complete!', 'success')
        fetchNews()
    } catch (error) {
        setStatus(error.response?.data?.message || 'Failed to run sentiment analysis.', 'danger')
    }
}

function viewArticle(articleId) {
    router.push(`/news/${articleId}`)
}

// --- CHART INTERACTIVITY ---
function handleChartClick(event) {
    const chart = chartRef.value?.chart;
    if (!chart) return;
    
    const elements = getElementAtEvent(chart, event);
    if (elements.length > 0) {
        const dataPoint = chart.data.datasets[elements[0].datasetIndex].data[elements[0].index];
        if (dataPoint && dataPoint.article) {
            viewArticle(dataPoint.article._id);
        }
    }
}
</script>

<template>
  <div class="container py-5">
    <div class="text-center mb-4">
        <h1 class="mb-3">News Article Management</h1>
        <p class="text-muted">Upload, manage, and analyze news articles with sentiment analysis</p>
    </div>
    <div class="d-flex justify-content-center gap-2 mb-4">
        <button @click="fetchNews" class="btn btn-outline-secondary">Refresh</button>
        <button @click="uploadModalInstance.show()" class="btn btn-primary">Upload News</button>
    </div>

    <!-- Status Message Area -->
    <div v-if="status.message" :class="`alert alert-${status.type}`" role="alert">
      {{ status.message }}
    </div>

    <!-- Chart Card -->
    <div class="card mb-4">
        <div class="card-header">
            Sentiment Analysis Trend
        </div>
        <div class="card-body">
            <div v-if="chartData.datasets[0].data.length > 0" style="height: 300px;">
                <LineChart 
                    ref="chartRef"
                    :data="chartData"
                    :options="chartOptions"
                    @click="handleChartClick"
                />
            </div>
            <div v-else class="text-muted text-center p-5">
                No analyzable articles match your criteria to display on the chart.
            </div>
        </div>
    </div>
    
    <!-- Articles Table Card -->
    <div class="card">
        <div class="card-header">
            <div class="row g-2 align-items-center">
                <div class="col-sm-8">
                    <input type="text" class="form-control" v-model="searchQuery" placeholder="Search by title...">
                </div>
                <div class="col-sm-4">
                    <select v-model="filterOption" class="form-select">
                        <option value="all">Show All</option>
                        <option value="analyzed">Show Analyzed</option>
                        <option value="not_analyzed">Show Not Analyzed</option>
                    </select>
                </div>
            </div>
        </div>
      <div class="card-body">
        <div v-if="!filteredArticles.length" class="text-muted text-center p-4">
          No articles match your criteria.
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Source</th>
                <th>Published At</th>
                <th>Sentiment Comp.</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="article in filteredArticles" :key="article._id" @click="viewArticle(article._id)" class="clickable-row">
                <td>{{ truncate(article.title, 40) }}</td>
                <td>{{ truncate(article.description, 50) }}</td>
                <td>{{ article.source_name }}</td>
                <td>{{ new Date(article.publishedAt).toLocaleDateString() }}</td>
                <td :class="getSentimentClass(article.sentiment_comparative)">
                    {{ article.sentiment_comparative !== undefined ? article.sentiment_comparative.toFixed(4) : 'N/A' }}
                </td>
                <td class="text-end">
                    <button
                        v-if="article.sentiment_score === undefined"
                        @click.stop="runSentimentAnalysis(article._id)"
                        class="btn btn-info btn-sm me-2">
                        Analyze
                    </button>
                    <a :href="article.url" target="_blank" rel="noopener noreferrer" @click.stop class="btn btn-outline-secondary btn-sm me-2 btn-fixed-width">Link</a>
                    <button @click.stop="confirmDelete(article._id)" class="btn btn-danger btn-sm btn-fixed-width">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- Upload Modal -->
  <div class="modal fade" ref="uploadModalEl" tabindex="-1" aria-labelledby="uploadModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg"><div class="modal-content"><div class="modal-header"><h5 class="modal-title" id="uploadModalLabel">Upload a News Article</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body"><form @submit.prevent="handleUpload"><div class="mb-3"><label for="articleTitle" class="form-label">Title</label><input v-model="newArticle.title" type="text" class="form-control" id="articleTitle" required></div><div class="mb-3"><label for="articleDescription" class="form-label">Description</label><textarea v-model="newArticle.description" class="form-control" id="articleDescription" rows="3"></textarea></div><div class="row"><div class="col-md-6 mb-3"><label for="articleUrl" class="form-label">Article URL</label><input v-model="newArticle.url" type="url" class="form-control" id="articleUrl" required></div><div class="col-md-6 mb-3"><label for="articleSource" class="form-label">Source Name</label><input v-model="newArticle.source_name" type="text" class="form-control" id="articleSource"></div></div><div class="mb-3"><label for="articlePublishedAt" class="form-label">Published Date & Time</label><input v-model="newArticle.publishedAt" type="datetime-local" class="form-control" id="articlePublishedAt" required></div></form></div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button><button type="button" @click="handleUpload" class="btn btn-primary">Upload Article</button></div></div></div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div class="modal fade" ref="deleteModalEl" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
    <div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h5 class="modal-title" id="deleteModalLabel">Confirm Deletion</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body">Are you sure you want to delete this news article? This action cannot be undone.</div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button type="button" @click="executeDelete" class="btn btn-danger">Confirm Delete</button></div></div></div>
  </div>
</template>

<style scoped>
/* Main Container */
.container {
  font-family: "Inter", sans-serif;
  color: var(--text-primary);
  background-color: var(--bg-light);
}

/* Headings */
h1 {
  font-family: "Poppins", sans-serif;
  font-weight: 700;
  color: var(--text-primary);
}

h5 {
  font-family: "Poppins", sans-serif;
  font-weight: 600;
  color: var(--text-primary);
}

/* Buttons */
.btn-primary {
  background: var(--accent);
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-family: "DM Sans", sans-serif;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #FF7A73;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 140, 134, 0.3);
}

.btn-outline-secondary {
  border: 2px solid var(--primary);
  color: var(--primary);
  background: #ffffff;
  border-radius: 8px;
  font-family: "DM Sans", sans-serif;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-outline-secondary:hover {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

.btn-secondary {
  background: #ffffff;
  border: 2px solid var(--primary);
  color: var(--text-primary);
  border-radius: 8px;
  font-family: "DM Sans", sans-serif;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: var(--primary);
  color: #fff;
}

.btn-danger {
  background: var(--accent);
  border: none;
  border-radius: 8px;
  font-family: "DM Sans", sans-serif;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-danger:hover {
  background: #FF7A73;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 140, 134, 0.3);
}

.btn-info {
  background: var(--secondary);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-family: "DM Sans", sans-serif;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-info:hover {
  background: #8FD9CC;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(167, 230, 218, 0.3);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.875rem;
  border-radius: 6px;
}

/* Alerts */
.alert {
  border-radius: 8px;
  border: 2px solid;
  font-family: "Inter", sans-serif;
}

.alert-success {
  background-color: rgba(183, 216, 183, 0.1);
  border-color: var(--success);
  color: var(--text-primary);
}

.alert-danger {
  background-color: rgba(235, 166, 169, 0.1);
  border-color: var(--error);
  color: var(--text-primary);
}

.alert-info {
  background-color: rgba(167, 230, 218, 0.1);
  border-color: var(--secondary);
  color: var(--text-primary);
}

/* Cards - Grey with pink hover */
.card {
  background: #f8f9fa;
  border: 3px solid #dee2e6;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  font-family: "Inter", sans-serif;
}

.card:hover {
  border-color: #FDA08C;
  box-shadow: 0 6px 20px rgba(253, 160, 140, 0.3);
}

.card-header {
  background: #e9ecef;
  border-bottom: 2px solid #dee2e6;
  border-radius: 13px 13px 0 0 !important;
  padding: 20px;
  font-family: "Poppins", sans-serif;
  font-weight: 600;
  color: #333;
  transition: all 0.3s ease;
}

.card:hover .card-header {
  background-color: #FDA08C;
  color: white;
}

.card-body {
  padding: 24px;
}

/* Form Controls - Grey borders only, no hover background on card header inputs */
.form-control, .form-select {
  border: 2px solid #dee2e6;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 15px;
  font-family: "Inter", sans-serif;
  background-color: white;
  transition: all 0.3s ease;
}

.form-control:hover, .form-select:hover {
  border-color: #FDA08C;
}

.form-control:focus, .form-select:focus {
  border-color: #FDA08C;
  box-shadow: 0 0 0 0.2rem rgba(253, 160, 140, 0.25);
  background-color: white;
}

/* Remove background color on hover for card-header inputs */
.card-header .form-control:hover,
.card-header .form-select:hover {
  background-color: white;
}

.form-label {
  font-family: "DM Sans", sans-serif;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

/* Table - Grey with pink hover */
.table {
  font-family: "Inter", sans-serif;
  color: var(--text-primary);
}

.table thead {
  background: #e9ecef !important;
  color: #333 !important;
  font-weight: 600;
  font-family: "DM Sans", sans-serif;
}

.table thead th {
  background: #e9ecef !important;
  color: #333 !important;
}

.table-hover tbody tr:hover {
  background: rgba(253, 160, 140, 0.1);
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.text-success {
  color: var(--success) !important;
  font-weight: 600;
}

.text-danger {
  color: var(--accent) !important;
  font-weight: 600;
}

.text-muted {
  color: var(--text-subdued) !important;
}

/* Modal */
.modal-content {
  border-radius: 16px;
  border: 3px solid var(--primary);
  font-family: "Inter", sans-serif;
}

.modal-header {
  background: var(--primary);
  color: #fff;
  border-radius: 13px 13px 0 0;
  font-family: "Poppins", sans-serif;
}

.modal-title {
  font-weight: 600;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  border-top: 2px solid rgba(253, 160, 140, 0.2);
  padding: 16px 24px;
}

.btn-close {
  filter: brightness(0) invert(1);
}

/* Fixed width buttons for consistent sizing and alignment */
.btn-fixed-width {
  min-width: 70px;
  width: 70px;
  display: inline-block;
  text-align: center;
  padding: 6px 12px !important;
  line-height: 1.5;
  white-space: nowrap;
}

/* Ensure actions column buttons are aligned */
.text-end {
  white-space: nowrap;
}

.text-end .btn {
  vertical-align: middle;
  margin-bottom: 0;
}
</style>

