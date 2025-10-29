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

onMounted(() => {
  loadSchoolData()
})
</script>

<template>
  <div class="cca-finder-container">
    <div class="container py-5">
      <div class="header-section mb-5">
        <h1 class="display-5 fw-bold mb-2">Singapore School CCA Finder</h1>
        <p class="text-muted">Find schools based on Co-Curricular Activities and location</p>
      </div>

      <div class="content-card mb-4">
        <h5 class="mb-4">Filters</h5>
        <SearchBar @location-change="handleLocationChange" />
        <FilterPanel
          :all-levels="allLevels"
          :all-categories="allCategories"
          :all-specific-c-c-as="allSpecificCCAsData"
          :selected-filters="selectedFilters"
          @filter-change="handleFilterChange"
        />
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
          @sort-change="handleSortChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.cca-finder-container {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.header-section {
  text-align: center;
}

.content-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.container {
  max-width: 1200px;
}
</style>
