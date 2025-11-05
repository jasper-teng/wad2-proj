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
      return this.selectedSchools.length < 4
    },

    toggleSchoolSelection(school) {
      const index = this.selectedSchools.findIndex(s => s._id === school._id)

      if (index > -1) {
        this.selectedSchools.splice(index, 1)
      } else {
        if (this.selectedSchools.length < 4) {
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
      <!-- Row 1: Counter -->
      <div class="selection-counter mb-2">
        {{ selectedSchools.length }}/4 schools selected
      </div>

      <!-- Row 2: School Badges -->
      <div v-if="selectedSchools.length > 0" class="selected-schools-list mb-3">
        <span
          v-for="school in selectedSchools"
          :key="school._id"
          class="selected-school-badge"
        >
          <span class="badge-text">{{ school.school_name }}</span>
          <button
            class="badge-close-btn"
            @click="toggleSchoolSelection(school)"
            aria-label="Remove school"
          >
            ×
          </button>
        </span>
      </div>

      <!-- Row 3: Compare Button -->
      <div class="button-row">
        <button
          @click="compareSchools"
          class="btn btn-primary btn-compare"
          :disabled="selectedSchools.length < 2"
        >
          Compare Schools
        </button>
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
  user-select: none;
}

.cursor-pointer:hover {
  color: #56bdb6;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
  border-width: 0.15em;
  color: #56bdb6;
}

.rounded-table {
  border: 5px solid #FFA18D;
  border-radius: 0 30px 0 30px;
  overflow: hidden;
  box-shadow: none;
  background: #ffffff;
}

.table {
  color: #313131;
  margin-bottom: 0;
}

.table thead th {
  background-color: rgba(255, 161, 141, 0.2);
  border-bottom: 2px solid rgba(255, 161, 141, 0.3);
  font-weight: 600;
  color: #313131;
  position: sticky;
  top: 0;
  z-index: 1;
}

.table tbody tr {
  border-color: rgba(255, 161, 141, 0.2);
}

.table-striped tbody tr:nth-of-type(odd) {
  background-color: rgba(255, 161, 141, 0.05);
}

.table tbody tr:hover {
  background-color: rgba(255, 161, 141, 0.15);
}

/* Distance badges with teal/coral theme */
.distance-near {
  background-color: rgba(86, 189, 182, 0.2);
  border: 1px solid #56bdb6;
  color: #56bdb6;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  display: inline-block;
  font-weight: 500;
  font-size: 0.875rem;
}

.distance-medium {
  background-color: rgba(255, 161, 141, 0.2);
  border: 1px solid #FFA18D;
  color: #FFA18D;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  display: inline-block;
  font-weight: 500;
  font-size: 0.875rem;
}

.distance-far {
  background-color: rgba(220, 53, 69, 0.15);
  border: 1px solid #dc3545;
  color: #dc3545;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  display: inline-block;
  font-weight: 500;
  font-size: 0.875rem;
}

.cca-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: center;
}

/* CCA badges with updated styling */
.cca-badge {
  background-color: rgba(255, 161, 141, 0.1);
  color: #313131;
  padding: 0.35rem 0.65rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid rgba(255, 161, 141, 0.3);
  white-space: nowrap;
  transition: all 0.2s ease;
}

.cca-badge:hover {
  background-color: rgba(255, 161, 141, 0.2);
  border-color: #FFA18D;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(255, 161, 141, 0.3);
}

.cca-badge-highlighted {
  background-color: rgba(86, 189, 182, 0.2);
  color: #56bdb6;
  padding: 0.35rem 0.65rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: 2px solid #56bdb6;
  white-space: nowrap;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(86, 189, 182, 0.2);
}

.cca-badge-highlighted:hover {
  background-color: rgba(86, 189, 182, 0.3);
  border-color: #56bdb6;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(86, 189, 182, 0.3);
}

.expand-btn {
  color: #56bdb6;
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.expand-btn:hover {
  color: #56bdb6;
  background-color: rgba(86, 189, 182, 0.1);
  border-radius: 0.5rem;
}

.expand-btn:focus {
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(86, 189, 182, 0.25);
}

.comparison-action-bar {
  background: #ffffff;
  border: 5px solid #FFA18D;
  padding: 1rem;
  border-radius: 0 15px 0 15px;
}

.button-row {
  display: flex;
  justify-content: center;
  width: 100%;
}

.btn-compare {
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  background-color: #56bdb6;
  border-color: #56bdb6;
  color: #ffffff;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-compare:hover {
  background-color: #4aa9a3;
  border-color: #4aa9a3;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(86, 189, 182, 0.3);
}

.btn-compare:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  background-color: rgba(86, 189, 182, 0.5);
  border-color: rgba(86, 189, 182, 0.5);
}

.selection-counter {
  color: #313131;
  font-size: 0.95rem;
  font-weight: 600;
  text-align: center;
  display: block;
}

.selected-schools-list {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  width: 100%;
}

.selected-school-badge {
  background-color: rgba(86, 189, 182, 0.15);
  color: #56bdb6;
  padding: 0.35rem 0.5rem 0.35rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid #56bdb6;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  flex: 1 1 auto;
  min-width: 0;
  max-width: 100%;
}

.badge-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1 1 auto;
  min-width: 0;
  text-align: center;
}

.badge-close-btn {
  background: none;
  border: none;
  color: #56bdb6;
  font-size: 1.25rem;
  line-height: 1;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  flex-shrink: 0;
  transition: all 0.2s ease;
  font-weight: 400;
}

.badge-close-btn:hover {
  background-color: rgba(86, 189, 182, 0.3);
  color: #4aa9a3;
}

.badge-close-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(86, 189, 182, 0.4);
}

/* Mobile: Allow 2 rows with wrapping */
@media (max-width: 767px) {
  .selected-schools-list {
    flex-wrap: wrap;
  }

  .selected-school-badge {
    font-size: 0.75rem;
    padding: 0.3rem 0.4rem 0.3rem 0.55rem;
    gap: 0.3rem;
    flex: 0 1 calc(50% - 0.2rem); /* Two badges per row */
    max-width: calc(50% - 0.2rem);
  }

  .badge-close-btn {
    font-size: 1.1rem;
    width: 1.1rem;
    height: 1.1rem;
  }

  /* If odd number of badges, let last one take full width */
  .selected-school-badge:last-child:nth-child(odd) {
    flex: 1 1 100%;
    max-width: 100%;
  }
}

/* Tablet and Desktop: Single row with dynamic sizing */
@media (min-width: 768px) {
  .selected-schools-list {
    flex-wrap: nowrap;
  }

  .selected-school-badge {
    flex: 1 1 0;
    max-width: 25%; /* Maximum width for 4 schools */
  }

  /* Adjust sizing based on number of schools */
  .selected-schools-list:has(.selected-school-badge:nth-child(4)) .selected-school-badge {
    font-size: 0.7rem;
    padding: 0.28rem 0.4rem 0.28rem 0.5rem;
    gap: 0.3rem;
  }

  .selected-schools-list:has(.selected-school-badge:nth-child(4)) .badge-close-btn {
    font-size: 1.1rem;
    width: 1.1rem;
    height: 1.1rem;
  }

  .selected-schools-list:has(.selected-school-badge:nth-child(3)) .selected-school-badge {
    font-size: 0.75rem;
    padding: 0.3rem 0.45rem 0.3rem 0.6rem;
    max-width: 33.33%;
  }

  .selected-schools-list:has(.selected-school-badge:nth-child(2)):not(:has(.selected-school-badge:nth-child(3))) .selected-school-badge {
    font-size: 0.8rem;
    padding: 0.32rem 0.48rem 0.32rem 0.65rem;
    max-width: 50%;
  }

  .selected-schools-list:has(.selected-school-badge:only-child) .selected-school-badge {
    font-size: 0.85rem;
    padding: 0.35rem 0.5rem 0.35rem 0.75rem;
    max-width: 100%;
  }
}

/* Checkbox styling */
.form-check-input {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
  margin: 0;
}

.form-check-input:checked {
  background-color: #56bdb6;
  border-color: #56bdb6;
}

.form-check-input:focus {
  border-color: #56bdb6;
  box-shadow: 0 0 0 0.2rem rgba(86, 189, 182, 0.25);
}

.form-check-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-check-input:hover:not(:disabled) {
  border-color: #56bdb6;
  cursor: pointer;
}

/* Center align checkboxes in table cells */
.table tbody td:first-child {
  text-align: center;
  vertical-align: middle;
}

.table tbody td {
  vertical-align: middle;
}
</style>