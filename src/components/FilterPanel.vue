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
      if (this.ccaDropdownOpen) {
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
  border: 2px solid #dee2e6;
  border-radius: 8px;
  background-color: white;
  transition: all 0.3s ease;
}

.dropdown-display:hover {
  border-color: #FDA08C;
  background-color: rgba(253, 160, 140, 0.05);
}

.dropdown-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--text-subdued);
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
  color: var(--text-subdued);
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.clear-cca-btn:hover {
  background-color: var(--error);
  color: white;
}

.dropdown-menu-custom {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #f8f9fa;
  border: 2px solid #dee2e6;
  border-radius: 12px;
  margin-top: 0.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  max-height: 350px;
  display: flex;
  flex-direction: column;
}

.search-input-wrapper {
  padding: 0.75rem;
  border-bottom: 2px solid #dee2e6;
  background-color: #e9ecef;
}

.search-input {
  font-size: 0.9rem;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  background-color: white;
  transition: all 0.3s ease;
}

.search-input:hover {
  border-color: #FDA08C;
}

.search-input:focus {
  border-color: #FDA08C;
  box-shadow: 0 0 0 0.2rem rgba(253, 160, 140, 0.25);
}

.dropdown-options {
  overflow-y: auto;
  max-height: 280px;
}

.dropdown-option {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #dee2e6;
  font-family: "Inter", sans-serif;
  background-color: white;
}

.dropdown-option:hover {
  background-color: #FDA08C;
  color: white;
  padding-left: 1.25rem;
}

.dropdown-option.selected {
  background-color: #e9ecef;
  color: var(--text-primary);
  font-weight: 600;
  border-left: 4px solid #FDA08C;
}

.dropdown-option.no-results {
  color: var(--text-subdued);
  font-style: italic;
  cursor: default;
}

.dropdown-option.no-results:hover {
  background-color: white;
  padding-left: 1rem;
  color: var(--text-subdued);
}

.form-select {
  border: 2px solid #dee2e6;
  background-color: white;
  transition: all 0.3s ease;
}

.form-select:hover {
  border-color: #FDA08C;
  background-color: rgba(253, 160, 140, 0.05);
}

.form-select:focus {
  border-color: #FDA08C;
  box-shadow: 0 0 0 0.2rem rgba(253, 160, 140, 0.25);
}
</style>