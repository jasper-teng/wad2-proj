<script>
    export default{
        // 1. Define the props (the values) coming from the parent
        props:{
            // 'modelValue' is the default name for v-model
            searchQuery: String, 
            filterLevel: String,
            showSaved: Boolean
        },
        // 2. Define the events this component will send to the parent
        emits: ['update:searchQuery', 'update:filterLevel', 'update:showSaved'],

        methods: {
            clearFilters() {
                this.$emit('update:searchQuery', '');
                this.$emit('update:filterLevel', 'all');
                this.$emit('update:showSaved', false);
            }
        }
    }
</script>

<template>
    <div class="filterCardMain bg-white">
        <div class="row g-3">
            <div class="col-12 col-md-6">
                <label for="dropdownSchool" class="d-block mb-2">
                    School Level
                </label>
                <select name="dropdownSchool" id="dropdownSchool" class="filterCardSub w-100"
                    :value="filterLevel"
                    @change="$emit('update:filterLevel', $event.target.value)">
                    <option value="all">All levels</option>
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                </select>
            </div>

            <div class="col-12 col-md-6">
                <label for="searchInput" class="d-block mb-2">
                    Search By School or Programme
                </label>
                <input type="text" class="filterCardSub w-100" placeholder="e.g., 'Clementi' or 'STEM'"
                    id="searchInput"
                    :value="searchQuery"
                    @input="$emit('update:searchQuery', $event.target.value)">
            </div>
        </div>

        <div class="row mt-3">
            <div class="col-12 col-md-6 d-flex align-items-center">
                <input type="checkbox" id="save-check"
                    :checked="showSaved"
                    @change="$emit('update:showSaved', $event.target.checked)">
                <label for="save-check" class="mb-0">
                    Show Saved Schools Only
                </label>
            </div>
            <div class="col-12 col-md-6 d-flex justify-content-md-end justify-content-start mt-3 mt-md-0">
                <button @click="clearFilters" class="clearBtn">
                    Clear Filters
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>

    .filterCardSub {
        border: 2px solid #FFA18D;
        padding: 0.75rem 1rem;
        outline: none;
        border-radius: 10px;
        transition: all 0.2s;
        background-color: white;
        color: #313131;
        font-size: 0.95rem;
        cursor: pointer;
    }

    .filterCardSub:hover {
        border-color: #ff8a70;
        box-shadow: 0 2px 8px rgba(255, 161, 141, 0.15);
    }

    .filterCardSub:focus {
        border-color: #FFA18D;
        box-shadow: 0 0 0 3px rgba(255, 161, 141, 0.2);
    }

    .filterCardSub::placeholder {
        color: #9ca3af;
    }

    select.filterCardSub {
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23313131' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 0.75rem center;
        background-size: 16px;
        padding-right: 2.5rem;
    }

    .filterCardMain{
        padding: 24px;
        border: 5px solid #FFA18D;
        border-radius: 0 30px 0 30px;
        margin-bottom: 32px;
        background-color: white;
    }
    
    .clearBtn {
        padding: 0.65rem 1.5rem;
        border: 2px solid #FFA18D;
        background-color: white;
        color: #FFA18D;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 600;
        font-size: 0.9rem;
        transition: all 0.2s;
        white-space: nowrap;
    }

    .clearBtn:hover {
        background-color: #FFA18D;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(255, 161, 141, 0.35);
    }

    .clearBtn:active {
        transform: translateY(0);
        box-shadow: 0 2px 6px rgba(255, 161, 141, 0.25);
    }

    @media (max-width: 768px) {
        .filterCardMain {
            padding: 20px;
        }
    }
    
    #save-check {
        height: 1.25rem;
        width: 1.25rem;
        cursor: pointer;
        accent-color: #FFA18D;
        border: 2px solid #FFA18D;
        border-radius: 4px;
        transition: all 0.2s;
    }

    #save-check:hover {
        transform: scale(1.05);
        box-shadow: 0 0 0 3px rgba(255, 161, 141, 0.15);
    }

    #save-check:checked {
        background-color: #FFA18D;
    }

    #save-check + label {
        cursor: pointer;
        margin-left: 12px;
        font-weight: 500;
        color: #313131;
        user-select: none;
        line-height: 1.25rem;
    }

    #save-check + label:hover {
        color: #FFA18D;
    }

    label:not(#save-check + label) {
        font-weight: 500;
        color: #313131;
        font-size: 0.9rem;
    }
</style>