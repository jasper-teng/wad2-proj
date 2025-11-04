<script>
export default {
  props: {
    schools: {
      type: Array,
      default: () => []
    },
    userLocation: {
      type: Object,
      default: null
    },
    currentSortOrder: {
      type: String,
      default: 'none'
    },
    selectedCcaFilter: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      distanceService: null,
      schoolDistances: {},
      isCalculatingDistances: false,
      expandedRows: new Set(),
      selectedSchools: []
    }
  },

  computed: {
    consolidatedSchools() {
      const schoolMap = new Map()

      this.schools.forEach(school => {
        const schoolName = school.school_name
        if (!schoolMap.has(schoolName)) {
          schoolMap.set(schoolName, {
            school_name: schoolName,
            school_section: school.school_section,
            ccas: [],
            _id: school._id
          })
        }
        schoolMap.get(schoolName).ccas.push(school.cca)
      })

      return Array.from(schoolMap.values())
    },

    sortedSchools() {
      if (this.currentSortOrder === 'none') {
        return this.consolidatedSchools
      }

      const schoolsWithDistance = this.consolidatedSchools.map((school) => ({
        ...school,
        distanceValue: this.getSchoolDistance(school)
      }))

      return schoolsWithDistance.sort((a, b) => {
        if (this.currentSortOrder === 'nearest') {
          return a.distanceValue - b.distanceValue
        } else {
          return b.distanceValue - a.distanceValue
        }
      })
    }
  },

  watch: {
    userLocation: {
      handler(newLocation) {
        if (newLocation && this.schools.length > 0) {
          this.calculateDistances()
        } else {
          this.schoolDistances = {}
        }
      },
      deep: true
    },

    schools: {
      handler(newSchools) {
        if (this.userLocation && newSchools.length > 0) {
          this.calculateDistances()
        }
      }
    }
  },

  methods: {
    initDistanceService() {
      if (typeof google !== 'undefined' && google.maps) {
        this.distanceService = new google.maps.DistanceMatrixService()
        console.log('Distance Matrix Service initialized')
      } else {
        console.warn('Google Maps not loaded yet for distance calculation')
        setTimeout(() => this.initDistanceService(), 500)
      }
    },

    async calculateDistances() {
      if (!this.distanceService || !this.userLocation || this.consolidatedSchools.length === 0) {
        return
      }

      this.isCalculatingDistances = true
      this.schoolDistances = {}

      const userOrigin = new google.maps.LatLng(this.userLocation.lat, this.userLocation.lng)
      const batchSize = 25
      const batches = []

      for (let i = 0; i < this.consolidatedSchools.length; i += batchSize) {
        batches.push(this.consolidatedSchools.slice(i, i + batchSize))
      }

      console.log(`Processing ${batches.length} batches of schools for distance calculation`)

      for (let i = 0; i < batches.length; i++) {
        await this.processBatch(batches[i], userOrigin)

        if (i < batches.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }

      this.isCalculatingDistances = false
      console.log('Distance calculation complete')
    },

    processBatch(batch, userOrigin) {
      return new Promise((resolve) => {
        const destinations = batch.map((school) => school.school_name + ', Singapore')

        this.distanceService.getDistanceMatrix(
          {
            origins: [userOrigin],
            destinations: destinations,
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC
          },
          (response, status) => {
            if (status === 'OK') {
              const results = response.rows[0].elements

              results.forEach((element, index) => {
                const schoolKey = batch[index]._id

                if (element.status === 'OK') {
                  this.schoolDistances[schoolKey] = {
                    text: element.distance.text,
                    value: element.distance.value,
                    duration: element.duration.text
                  }
                } else {
                  this.schoolDistances[schoolKey] = {
                    text: 'N/A',
                    value: Infinity,
                    duration: 'N/A'
                  }
                }
              })
            } else {
              console.error('Distance Matrix request failed:', status)
            }

            resolve()
          }
        )
      })
    },

    getSchoolDistance(school) {
      return this.schoolDistances[school._id]?.value || Infinity
    },

    toggleSort() {
      let newSortOrder = 'none'

      if (this.currentSortOrder === 'none') {
        newSortOrder = 'nearest'
      } else if (this.currentSortOrder === 'nearest') {
        newSortOrder = 'farthest'
      } else {
        newSortOrder = 'none'
      }

      this.$emit('sort-change', newSortOrder)
    },

    getSortIcon() {
      if (this.currentSortOrder === 'nearest') {
        return '↑'
      } else if (this.currentSortOrder === 'farthest') {
        return '↓'
      }
      return '↕'
    },

    getDistanceClass(school) {
      const distance = this.schoolDistances[school._id]
      if (!distance || distance.value === Infinity) {
        return ''
      }

      const km = distance.value / 1000

      if (km <= 3) {
        return 'distance-near'
      } else if (km <= 7) {
        return 'distance-medium'
      } else {
        return 'distance-far'
      }
    },

    toggleRow(schoolId) {
      if (this.expandedRows.has(schoolId)) {
        this.expandedRows.delete(schoolId)
      } else {
        this.expandedRows.add(schoolId)
      }
    },

    isRowExpanded(schoolId) {
      return this.expandedRows.has(schoolId)
    },

    getDisplayedCCAs(ccas, schoolId) {
      if (this.isRowExpanded(schoolId)) {
        return ccas
      }
      return ccas.slice(0, 3)
    },

    hasMoreCCAs(ccas) {
      return ccas.length > 3
    },

    isSchoolSelected(schoolId) {
      return this.selectedSchools.some(s => s._id === schoolId)
    },

    canSelectSchool(school) {
      if (this.isSchoolSelected(school._id)) {
        return true
      }
      const selectedFromLevel = this.selectedSchools.filter(s => s.school_section === school.school_section)
      return selectedFromLevel.length < 4
    },

    toggleSchoolSelection(school) {
      const index = this.selectedSchools.findIndex(s => s._id === school._id)

      if (index > -1) {
        this.selectedSchools.splice(index, 1)
      } else {
        const selectedFromLevel = this.selectedSchools.filter(s => s.school_section === school.school_section)
        if (selectedFromLevel.length < 4) {
          this.selectedSchools.push(school)
        }
      }
    },

    compareSchools() {
      if (this.selectedSchools.length < 2) {
        alert('Please select at least 2 schools to compare')
        return
      }

      const schoolNames = this.selectedSchools.map(s => s.school_name)
      const params = new URLSearchParams()
      schoolNames.forEach((name, index) => {
        params.set(`school${index + 1}`, name)
      })

      this.$router.push({
        path: '/comparison',
        query: Object.fromEntries(params)
      })
    },

    getCCAClass(ccaName) {
      if (this.selectedCcaFilter && this.selectedCcaFilter === ccaName) {
        return 'cca-badge-highlighted'
      }
      return 'cca-badge'
    }
  },

  mounted() {
    this.initDistanceService()
  }
}
</script>

<template>
  <div class="mb-4">
    <div v-if="isCalculatingDistances" class="text-muted mb-2">
      <span class="spinner-border spinner-border-sm me-2" role="status"></span>
      Calculating distances...
    </div>

    <div class="comparison-action-bar mb-3">
      <div class="comparison-content">
        <button
          @click="compareSchools"
          class="btn btn-primary btn-compare"
          :disabled="selectedSchools.length < 2"
        >
          Compare Schools
        </button>
        <span class="selection-counter ms-3">
          {{ selectedSchools.length }}/4 schools selected
        </span>
      </div>
    </div>

    <div v-if="schools.length === 0" class="text-center py-5">
      <p class="text-muted mb-0">No schools found matching your criteria.</p>
    </div>

    <div v-else class="table-responsive rounded-table">
      <table class="table table-striped mb-0">
        <thead>
          <tr>
            <th style="width: 60px;">Select</th>
            <th style="width: 50px;">#</th>
            <th style="width: 280px;">School Name</th>
            <th style="width: 150px;">Level</th>
            <th>CCAs</th>
            <th
              style="width: 150px;"
              class="cursor-pointer"
              @click="toggleSort"
            >
              Distance {{ getSortIcon() }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(school, index) in sortedSchools" :key="school._id">
            <td>
              <input
                type="checkbox"
                class="form-check-input"
                :checked="isSchoolSelected(school._id)"
                :disabled="!canSelectSchool(school)"
                @change="toggleSchoolSelection(school)"
              />
            </td>
            <td>{{ index + 1 }}</td>
            <td>{{ school.school_name }}</td>
            <td>{{ school.school_section }}</td>
            <td>
              <div class="cca-container">
                <span
                  v-for="(cca, ccaIndex) in getDisplayedCCAs(school.ccas, school._id)"
                  :key="ccaIndex"
                  :class="getCCAClass(cca)"
                >
                  {{ cca }}
                </span>
                <button
                  v-if="hasMoreCCAs(school.ccas)"
                  @click="toggleRow(school._id)"
                  class="btn btn-sm btn-link expand-btn"
                >
                  <span v-if="isRowExpanded(school._id)">
                    Show less ▲
                  </span>
                  <span v-else>
                    +{{ school.ccas.length - 3 }} more ▼
                  </span>
                </button>
              </div>
            </td>
            <td>
              <span v-if="userLocation && schoolDistances[school._id]" :class="getDistanceClass(school)">
                {{ schoolDistances[school._id].text }}
              </span>
              <span v-else>-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
  user-select: none;
}

.cursor-pointer:hover {
  color: var(--accent);
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
  border-width: 0.15em;
}

.rounded-table {
  border: 3px solid #dee2e6;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.rounded-table:hover {
  border-color: #FDA08C;
  box-shadow: 0 6px 20px rgba(253, 160, 140, 0.3);
}

.table thead th {
  background-color: #e9ecef;
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
  color: #333;
  font-family: "DM Sans", sans-serif;
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.5px;
  padding: 1rem 0.75rem;
  transition: all 0.3s ease;
}

.rounded-table:hover .table thead th {
  background-color: #FDA08C;
  color: white;
  border-bottom-color: #FDA08C;
}

.table tbody td {
  padding: 0.875rem 0.75rem;
  vertical-align: middle;
  background-color: white;
  transition: all 0.2s ease;
}

.table tbody tr:hover td {
  background-color: rgba(253, 160, 140, 0.1);
}

.distance-near {
  background-color: var(--success);
  border: 2px solid #9CC99C;
  color: var(--text-primary);
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  display: inline-block;
  font-weight: 600;
  font-family: "DM Sans", sans-serif;
  font-size: 0.875rem;
}

.distance-medium {
  background-color: var(--warning);
  border: 2px solid #E8D889;
  color: var(--text-primary);
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  display: inline-block;
  font-weight: 600;
  font-family: "DM Sans", sans-serif;
  font-size: 0.875rem;
}

.distance-far {
  background-color: var(--error);
  border: 2px solid #DA8E91;
  color: var(--text-primary);
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  display: inline-block;
  font-weight: 600;
  font-family: "DM Sans", sans-serif;
  font-size: 0.875rem;
}

.cca-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.cca-badge {
  background-color: rgba(253, 160, 140, 0.15);
  color: var(--text-primary);
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 2px solid rgba(253, 160, 140, 0.3);
  white-space: nowrap;
  transition: all 0.3s ease;
  font-family: "DM Sans", sans-serif;
}

.cca-badge:hover {
  background-color: #FDA08C;
  color: white;
  border-color: #FDA08C;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(253, 160, 140, 0.3);
}

.cca-badge-highlighted {
  background-color: #FDA08C;
  color: white;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  border: 2px solid #FDA08C;
  white-space: nowrap;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(253, 160, 140, 0.3);
  font-family: "DM Sans", sans-serif;
}

.cca-badge-highlighted:hover {
  background-color: #FF8C86;
  border-color: #FF8C86;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(253, 160, 140, 0.5);
}

.expand-btn {
  color: #6c757d;
  text-decoration: none;
  padding: 0.375rem 0.625rem;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.3s ease;
  font-family: "DM Sans", sans-serif;
  border-radius: 6px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
}

.expand-btn:hover {
  color: white;
  background-color: #FDA08C;
  border-color: #FDA08C;
}

.expand-btn:focus {
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(253, 160, 140, 0.25);
}

.comparison-action-bar {
  background: #f8f9fa;
  border: 2px solid #dee2e6;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.comparison-action-bar:hover {
  border-color: #FDA08C;
  box-shadow: 0 4px 12px rgba(253, 160, 140, 0.2);
}

.comparison-content {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.btn-compare {
  font-size: 0.9rem;
  padding: 0.625rem 1.5rem;
  font-family: "DM Sans", sans-serif;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-compare:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.btn-compare:not(:disabled):hover {
  transform: translateY(-2px);
}

.selection-counter {
  color: var(--text-primary);
  font-size: 0.95rem;
  font-weight: 600;
  font-family: "Poppins", sans-serif;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 2px solid #dee2e6;
}

.form-check-input {
  cursor: pointer;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #dee2e6;
  transition: all 0.3s ease;
}

.form-check-input:hover {
  border-color: #FDA08C;
}

.form-check-input:checked {
  background-color: #FDA08C;
  border-color: #FDA08C;
}

.form-check-input:focus {
  border-color: #FDA08C;
  box-shadow: 0 0 0 0.2rem rgba(253, 160, 140, 0.25);
}
</style>