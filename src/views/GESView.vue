<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

// --- STATE MANAGEMENT ---
const universities = ref([]);
const schools = ref({}); // Using an object to cache schools by university
const degrees = ref([]);
const schoolSummary = ref(null);
const selectedUniversity = ref(null);
const selectedSchool = ref(null);
const isLoading = reactive({ universities: false, schools: false, degrees: false });
const error = ref(null);
const isSidebarOpen = ref(true);

// --- API CONFIGURATION ---
const getApiConfig = () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    error.value = 'Authentication token is missing. Please log in again.';
    return null;
  }
  return {
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
    headers: { Authorization: `Bearer ${token}` }
  };
};

// --- DATA FETCHING & STATE LOGIC ---
async function fetchUniversities() {
  const config = getApiConfig();
  if (!config) return;
  isLoading.universities = true;
  error.value = null;
  try {
    const response = await axios.get('/ges/universities', config);
    universities.value = response.data.data.sort();
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to fetch universities.';
  } finally {
    isLoading.universities = false;
  }
}

async function handleUniversityClick(university, isRestoring = false) {
  if (selectedUniversity.value === university && !isRestoring) {
    selectedUniversity.value = null;
    return;
  }
  
  selectedSchool.value = null;
  degrees.value = [];
  schoolSummary.value = null;
  
  if (schools.value[university]) {
    selectedUniversity.value = university;
    return;
  }
  
  const config = getApiConfig();
  if (!config) return;
  isLoading.schools = true;
  error.value = null;
  try {
    const response = await axios.get(`/ges/schools/${encodeURIComponent(university)}`, config);
    schools.value[university] = [...new Set(response.data.data)].sort();
    selectedUniversity.value = university;
  } catch (err) {
    error.value = err.response?.data?.message || `Failed to fetch schools for ${university}.`;
  } finally {
    isLoading.schools = false;
  }
}

async function handleSchoolClick(university, school) {
  selectedSchool.value = school;
  degrees.value = [];
  schoolSummary.value = null;
  const config = getApiConfig();
  if (!config) return;
  isLoading.degrees = true;
  error.value = null;
  try {
    const response = await axios.get(`/ges/degrees/${encodeURIComponent(university)}/${encodeURIComponent(school)}`, config);
    degrees.value = response.data.data;
    calculateSchoolSummary(response.data.data);
  } catch (err) {
    error.value = err.response?.data?.message || `Failed to fetch degrees for ${school}.`;
  } finally {
    isLoading.degrees = false;
  }
}

function viewDegreeHistory(degree) {
  sessionStorage.setItem('ges_selectedUniversity', selectedUniversity.value);
  sessionStorage.setItem('ges_selectedSchool', selectedSchool.value);
  router.push({
    name: 'ges-object',
    params: {
      university: selectedUniversity.value,
      school: selectedSchool.value,
      degree: degree.degree
    }
  });
}

function clearSelections() {
    sessionStorage.removeItem('ges_selectedUniversity');
    sessionStorage.removeItem('ges_selectedSchool');
    selectedUniversity.value = null;
    selectedSchool.value = null;
    degrees.value = [];
    schoolSummary.value = null;
}

// --- LIFECYCLE HOOKS ---
onMounted(async () => {
  const savedUni = sessionStorage.getItem('ges_selectedUniversity');
  const savedSchool = sessionStorage.getItem('ges_selectedSchool');

  await fetchUniversities(); // Always fetch the main list first

  if (savedUni) {
    await handleUniversityClick(savedUni, true);
    if (savedSchool) {
      await handleSchoolClick(savedUni, savedSchool);
    }
  }
  
  const mediaQuery = window.matchMedia('(max-width: 992px)');
  const handleResize = () => isSidebarOpen.value = !mediaQuery.matches;
  handleResize();
  window.addEventListener('resize', handleResize);
  
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });
});

// --- HELPER & CALCULATION FUNCTIONS ---
const formatCurrency = (value) => {
    if (isNaN(parseFloat(value)) || value === 'na' || value === null) return 'N/A';
    return new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', minimumFractionDigits: 0 }).format(value);
};

const formatPercentage = (value) => {
    if (isNaN(parseFloat(value)) || value === 'na' || value === null) return 'N/A';
    return `${parseFloat(value).toFixed(1)}%`;
}

const calculateSchoolSummary = (degreeData) => {
    const validEntries = degreeData.filter(d => d.employment_rate_overall !== 'na' && d.gross_monthly_mean !== 'na');
    if (validEntries.length === 0) {
        schoolSummary.value = null;
        return;
    }
    const avgEmployment = validEntries.reduce((acc, curr) => acc + parseFloat(curr.employment_rate_overall), 0) / validEntries.length;
    const avgGrossMean = validEntries.reduce((acc, curr) => acc + parseFloat(curr.gross_monthly_mean), 0) / validEntries.length;

    schoolSummary.value = {
        avgEmployment,
        avgGrossMean,
        degreeCount: degreeData.length,
    };
};

</script>

<template>
  <div>
    <!-- Backdrop for mobile sidebar -->
    <div v-if="isSidebarOpen" @click="isSidebarOpen = false" class="backdrop d-lg-none"></div>

    <!-- Floating Sidebar -->
    <div :class="['sidebar', { 'open': isSidebarOpen }]">
      <div class="px-3 pt-3 d-flex justify-content-between align-items-center">
        <h5 class="mb-0">GES Explorer</h5>
        <button class="btn btn-sm btn-outline-secondary" @click="clearSelections" title="Clear Selections">Reset</button>
      </div>
      <hr>
      <div v-if="isLoading.universities" class="text-center p-3">
          <div class="spinner-border spinner-border-sm" role="status"></div>
      </div>
      <ul class="list-group list-group-flush">
        <li v-for="uni in universities" :key="uni" class="list-group-item">
          <a @click.prevent="handleUniversityClick(uni)" href="#" class="d-flex justify-content-between align-items-center fw-bold">
            {{ uni }}
            <span class="arrow" :class="{ 'expanded': selectedUniversity === uni }">›</span>
          </a>
          <div v-if="selectedUniversity === uni" class="school-list mt-2">
            <div v-if="isLoading.schools" class="text-center p-2">
                <div class="spinner-border spinner-border-sm text-secondary" role="status"></div>
            </div>
            <ul v-else class="list-group list-group-flush">
              <li v-for="school in schools[uni]" :key="school" 
                  class="list-group-item school-item"
                  :class="{ 'active': selectedSchool === school }"
                  @click="handleSchoolClick(uni, school)">
                {{ school }}
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </div>

    <!-- Main Content Area -->
    <main class="main-content" :class="{ 'sidebar-open': isSidebarOpen }">
      <div class="container-fluid py-4">
        <div class="d-flex justify-content-start mb-3 d-lg-none">
            <button @click="isSidebarOpen = !isSidebarOpen" class="btn btn-light">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/></svg>
            </button>
        </div>
        <div class="text-center mb-4">
            <h1 class="mb-2">Graduate Employment Survey</h1>
            <p class="text-muted mb-0">Select a university and school from the sidebar to view degree statistics</p>
        </div>

        <div v-if="error" class="alert alert-danger">{{ error }}</div>

        <div v-if="isLoading.degrees" class="text-center p-5">
            <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
        
        <div v-else-if="degrees.length > 0">
            <h3 class="mb-3">{{ selectedSchool }}</h3>
            <!-- School Summary Card -->
            <div v-if="schoolSummary" class="card mb-4 bg-light border-primary">
                <div class="card-body">
                    <h5 class="card-title text-primary">School Summary</h5>
                     <div class="row text-center">
                        <div class="col-md-4">
                            <div class="stat-title">Degrees Offered</div>
                            <div class="stat-value">{{ schoolSummary.degreeCount }}</div>
                        </div>
                        <div class="col-md-4">
                            <div class="stat-title">Avg. Employment Rate</div>
                            <div class="stat-value">{{ formatPercentage(schoolSummary.avgEmployment) }}</div>
                        </div>
                        <div class="col-md-4">
                            <div class="stat-title">Avg. Gross Salary</div>
                            <div class="stat-value">{{ formatCurrency(schoolSummary.avgGrossMean) }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Degree Cards -->
            <div class="row">
                <div v-for="degree in degrees" :key="degree._id" class="col-md-6 col-lg-4 mb-4">
                    <div class="card h-100 degree-card" @click="viewDegreeHistory(degree)">
                        <div class="card-body">
                            <h5 class="card-title">{{ degree.degree }}</h5>
                            <h6 class="card-subtitle mb-3 text-muted">Last Updated: {{ degree.year }}</h6>
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item d-flex justify-content-between">
                                    <span>Overall Employment:</span>
                                    <span class="fw-bold">{{ formatPercentage(degree.employment_rate_overall) }}</span>
                                </li>
                                <li class="list-group-item d-flex justify-content-between">
                                    <span>Mean Basic Salary:</span>
                                    <span class="fw-bold">{{ formatCurrency(degree.basic_monthly_mean) }}</span>
                                </li>
                                <li class="list-group-item d-flex justify-content-between">
                                    <span>Mean Gross Salary:</span>
                                    <span class="fw-bold">{{ formatCurrency(degree.gross_monthly_mean) }}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div v-else-if="selectedSchool" class="text-center text-muted mt-5">
            <p>No degree data found for the selected school.</p>
        </div>
        <div v-else-if="selectedUniversity" class="text-center text-muted mt-5">
            <p class="lead">Please select a school to continue.</p>
        </div>
        <div v-else class="text-center text-muted mt-5">
            <p class="lead">Please make a selection from the sidebar to begin.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Sidebar */
.sidebar {
  position: fixed;
  top: 56px;
  left: 0;
  bottom: 0;
  width: 300px;
  background-color: #ffffff;
  border-right: 3px solid var(--primary);
  overflow-y: auto;
  z-index: 1030;
  transition: transform 0.3s ease;
  transform: translateX(-100%);
  font-family: "Inter", sans-serif;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.08);
}

.sidebar.open {
  transform: translateX(0);
}

.sidebar h5 {
  font-family: "Poppins", sans-serif;
  font-weight: 700;
  color: var(--text-primary);
}

.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1020;
}

.main-content {
  transition: margin-left 0.3s ease;
  padding: 0;
  margin-left: 0;
  background-color: var(--bg-light);
  min-height: 100vh;
}

@media (min-width: 992px) {
  .sidebar {
    transform: translateX(0);
  }
  .main-content.sidebar-open {
    margin-left: 300px;
  }
}

/* Sidebar List Items */
.sidebar .list-group-item {
  background-color: transparent;
  border: none;
  padding: 0.75rem 1rem;
  font-family: "Inter", sans-serif;
}

.sidebar .list-group-item a {
  text-decoration: none;
  color: var(--text-primary);
  font-weight: 600;
  transition: color 0.3s ease;
}

.sidebar .list-group-item a:hover {
  color: var(--primary);
}

.school-list {
  padding-left: 1rem;
  border-left: 2px solid var(--primary);
  margin-left: 0.5rem;
}

.school-item {
  font-size: 0.9rem;
  padding: 0.5rem 1rem !important;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-family: "Inter", sans-serif;
}

.school-item:hover {
  background-color: rgba(253, 160, 140, 0.1);
}

.school-item.active {
  background-color: var(--primary);
  color: white;
  border-color: var(--primary);
}

.arrow {
  transition: transform 0.2s ease;
  display: inline-block;
  color: var(--primary);
  font-size: 1.2rem;
}

.arrow.expanded {
  transform: rotate(90deg);
}

/* Main Content */
h1 {
  font-family: "Poppins", sans-serif;
  font-weight: 700;
  color: var(--text-primary);
}

h3 {
  font-family: "Poppins", sans-serif;
  font-weight: 600;
  color: var(--text-primary);
}

.text-muted {
  color: var(--text-subdued) !important;
  font-family: "Inter", sans-serif;
}

/* Buttons */
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

.btn-light {
  background: #ffffff;
  border: 2px solid var(--primary);
  color: var(--text-primary);
  border-radius: 8px;
  font-family: "DM Sans", sans-serif;
  transition: all 0.3s ease;
}

.btn-light:hover {
  background: var(--primary);
  color: #fff;
}

/* Cards */
.card {
  background: #ffffff;
  border: 3px solid var(--primary);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  font-family: "Inter", sans-serif;
}

.card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.card-title {
  font-family: "Poppins", sans-serif;
  font-weight: 700;
  color: var(--text-primary);
}

.card-subtitle {
  font-family: "Inter", sans-serif;
  color: var(--text-subdued);
}

.text-primary {
  color: var(--primary) !important;
}

.bg-light {
  background-color: rgba(253, 160, 140, 0.05) !important;
}

.border-primary {
  border-color: var(--primary) !important;
}

/* Degree Cards */
.degree-card {
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.degree-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}

/* Statistics */
.stat-title {
  font-size: 0.9rem;
  color: var(--text-subdued);
  font-family: "DM Sans", sans-serif;
  font-weight: 600;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
  font-family: "Poppins", sans-serif;
}

/* List Group */
.list-group-item {
  border: 1px solid rgba(253, 160, 140, 0.2);
  font-family: "Inter", sans-serif;
  color: var(--text-primary);
}

.list-group-flush .list-group-item {
  border-width: 0 0 1px;
}

/* Alerts */
.alert-danger {
  background-color: rgba(235, 166, 169, 0.1);
  border: 2px solid var(--error);
  color: var(--text-primary);
  border-radius: 8px;
  font-family: "Inter", sans-serif;
}

/* Spinners */
.spinner-border {
  color: var(--primary);
}

.text-secondary {
  color: var(--secondary) !important;
}

.text-primary {
  color: var(--primary) !important;
}
</style>

