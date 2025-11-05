<script>
    import axios from 'axios'
    import accordion1 from './subcomponents/accordion.vue';
    import accordion2 from './subcomponents/accordion2.vue';
    import filterCard from './subcomponents/filterCard.vue';
    import mainCard from './subcomponents/mainCard.vue';
    import singleModal from './subcomponents/singleModal.vue';
    import alpLlpDataImport from './alp_llp_data.json';
    import schSummaryDataImport from './schSummary.json';



function fixApiDataErrors(inputText) {
    if (typeof inputText !== 'string' || !inputText) {
        return inputText;
    }

    let cleanedText = inputText;

    // This list targets the 10 errors based on the *actual* API data, not the Word doc.
    const fixes = [
        // 1. (ID 95) "Paying it Forward: WDLs..."
        [/Paying it Forward: WDL\uFFFDs Glocal Leadership Programme/g, "Paying it Forward: WDL’s Glocal Leadership Programme"],

        // 2. (ID 85) "St Hildas Secondary "
        [/St Hilda\uFFFDs Secondary/g, "St. Hilda's Secondary School"],

        // 3. (ID 83) "St Andrews Secondary"
        [/St Andrew\uFFFDs Secondary/g, "St Andrew's Secondary School"],

        // 4. (ID 76) "Create  Connect  Innovate..."
        [/Create \uFFFD Connect \uFFFD Innovate \(Emerging Technologies\)/g, "Create – Connect – Innovate (Emerging Technologies)"],

        // 5. (ID 70) "Becoming Persons for Others  Developing..."
        [/Becoming Persons for Others \uFFFD Developing Leadership through and for the Community/g, "Becoming Persons for Others – Developing Leadership through and for the Community"],

        // 6. (ID 64) "Game for Life (GfL)  Empowering..."
        // This regex captures the text inside the quotes.
        [/Game for Life \(GfL\) \uFFFD \uFFFD(Empowering our Active Sportsmen)\uFFFD/g, 'Game for Life (GfL) – “$1”'],

        // 7. (ID 58) "Made In Montfort  Design..."
        // Added .trim() to catch the trailing space in the data
        [/Made In Montfort \uFFFD Design, Code, Make/g, "Made In Montfort – Design, Code, Make"],

        // 8. (ID 52) "Its B.a.S.i.C!  Being..."
        // Fixes both the apostrophe and the dash in one go.
        [/It\uFFFDs B\.a\.S\.i\.C! \uFFFD Being a Servant Leader in the Community/g, "It’s B.a.S.i.C! – Being a Servant Leader in the Community"],

        // 9. (ID 21) "Education For Life  Developing..."
        [/Education For Life \uFFFD Developing Portable Skills through and for Real World Problem Solving/g, "Education For Life – Developing Portable Skills through and for Real World Problem Solving"],

        // 10. (ID 7) "Beattys Leaders..."
        [/Beatty\uFFFDs Leaders for Life Programme/g, "Beatty’s Leaders for Life Programme"],
        
        // 11. (ID 242) "St Andrew s Junior"
        [/St Andrew\uFFFDs Junior/g, "St Andrew's Junior"],

        // 12. (ID 182) "Learning for Life Programme... Let s Think Design!"
        [/Learning for Life Programme in Visual Art and Design - \uFFFDLet\uFFFDs Think Design!\uFFFD/g, "Learning for Life Programme in Visual Art and Design - “Let’s Think Design!”"]
    ];

    for (const [regex, replacement] of fixes) {
        cleanedText = cleanedText.replace(regex, replacement);
    }

    return cleanedText;
}

    export default{
        components: {accordion1,filterCard,mainCard,accordion2,singleModal},
        data(){
            return {
                schools: [],
                url: "https://data.gov.sg/api/action/datastore_search?resource_id=d_db1faeea02c646fa3abccfa5aba99214&limit=300",
                isModalOpen: false,
                selectedSchool:null,
                compareList: [],
                isCompareModalOpen: false,
                suggestionPool: new Set(),

                // --- NEW: State for Filtering & Pagination ---
                searchQuery: '',       // You can connect this to your filterCard
                filterLevel: 'all',    // You can connect this to your filterCard
                currentPage: 1,
                itemsPerPage: 9, // 9 items = 3 rows on your 3-column grid
                // --- ADDED: showSaved state ---
                showSaved: false,
                // --- NEW: Added loading and error states ---
                isLoading: true,
                error: null,

                summaryData: [],
                alp_llp_data:[],
            }
        },

        computed: {
            /**
             * First, filter the list based on search.
             * (You can add your level/programme filters here too)
             */
            filteredSchools() {
                const query = this.searchQuery.toLowerCase().trim();
                
                // Start with the full list
                let filtered = this.schools;

                // 1. Apply Search Query Filter
                if (query) {
                    filtered = filtered.filter(school => {
                        return (
                            (school.name && school.name.toLowerCase().includes(query)) ||
                            (school.alp_domain && school.alp_domain.toLowerCase().includes(query)) ||
                            (school.alp_title && school.alp_title.toLowerCase().includes(query)) ||
                            (school.llp_domain && school.llp_domain.toLowerCase().includes(query)) ||
                            (school.llp_title && school.llp_title.toLowerCase().includes(query))
                        );
                    });
                }
                
                // 2. Apply School Level Filter
                if (this.filterLevel !== 'all') {
                    filtered = filtered.filter(school => {
                        // IDs <= 102 are secondary, IDs >= 103 are primary
                        return (this.filterLevel === 'secondary' && school.id <= 102) ||
                            (this.filterLevel === 'primary' && school.id >= 103);
                    });
                }

                

                // 3. Apply "Show Saved" Filter
                if (this.showSaved) {
                    filtered = filtered.filter(school => school.isSaved); // Assumes you've added 'isSaved' to your school object
                }

                return filtered;
            },

            totalPages() {
                return Math.ceil(this.filteredSchools.length / this.itemsPerPage);
            },

            /**
             * Get just the schools for the current page
             */
            paginatedSchools() {
                const start = (this.currentPage - 1) * this.itemsPerPage;
                const end = start + this.itemsPerPage;
                return this.filteredSchools.slice(start, end);
            },

            /**
             * Helper for "Showing 1-9 of 300" text
             */
            totalResults() {
                return this.filteredSchools.length;
            },
            startResult() {
                // Prevent showing "1" when there are 0 results
                if (this.totalResults === 0) return 0;
                return (this.currentPage - 1) * this.itemsPerPage + 1;
            },
            endResult() {
                const end = this.currentPage * this.itemsPerPage;
                return Math.min(end, this.totalResults);
            },

            visiblePages() {
                const pages = [];
                const current = this.currentPage;
                const total = this.totalPages;
                
                // Show current page and one page on each side
                for (let i = Math.max(1, current - 1); i <= Math.min(total, current + 1); i++) {
                    pages.push(i);
                }
                
                return pages;
            }
        },

        // --- NEW: Watcher to reset page on filter change ---
        watch: {
            // When any of these filters change, go back to page 1
            searchQuery() {
                this.currentPage = 1;
            },
            filterLevel() {
                this.currentPage = 1;
            },
            showSaved() {
                this.currentPage = 1;
            }
        },

        methods: {
            getAlpLlpData(){
                try{
                    // Use imported JSON data directly instead of fetching
                    this.alp_llp_data = alpLlpDataImport
                } catch (err){
                    console.error("Failed to get data:",err)
                    this.alp_llp_data = [];
                }
            },

            getSummaries() {
                try {
                    // Use imported JSON data directly instead of fetching
                    this.summaryData = schSummaryDataImport;
                } catch (err) {
                    console.error("Failed to get summaries:", err);
                    // Keep it as an array to prevent future .find() errors
                    this.summaryData = [];
                }
            },

            async getSchools(){
                this.isLoading = true
                this.error = null
                try {
                    let response = await axios.get(this.url)
                    let result = response.data.result.records
                    
                    for (const data of result){
                        let school = {}
                        school.id = data._id
                        // Trim to remove any leading/trailing spaces
                        school.name = fixApiDataErrors(data.school_name).trim()
                        school.alp_domain = fixApiDataErrors(data.alp_domain)
                        school.alp_title = fixApiDataErrors(data.alp_title)
                        school.llp_domain = fixApiDataErrors(data.llp_domain1)
                        school.llp_title = fixApiDataErrors(data.llp_title)
                        school.isSaved = false
                        this.schools.push(school)
                    }
                
                    console.log(this.schools)

                } catch(err){
                    console.log("Failed to get schools:", err)
                    this.error  = "Could not load school data. Please try again later.";
                } finally{
                    this.isLoading = false;
                }
            },
            saveCard(sch){
                if (sch.isSaved){
                    sch.isSaved = false
                }

                else{
                    sch.isSaved = true
                }
            },

            openModal(sch){
                this.selectedSchool = sch
                this.isModalOpen = true
            },

            closeModal() {
                this.isModalOpen = false;    
                this.selectedSchool = null;  
            },

            handleCompareAdd(school) {
                console.log('Compare add:', school.name);
                
                // Don't add if list is full or school is already in
                if (this.compareList.length >= 2 || this.compareList.find(s => s.id === school.id)) {
                    console.log('Compare list full or school already added.');
                    return;
                }
                
                this.compareList.push(school);
                
                // Update isCompareDisabled for all schools
                this.updateCompareDisabledState();
            },


            // --- UPDATED: handleShareClick with navigator.share ---
            handleShareClick(school) {
                console.log('Share:', school.name);
                const baseUrl = window.location.origin + window.location.pathname;
                const shareUrl = `${baseUrl}?school_name=${encodeURIComponent(school.name)}`;
                
                const shareData = {
                    title: `Check out ${school.name}`,
                    text: `Look at the distinctive programmes at ${school.name}:`,
                    url: shareUrl
                };

                // Check if Web Share API is available
                if (navigator.share) {
                    navigator.share(shareData)
                        .then(() => console.log('Successful share'))
                        .catch((error) => console.log('Error sharing:', error));
                } else {
                    // Fallback for desktop: copy to clipboard
                    console.log('Web Share not supported, falling back to clipboard.');
                    navigator.clipboard.writeText(shareUrl).then(() => {
                        alert('Link copied to clipboard!'); // Using alert for simplicity
                    }).catch(err => {
                        console.error('Failed to copy text: ', err);
                    });
                }
            },

            // --- NEW: Helper method to update disabled state ---
            updateCompareDisabledState() {
                const isFull = this.compareList.length >= 2;
                this.schools = this.schools.map(s => {
                    const isInList = this.compareList.find(item => item.id === s.id);
                    s.isCompareDisabled = isFull || !!isInList;
                    return s;
                });
            },

            // --- NEW: Add to compare from modal button ---
            addCompareAndClose() {
                if (this.selectedSchool) {
                    this.handleCompareAdd(this.selectedSchool);
                }
                this.closeModal();
            },

            openCompareModal(){
                if (this.compareList.length===2){
                    this.isCompareModalOpen = true
                }
                console.log(this.compareList)
            },

            closeCompareModal(){
                this.isCompareModalOpen = false
            },

            clearCompareList(){
                this.compareList=[];
                this.updateCompareDisabledState();
            },

            removeSchoolFromCompare(schoolId) {
                // filter() creates a new array *without* the matching item
                this.compareList = this.compareList.filter(s => s.id !== schoolId);
                this.updateCompareDisabledState();
            },

            // --- ADDED: Pagination Methods ---
            nextPage() {
                if (this.currentPage < this.totalPages) {
                    this.currentPage++;
                }
            },
            prevPage() {
                if (this.currentPage > 1) {
                    this.currentPage--;
                }
            },
            goToPage(page) {
                if (page >= 1 && page <= this.totalPages) {
                    this.currentPage = page;
                    // Scroll to top of results
                    this.scrollToCards();
                }
            },
            
            nextPage() {
                if (this.currentPage < this.totalPages) {
                    this.currentPage++;
                    this.scrollToCards();
                }
            },
            
            prevPage() {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.scrollToCards();
                }
            },

                scrollToCards() {
                this.$nextTick(() => {
                    if (this.$refs.schoolCardsGrid) {
                        const element = this.$refs.schoolCardsGrid;
                        const offset = 100; // Adjust this value to leave some space above the cards
                        const elementPosition = element.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - offset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }
                });
            },

            getSchoolSummary(schoolId) {
                if (!Array.isArray(this.summaryData)) {
                    return '(Summaries are still loading...)';
                }

                // --- FIX HERE: Use item._id instead of item.id ---
                // Using == handles string vs number differences
                const summaryEntry = this.summaryData.find(item => item._id == schoolId); 
                
                // --- FIX HERE: Use item.Summary (capital S) ---
                return summaryEntry ? summaryEntry.Summary : '(No summary available for this school yet.)';
            },

            getSchoolAlp(schoolId){
                if (!Array.isArray(this.alp_llp_data)){
                    return '(Data are still loading)'
                }

                const alp_entry = this.alp_llp_data.find(item =>item.sch_id == schoolId)
                return alp_entry ? alp_entry.alp_description : '(No description available for this school yet)'
            },

            getSchoolLlp(schoolId){
                if (!Array.isArray(this.alp_llp_data)){
                    return '(Data are still loading)'
                }

                const llp_entry = this.alp_llp_data.find(item =>item.sch_id == schoolId)
                return llp_entry ? llp_entry.llp_description : '(No description available for this school yet)'
            },

            handleCompareAdd(school) {
                console.log('Compare add:', school.name);
                
                if (this.compareList.length >= 2 || this.compareList.find(s => s.id === school.id)) {
                    console.log('Compare list full or school already added.');
                    return;
                }
                
                this.compareList.push(school);
                this.updateCompareDisabledState();
                
                // Update URL with compare parameters
                this.updateCompareUrl();
            },
            
            removeSchoolFromCompare(schoolId) {
                this.compareList = this.compareList.filter(s => s.id !== schoolId);
                this.updateCompareDisabledState();
                
                // Update URL when removing schools
                this.updateCompareUrl();
            },
            
            clearCompareList() {
                this.compareList = [];
                this.updateCompareDisabledState();
                
                // Clear URL parameters
                this.updateCompareUrl();
            },
            
            // New method to update URL
            updateCompareUrl() {
                const url = new URL(window.location);
                
                // Clear old parameters first
                url.searchParams.delete('school1');
                url.searchParams.delete('school2');
                
                if (this.compareList.length > 0) {
                    url.searchParams.set('school1', this.compareList[0].name);
                    if (this.compareList.length === 2) {
                        url.searchParams.set('school2', this.compareList[1].name);
                    }
                }
                
                console.log('Updated URL:', url.toString()); // Debug
                window.history.pushState({}, '', url);
            },
            
            // New method to load compare list from URL
            loadCompareFromUrl() {
                const urlParams = new URLSearchParams(window.location.search);
                
                const school1Param = urlParams.get('school1');
                const school2Param = urlParams.get('school2');
                
                console.log('URL Param school1:', school1Param);
                console.log('URL Param school2:', school2Param);
                
                if (this.schools.length === 0) return;
                
                // Handle school1/school2 format
                if (school1Param || school2Param) {
                    const schoolNames = [school1Param, school2Param].filter(name => name);
                    
                    schoolNames.forEach(name => {
                        // Trim both the URL param and compare with trimmed school names
                        const decodedName = decodeURIComponent(name).trim();
                        console.log('Looking for school:', `"${decodedName}"`);
                        
                        // Try exact match (case-insensitive)
                        const school = this.schools.find(s => 
                            s.name.toLowerCase() === decodedName.toLowerCase()
                        );
                        
                        if (school && this.compareList.length < 2) {
                            this.compareList.push(school);
                            console.log('Successfully added:', school.name);
                        } else if (!school) {
                            console.log('Could not find school matching:', decodedName);
                            // Log similar names to help debug
                            const similar = this.schools.filter(s => 
                                s.name.toLowerCase().includes(decodedName.toLowerCase())
                            );
                            console.log('Similar schools found:', similar.map(s => `"${s.name}"`));
                        }
                    });
                }
                
                this.updateCompareDisabledState();
                
                console.log('Compare list length:', this.compareList.length);
                console.log('Compare list schools:', this.compareList.map(s => s.name));
                
                if (this.compareList.length === 2) {
                    this.$nextTick(() => {
                        this.isCompareModalOpen = true;
                        console.log('Modal should be open now');
                    });
                } else {
                    console.log('Only found', this.compareList.length, 'school(s)');
                }
            },

            shareCompareLink() {
                const url = new URL(window.location.origin + window.location.pathname);
                
                if (this.compareList.length === 2) {
                    // Properly encode school names
                    url.searchParams.set('school1', this.compareList[0].name);
                    url.searchParams.set('school2', this.compareList[1].name);
                }
                
                const shareUrl = url.toString();
                console.log('Share URL:', shareUrl); // Debug
                
                const shareData = {
                    title: `Compare ${this.compareList[0].name} vs ${this.compareList[1].name}`,
                    text: `Check out this school comparison:`,
                    url: shareUrl
                };

                if (navigator.share) {
                    navigator.share(shareData)
                        .then(() => console.log('Successful share'))
                        .catch((error) => console.log('Error sharing:', error));
                } else {
                    navigator.clipboard.writeText(shareUrl).then(() => {
                        alert('Comparison link copied to clipboard!');
                    }).catch(err => {
                        console.error('Failed to copy text: ', err);
                    });
                }
            },
            loadSchoolFromUrl() {
                const urlParams = new URLSearchParams(window.location.search);
                const schoolNameParam = urlParams.get('school_name');
                
                if (schoolNameParam && this.schools.length > 0) {
                    const decodedName = decodeURIComponent(schoolNameParam).trim();
                    console.log('Looking for school from URL:', decodedName);
                    
                    const school = this.schools.find(s => 
                        s.name.toLowerCase() === decodedName.toLowerCase()
                    );
                    
                    if (school) {
                        console.log('Found school, opening modal:', school.name);
                        this.$nextTick(() => {
                            this.openModal(school);
                        });
                    } else {
                        console.log('School not found:', decodedName);
                    }
                }
            }
        },


        async mounted() {
            // Load JSON data synchronously (no need to await)
            this.getSummaries();
            this.getAlpLlpData();

            // Wait for schools to load from API
            await this.getSchools();

            // Load compare list and single school from URL AFTER all data is ready
            this.loadCompareFromUrl();
            this.loadSchoolFromUrl();
        }
        
    }
</script>

<template>
    <div class="page-content">
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading school data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger text-center">
        <h5>{{ error }}</h5>
        <button class="btn btn-primary mt-2" @click="getSchools">Retry</button>
    </div>

    <!-- No Results -->
    <div v-else-if="totalResults === 0" class="text-center py-5">
        <p class="text-muted">No schools match your filters.</p>
    </div>

    <div class="container my-4 my-md-5">
        <h1 style="font-size: 2.25rem;">Distinctive Programmes</h1>
        <p style="font-size: 1.125rem; color: #6b7280;">Find programmes in Primary and Secondary Schools</p>
        <div class="row">
            <accordion1></accordion1>
        </div>

        <div class="row">
            <accordion2></accordion2>
        </div>

        <filterCard
            v-model:filterLevel="filterLevel"
            v-model:showSaved="showSaved"
            v-model:searchQuery="searchQuery"
        ></filterCard>

        <div class="cards-grid" ref="schoolCardsGrid">
            <mainCard v-for="school in paginatedSchools" 
                v-bind:mainCard="school" 
                :isSaved="school.isSaved" 
                :isCompareDisabled="school.isCompareDisabled" 
                v-bind:key="school.id" 
                @save-toggle="saveCard(school)"
                @card-click="openModal(school)" 
                @share-link="handleShareClick(school)"
                @compare-add="handleCompareAdd(school)">
            
                <template #slotMainCard1>
                    <span 
                        v-if="school.alp_domain" 
                        class="badge bg-primary-subtle text-primary-emphasis rounded-pill me-2" 
                    >
                        ALP
                    </span>
                </template>

                <template #slotMainCard2>
                    <span 
                        v-if="school.llp_domain"
                        class="badge bg-success-subtle text-success-emphasis rounded-pill me-2"
                    >
                        LLP
                    </span>
                </template>
            </mainCard>
        </div>
        <div v-if="isModalOpen">
            
            <singleModal v-bind:single-modal="selectedSchool" @close-modal="closeModal">

                <template #slotSingleModal1>
                    <p class="modal-text">{{ getSchoolAlp(selectedSchool.id) }}</p>
                </template>

                <template #slotSingleModal2>
                    <p class="modal-text">{{ getSchoolLlp(selectedSchool.id)}}</p>
                </template>

                <template #slotSingleModal3>
                    <p class="modal-text">{{ getSchoolSummary(selectedSchool.id) }}</p>
                </template>

                <template #slotSingleModal4>
                    <button 
                        type="button" 
                        class="btn btn-primary" 
                        @click="addCompareAndClose"
                        :disabled="selectedSchool && selectedSchool.isCompareDisabled"
                    >
                        {{ selectedSchool && selectedSchool.isCompareDisabled ? 'Compare List Full' : 'Add to Compare' }}
                    </button>
                </template>
            </singleModal>
        </div>

                <!-- 
          --- NEW: Compare Bar ---
          Shows at the bottom when compareList has items
        -->
        <div v-if="compareList.length > 0" class="fixed-bottom bg-white border-top shadow-lg p-3">
            <div class="container">
                <div class="row align-items-end">
                    <!-- Title -->
                    <div class="col-12 col-md-auto">
                        <h5 class="fw-semibold mb-2">Compare Schools ({{ compareList.length }}/2)</h5>
                    </div>
                    <!-- Slots -->
                    <div class="col-12 col-md">
                        <div class="row g-2">
                            <!-- Slot 1 -->
                            <div class="col-6">
                                <div v-if="compareList[0]" class="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                                    <span class="text-truncate small me-2">{{ compareList[0].name }}</span>
                                    <button class="btn-close small" style="font-size: 0.65rem;" @click="removeSchoolFromCompare(compareList[0].id)"></button>
                                </div>
                                <div v-else class="p-2 bg-light rounded text-muted small fst-italic">
                                    Select a school...
                                </div>
                            </div>
                            <!-- Slot 2 -->
                            <div class="col-6">
                                <div v-if="compareList[1]" class="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                                    <span class="text-truncate small me-2">{{ compareList[1].name }}</span>
                                    <button class="btn-close small" style="font-size: 0.65rem;" @click="removeSchoolFromCompare(compareList[1].id)"></button>
                                </div>
                                <div v-else class="p-2 bg-light rounded text-muted small fst-italic">
                                    Select a school...
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Buttons -->
                    <div class="col-12 col-md-auto d-flex gap-2 mt-3 mt-md-0">
                        <button class="btn btn-primary" :disabled="compareList.length !== 2" @click="openCompareModal">Compare</button>
                        <button class="btn btn-outline-secondary" @click="clearCompareList">Clear</button>
                    </div>
                </div>
            </div>
        </div>

                <!-- 
          --- NEW: Compare Modal ("Compare Table") ---
        -->
        <div v-if="isCompareModalOpen">
            <!-- Modal Container -->
            <div class="modal fade show" style="display: block;" tabindex="-1">
                <!-- MODAL-LG makes it wider -->
                <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Comparing Schools</h5>
                            <button type="button" class="btn-close" @click="closeCompareModal"></button>
                        </div>
                        <div class="modal-body" v-if="compareList.length === 2">
                            <!-- School Names Header -->
                            <div class="row mb-3">
                                <div class="col-6">
                                    <h5 class="fw-bold border-bottom pb-2">{{ compareList[0].name }}</h5>
                                </div>
                                <div class="col-6 border-start">
                                    <h5 class="fw-bold border-bottom pb-2">{{ compareList[1].name }}</h5>
                                </div>
                            </div>

                            <!-- ALP Section (Side by Side) -->
                            <div class="row mb-4">
                                <div class="col-6">
                                    <div v-if="compareList[0].alp_domain">
                                        <span class="badge bg-primary-subtle text-primary-emphasis rounded-pill me-2">ALP</span>
                                        <h4 class="modal-subtitle">{{ compareList[0].alp_domain }}</h4>
                                        <p class="modal-text">{{ compareList[0].alp_title }}</p>
                                        <p class="modal-text">{{ getSchoolAlp(compareList[0].id) }}</p>
                                    </div>
                                    <div v-else>
                                        <p class="modal-text fst-italic">No ALP information available.</p>
                                    </div>
                                </div>
                                <div class="col-6 border-start">
                                    <div v-if="compareList[1].alp_domain">
                                        <span class="badge bg-primary-subtle text-primary-emphasis rounded-pill me-2">ALP</span>
                                        <h4 class="modal-subtitle">{{ compareList[1].alp_domain }}</h4>
                                        <p class="modal-text">{{ compareList[1].alp_title }}</p>
                                        <p class="modal-text">{{ getSchoolAlp(compareList[1].id) }}</p>
                                    </div>
                                    <div v-else>
                                        <p class="modal-text fst-italic">No ALP information available.</p>
                                    </div>
                                </div>
                            </div>

                            <!-- LLP Section (Side by Side) -->
                            <div class="row mb-4">
                                <div class="col-6">
                                    <div v-if="compareList[0].llp_domain">
                                        <span class="badge bg-success-subtle text-success-emphasis rounded-pill me-2">LLP</span>
                                        <h4 class="modal-subtitle">{{ compareList[0].llp_domain }}</h4>
                                        <p class="modal-text">{{ compareList[0].llp_title }}</p>
                                        <p class="modal-text">{{ getSchoolLlp(compareList[0].id) }}</p>
                                    </div>
                                    <div v-else>
                                        <p class="modal-text fst-italic">No LLP information available.</p>
                                    </div>
                                </div>
                                <div class="col-6 border-start">
                                    <div v-if="compareList[1].llp_domain">
                                        <span class="badge bg-success-subtle text-success-emphasis rounded-pill me-2">LLP</span>
                                        <h4 class="modal-subtitle">{{ compareList[1].llp_domain }}</h4>
                                        <p class="modal-text">{{ compareList[1].llp_title }}</p>
                                        <p class="modal-text">{{ getSchoolLlp(compareList[1].id) }}</p>
                                    </div>
                                    <div v-else>
                                        <p class="modal-text fst-italic">No LLP information available.</p>
                                    </div>
                                </div>
                            </div>

                            <hr>

                            <!-- About Section (Side by Side) -->
                            <div class="row">
                                <div class="col-6">
                                    <h5 class="aboutSchool mb-3">About the School</h5>
                                    <p class="modal-text">{{ getSchoolSummary(compareList[0].id) }}</p>
                                </div>
                                <div class="col-6 border-start">
                                    <h5 class="aboutSchool mb-3">About the School</h5>
                                    <p class="modal-text">{{ getSchoolSummary(compareList[1].id) }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-outline-primary" @click="shareCompareLink">
                                Share Comparison
                            </button>
                            <button class="btn btn-secondary" @click="closeCompareModal">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-backdrop fade show"></div>

        </div>

        <!-- --- ADDED: Pagination Controls --- -->
        <div v-if="totalResults > 0" class="row mt-5">
            <div class="col-12 d-flex flex-column flex-md-row justify-content-between align-items-center">
                
                <!-- Page Info -->
                <p class="text-muted small mb-3 mb-md-0">
                    Showing <strong>{{ startResult }}</strong> to <strong>{{ endResult }}</strong> of <strong>{{ totalResults }}</strong> results
                </p>

                <!-- Buttons -->
                <nav>
                    <ul class="pagination mb-3">
                        <li class="page-item" :class="{ 'disabled': currentPage === 1 }">
                            <button class="page-link" @click="prevPage">Previous</button>
                        </li>
                        <li class="page-item active" aria-current="page">
                            <span class="page-link">{{ currentPage }} / {{ totalPages }}</span>
                        </li>
                        <li class="page-item" :class="{ 'disabled': currentPage === totalPages }">
                            <button class="page-link" @click="nextPage">Next</button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
        <!-- --- END: Pagination Controls --- -->

    </div>
</div>
</template>

<style scoped>

    .modal-subtitle{
        font-size: 16px;
        font-weight: 600;
        color: #313131;
        margin-top: 0.25rem;
    }

    .modal-text{
        font-size: 14px;
        color: #313131;
    }

    .aboutSchool{
        font-size: 16px;
        font-weight: 600;
        color: #313131;
    }

    .cards-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 1.5rem;
    }

    .cards-grid {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
        gap: 1.5rem;
    }

    /* Medium screens and up: 2 columns */
    @media (min-width: 768px) {
        .cards-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    /* Large screens and up: 3 columns */
    @media (min-width: 992px) {
        .cards-grid {
            grid-template-columns: repeat(3, 1fr);
        }
    }

    .pagination .page-link {
        color: #313131;
        border: 1px solid #e5e7eb;
        padding: 0.5rem 1rem;
        transition: all 0.2s;
    }

    .pagination .page-link:hover:not(.disabled .page-link) {
        background-color: #FFA18D;
        color: white;
        border-color: #FFA18D;
    }

    .pagination .page-item.active .page-link {
        background-color: #FFA18D;
        border-color: #FFA18D;
        color: white;
    }

    .pagination .page-item.disabled .page-link {
        color: #9ca3af;
        cursor: not-allowed;
    }

    h1 {
        font-size: 2.25rem;
        font-weight: 700;
        color: #313131;
        margin-bottom: 0.5rem;
    }

    h1 + p {
        font-size: 1.125rem;
        color: #313131;
        margin-bottom: 2rem;
    }

    .fixed-bottom {
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
    animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
    from {
        transform: translateY(100%);
    }
    to {
        transform: translateY(0);
    }
}

    .fixed-bottom .btn-primary {
        background-color: #FFA18D;
        border-color: #FFA18D;
    }

    .fixed-bottom .btn-primary:hover:not(:disabled) {
        background-color: #ff8a70;
        border-color: #ff8a70;
    }

    .fixed-bottom .btn-outline-secondary:hover {
        background-color: #f3f4f6;
    }



    /* Add this if your mainCard component accepts it */
    ::v-deep .card {
        transition: transform 0.2s, box-shadow 0.2s;
    }

    ::v-deep .card:hover {
        transform: translateY(-4px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    }

    .pagination .page-link:focus:not(:focus-visible) {
        box-shadow: none;
        outline: none;
    }

    .page-content {
        padding-top: 30px;
        min-height: 100vh;
    }

@media (max-width: 768px) {
    .page-content {
        padding-top: 20px;
    }
}

@media (max-width: 576px) {
    .page-content {
            padding-top: 10px;
        }
    }
</style>