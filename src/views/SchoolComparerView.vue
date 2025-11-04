<template>
  <div class="school-comparer">
    <div class="container py-4">
      <!-- Header -->
      <div class="text-center mb-4">
        <h2 class="display-6 fw-bold tool-title">School Comparison Tool</h2>
        <p class="lead text-muted tool-subtitle">Compare schools side-by-side to make informed decisions</p>
      </div>

      <!-- Shared Filters -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-info text-white">
              <h5 class="mb-0">🔍 Filter Schools</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-3">
                  <label class="form-label">School Type</label>
                  <select class="form-select" v-model="sharedFilters.type" @change="applySharedFilters">
                    <option value="">All Types</option>
                    <option value="University">University</option>
                    <option value="Junior College">Junior College</option>
                    <option value="Secondary School">Secondary School</option>
                    <option value="Primary School">Primary School</option>
                    <option value="Educational Institution">Other</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Co-educational</label>
                  <select class="form-select" v-model="sharedFilters.coed" @change="applySharedFilters">
                    <option value="">All</option>
                    <option value="true">Co-ed Only</option>
                    <option value="false">Single Gender</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Region</label>
                  <select class="form-select" v-model="sharedFilters.region" @change="applySharedFilters">
                    <option value="">All Regions</option>
                    <option value="North">North</option>
                    <option value="South">South</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                    <option value="Central">Central</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Actions</label>
                  <div class="d-flex gap-2">
                    <button class="btn btn-outline-secondary btn-sm flex-fill" @click="clearSharedFilters">
                      🗑️ Clear
                    </button>
                    <button class="btn btn-outline-info btn-sm flex-fill" @click="resetSelections">
                      🔄 Reset Selection
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Filter Status -->
              <div class="mt-3">
                <div class="alert alert-light mb-0">
                  <div class="row">
                    <div class="col-md-6">
                      <strong>Filtered Results:</strong> {{ filteredSchools.length }} schools
                      <span v-if="hasActiveFilters" class="text-info">
                        (from {{ allSchools.length }} total)
                      </span>
                    </div>
                    <div class="col-md-6 text-end">
                      <span v-if="hasActiveFilters" class="badge bg-info">
                        Filters Active
                      </span>
                      <span v-else class="badge bg-secondary">
                        No Filters
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- School Selection -->
      <div class="row mb-4">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header bg-turquoise text-white">
              <h5 class="mb-0">Select First School</h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label">Search School</label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="searchQuery1"
                  placeholder="Type to search schools..."
                  @input="filterSchools1"
                />
              </div>
              
              <div class="school-list" style="max-height: 300px; overflow-y: auto;">
                <div 
                  v-for="school in filteredSchools1" 
                  :key="school.name"
                  class="school-item p-2 border rounded mb-2 cursor-pointer"
                  :class="{ 'bg-turquoise text-white': selectedSchool1?.name === school.name }"
                  @click="selectSchool1(school)"
                >
                  <div class="fw-bold">{{ school.name }}</div>
                  <small class="text-muted">{{ school.type }} • {{ school.region }}</small>
                </div>
                <div v-if="filteredSchools1.length === 0" class="text-center text-muted py-3">
                  <i class="bi bi-search"></i>
                  <div>No schools match your criteria</div>
                  <small>Try adjusting your filters or search terms</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card">
            <div class="card-header bg-orange-pastel text-white">
              <h5 class="mb-0">Select Second School</h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label">Search School</label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="searchQuery2"
                  placeholder="Type to search schools..."
                  @input="filterSchools2"
                />
              </div>
              
              <div class="school-list" style="max-height: 300px; overflow-y: auto;">
                <div 
                  v-for="school in filteredSchools2" 
                  :key="school.name"
                  class="school-item p-2 border rounded mb-2 cursor-pointer"
                  :class="{ 'bg-orange-pastel text-white': selectedSchool2?.name === school.name }"
                  @click="selectSchool2(school)"
                >
                  <div class="fw-bold">{{ school.name }}</div>
                  <small class="text-muted">{{ school.type }} • {{ school.region }}</small>
                </div>
                <div v-if="filteredSchools2.length === 0" class="text-center text-muted py-3">
                  <i class="bi bi-search"></i>
                  <div>No schools match your criteria</div>
                  <small>Try adjusting your filters or search terms</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Comparison Results -->
      <div v-if="selectedSchool1 && selectedSchool2" class="comparison-results">
        <div class="text-center mb-4">
          <button class="btn btn-outline-secondary" @click="clearSelection">
            🔄 Clear Selection
          </button>
        </div>

        <div class="row">
          <!-- School 1 Details -->
          <div class="col-md-6">
            <div class="card h-100">
              <div class="card-header bg-turquoise text-white">
                <h4 class="mb-0">{{ selectedSchool1.name }}</h4>
              </div>
              <div class="card-body">
                <div class="school-info">
                  <!-- Basic Information -->
                  <div class="info-section mb-4">
                    <h6 class="text-turquoise">📋 Basic Information</h6>
                    <div class="row">
                      <div class="col-6">
                        <strong>Type:</strong><br>
                        <span class="badge bg-secondary">{{ selectedSchool1.type }}</span>
                      </div>
                      <div class="col-6">
                        <strong>Region:</strong><br>
                        <span class="badge bg-info">{{ selectedSchool1.region }}</span>
                      </div>
                    </div>
                    <div class="mt-2">
                      <strong>Co-educational:</strong><br>
                      <span class="badge" :class="selectedSchool1.coed ? 'bg-success' : 'bg-warning'">
                        {{ selectedSchool1.coed ? 'Yes' : 'No' }}
                      </span>
                    </div>
                  </div>

                  <!-- Academic Information -->
                  <div class="info-section mb-4">
                    <h6 class="text-turquoise">🎓 Academic Information</h6>
                    <div class="row">
                      <div class="col-6">
                        <strong>Founded:</strong><br>
                        {{ selectedSchool1.founded || 'N/A' }}
                      </div>
                      <div class="col-6">
                        <strong>Student Population:</strong><br>
                        {{ selectedSchool1.students || 'N/A' }}
                      </div>
                    </div>
                    <div class="mt-2">
                      <strong>Programs Offered:</strong><br>
                      <div class="programs">
                        <span 
                          v-for="program in selectedSchool1.programs" 
                          :key="program"
                          class="badge bg-light text-dark me-1 mb-1"
                        >
                          {{ program }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Facilities -->
                  <div class="info-section mb-4">
                    <h6 class="text-turquoise">🏢 Facilities</h6>
                    <div class="facilities">
                      <span 
                        v-for="facility in selectedSchool1.facilities" 
                        :key="facility"
                        class="badge bg-light text-dark me-1 mb-1"
                      >
                        {{ facility }}
                      </span>
                    </div>
                  </div>

                  <!-- Location -->
                  <div class="info-section mb-4">
                    <h6 class="text-turquoise">📍 Location</h6>
                    <div class="location-info">
                      <div><strong>Address:</strong> {{ selectedSchool1.address || 'N/A' }}</div>
                      <div><strong>Nearest MRT:</strong> {{ selectedSchool1.mrt || 'N/A' }}</div>
                      <div><strong>Coordinates:</strong> {{ selectedSchool1.lat }}, {{ selectedSchool1.lng }}</div>
                    </div>
                  </div>

                  <!-- Contact Information -->
                  <div class="info-section">
                    <h6 class="text-turquoise">📞 Contact Information</h6>
                    <div class="contact-info">
                      <div><strong>Phone:</strong> {{ selectedSchool1.phone || 'N/A' }}</div>
                      <div><strong>Website:</strong> 
                        <a v-if="selectedSchool1.website" :href="selectedSchool1.website" target="_blank" class="text-decoration-none">
                          {{ selectedSchool1.website }}
                        </a>
                        <span v-else>N/A</span>
                      </div>
                      <div><strong>Email:</strong> {{ selectedSchool1.email || 'N/A' }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- School 2 Details -->
          <div class="col-md-6">
            <div class="card h-100">
              <div class="card-header bg-orange-pastel text-white">
                <h4 class="mb-0">{{ selectedSchool2.name }}</h4>
              </div>
              <div class="card-body">
                <div class="school-info">
                  <!-- Basic Information -->
                  <div class="info-section mb-4">
                    <h6 class="text-orange-pastel">📋 Basic Information</h6>
                    <div class="row">
                      <div class="col-6">
                        <strong>Type:</strong><br>
                        <span class="badge bg-secondary">{{ selectedSchool2.type }}</span>
                      </div>
                      <div class="col-6">
                        <strong>Region:</strong><br>
                        <span class="badge bg-info">{{ selectedSchool2.region }}</span>
                      </div>
                    </div>
                    <div class="mt-2">
                      <strong>Co-educational:</strong><br>
                      <span class="badge" :class="selectedSchool2.coed ? 'bg-success' : 'bg-warning'">
                        {{ selectedSchool2.coed ? 'Yes' : 'No' }}
                      </span>
                    </div>
                  </div>

                  <!-- Academic Information -->
                  <div class="info-section mb-4">
                    <h6 class="text-orange-pastel">🎓 Academic Information</h6>
                    <div class="row">
                      <div class="col-6">
                        <strong>Founded:</strong><br>
                        {{ selectedSchool2.founded || 'N/A' }}
                      </div>
                      <div class="col-6">
                        <strong>Student Population:</strong><br>
                        {{ selectedSchool2.students || 'N/A' }}
                      </div>
                    </div>
                    <div class="mt-2">
                      <strong>Programs Offered:</strong><br>
                      <div class="programs">
                        <span 
                          v-for="program in selectedSchool2.programs" 
                          :key="program"
                          class="badge bg-light text-dark me-1 mb-1"
                        >
                          {{ program }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Facilities -->
                  <div class="info-section mb-4">
                    <h6 class="text-orange-pastel">🏢 Facilities</h6>
                    <div class="facilities">
                      <span 
                        v-for="facility in selectedSchool2.facilities" 
                        :key="facility"
                        class="badge bg-light text-dark me-1 mb-1"
                      >
                        {{ facility }}
                      </span>
                    </div>
                  </div>

                  <!-- Location -->
                  <div class="info-section mb-4">
                    <h6 class="text-orange-pastel">📍 Location</h6>
                    <div class="location-info">
                      <div><strong>Address:</strong> {{ selectedSchool2.address || 'N/A' }}</div>
                      <div><strong>Nearest MRT:</strong> {{ selectedSchool2.mrt || 'N/A' }}</div>
                      <div><strong>Coordinates:</strong> {{ selectedSchool2.lat }}, {{ selectedSchool2.lng }}</div>
                    </div>
                  </div>

                  <!-- Contact Information -->
                  <div class="info-section">
                    <h6 class="text-orange-pastel">📞 Contact Information</h6>
                    <div class="contact-info">
                      <div><strong>Phone:</strong> {{ selectedSchool2.phone || 'N/A' }}</div>
                      <div><strong>Website:</strong> 
                        <a v-if="selectedSchool2.website" :href="selectedSchool2.website" target="_blank" class="text-decoration-none">
                          {{ selectedSchool2.website }}
                        </a>
                        <span v-else>N/A</span>
                      </div>
                      <div><strong>Email:</strong> {{ selectedSchool2.email || 'N/A' }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Comparison Summary -->
        <div class="row mt-4">
          <div class="col-12">
            <div class="card">
              <div class="card-header bg-warning text-dark">
                <h5 class="mb-0">📊 Comparison Summary</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <h6>Similarities</h6>
                    <ul class="list-unstyled">
                      <li v-for="similarity in similarities" :key="similarity" class="text-success">
                        ✅ {{ similarity }}
                      </li>
                    </ul>
                  </div>
                  <div class="col-md-6">
                    <h6>Key Differences</h6>
                    <ul class="list-unstyled">
                      <li v-for="difference in differences" :key="difference" class="text-info">
                        🔄 {{ difference }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Selection Message -->
      <div v-else class="text-center py-5">
        <div class="text-muted">
          <i class="bi bi-search" style="font-size: 3rem;"></i>
          <h4 class="mt-3">Select Two Schools to Compare</h4>
          <p>Choose schools from the search boxes above to see a detailed comparison</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import schoolCoordinates from '../data/schoolCoordinates.json'

// Reactive data
const searchQuery1 = ref('')
const searchQuery2 = ref('')
const selectedSchool1 = ref(null)
const selectedSchool2 = ref(null)
const allSchools = ref([])

// Shared filter object
const sharedFilters = ref({
  type: '',
  coed: '',
  region: ''
})

// Enhanced school data with additional information
const enhancedSchoolData = {
  "National University of Singapore (NUS)": {
    type: "University",
    region: "Central",
    coed: true,
    founded: "1905",
    students: "40,000+",
    programs: ["Engineering", "Medicine", "Business", "Arts", "Science", "Computing"],
    facilities: ["Library", "Sports Complex", "Research Labs", "Student Center", "Dormitories"],
    address: "21 Lower Kent Ridge Road, Singapore 119077",
    mrt: "Kent Ridge MRT",
    phone: "+65 6516 6666",
    website: "https://www.nus.edu.sg",
    email: "info@nus.edu.sg"
  },
  "Nanyang Technological University (NTU)": {
    type: "University",
    region: "West",
    coed: true,
    founded: "1991",
    students: "33,000+",
    programs: ["Engineering", "Business", "Science", "Arts", "Medicine"],
    facilities: ["Library", "Sports Complex", "Research Labs", "Student Center", "Dormitories"],
    address: "50 Nanyang Avenue, Singapore 639798",
    mrt: "Pioneer MRT",
    phone: "+65 6791 1744",
    website: "https://www.ntu.edu.sg",
    email: "info@ntu.edu.sg"
  },
  "Singapore Management University (SMU)": {
    type: "University",
    region: "Central",
    coed: true,
    founded: "2000",
    students: "10,000+",
    programs: ["Business", "Economics", "Law", "Computing", "Social Sciences"],
    facilities: ["Library", "Student Center", "Research Labs", "Auditorium"],
    address: "81 Victoria Street, Singapore 188065",
    mrt: "Bras Basah MRT",
    phone: "+65 6828 0100",
    website: "https://www.smu.edu.sg",
    email: "info@smu.edu.sg"
  },
  "Singapore University of Technology and Design (SUTD)": {
    type: "University",
    region: "East",
    coed: true,
    founded: "2009",
    students: "2,000+",
    programs: ["Engineering", "Design", "Architecture", "Computing"],
    facilities: ["Library", "Design Studios", "Research Labs", "Student Center"],
    address: "8 Somapah Road, Singapore 487372",
    mrt: "Upper Changi MRT",
    phone: "+65 6303 6600",
    website: "https://www.sutd.edu.sg",
    email: "info@sutd.edu.sg"
  },
  "Singapore Institute of Technology (SIT)": {
    type: "University",
    region: "North",
    coed: true,
    founded: "2009",
    students: "8,000+",
    programs: ["Engineering", "Health Sciences", "Business", "Computing"],
    facilities: ["Library", "Sports Complex", "Research Labs", "Student Center"],
    address: "10 Dover Drive, Singapore 138683",
    mrt: "Dover MRT",
    phone: "+65 6592 1189",
    website: "https://www.singaporetech.edu.sg",
    email: "info@singaporetech.edu.sg"
  },
  "Singapore University of Social Sciences (SUSS)": {
    type: "University",
    region: "Central",
    coed: true,
    founded: "2005",
    students: "15,000+",
    programs: ["Social Sciences", "Business", "Law", "Humanities"],
    facilities: ["Library", "Student Center", "Research Labs"],
    address: "463 Clementi Road, Singapore 599494",
    mrt: "Clementi MRT",
    phone: "+65 6248 9777",
    website: "https://www.suss.edu.sg",
    email: "info@suss.edu.sg"
  }
}

// Initialize school data
onMounted(() => {
  allSchools.value = Object.entries(schoolCoordinates).map(([name, coords]) => {
    const enhanced = enhancedSchoolData[name] || {}
    return {
      name,
      lat: coords.lat,
      lng: coords.lng,
      type: enhanced.type || getSchoolType(name),
      region: enhanced.region || getSchoolRegion(coords),
      coed: enhanced.coed !== undefined ? enhanced.coed : getCoedStatus(name),
      founded: enhanced.founded || 'N/A',
      students: enhanced.students || 'N/A',
      programs: enhanced.programs || getDefaultPrograms(name),
      facilities: enhanced.facilities || getDefaultFacilities(name),
      address: enhanced.address || 'N/A',
      mrt: enhanced.mrt || 'N/A',
      phone: enhanced.phone || 'N/A',
      website: enhanced.website || null,
      email: enhanced.email || 'N/A'
    }
  })
})

// Helper functions
const getSchoolType = (name) => {
  if (name.includes('UNIVERSITY') || name.includes('University')) return 'University'
  if (name.includes('JUNIOR COLLEGE') || name.includes('Junior College')) return 'Junior College'
  if (name.includes('SECONDARY') || name.includes('Secondary')) return 'Secondary School'
  if (name.includes('PRIMARY') || name.includes('Primary')) return 'Primary School'
  return 'Educational Institution'
}

const getSchoolRegion = (coords) => {
  const { lat, lng } = coords
  if (lat > 1.4) return 'North'
  if (lat < 1.3) return 'South'
  if (lng > 103.9) return 'East'
  if (lng < 103.7) return 'West'
  return 'Central'
}

const getCoedStatus = (name) => {
  const girlsSchools = ['GIRLS', 'Girls', 'CHIJ', 'Methodist Girls']
  const boysSchools = ['BOYS', 'Boys', 'St. Joseph', 'Anglo-Chinese']
  
  if (girlsSchools.some(keyword => name.includes(keyword))) return false
  if (boysSchools.some(keyword => name.includes(keyword))) return false
  return true
}


const getDefaultPrograms = (name) => {
  if (name.includes('UNIVERSITY') || name.includes('University')) {
    return ['Bachelor', 'Master', 'PhD']
  }
  if (name.includes('JUNIOR COLLEGE') || name.includes('Junior College')) {
    return ['A-Level', 'IB']
  }
  return ['General Education']
}

const getDefaultFacilities = (name) => {
  const facilities = ['Library', 'Computer Lab', 'Science Lab']
  if (name.includes('UNIVERSITY') || name.includes('University')) {
    facilities.push('Research Labs', 'Sports Complex', 'Student Center')
  }
  return facilities
}

// Helper function to apply shared filters
const applySharedFilters = (schools) => {
  let filtered = schools

  // Apply type filter
  if (sharedFilters.value.type) {
    filtered = filtered.filter(school => school.type === sharedFilters.value.type)
  }

  // Apply co-ed filter
  if (sharedFilters.value.coed !== '') {
    const isCoed = sharedFilters.value.coed === 'true'
    filtered = filtered.filter(school => school.coed === isCoed)
  }

  // Apply region filter
  if (sharedFilters.value.region) {
    filtered = filtered.filter(school => school.region === sharedFilters.value.region)
  }

  return filtered
}

// Computed properties
const filteredSchools = computed(() => {
  return applySharedFilters(allSchools.value)
})

const filteredSchools1 = computed(() => {
  let schools = applySharedFilters(allSchools.value)
  
  // Apply search query for school 1
  if (searchQuery1.value) {
    schools = schools.filter(school => 
      school.name.toLowerCase().includes(searchQuery1.value.toLowerCase())
    )
  }
  
  return schools.slice(0, 10)
})

const filteredSchools2 = computed(() => {
  let schools = applySharedFilters(allSchools.value)
  
  // Apply search query for school 2
  if (searchQuery2.value) {
    schools = schools.filter(school => 
      school.name.toLowerCase().includes(searchQuery2.value.toLowerCase())
    )
  }
  
  return schools.slice(0, 10)
})

// Check if filters are active
const hasActiveFilters = computed(() => {
  return sharedFilters.value.type || sharedFilters.value.coed !== '' || sharedFilters.value.region
})

const similarities = computed(() => {
  if (!selectedSchool1.value || !selectedSchool2.value) return []
  
  const sims = []
  if (selectedSchool1.value.type === selectedSchool2.value.type) {
    sims.push(`Both are ${selectedSchool1.value.type === 'University' ? 'Universities' : selectedSchool1.value.type + 's'}`)
  }
  if (selectedSchool1.value.region === selectedSchool2.value.region) {
    sims.push(`Both located in ${selectedSchool1.value.region} region`)
  }
  if (selectedSchool1.value.coed === selectedSchool2.value.coed) {
    sims.push(`Both are ${selectedSchool1.value.coed ? 'co-educational' : 'single-gender'} institutions`)
  }
  
  const commonPrograms = selectedSchool1.value.programs.filter(p => 
    selectedSchool2.value.programs.includes(p)
  )
  if (commonPrograms.length > 0) {
    sims.push(`Both offer: ${commonPrograms.join(', ')}`)
  }
  
  return sims
})

const differences = computed(() => {
  if (!selectedSchool1.value || !selectedSchool2.value) return []
  
  const diffs = []
  if (selectedSchool1.value.type !== selectedSchool2.value.type) {
    diffs.push(`${selectedSchool1.value.name} is a ${selectedSchool1.value.type} while ${selectedSchool2.value.name} is a ${selectedSchool2.value.type}`)
  }
  if (selectedSchool1.value.region !== selectedSchool2.value.region) {
    diffs.push(`Different regions: ${selectedSchool1.value.region} vs ${selectedSchool2.value.region}`)
  }
  if (selectedSchool1.value.coed !== selectedSchool2.value.coed) {
    diffs.push(`Gender policy differs: ${selectedSchool1.value.coed ? 'Co-ed' : 'Single-gender'} vs ${selectedSchool2.value.coed ? 'Co-ed' : 'Single-gender'}`)
  }
  
  return diffs
})

// Methods
const selectSchool1 = (school) => {
  selectedSchool1.value = school
}

const selectSchool2 = (school) => {
  selectedSchool2.value = school
}

const clearSelection = () => {
  selectedSchool1.value = null
  selectedSchool2.value = null
  searchQuery1.value = ''
  searchQuery2.value = ''
}


const clearSharedFilters = () => {
  sharedFilters.value = {
    type: '',
    coed: '',
    region: ''
  }
}

const resetSelections = () => {
  selectedSchool1.value = null
  selectedSchool2.value = null
  searchQuery1.value = ''
  searchQuery2.value = ''
}

const filterSchools1 = () => {
  // Filtering is handled by computed property
}

const filterSchools2 = () => {
  // Filtering is handled by computed property
}
</script>

<style scoped>
.school-comparer {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.tool-title {
  text-align: center;
  font-size: 2.5rem;
}

.tool-subtitle {
  text-align: center;
  font-size: 1.125rem;
}

/* Turquoise color scheme */
.bg-turquoise {
  background-color: #40E0D0 !important;
}

.text-turquoise {
  color: #40E0D0 !important;
}

/* Orange Pastel color scheme */
.bg-orange-pastel {
  background-color: #FFB366 !important;
}

.text-orange-pastel {
  color: #FFB366 !important;
}

/* School list items - always grey, pink on hover */
.school-item {
  transition: all 0.2s ease;
  cursor: pointer;
  background-color: #e9ecef !important;
  color: #333 !important;
  border: 1px solid #dee2e6;
}

.school-item:hover {
  background-color: #FDA08C !important;
  color: white !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-color: #FDA08C;
}

.school-item:hover .text-muted {
  color: rgba(255, 255, 255, 0.8) !important;
}

/* Override selected state to also be grey */
.school-item.bg-turquoise,
.school-item.bg-orange-pastel {
  background-color: #e9ecef !important;
  color: #333 !important;
}

.school-item.bg-turquoise:hover,
.school-item.bg-orange-pastel:hover {
  background-color: #FDA08C !important;
  color: white !important;
}

.cursor-pointer {
  cursor: pointer;
}

.info-section {
  border-left: 3px solid #dee2e6;
  padding-left: 15px;
}

/* Grey card headers with pink hover */
.card-header.bg-turquoise,
.card-header.bg-orange-pastel {
  background-color: #e9ecef !important;
  color: #333 !important;
  border-bottom: 2px solid #dee2e6;
}

.card:hover .card-header.bg-turquoise,
.card:hover .card-header.bg-orange-pastel {
  background-color: #FDA08C !important;
  color: white !important;
}

/* Section headings in grey, pink on card hover */
.text-turquoise,
.text-orange-pastel {
  color: #6c757d !important;
  transition: color 0.3s ease;
}

.card:hover .text-turquoise,
.card:hover .text-orange-pastel {
  color: #FDA08C !important;
}

.programs, .facilities {
  display: flex;
  flex-wrap: wrap;
}

.location-info, .contact-info {
  font-size: 0.9rem;
}

.location-info div, .contact-info div {
  margin-bottom: 5px;
}

.comparison-results {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.card {
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(253, 160, 140, 0.3);
  border-color: #FDA08C;
}
</style>
