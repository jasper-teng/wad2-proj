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
      },
      ccaSearchQuery: '',
      ccaDropdownOpen: false
    }
  },

  computed: {
    filteredSpecificCCAs() {
      let ccas = this.allSpecificCCAs

      if (this.localFilters.category) {
        ccas = ccas.filter((cca) => cca.category === this.localFilters.category)
      }

      if (this.ccaSearchQuery.trim()) {
        const query = this.ccaSearchQuery.toLowerCase()
        ccas = ccas.filter((cca) => cca.name.toLowerCase().includes(query))
      }

      return ccas
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

    handleCCAChange() {
      this.emitFilterChange()
    },

    emitFilterChange() {
      this.$emit('filter-change', { ...this.localFilters })
    },

    clearFilters() {
      this.localFilters = {
        level: '',
        category: '',
        cca: ''
      }
      this.ccaSearchQuery = ''
      this.emitFilterChange()
    },

    toggleCCADropdown() {
      this.ccaDropdownOpen = !this.ccaDropdownOpen
      if (this.ccaDrsopdownOpen) {
        this.$nextTick(() => {
          this.$refs.ccaSearchInput?.focus()
        })
      }
    },

    selectCCA(ccaName) {
      this.localFilters.cca = ccaName
      this.ccaSearchQuery = ''
      this.ccaDropdownOpen = false
      this.handleCCAChange()
    },

    clearCCASelection() {
      this.localFilters.cca = ''
      this.ccaSearchQuery = ''
      this.handleCCAChange()
    },

    handleClickOutside(event) {
      if (this.$refs.ccaDropdown && !this.$refs.ccaDropdown.contains(event.target)) {
        this.ccaDropdownOpen = false
      }
    }
  },

  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  }
}
</script>

<template>
  <div>
    <div class="row mb-3">
      <div class="col-12">
        <label for="ccaFilter" class="form-label fw-semibold">Specific CCA</label>
        <div class="custom-searchable-dropdown" ref="ccaDropdown">
          <div class="dropdown-input-wrapper" @click="toggleCCADropdown">
            <input
              type="text"
              class="form-control dropdown-display"
              :value="localFilters.cca || 'All CCAs'"
              readonly
              placeholder="Select a CCA"
            />
            <span class="dropdown-arrow">▼</span>
            <button
              v-if="localFilters.cca"
              type="button"
              class="clear-cca-btn"
              @click.stop="clearCCASelection"
              title="Clear selection"
            >
              ×
            </button>
          </div>

          <div v-if="ccaDropdownOpen" class="dropdown-menu-custom">
            <div class="search-input-wrapper">
              <input
                ref="ccaSearchInput"
                type="text"
                class="form-control search-input"
                v-model="ccaSearchQuery"
                placeholder="Search CCAs..."
                @click.stop
              />
            </div>

            <div class="dropdown-options">
              <div
                class="dropdown-option"
                @click="selectCCA('')"
              >
                All CCAs
              </div>
              <div
                v-for="cca in filteredSpecificCCAs"
                :key="cca.name"
                class="dropdown-option"
                :class="{ 'selected': localFilters.cca === cca.name }"
                @click="selectCCA(cca.name)"
              >
                {{ cca.name }}
              </div>
              <div v-if="filteredSpecificCCAs.length === 0 && ccaSearchQuery" class="dropdown-option no-results">
                No matching CCAs found
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row mb-3">
      <div class="col-md-6 mb-3 mb-md-0">
        <label for="categoryFilter" class="form-label fw-semibold">CCA Category</label>
        <select class="form-select" id="categoryFilter" v-model="localFilters.category">
          <option value="">All Categories</option>
          <option v-for="category in allCategories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>

      <div class="col-md-6">
        <label for="levelFilter" class="form-label fw-semibold">Education Level</label>
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
    </div>
  </div>
</template>

<style scoped>
.custom-searchable-dropdown {
  position: relative;
}

.dropdown-input-wrapper {
  position: relative;
  cursor: pointer;
}

.dropdown-display {
  cursor: pointer;
  padding-right: 60px;
}

.dropdown-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #6c757d;
  font-size: 0.75rem;
}

.clear-cca-btn {
  position: absolute;
  right: 35px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.clear-cca-btn:hover {
  background-color: #e9ecef;
  color: #495057;
}

.dropdown-menu-custom {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  margin-top: 0.25rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 350px;
  display: flex;
  flex-direction: column;
}

.search-input-wrapper {
  padding: 0.5rem;
  border-bottom: 1px solid #dee2e6;
  background-color: #f8f9fa;
}

.search-input {
  font-size: 0.9rem;
  border: 1px solid #ced4da;
}

.search-input:focus {
  border-color: #FFA18D;
  box-shadow: 0 0 0 0.2rem rgba(255, 161, 141, 0.25);
}

.dropdown-options {
  overflow-y: auto;
  max-height: 280px;
}

.dropdown-option {
  padding: 0.6rem 1rem;
  cursor: pointer;
  transition: background-color 0.15s ease;
  border-bottom: 1px solid #f1f3f5;
}

.dropdown-option:hover {
  background-color: #f8f9fa;
}

.dropdown-option.selected {
  background-color: #e7f3ff;
  color: #0066cc;
  font-weight: 500;
}

.dropdown-option.no-results {
  color: #6c757d;
  font-style: italic;
  cursor: default;
}

.dropdown-option.no-results:hover {
  background-color: white;
}
</style>