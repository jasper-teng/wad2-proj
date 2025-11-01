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
        emits: ['update:searchQuery', 'update:filterLevel', 'update:showSaved']
    }
</script>

<template>
    <div class="filterCardMain bg-white border">
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

                <label for="save-check" style="margin-left: 8px;">
                    Show Saved Schools Only
                    
                </label> 
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

    .filterCardSub{
        border: none;
        width: 250px;
        padding: 0.8rem;
        outline: none;
    }
    .filterCardMain{
        padding: 24px;
        border: lightgray;
        border-radius: 25px;
        margin-bottom: 32px;
    }
    
</style>