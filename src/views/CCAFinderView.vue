<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import SearchBar from '../components/SearchBar.vue'
import FilterPanel from '../components/FilterPanel.vue'
import SchoolTable from '../components/SchoolTable.vue'

const isLoading = ref(false)
const error = ref('')
const allSchools = ref([])
const userLocation = ref(null)
const currentSortOrder = ref('none')
const searchBar = ref(null)

const selectedFilters = reactive({
  level: '',
  category: '',
  cca: ''
})

const allLevels = computed(() => {
  const levels = new Set()
  allSchools.value.forEach((school) => {
    if (school.school_section) {
      levels.add(school.school_section)
    }
  })
  return Array.from(levels).sort()
})

const allCategories = computed(() => {
  const categories = new Set()
  allSchools.value.forEach((school) => {
    if (school.cca_generic_name && school.cca_generic_name !== 'na') {
      categories.add(school.cca_generic_name)
    }
  })
  return Array.from(categories).sort()
})

const allSpecificCCAsData = computed(() => {
  const ccaMap = new Map()

  allSchools.value.forEach((school) => {
    const ccaName = school.cca_grouping_desc
    const category = school.cca_generic_name

    if (ccaName && ccaName !== 'na' && category && category !== 'na') {
      if (!ccaMap.has(ccaName)) {
        ccaMap.set(ccaName, category)
      }
    }
  })

  const ccaArray = Array.from(ccaMap.entries()).map(([name, category]) => ({
    name,
    category
  }))

  return ccaArray.sort((a, b) => a.name.localeCompare(b.name))
})

const filteredSchools = computed(() => {
  let filtered = allSchools.value

  if (selectedFilters.level) {
    filtered = filtered.filter((school) => school.school_section === selectedFilters.level)
  }

  if (selectedFilters.category) {
    filtered = filtered.filter((school) => school.cca_generic_name === selectedFilters.category)
  }

  if (selectedFilters.cca) {
    filtered = filtered.filter((school) => school.cca_grouping_desc === selectedFilters.cca)
  }

  return filtered.map((school) => ({
    school_name: school.School_name,
    school_section: school.school_section,
    cca: school.cca_grouping_desc,
    _id: school._id
  }))
})

async function loadSchoolData() {
  isLoading.value = true
  error.value = ''

  try {
    console.log("fetch data");
    const datasetId = 'd_9aba12b5527843afb0b2e8e4ed6ac6bd'
    const apiUrl = `https://data.gov.sg/api/action/datastore_search?resource_id=${datasetId}&limit=10000`

    const response = await fetch(apiUrl)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('API Response:', data)

    let records = []
    if (data.success && data.result && data.result.records) {
      records = data.result.records
    } else if (data.data && Array.isArray(data.data)) {
      records = data.data
    } else if (Array.isArray(data)) {
      records = data
    }

    if (records.length > 0) {
      allSchools.value = records
      console.log(`Loaded ${allSchools.value.length} school records`)
    } else {
      throw new Error('No school records found in API response')
    }
  } catch (err) {
    console.error('Error fetching school data:', err)
    error.value = `Error loading school data: ${err.message}`
  } finally {
    isLoading.value = false
  }
}

function handleLocationChange(location) {
  userLocation.value = location
  console.log('Location updated:', location)
}

function handleFilterChange(filters) {
  selectedFilters.level = filters.level
  selectedFilters.category = filters.category
  selectedFilters.cca = filters.cca
  console.log('Filters updated:', filters)
}

function handleSortChange(sortOrder) {
  currentSortOrder.value = sortOrder
  console.log('Sort order changed:', sortOrder)
}

function clearAllFilters() {
  selectedFilters.level = ''
  selectedFilters.category = ''
  selectedFilters.cca = ''
  userLocation.value = null
  if (searchBar.value) {
    searchBar.value.clearLocation()
  }
}

onMounted(() => {
  loadSchoolData()
})
</script>

<template>
  <div class="cca-finder-container">
    <div class="container py-5">
      <div class="header-section mb-5">
        <h1 class="display-5 fw-bold mb-2">Singapore School CCA Finder</h1>
        <p>Find schools based on Co-Curricular Activities and location</p>
      </div>

      <div class="content-card mb-4">
        <h5 class="mb-4">Filters</h5>
        <FilterPanel
          :all-levels="allLevels"
          :all-categories="allCategories"
          :all-specific-c-c-as="allSpecificCCAsData"
          :selected-filters="selectedFilters"
          @filter-change="handleFilterChange"
        />
        <SearchBar ref="searchBar" @location-change="handleLocationChange" />
        <div class="mt-3">
          <button
            type="button"
            class="btn btn-outline-secondary"
            @click="clearAllFilters"
            :disabled="!selectedFilters.level && !selectedFilters.category && !selectedFilters.cca && !userLocation"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      <div v-if="error" class="alert alert-danger shadow-sm" role="alert">
        {{ error }}
      </div>

      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading school data...</p>
      </div>

      <div v-else>
        <SchoolTable
          :schools="filteredSchools"
          :user-location="userLocation"
          :current-sort-order="currentSortOrder"
          :selected-cca-filter="selectedFilters.cca"
          @sort-change="handleSortChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.cca-finder-container {
  min-height: 100vh;
  background-color: none;
}

.header-section {
  text-align: center;
  color: #313131;
}

.header-section h1 {
  color: #313131;
}

.header-section .text-muted {
  color: #6c757d !important;
}

.content-card {
  background: #ffffff;
  padding: 1.5rem;
  border: 5px solid #FFA18D;
  border-radius: 0 30px 0 30px;
  box-shadow: none;
}

/* Alert styling to match ComparisonView */
.alert-danger {
  border-color: rgba(255, 161, 141, 0.5);
  background-color: rgba(255, 161, 141, 0.1);
  color: #313131;
}

/* Spinner styling */
.spinner-border.text-primary {
  color: #56bdb6 !important;
}

/* Button styling */
.btn-outline-secondary {
  border-color: #FFA18D;
  color: #FFA18D;
}

.btn-outline-secondary:hover {
  background-color: #FFA18D;
  border-color: #FFA18D;
  color: #ffffff;
}

.btn-outline-secondary:disabled {
  border-color: rgba(255, 161, 141, 0.5);
  color: rgba(255, 161, 141, 0.5);
}

/* Form control styling */
:deep(.form-control:focus),
:deep(.form-select:focus) {
  border-color: #56bdb6;
  box-shadow: 0 0 0 0.2rem rgba(86, 189, 182, 0.25);
}

/* Badge styling to match ComparisonView */
:deep(.badge.bg-primary-subtle) {
  background-color: rgba(86, 189, 182, 0.2) !important;
  color: #56bdb6 !important;
  border: 1px solid #56bdb6;
}

:deep(.badge.bg-success-subtle) {
  background-color: rgba(86, 189, 182, 0.2) !important;
  color: #56bdb6 !important;
  border: 1px solid #56bdb6;
}

:deep(.badge.bg-secondary-subtle) {
  background-color: rgba(255, 161, 141, 0.2) !important;
  color: #FFA18D !important;
  border: 1px solid #FFA18D;
}

/* Table styling to match ComparisonView */
:deep(.table) {
  color: #313131;
}

:deep(.table thead) {
  background-color: rgba(255, 161, 141, 0.2);
}

:deep(.table-striped tbody tr:nth-of-type(odd)) {
  background-color: rgba(255, 161, 141, 0.05);
}

:deep(.table-hover tbody tr:hover) {
  background-color: rgba(255, 161, 141, 0.15);
}

/* Input group styling */
:deep(.input-group-text) {
  background-color: rgba(255, 161, 141, 0.1);
  border-color: #FFA18D;
  color: #313131;
}
</style>