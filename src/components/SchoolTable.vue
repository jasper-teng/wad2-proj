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
    }
  },

  data() {
    return {
      distanceService: null,
      schoolDistances: {},
      isCalculatingDistances: false
    }
  },

  computed: {
    sortedSchools() {
      if (this.currentSortOrder === 'none') {
        return this.schools
      }

      const schoolsWithDistance = this.schools.map((school) => ({
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
      if (!this.distanceService || !this.userLocation || this.schools.length === 0) {
        return
      }

      this.isCalculatingDistances = true
      this.schoolDistances = {}

      const userOrigin = new google.maps.LatLng(this.userLocation.lat, this.userLocation.lng)
      const batchSize = 25
      const batches = []

      for (let i = 0; i < this.schools.length; i += batchSize) {
        batches.push(this.schools.slice(i, i + batchSize))
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

    <div v-if="schools.length === 0" class="text-center py-5">
      <p class="text-muted mb-0">No schools found matching your criteria.</p>
    </div>

    <div v-else class="table-responsive rounded-table">
      <table class="table table-striped mb-0">
        <thead>
          <tr>
            <th>#</th>
            <th>School Name</th>
            <th>Level</th>
            <th>CCA</th>
            <th
              class="cursor-pointer"
              @click="toggleSort"
            >
              Distance {{ getSortIcon() }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(school, index) in sortedSchools" :key="school._id">
            <td>{{ index + 1 }}</td>
            <td>{{ school.school_name }}</td>
            <td>{{ school.school_section }}</td>
            <td>{{ school.cca }}</td>
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
</style>
