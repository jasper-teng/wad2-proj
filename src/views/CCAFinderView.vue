<script>
import SearchBar from '../components/SearchBar.vue'
import FilterPanel from '../components/FilterPanel.vue'
import SchoolTable from '../components/SchoolTable.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'

export default {
    components: {
        SearchBar,
        FilterPanel,
        SchoolTable,
        LoadingSpinner
    },
    data() {
        return {
            allSchools: [],
            filteredSchools: [],
            allCCAs: new Set(),
            ccaCategoryMapping: new Map(),
            userLocation: null,
            isLoading: false,
            resultsCount: 0,
            currentSortOrder: 'none',
            selectedFilters: {
                level: '',
                category: '',
                cca: ''
            }
        }
    },
    computed: {
        allLevels() {
            const levels = new Set()
            this.allSchools.forEach(school => {
                if (school.school_section) {
                    levels.add(school.school_section)
                }
            })
            return Array.from(levels).sort()
        },
        allCategories() {
            return Array.from(this.allCCAs).sort()
        },
        allSpecificCCAs() {
            if (!this.selectedFilters.category) {
                const ccas = new Set()
                this.allSchools.forEach(school => {
                    if (school.cca_grouping_desc) {
                        ccas.add(school.cca_grouping_desc)
                    }
                })
                return Array.from(ccas).sort()
            } else {
                const specificCCAs = this.ccaCategoryMapping.get(this.selectedFilters.category) || new Set()
                return Array.from(specificCCAs).sort()
            }
        }
    },
    methods: {
        async loadSchoolData() {
            this.isLoading = true

            try {
                const response = await fetch('http://localhost/api-proxy.php')

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
                }

                const data = await response.json()
                console.log('API Response:', data)

                // Handle different API response formats
                let records = []
                if (data.success && data.result && data.result.records) {
                    records = data.result.records
                } else if (data.data && Array.isArray(data.data)) {
                    records = data.data
                } else if (Array.isArray(data)) {
                    records = data
                }

                if (records.length > 0) {
                    this.allSchools = records
                    console.log(`Loaded ${this.allSchools.length} schools`)

                    // Build CCA sets and mappings
                    this.allSchools.forEach(school => {
                        if (school.cca_generic_name) {
                            const ccas = school.cca_generic_name.split(',')
                            ccas.forEach(cca => {
                                this.allCCAs.add(cca.trim())
                            })
                        }

                        // Build mapping between CCA categories and specific CCAs
                        if (school.cca_generic_name && school.cca_grouping_desc) {
                            const categories = school.cca_generic_name.split(',').map(c => c.trim())
                            const specificCCA = school.cca_grouping_desc.trim()

                            categories.forEach(category => {
                                if (!this.ccaCategoryMapping.has(category)) {
                                    this.ccaCategoryMapping.set(category, new Set())
                                }
                                this.ccaCategoryMapping.get(category).add(specificCCA)
                            })
                        }
                    })

                    console.log(`Found ${this.allCCAs.size} unique CCAs`)
                    this.filterSchools()
                } else {
                    throw new Error('No school records found in API response')
                }
            } catch (error) {
                console.error('Error fetching school data:', error)
                alert(`Error loading school data: ${error.message}`)
            } finally {
                this.isLoading = false
            }
        },
        filterSchools() {
            let filtered = this.allSchools

            // Filter by education level
            if (this.selectedFilters.level) {
                filtered = filtered.filter(school =>
                    school.school_section === this.selectedFilters.level
                )
            }

            // Filter by CCA category
            if (this.selectedFilters.category) {
                filtered = filtered.filter(school =>
                    school.cca_generic_name &&
                    school.cca_generic_name.toLowerCase().includes(this.selectedFilters.category.toLowerCase())
                )
            }

            // Filter by specific CCA
            if (this.selectedFilters.cca) {
                filtered = filtered.filter(school =>
                    school.cca_grouping_desc === this.selectedFilters.cca
                )
            }

            this.filteredSchools = filtered
            this.resultsCount = filtered.length
        },
        handleFilterChange(filters) {
            this.selectedFilters = { ...filters }
            this.currentSortOrder = 'none'
            this.filterSchools()
        },
        handleLocationChange(location) {
            this.userLocation = location
        },
        handleSortChange(sortOrder) {
            this.currentSortOrder = sortOrder
        },
        handleClearFilters() {
            this.selectedFilters = {
                level: '',
                category: '',
                cca: ''
            }
            this.userLocation = null
            this.currentSortOrder = 'none'
            this.filterSchools()
        },
        searchSchools() {
            if (this.allSchools.length === 0) {
                this.loadSchoolData()
            } else {
                this.filterSchools()
            }
        }
    },
    mounted() {
        console.log('CCA Finder mounted, loading school data...')
        this.loadSchoolData()
    }
}
</script>

<template>
    <div class="container mt-4">
        <h1 class="text-center mb-4">Singapore School CCA Finder</h1>

        <div class="search-section">
            <SearchBar
                @location-change="handleLocationChange"
                @clear-location="userLocation = null"
            />

            <FilterPanel
                :all-levels="allLevels"
                :all-categories="allCategories"
                :all-specific-ccas="allSpecificCCAs"
                :selected-filters="selectedFilters"
                @filter-change="handleFilterChange"
            />

            <div class="row">
                <div class="col-md-12">
                    <button type="button" class="btn btn-primary" @click="searchSchools">
                        Search Schools
                    </button>
                    <button type="button" class="btn btn-secondary ms-2" @click="handleClearFilters">
                        Clear All Filters
                    </button>
                    <span class="ms-3 text-muted">
                        Showing {{ resultsCount }} result(s)
                    </span>
                </div>
            </div>
        </div>

        <LoadingSpinner v-if="isLoading" />

        <SchoolTable
            v-else
            :schools="filteredSchools"
            :user-location="userLocation"
            :current-sort-order="currentSortOrder"
            @sort-change="handleSortChange"
        />
    </div>
</template>

<style scoped>
.search-section {
    background-color: #f8f9fa;
    padding: 1.5rem;
    border-radius: 0.5rem;
    margin-bottom: 2rem;
}
</style>
