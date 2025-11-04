<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import axios from 'axios';

const router = useRouter();
const route = useRoute();

// --- Constants ---
const DATA_GOV_BASE_URL = 'https://api-production.data.gov.sg/v2/public/api/datasets';
const DATASET_ID = {
  GENERAL: 'd_688b934f82c1059ed0a6993d2a829089',
  SUBJECTS: 'd_f1d144e423570c9d84dbc5102c2e664d',
  CCAS: 'd_9aba12b5527843afb0b2e8e4ed6ac6bd',
};
const MAX_COMPARISON = 4;

// --- State ---
const allSchools = ref([]); // Master list of all schools
const allSubjectsData = ref([]); // Master list of all subjects
const allCcasData = ref([]); // Master list of all CCAs

const subjectsCache = ref({}); // Cache for *filtered* subjects
const ccasCache = ref({}); // Cache for *filtered* CCAs

const isLoadingMasterList = ref(true);
const error = ref(null);

// Factory function to create a new, empty slot
const createEmptySlot = (id) => ({
  id,
  schoolName: null,
  genInfo: null,
  subjects: [],
  ccas: [],
  isLoading: false,
  schoolSearch: '',
  subjectSearch: '',
  ccaSearch: '',
  showSchoolResults: false, // For controlling the search dropdown
});

// Start with 2 comparison slots by default
const comparisonSlots = ref([
  createEmptySlot(1),
  createEmptySlot(2)
]);

// --- Layout ---
const columnClass = computed(() => {
  const count = comparisonSlots.value.length;
  switch (count) {
    case 2: return 'col-xl-6';
    case 3: return 'col-xl-4 col-md-6';
    case 4: return 'col-xl-3 col-md-6';
    default: return 'col-md-6';
  }
});

// --- Data Fetching ---

/**
 * Recursively fetches all data from a paginated data.gov.sg dataset.
 * @param {string} datasetId - The ID of the dataset to fetch.
 */
async function fetchPaginatedData(datasetId) {
  let allRecords = [];
  let limit = 15000; // dont fetch in batches, fetch all at once
  let offset = 0;
  let total = Infinity;

  try {
    while (allRecords.length < total) {
      const url = `${DATA_GOV_BASE_URL}/${datasetId}/list-rows?limit=${limit}&offset=${offset}`;
      
      const response = await axios.get(url);
      const data = response.data.data;
      console.log(data);
      allRecords = allRecords.concat(data.rows);
      // Get the total count from the first response, if it's not already set
      if (total === Infinity) {
        total = data.total;
      }
      offset += limit;

      if (!data.rows.length || data.rows.length < limit) {
        // Stop if no rows are returned or if it's the last page
        break;
      }
    }
    return allRecords;
  } catch (err) {
    console.error(`Failed to fetch paginated data for ${datasetId}:`, err);
    throw err; // Re-throw to be caught by the caller
  }
}

onMounted(async () => {
  isLoadingMasterList.value = true;
  error.value = null;
  try {
    // Fetch all three datasets in parallel
    const [schools, subjects, ccas] = await Promise.all([
      fetchPaginatedData(DATASET_ID.GENERAL),
      fetchPaginatedData(DATASET_ID.SUBJECTS),
      fetchPaginatedData(DATASET_ID.CCAS)
    ]);

    allSchools.value = schools.sort((a, b) => a.school_name.localeCompare(b.school_name));
    allSubjectsData.value = subjects;
    allCcasData.value = ccas;

    // Auto-populate from URL query params
    for (let i = 1; i <= MAX_COMPARISON; i++) {
      const schoolName = route.query[`school${i}`];
      if (schoolName && comparisonSlots.value[i - 1]) {
        const school = allSchools.value.find(s => s.school_name === schoolName);
        if (school) {
          await handleSchoolSelect(comparisonSlots.value[i - 1], school);
        }
      } else if (schoolName && i > comparisonSlots.value.length) {
        // Add slot if needed
        addComparisonSlot();
        const school = allSchools.value.find(s => s.school_name === schoolName);
        if (school) {
          await handleSchoolSelect(comparisonSlots.value[i - 1], school);
        }
      }
    }

  } catch (err) {
    error.value = 'Could not load initial school data. Please refresh the page.';
  } finally {
    isLoadingMasterList.value = false;
  }
});

async function handleSchoolSelect(slot, school) {
  if (!slot || slot.schoolName === school.school_name) return;

  slot.schoolName = school.school_name;
  slot.isLoading = true;
  slot.genInfo = school; // We already have this from the master list
  slot.subjects = [];
  slot.ccas = [];
  slot.subjectSearch = '';
  slot.ccaSearch = '';
  slot.showSchoolResults = false;
  slot.schoolSearch = '';

  let subjectsData, ccasData;

  // Check Subjects Cache
  if (subjectsCache.value[school.school_name]) {
    subjectsData = subjectsCache.value[school.school_name];
  } else {
    // Filter from the master list
    subjectsData = allSubjectsData.value
      .filter(r => r.School_Name === school.school_name)
      .map(r => r.Subject_Desc) // Keep original order for now
      // .sort(); // Removed sorting here
    subjectsCache.value[school.school_name] = subjectsData; // Save to cache
  }

  // Check CCAs Cache
  if (ccasCache.value[school.school_name]) {
    ccasData = ccasCache.value[school.school_name];
  } else {
    // Filter from the master list
    // *** UPDATED to use cca_grouping_desc ***
    ccasData = allCcasData.value
      .filter(r => r.School_name === school.school_name)
      .map(r => r.cca_grouping_desc) // Keep original order for now
       // .sort(); // Removed sorting here
    ccasCache.value[school.school_name] = ccasData; // Save to cache
  }

  slot.subjects = subjectsData;
  slot.ccas = ccasData;
  slot.isLoading = false; // All operations are synchronous now
}

// --- Slot Management ---
function addComparisonSlot() {
  if (comparisonSlots.value.length < MAX_COMPARISON) {
    comparisonSlots.value.push(createEmptySlot(Date.now()));
  }
}

function removeComparisonSlot(slotId) {
  comparisonSlots.value = comparisonSlots.value.filter(s => s.id !== slotId);
}

function clearSlot(slot) {
  const newSlot = createEmptySlot(slot.id);
  // Re-assign properties to keep reactivity
  Object.keys(newSlot).forEach(key => {
    slot[key] = newSlot[key];
  });
}

// --- Computed Data for Display ---
const allOtherSelectedSubjects = computed(() => (slotId) => {
  const otherSubjects = new Set();
  comparisonSlots.value.forEach(slot => {
    if (slot.id !== slotId && slot.subjects.length > 0) {
      slot.subjects.forEach(subject => otherSubjects.add(subject));
    }
  });
  return otherSubjects;
});

const allOtherSelectedCCAs = computed(() => (slotId) => {
  const otherCCAs = new Set();
  comparisonSlots.value.forEach(slot => {
    if (slot.id !== slotId && slot.ccas.length > 0) {
      slot.ccas.forEach(cca => otherCCAs.add(cca));
    }
  });
  return otherCCAs;
});

function getFilteredSchoolList(slot) {
  if (!slot.schoolSearch) {
    return allSchools.value.slice(0, 400); // Limit initial list for performance
  }
  return allSchools.value.filter(school =>
    school.school_name.toLowerCase().includes(slot.schoolSearch.toLowerCase())
  );
}

// *** UPDATED Computed for filtering AND sorting subjects ***
const getFilteredSubjects = (slot) => {
  const otherSubjects = allOtherSelectedSubjects.value(slot.id);
  const search = slot.subjectSearch.toLowerCase();

  return slot.subjects
    .filter(subject => subject.toLowerCase().includes(search))
    .map(subject => ({
      name: subject,
      isUnique: !otherSubjects.has(subject)
    }))
    .sort((a, b) => {
      // Sort by unique status first (true comes before false)
      if (a.isUnique !== b.isUnique) {
        return a.isUnique ? -1 : 1;
      }
      // Then sort alphabetically by name
      return a.name.localeCompare(b.name);
    });
};

// *** UPDATED Computed for filtering AND sorting CCAs ***
const getFilteredCCAs = (slot) => {
  const otherCCAs = allOtherSelectedCCAs.value(slot.id);
  const search = slot.ccaSearch.toLowerCase();

  return slot.ccas
    .filter(cca => cca.toLowerCase().includes(search))
    .map(cca => ({
      name: cca,
      isUnique: !otherCCAs.has(cca)
    }))
    .sort((a, b) => {
      // Sort by unique status first (true comes before false)
      if (a.isUnique !== b.isUnique) {
        return a.isUnique ? -1 : 1;
      }
      // Then sort alphabetically by name
      return a.name.localeCompare(b.name);
    });
};

// --- Helper Functions ---
function formatIndicator(value) {
  return value === 'Yes' ? '✅ Yes' : (value === 'No' ? '❌ No' : 'N/A');
}

function formatMotherTongue(info) {
  if (!info) return 'N/A';
  return [info.mothertongue1_code, info.mothertongue2_code, info.mothertongue3_code]
    .filter(lang => lang && lang !== 'na')
    .join(', ') || 'N/A';
}

function handleInputBlur(slot) {
  window.setTimeout(() => {
    slot.showSchoolResults = false;
  }, 200);
}

function updateURLParams() {
  const params = new URLSearchParams();

  comparisonSlots.value.forEach((slot, index) => {
    if (slot.schoolName) {
      params.set(`school${index + 1}`, slot.schoolName);
    }
  });

  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState(null, '', newUrl);
}

watch(
  () => comparisonSlots.value.map(slot => slot.schoolName),
  () => {
    updateURLParams();
  },
  { deep: true }
);
</script>

<template>
  <!-- Main container with height calculation and overflow hidden -->
  <div class="comparison-container container-fluid px-lg-5 d-flex flex-column">

    <!-- Header and Controls (fixed part) -->
    <div class="flex-shrink-0 pt-4 pb-3">
      <div class="text-center mb-4">
        <h1 class="display-6 fw-bolder mb-2">School Comparison Tool</h1>
        <p class="text-muted mb-4">Compare multiple schools side-by-side to view their subjects, CCAs, and general information</p>
      </div>
      <div class="d-flex justify-content-center mb-4">
        <button
          @click="addComparisonSlot"
          class="btn btn-primary"
          :disabled="comparisonSlots.length >= MAX_COMPARISON">
          <i class="bi bi-plus-lg"></i> Add Comparison ({{ comparisonSlots.length }}/{{ MAX_COMPARISON }})
        </button>
      </div>

      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div v-if="isLoadingMasterList" class="text-center p-5">
        <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status"></div>
        <p class="mt-2">Loading all school data. This may take a moment...</p>
      </div>
    </div>

    <!-- Comparison Grid (scrollable part) -->
    <div v-if="!isLoadingMasterList" class="row g-3 flex-grow-1 comparison-grid-scrollable">
      <div v-for="slot in comparisonSlots" :key="slot.id" :class="columnClass" class="mb-3 d-flex flex-column">
        <div class="card h-100 shadow-sm d-flex flex-column">
          <!-- Card Header: School Selector (fixed within card) -->
          <div class="card-header p-3 flex-shrink-0">
            <div class="d-flex justify-content-between align-items-center">

              <!-- Search Input Area -->
              <div class="flex-grow-1 me-2">
                <div v-if="!slot.schoolName" style="position: relative;">
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Search for a school..."
                    v-model="slot.schoolSearch"
                    @focus="slot.showSchoolResults = true"
                    @blur="handleInputBlur(slot)"
                  >
                  <div
                    class="dropdown-menu w-100 shadow-lg"
                    :class="{ 'show': slot.showSchoolResults && getFilteredSchoolList(slot).length > 0 }"
                    style="max-height: 400px; overflow-y: auto; position: absolute; z-index: 10;"
                  >
                    <ul class="list-unstyled mb-0">
                      <li v-for="school in getFilteredSchoolList(slot)" :key="school.school_name">
                        <a
                          class="dropdown-item"
                          href="#"
                          @click.prevent="handleSchoolSelect(slot, school)">
                          {{ school.school_name }}
                        </a>
                      </li>
                      <li v-if="getFilteredSchoolList(slot).length === 0" class="dropdown-item text-muted">No schools found</li>
                    </ul>
                  </div>
                </div>
                <div v-else class="d-flex align-items-center">
                  <span class="fw-bold fs-5">{{ slot.schoolName }}</span>
                </div>
              </div>

              <!-- Clear Slot Button -->
              <button v-if="slot.schoolName" @click="clearSlot(slot)" class="btn btn-sm btn-outline-secondary" title="Clear School">
                Clear
                <i class="bi bi-arrow-counterclockwise"></i>
              </button>

              <!-- Remove Column Button -->
              <button
                v-if="comparisonSlots.length > 2"
                @click="removeComparisonSlot(slot.id)"
                class="btn-close ms-2"
                title="Remove column"
              ></button>
            </div>
          </div>

          <!-- Card Body: Data (scrollable within card) -->
          <div class="card-body card-body-scrollable flex-grow-1">
            <div v-if="slot.isLoading" class="text-center p-5">
              <div class="spinner-border spinner-border-sm" role="status"></div>
            </div>
            <div v-else-if="!slot.schoolName" class="text-center text-muted p-5 d-flex flex-column justify-content-center align-items-center h-100">
              <i class="bi bi-search fs-1"></i>
              <p class="mt-2">Please select a school to compare.</p>
            </div>

            <!-- Content for selected school -->
            <div v-else>

              <!-- General Info (Collapsible) -->
              <div class="accordion accordion-flush" :id="`accordion-slot-${slot.id}`">
                <div class="accordion-item">
                  <h2 class="accordion-header">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse" :data-bs-target="`#collapse-geninfo-${slot.id}`" aria-expanded="true">
                      General Information
                    </button>
                  </h2>
                  <div :id="`collapse-geninfo-${slot.id}`" class="accordion-collapse collapse show" :data-bs-parent="`#accordion-slot-${slot.id}`">
                    <ul class="list-group list-group-flush">
                      <li class="list-group-item d-flex justify-content-between"><strong>Address:</strong> <span>{{ slot.genInfo.address }}</span></li>
                      <li class="list-group-item d-flex justify-content-between"><strong>Principal:</strong> <span>{{ slot.genInfo.principal_name }}</span></li>
                      <li class="list-group-item d-flex justify-content-between"><strong>Phone:</strong> <span>{{ slot.genInfo.telephone_no }}</span></li>
                      <li class="list-group-item d-flex justify-content-between"><strong>Email:</strong> <span>{{ slot.genInfo.email_address }}</span></li>
                      <li class="list-group-item d-flex justify-content-between"><strong>Website:</strong> <a :href="slot.genInfo.url_address" target="_blank">Link</a></li>
                      <li class="list-group-item d-flex justify-content-between"><strong>Nearest MRT:</strong> <span>{{ slot.genInfo.mrt_desc }}</span></li>
                      <li class="list-group-item d-flex justify-content-between"><strong>Buses:</strong> <span>{{ slot.genInfo.bus_desc }}</span></li>
                      <li class="list-group-item d-flex justify-content-between"><strong>Level:</strong> <span>{{ slot.genInfo.mainlevel_code }}</span></li>
                      <li class="list-group-item d-flex justify-content-between"><strong>Session:</strong> <span>{{ slot.genInfo.session_code }}</span></li>
                      <li class="list-group-item d-flex justify-content-between"><strong>Mother Tongues:</strong> <span>{{ formatMotherTongue(slot.genInfo) }}</span></li>
                      <li class="list-group-item">
                        <strong>Indicators:</strong>
                        <div class="d-flex flex-wrap gap-2 mt-1">
                          <span class="badge bg-primary-subtle text-primary-emphasis rounded-pill">SAP: {{ formatIndicator(slot.genInfo.sap_ind) }}</span>
                          <span class="badge bg-primary-subtle text-primary-emphasis rounded-pill">Gifted: {{ formatIndicator(slot.genInfo.gifted_ind) }}</span>
                          <span class="badge bg-primary-subtle text-primary-emphasis rounded-pill">IP: {{ formatIndicator(slot.genInfo.ip_ind) }}</span>
                          <span class="badge bg-primary-subtle text-primary-emphasis rounded-pill">Autonomous: {{ formatIndicator(slot.genInfo.autonomous_ind) }}</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div> <!-- End of General Info Accordion -->

              <hr>

              <!-- Subjects (Always Visible Table) -->
              <div class="px-3"> <!-- Added padding to align with accordion body -->
                <h5 class="mb-2">Subjects Offered ({{ slot.subjects.length }})</h5>
                <!-- Search bar for subjects -->
                <div class="input-group input-group-sm mb-3">
                  <span class="input-group-text"><i class="bi bi-search"></i></span>
                  <input type="text" class="form-control" placeholder="Search subjects..." v-model="slot.subjectSearch">
                </div>

                <!-- Table for subjects -->
                <div class="table-container">
                  <table class="table table-sm table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="subject in getFilteredSubjects(slot)" :key="subject.name">
                        <td>{{ subject.name }}</td>
                        <td>
                          <span v-if="subject.isUnique" class="badge bg-success-subtle text-success-emphasis rounded-pill">Unique</span>
                          <span v-else class="badge bg-secondary-subtle text-secondary-emphasis rounded-pill">Common</span>
                        </td>
                      </tr>
                      <tr v-if="getFilteredSubjects(slot).length === 0">
                        <td colspan="2" class="text-center text-muted">No subjects found.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <hr>

              <!-- CCAs (Always Visible Table) -->
              <div class="px-3"> <!-- Added padding to align with accordion body -->
                <h5 class="mb-2">CCAs Offered ({{ slot.ccas.length }})</h5>
                <!-- Search bar for CCAs -->
                <div class="input-group input-group-sm mb-3">
                  <span class="input-group-text"><i class="bi bi-search"></i></span>
                  <input type="text" class="form-control" placeholder="Search CCAs..." v-model="slot.ccaSearch">
                </div>

                <!-- Table for CCAs -->
                <div class="table-container">
                  <table class="table table-sm table-striped table-hover">
                    <thead>
                      <tr>
                        <th>CCA</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="cca in getFilteredCCAs(slot)" :key="cca.name">
                        <td>{{ cca.name }}</td>
                        <td>
                          <span v-if="cca.isUnique" class="badge bg-success-subtle text-success-emphasis rounded-pill">Unique</span>
                          <span v-else class="badge bg-secondary-subtle text-secondary-emphasis rounded-pill">Common</span>
                        </td>
                      </tr>
                      <tr v-if="getFilteredCCAs(slot).length === 0">
                        <td colspan="2" class="text-center text-muted">No CCAs found.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div> <!-- End of v-else (content wrapper) -->
          </div> <!-- End of card-body -->
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Main container styles */
.comparison-container {
  height: calc(100vh - 56px);
  overflow: hidden;
  background-color: var(--bg-light);
}

.comparison-grid-scrollable {
  overflow-y: auto;
  padding-bottom: 0 !important;
}

/* Card Styles */
.card {
  height: 100%;
  background: #f8f9fa;
  border: 3px solid #dee2e6;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  font-family: "Inter", sans-serif;
}

.card:hover {
  box-shadow: 0 6px 20px rgba(253, 160, 140, 0.3);
  border-color: #FDA08C;
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
  background: #FDA08C;
  color: white;
  border-bottom-color: #FDA08C;
}

.card-header .dropdown-menu {
  width: 100%;
  border: 2px solid var(--primary);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: "Inter", sans-serif;
}

.card-body {
  padding: 24px;
  font-family: "Inter", sans-serif;
  color: var(--text-primary);
}

/* Form Controls */
.form-control {
  border: 2px solid var(--primary);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 15px;
  font-family: "Inter", sans-serif;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: var(--secondary);
  box-shadow: 0 0 0 0.2rem rgba(167, 230, 218, 0.25);
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

.btn-secondary {
  background: #ffffff;
  border: 2px solid var(--primary);
  color: var(--text-primary);
  border-radius: 8px;
  padding: 10px 20px;
  font-family: "DM Sans", sans-serif;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: var(--primary);
  color: #fff;
  transform: translateY(-2px);
}

/* Table Styles */
.table-container {
  max-height: 200px;
  overflow-y: auto;
  border-radius: 8px;
}

.table {
  font-family: "Inter", sans-serif;
  color: var(--text-primary);
}

.table thead {
  background: #e9ecef;
  color: var(--text-primary);
  font-weight: 600;
}

.table tbody tr {
  transition: all 0.2s ease;
}

.table tbody tr:hover {
  background: #FDA08C;
  color: white;
}

.table tbody tr:hover .badge {
  color: white !important;
  background: rgba(255, 255, 255, 0.2) !important;
}

/* List Group */
.list-group-item {
  font-size: 0.9rem;
  flex-wrap: wrap;
  border: 1px solid #dee2e6;
  font-family: "Inter", sans-serif;
  color: var(--text-primary);
  background-color: #f8f9fa;
  transition: all 0.2s ease;
}

.list-group-item:hover {
  background-color: #FDA08C;
  color: white;
  border-color: #FDA08C;
}

.list-group-item > span {
  text-align: right;
  max-width: 100%;
  word-break: break-word;
  padding-left: 10px;
}

/* Accordion */
.accordion-item {
  border: 2px solid #dee2e6;
  border-radius: 8px;
  margin-bottom: 12px;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.accordion-item:hover {
  border-color: #FDA08C;
}

.accordion-button {
  background: #e9ecef;
  color: var(--text-primary);
  font-family: "Poppins", sans-serif;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.accordion-button:hover {
  background: #FDA08C;
  color: white;
}

.accordion-button:not(.collapsed) {
  background: #dee2e6;
  color: var(--text-primary);
}

.accordion-button:not(.collapsed):hover {
  background: #FDA08C;
  color: white;
}

.accordion-button:focus {
  box-shadow: 0 0 0 0.2rem rgba(253, 160, 140, 0.25);
}

/* Badges */
.badge {
  font-family: "DM Sans", sans-serif;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 8px;
}

.bg-primary {
  background: var(--primary) !important;
}

.bg-secondary {
  background: var(--secondary) !important;
}

.bg-success {
  background: var(--success) !important;
}

/* Scrollable Areas */
.card-body-scrollable {
  overflow-y: auto;
}

.d-flex.flex-column > .card-body {
  flex-grow: 1;
  overflow-y: auto;
}

/* Input Groups */
.input-group .form-control {
  border-right: none;
}

.input-group .btn {
  border-left: none;
}
</style>