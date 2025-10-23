<script>
export default {
    props: {
        allLevels: {
            type: Array,
            default: () => []
        },
        allCategories: {
            type: Array,
            default: () => []
        },
        allSpecificCCAs: {
            type: Array,
            default: () => []
        },
        selectedFilters: {
            type: Object,
            default: () => ({
                level: '',
                category: '',
                cca: ''
            })
        }
    },
    data() {
        return {
            localFilters: {
                level: '',
                category: '',
                cca: ''
            }
        }
    },
    watch: {
        selectedFilters: {
            handler(newVal) {
                this.localFilters = { ...newVal }
            },
            deep: true,
            immediate: true
        },
        'localFilters.category'(newVal, oldVal) {
            if (newVal !== oldVal) {
                this.localFilters.cca = ''
                this.emitFilterChange()
            }
        }
    },
    methods: {
        handleLevelChange() {
            this.emitFilterChange()
        },
        handleCategoryChange() {
            this.emitFilterChange()
        },
        handleCCAChange() {
            this.emitFilterChange()
        },
        emitFilterChange() {
            this.$emit('filter-change', { ...this.localFilters })
        }
    }
}
</script>

<template>
    <div class="row">
        <div class="col-md-4 mb-3">
            <label for="levelFilter" class="form-label">Education Level</label>
            <select
                class="form-select"
                id="levelFilter"
                v-model="localFilters.level"
                @change="handleLevelChange"
            >
                <option value="">All Levels</option>
                <option v-for="level in allLevels" :key="level" :value="level">
                    {{ level }}
                </option>
            </select>
        </div>
        <div class="col-md-4 mb-3">
            <label for="ccaCategoryFilter" class="form-label">CCA Category</label>
            <select
                class="form-select"
                id="ccaCategoryFilter"
                v-model="localFilters.category"
                @change="handleCategoryChange"
            >
                <option value="">All Categories</option>
                <option v-for="category in allCategories" :key="category" :value="category">
                    {{ category }}
                </option>
            </select>
        </div>
        <div class="col-md-4 mb-3">
            <label for="ccaFilter" class="form-label">Specific CCA</label>
            <select
                class="form-select"
                id="ccaFilter"
                v-model="localFilters.cca"
                @change="handleCCAChange"
            >
                <option value="">
                    {{ localFilters.category ? 'All CCAs in this category' : 'All CCAs' }}
                </option>
                <option v-for="cca in allSpecificCCAs" :key="cca" :value="cca">
                    {{ cca }}
                </option>
            </select>
        </div>
    </div>
</template>

<style scoped>
</style>
