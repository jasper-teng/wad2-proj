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
        <div class="row">
            <div class="col" style="text-align: left;">
                <label for="dropdownSchool">
                    School Level
                </label>

                <select name="dropdownSchool" id="" class="filterCardSub" style="display: block;"
                    :value="filterLevel"
                    @change="$emit('update:filterLevel', $event.target.value)">
                    <option value="all">All levels</option>
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                </select>
            </div>

            <div class="col" style="text-align: left;">
                <label for="" style="display: block;">
                    Search By School or Programme
                </label>

                <input type="text" class="filterCardSub" placeholder="e.g., 'Clementi' or 'STEM'"
                    id="searchInput"
                    :value="searchQuery"
                    @input="$emit('update:searchQuery', $event.target.value)">
            </div>
        </div>

        <div class="row">
            <div class="col filterSaved">
                <input type="checkbox"  id="save-check" style="height: 1rem; width: 1rem;"
                :checked="showSaved"
                @change="$emit('update:showSaved', $event.target.checked)"
                > 

                <label for="save-check">
                    Show Saved Schools Only
                    
                </label> 
                    <div class="col" style="text-align: right;">
                        <button @click="clearFilters" class="clearBtn">
                            Clear Filters
                        </button>
                    </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

    .filterSaved{
        display: flex;
        justify-content: end;
        align-items: center;
    }

    .filterCardSub {
        border: 1px solid #e5e7eb;
        width: 250px;
        padding: 0.8rem;
        outline: none;
        border-radius: 8px;
        transition: border-color 0.2s;
        background-color: white;
    }

    .filterCardSub:focus {
        border-color: #FFA18D;
        box-shadow: 0 0 0 3px rgba(255, 161, 141, 0.1);
    }

    .filterCardSub::placeholder {
        color: #9ca3af;
    }

    .filterCardMain{
        padding: 24px;
        border: 2px solid #FFA18D;
        border-radius: 25px;
        margin-bottom: 32px;
    }

    .filterCardMain .row:not(:last-child) {
        margin-bottom: 1.5rem;
    }
    
    .clearBtn {
        padding: 0.6rem 1.25rem;
        border: 1px solid #FFA18D;
        background-color: white;
        color: #FFA18D;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;
    }

    .clearBtn:hover {
        background-color: #FFA18D;
        color: white;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(255, 161, 141, 0.3);
    }

    .clearBtn:active {
        transform: translateY(0);
    }

    @media (max-width: 768px) {
        .filterCardSub {
            width: 100%;
        }
        
        .filterCardMain .col {
            margin-bottom: 1rem;
        }
        
        .filterSaved {
            justify-content: flex-start !important;
        }
    }
    
    #save-check {
        height: 1rem;
        width: 1rem;
        cursor: pointer;
        accent-color: #FFA18D; /* Changes checkbox color when checked */
    }

    #save-check + label {
        cursor: pointer;
        margin-left: 8px;
        font-weight: 400;
    }

    label {
        font-weight: 500;
        color: #313131;
        margin-bottom: 0.5rem;
        font-size: 0.875rem;
    }
</style>