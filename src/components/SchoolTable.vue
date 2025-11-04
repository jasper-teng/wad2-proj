<script>
import SCHOOL_COORDINATES from '../data/schoolCoordinates.json'

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
      schoolDistances: {},
      isCalculatingDistances: false,
      expandedRows: new Set(),
      selectedSchools: []
    }
  }, 
  mounted() {
    this.calculateDistances();
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
    async calculateDistances() {
      if (!this.userLocation || this.consolidatedSchools.length === 0) {
        return
      }

      this.isCalculatingDistances = true
      this.schoolDistances = {}

      const userLat = this.userLocation.lat;
      const userLon = this.userLocation.lng;

      let schoolCoordinatesAPI = SCHOOL_COORDINATES;

      const keys = Object.keys(schoolCoordinatesAPI).reverse();

      let id = 1;
      for (const schoolName of keys) {
        schoolCoordinatesAPI[schoolName]._id = id++;
      }

      for (const [schoolName, school] of Object.entries(schoolCoordinatesAPI)) {
        const distanceCalculated = this.calculateKmFromTwoCoordinates(
          userLat,
          userLon,
          school.lat,
          school.lng
        );

        this.schoolDistances[schoolName] = {
          text: `${distanceCalculated.toFixed(2)} km`,
          value: distanceCalculated,
        };
      }

      this.isCalculatingDistances = false
      console.log('Distance calculation complete')
    },

    calculateKmFromTwoCoordinates(lat1, lon1, lat2, lon2) {
      const R = 6371000; // Earth radius in meters
      const φ1 = lat1 * Math.PI / 180;
      const φ2 = lat2 * Math.PI / 180;
      const Δφ = (lat2 - lat1) * Math.PI / 180;
      const Δλ = (lon2 - lon1) * Math.PI / 180;

      const a = Math.sin(Δφ / 2) ** 2 +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      const d = R * c; 
      return d / 1000;
    },

    getSchoolDistance(school) {
      console.log("value asssigned", this.schoolDistances[school.school_name])
      return this.schoolDistances[school.school_name]?.value || Infinity
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
      const distance = this.schoolDistances[school.school_name]
      if (!distance || distance.value === Infinity) {
        return ''
      }

      const km = distance.value

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
              <span v-if="userLocation && schoolDistances[school.school_name]" :class="getDistanceClass(school)">
                {{ schoolDistances[school.school_name].text }}
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
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
  border-width: 0.15em;
}

.rounded-table {
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 0.2rem solid #FFA18D;
  border-radius: 0.5rem;
}

.table thead th {
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
  color: #495057;
}

.distance-near {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  display: inline-block;
}

.distance-medium {
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  display: inline-block;
}

.distance-far {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  display: inline-block;
}

.cca-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: center;
}

.cca-badge {
  background-color: #e9ecef;
  color: #495057;
  padding: 0.35rem 0.65rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid #ced4da;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.cca-badge:hover {
  background-color: #dee2e6;
  border-color: #adb5bd;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.cca-badge-highlighted {
  background-color: #d1e7dd;
  color: #0f5132;
  padding: 0.35rem 0.65rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: 2px solid #198754;
  white-space: nowrap;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(25, 135, 84, 0.2);
}

.cca-badge-highlighted:hover {
  background-color: #badbcc;
  border-color: #146c43;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(25, 135, 84, 0.3);
}

.expand-btn {
  color: #6c757d;
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.expand-btn:hover {
  color: #495057;
  background-color: #f8f9fa;
  border-radius: 0.25rem;
}

.expand-btn:focus {
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.25);
}

.comparison-action-bar {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
}

.comparison-content {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.btn-compare {
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
}

.btn-compare:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.selection-counter {
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
}
</style>