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
            schoolsWithDistances: []
        }
    },
    computed: {
        sortIcon() {
            if (this.currentSortOrder === 'asc') {
                return '<i class="fas fa-sort-up"></i>'
            } else if (this.currentSortOrder === 'desc') {
                return '<i class="fas fa-sort-down"></i>'
            }
            return '<i class="fas fa-sort"></i>'
        },
        displayedSchools() {
            let sorted = [...this.schoolsWithDistances]

            if (this.currentSortOrder === 'asc') {
                sorted.sort((a, b) => {
                    const distA = a.calculatedDistance !== undefined ? a.calculatedDistance : Infinity
                    const distB = b.calculatedDistance !== undefined ? b.calculatedDistance : Infinity
                    return distA - distB
                })
            } else if (this.currentSortOrder === 'desc') {
                sorted.sort((a, b) => {
                    const distA = a.calculatedDistance !== undefined ? a.calculatedDistance : Infinity
                    const distB = b.calculatedDistance !== undefined ? b.calculatedDistance : Infinity
                    return distB - distA
                })
            }

            return sorted
        }
    },
    watch: {
        schools: {
            handler(newSchools) {
                this.schoolsWithDistances = newSchools.map(school => ({
                    ...school,
                    distanceText: '-',
                    distanceClass: 'distance-calculating',
                    calculatedDistance: undefined
                }))

                if (this.userLocation) {
                    this.calculateDistances()
                }
            },
            immediate: true
        },
        userLocation(newLocation) {
            if (newLocation && this.schools.length > 0) {
                this.calculateDistances()
            }
        }
    },
    methods: {
        initDistanceService() {
            if (typeof google !== 'undefined' && google.maps) {
                this.distanceService = new google.maps.DistanceMatrixService()
                console.log('Distance service initialized')
            } else {
                console.warn('Google Maps not loaded yet')
                setTimeout(() => this.initDistanceService(), 500)
            }
        },
        calculateDistances() {
            if (!this.userLocation || !this.distanceService) {
                console.log('Cannot calculate distances: missing user location or distance service')
                return
            }

            console.log(`Calculating distances for ${this.schoolsWithDistances.length} schools...`)

            // Update all to calculating state
            this.schoolsWithDistances.forEach(school => {
                school.distanceText = 'Calculating...'
                school.distanceClass = 'distance-calculating'
            })

            // Prepare destinations
            const destinations = this.schoolsWithDistances.map(school => {
                const schoolName = school.School_name || ''
                const postalCode = school.postal_code || ''
                const address = school.address || ''

                if (address && postalCode) {
                    return `${address}, Singapore ${postalCode}`
                } else if (address) {
                    return `${address}, Singapore`
                } else if (schoolName) {
                    return `${schoolName}, Singapore`
                } else {
                    return 'Singapore'
                }
            })

            // Process in batches of 25
            const batchSize = 25
            const batches = []

            for (let i = 0; i < destinations.length; i += batchSize) {
                batches.push({
                    destinations: destinations.slice(i, i + batchSize),
                    startIndex: i
                })
            }

            // Process each batch with delay
            batches.forEach((batch, batchIndex) => {
                setTimeout(() => {
                    const origin = new google.maps.LatLng(this.userLocation.lat, this.userLocation.lng)

                    this.distanceService.getDistanceMatrix(
                        {
                            origins: [origin],
                            destinations: batch.destinations,
                            travelMode: google.maps.TravelMode.DRIVING,
                            unitSystem: google.maps.UnitSystem.METRIC
                        },
                        (response, status) => {
                            if (status === 'OK') {
                                const results = response.rows[0].elements

                                results.forEach((result, index) => {
                                    const schoolIndex = batch.startIndex + index

                                    if (result.status === 'OK') {
                                        const distanceText = result.distance.text
                                        const distanceValue = result.distance.value / 1000

                                        let badgeClass = 'distance-far'
                                        if (distanceValue < 3) {
                                            badgeClass = 'distance-near'
                                        } else if (distanceValue < 7) {
                                            badgeClass = 'distance-medium'
                                        }

                                        this.schoolsWithDistances[schoolIndex].distanceText = distanceText
                                        this.schoolsWithDistances[schoolIndex].distanceClass = `distance-badge ${badgeClass}`
                                        this.schoolsWithDistances[schoolIndex].calculatedDistance = distanceValue
                                    } else {
                                        this.schoolsWithDistances[schoolIndex].distanceText = 'N/A'
                                        this.schoolsWithDistances[schoolIndex].distanceClass = 'text-muted'
                                        console.warn(`Distance calculation failed for school: ${result.status}`)
                                    }
                                })
                            } else {
                                console.error('Distance Matrix request failed:', status)
                                batch.destinations.forEach((dest, index) => {
                                    const schoolIndex = batch.startIndex + index
                                    this.schoolsWithDistances[schoolIndex].distanceText = 'Error'
                                    this.schoolsWithDistances[schoolIndex].distanceClass = 'text-danger'
                                })
                            }
                        }
                    )
                }, batchIndex * 1000)
            })
        },
        sortByDistance() {
            if (!this.userLocation) {
                alert('Please enter your address first to sort by distance.')
                return
            }

            const hasDistances = this.schoolsWithDistances.some(school => school.calculatedDistance !== undefined)
            if (!hasDistances) {
                alert('Please wait for distances to be calculated.')
                return
            }

            let newSortOrder = 'none'
            if (this.currentSortOrder === 'none') {
                newSortOrder = 'asc'
            } else if (this.currentSortOrder === 'asc') {
                newSortOrder = 'desc'
            }

            this.$emit('sort-change', newSortOrder)
        },
        getCCACategories(school) {
            const ccaCategoriesField = school.cca_generic_name || ''
            const ccaCategoriesArray = ccaCategoriesField ? ccaCategoriesField.split(',').map(cca => cca.trim()) : []
            return ccaCategoriesArray
        }
    },
    mounted() {
        this.initDistanceService()
    }
}
</script>

<template>
    <div id="resultsDiv">
        <div v-if="schools.length === 0" class="no-results">
            <h4>No schools found</h4>
            <p>Try adjusting your search criteria</p>
        </div>

        <div v-else class="table-responsive">
            <table class="table table-striped table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>School Name</th>
                        <th>Level</th>
                        <th>Specific CCA</th>
                        <th style="width: 40%;">CCA Categories</th>
                        <th class="sortable-header" @click="sortByDistance" style="cursor: pointer;">
                            Distance <span v-html="sortIcon"></span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(school, index) in displayedSchools" :key="index">
                        <td><strong>{{ school.School_name || 'N/A' }}</strong></td>
                        <td>{{ school.school_section || 'N/A' }}</td>
                        <td>{{ school.cca_grouping_desc || 'N/A' }}</td>
                        <td>
                            <span v-if="getCCACategories(school).length > 0">
                                <span
                                    v-for="cca in getCCACategories(school)"
                                    :key="cca"
                                    class="cca-tag"
                                >
                                    {{ cca }}
                                </span>
                            </span>
                            <span v-else class="text-muted">No CCAs listed</span>
                        </td>
                        <td>
                            <span :class="school.distanceClass">{{ school.distanceText }}</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
.cca-tag {
    display: inline-block;
    background-color: #e9ecef;
    padding: 0.25rem 0.5rem;
    margin-right: 0.25rem;
    margin-bottom: 0.25rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
}

.table-responsive {
    border-radius: 0.5rem;
    border: 1px solid #dee2e6;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.table th {
    background-color: #343a40;
    color: white;
    font-weight: bold;
    padding: 1rem;
}

.table th:hover {
    background-color: #495057;
}

.table td {
    vertical-align: middle;
}

.table-hover tbody tr:hover {
    background-color: rgba(0, 0, 0, 0.075);
}

.sortable-header {
    transition: background-color 0.3s ease;
}

.distance-calculating {
    color: #6c757d;
    font-style: italic;
}

.distance-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    border: 1px solid #dee2e6;
    background-color: white;
}

.distance-near {
    color: #212529;
    border-color: #dee2e6;
}

.distance-medium {
    color: #212529;
    border-color: #dee2e6;
}

.distance-far {
    color: #212529;
    border-color: #dee2e6;
}

.no-results {
    text-align: center;
    padding: 3rem;
    color: #6c757d;
}
</style>
