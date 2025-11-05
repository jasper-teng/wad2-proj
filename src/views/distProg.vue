<template>
    <!-- Main Container -->
    <div class="container py-5">

        <!-- Header -->
        <div class="header-section text-center mb-5">
            <h1 class="display-5 fw-bold mb-2">School Distinctive Programmes</h1>
            <p class="lead">Find distinctive programmes (ALP & LLP) in Singapore schools.</p>
        </div>

        <!-- Accordion for ALP/LLP Descriptions -->
        <div class="mb-4">
            <!-- ALP Description -->
            <div class="content-card mb-3">
                <h2>
                    <button
                        type="button"
                        class="accordion-toggle btn w-100 text-start d-flex justify-content-between align-items-center p-3 border-0"
                        @click="openAccordion = openAccordion === 'alp' ? null : 'alp'"
                        :aria-expanded="openAccordion === 'alp'"
                    >
                        <span class="fw-semibold">What is the Applied Learning Programme (ALP)?</span>
                        <svg class="accordion-icon" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                </h2>
                <div v-if="openAccordion === 'alp'" class="p-3 border-top">
                    <p class="mb-3">The Applied Learning Programme (ALP) helps students connect academic knowledge and skills with the real world. It's intended to help students appreciate the relevance and value of what they are learning and to develop stronger motivation and purpose.</p>
                    <p class="mb-3">ALP is non-examinable, and its emphasis is on the application of knowledge and thinking skills, stretching the imagination, and applying these to authentic settings in society and industries.</p>
                    <p class="fw-semibold mb-2">Schools may offer ALP in areas like:</p>
                    <ul class="mb-0">
                        <li>Science, Technology, Engineering & Mathematics (STEM) (e.g., Cities and Urban Technology, Emerging Technologies, Future of Transportation, Health and Food Science, Sustainability)</li>
                        <li>Languages (e.g., Drama and Debate, Journalism and Broadcasting, Speech and Drama)</li>
                        <li>Humanities (e.g., Digital Media, Field Studies, Media Literacy, Business and Entrepreneurship)</li>
                        <li>Aesthetics</li>
                        <li>Interdisciplinary (e.g., Thinking Skills)</li>
                    </ul>
                </div>
            </div>

            <!-- LLP Description -->
            <div class="content-card mb-3">
                <h2>
                    <button
                        type="button"
                        class="accordion-toggle btn w-100 text-start d-flex justify-content-between align-items-center p-3 border-0"
                        @click="openAccordion = openAccordion === 'llp' ? null : 'llp'"
                        :aria-expanded="openAccordion === 'llp'"
                    >
                        <span class="fw-semibold">What is the Learning for Life Programme (LLP)?</span>
                        <svg class="accordion-icon" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                </h2>
                <div v-if="openAccordion === 'llp'" class="p-3 border-top">
                    <p class="mb-3">The Learning for Life Programme (LLP) exposes students to a wide range of experiences to build their social-emotional competencies and to acquire sound values.</p>
                    <p class="mb-3">LLP is intended to instill in students a sense of rootedness and responsibility for their community and fellow Singaporeans and an appreciation of aesthetics, sports and outdoor education.</p>
                    <p class="fw-semibold mb-2">Schools may offer LLP in areas like:</p>
                    <ul class="mb-0">
                        <li>Community and Youth Leadership</li>
                        <li>Music and Performing Arts / Visual Arts and Design</li>
                        <li>Sports and Outdoor Education</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Filters Card -->
        <div class="content-card mb-4">
            <h5 class="mb-4">Filters</h5>
            <div class="row g-3 mb-3">
                <!-- Filter: School Level -->
                <div class="col-md-4">
                    <label for="filter-level" class="form-label">School Level</label>
                    <select id="filter-level" v-model="filterLevel" class="form-select">
                        <option value="all">All Levels</option>
                        <option value="primary">Primary</option>
                        <option value="secondary">Secondary</option>
                    </select>
                </div>

                <!-- Filter: Programme Type -->
                <div class="col-md-4">
                    <label for="filter-programme" class="form-label">Programme Type</label>
                    <select id="filter-programme" v-model="filterProgramme" class="form-select">
                        <option value="all">All Programmes</option>
                        <option value="alp">ALP</option>
                        <option value="llp">LLP</option>
                    </select>
                </div>

                <!-- Search Input with Suggestions -->
                <div class="col-md-4">
                    <label for="search-input" class="form-label">Search by School or Programme</label>
                    <div class="position-relative">
                        <input
                            type="text"
                            id="search-input"
                            v-model="searchQuery"
                            @focus="showSuggestions = true"
                            @blur="onSearchBlur"
                            class="form-control"
                            placeholder="e.g., 'Clementi' or 'STEM'">
                        <!-- Suggestions Box -->
                        <div v-if="suggestions.length > 0 && showSuggestions" class="suggestions-dropdown">
                            <div
                                v-for="suggestion in suggestions"
                                :key="suggestion"
                                class="suggestion-item"
                                @mousedown.prevent="selectSuggestion(suggestion)"
                            >
                                {{ suggestion }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- "Show Saved" filter -->
            <div class="d-flex align-items-center justify-content-end">
                <input type="checkbox" id="show-saved-filter" v-model="showSaved" class="form-check-input me-2">
                <label for="show-saved-filter" class="form-check-label">Show Saved Schools Only</label>
            </div>
        </div>

        <!-- Main Content: School List -->
        <div>
            <!-- Loading Spinner -->
            <div v-if="isLoading" class="text-center py-5">
                <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">Loading school data...</p>
            </div>

            <!-- Error Message -->
            <div v-else-if="error" class="alert alert-danger text-center" role="alert">
                {{ error }}
            </div>

            <!-- No Results Message -->
            <div v-else-if="filteredSchools.length === 0" class="text-center py-5">
                <h5>No schools match your filters.</h5>
            </div>

            <!-- School Grid -->
            <div v-else class="row g-4">
                <div
                    v-for="school in filteredSchools"
                    :key="school._id"
                    :data-id="school.schoolIdStr"
                    :data-name="school.school_name"
                    class="col-md-6 col-lg-4"
                >
                    <div class="school-card card h-100">
                        <!-- Main Card Body (Clickable) -->
                        <div class="card-body flex-grow-1 cursor-pointer" @click="handleSchoolClick(school)">
                            <h3 class="h5 fw-bold mb-3">{{ school.school_name }}</h3>
                            <!-- ALP -->
                            <div class="mb-3">
                                <span class="badge alp-badge me-2">ALP</span>
                                <div v-if="school.alp_domain">
                                    <h4 class="h6 fw-semibold mt-2">{{ school.alp_domain }}</h4>
                                    <p class="small mb-0">{{ school.alp_title }}</p>
                                </div>
                                <p v-else class="small text-muted fst-italic mt-2 mb-0">No ALP information available.</p>
                            </div>
                            <!-- LLP -->
                            <div>
                                <span class="badge llp-badge me-2">LLP</span>
                                <div v-if="school.llp_domain1">
                                    <h4 class="h6 fw-semibold mt-2">{{ school.llp_domain1 }}</h4>
                                    <p class="small mb-0">{{ school.llp_title }}</p>
                                </div>
                                <p v-else class="small text-muted fst-italic mt-2 mb-0">No LLP information available.</p>
                            </div>
                        </div>

                        <!-- Button container -->
                        <div class="card-footer bg-white border-top d-flex justify-content-between align-items-center">
                            <!-- Like Button -->
                            <button
                                class="btn btn-sm btn-icon"
                                :class="{ 'text-danger': school.userHasLiked }"
                                title="Like"
                                @click="handleLikeClick(school)"
                            >
                                <span v-html="school.userHasLiked ? heartIconSolid : heartIconOutline"></span>
                                <span class="ms-1 small">{{ school.likeCount }}</span>
                            </button>

                            <div class="d-flex gap-1">
                                <!-- Compare Button -->
                                <button
                                    class="btn btn-sm btn-icon"
                                    title="Add to Compare"
                                    :disabled="school.isCompareDisabled"
                                    @click="handleCompareAdd(school)"
                                    v-html="compareIcon">
                                </button>
                                <!-- Save Button -->
                                <button
                                    class="btn btn-sm btn-icon"
                                    :class="{ 'text-primary': school.isSaved }"
                                    title="Save"
                                    @click="handleSaveClick(school)"
                                    v-html="school.isSaved ? bookmarkIconSolid : bookmarkIconOutline">
                                </button>
                                <!-- Share Button -->
                                <button
                                    class="btn btn-sm btn-icon"
                                    title="Share Link"
                                    @click="handleShareClick(school)"
                                    v-html="shareIcon">
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <footer class="text-center mt-5 text-muted small">
            <p>Data sourced from <a href="https://data.gov.sg" target="_blank" rel="noopener noreferrer">data.gov.sg</a>.</p>
        </footer>
    </div>

    <!-- Notification pop-up for "Link Copied" -->
    <div v-if="notificationMessage" class="notification-toast">
        {{ notificationMessage }}
    </div>

    <!-- Details Modal -->
    <div v-if="isModalOpen" class="modal fade show d-block" tabindex="-1" @click.self="closeModal">
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
            <div class="modal-content">
                <!-- Modal Header -->
                <div class="modal-header">
                    <h2 class="modal-title fs-4 fw-bold">{{ modalTitle }}</h2>
                    <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
                </div>

                <!-- Modal Body (Scrollable) -->
                <div class="modal-body">
                    <!-- Single School View -->
                    <div v-if="!isCompareMode && modalSchool">
                        <div class="mb-4">
                            <h3 class="h5 fw-semibold mb-3" style="border-bottom: 3px solid #0d6efd; padding-bottom: 0.5rem;">Programmes</h3>
                            <div v-html="generateSchoolDetailHtml(modalSchool)"></div>
                        </div>
                        <div>
                            <h3 class="h5 fw-semibold mb-3" style="border-bottom: 3px solid #198754; padding-bottom: 0.5rem;">About the School</h3>
                            <div v-html="generateAboutHtml(modalSchool)"></div>
                        </div>
                    </div>

                    <!-- Comparison View -->
                    <div v-if="isCompareMode && compareList.length === 2">
                        <div class="row mb-4">
                            <div class="col-md-6">
                                <h2 class="h5 fw-bold pb-2 border-bottom">{{ compareList[0].school_name }}</h2>
                            </div>
                            <div class="col-md-6">
                                <h2 class="h5 fw-bold pb-2 border-bottom">{{ compareList[1].school_name }}</h2>
                            </div>
                        </div>
                        <!-- ALP -->
                        <div class="mb-4">
                            <h3 class="h5 fw-semibold mb-3" style="border-bottom: 3px solid #0d6efd; padding-bottom: 0.5rem;">Applied Learning Programme (ALP)</h3>
                            <div class="row">
                                <div class="col-md-6" v-html="generateAlpHtml(compareList[0])"></div>
                                <div class="col-md-6 border-start" v-html="generateAlpHtml(compareList[1])"></div>
                            </div>
                        </div>
                        <!-- LLP -->
                        <div class="mb-4">
                            <h3 class="h5 fw-semibold mb-3" style="border-bottom: 3px solid #198754; padding-bottom: 0.5rem;">Learning for Life Programme (LLP)</h3>
                            <div class="row">
                                <div class="col-md-6" v-html="generateLlpHtml(compareList[0])"></div>
                                <div class="col-md-6 border-start" v-html="generateLlpHtml(compareList[1])"></div>
                            </div>
                        </div>
                        <!-- About -->
                        <div>
                            <h3 class="h5 fw-semibold mb-3 pb-2 border-bottom">About the School</h3>
                            <div class="row">
                                <div class="col-md-6" v-html="generateAboutHtml(compareList[0])"></div>
                                <div class="col-md-6 border-start" v-html="generateAboutHtml(compareList[1])"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal Footer -->
                <div v-if="!isCompareMode && modalSchool" class="modal-footer">
                    <div class="w-100" v-html="generateModalFooterHtml(modalSchool)"></div>
                </div>
            </div>
        </div>
    </div>
    <div v-if="isModalOpen" class="modal-backdrop fade show"></div>

    <!-- Comparison Bar -->
    <div id="compare-bar" class="compare-bar" :class="{ 'show': isCompareBarOpen }">
        <div class="container">
            <div class="row align-items-end g-3">
                <!-- Title & Slots -->
                <div class="col-md-8">
                    <h3 class="h6 fw-semibold mb-2">Compare Schools (Max 2)</h3>
                    <div class="row g-2">
                        <!-- Slot 1 -->
                        <div class="col-md-6">
                            <div class="compare-slot">
                                <span v-if="compareList[0]" class="fw-medium">{{ compareList[0].school_name }}</span>
                                <span v-else class="text-muted fst-italic">Select a school...</span>
                                <button v-if="compareList[0]" @click="handleCompareRemove(compareList[0])" class="btn-close ms-2" :data-id="compareList[0]._id"></button>
                            </div>
                        </div>
                        <!-- Slot 2 -->
                        <div class="col-md-6">
                            <div class="compare-slot">
                                <span v-if="compareList[1]" class="fw-medium">{{ compareList[1].school_name }}</span>
                                <span v-else class="text-muted fst-italic">Select a school...</span>
                                <button v-if="compareList[1]" @click="handleCompareRemove(compareList[1])" class="btn-close ms-2" :data-id="compareList[1]._id"></button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Buttons -->
                <div class="col-md-4">
                    <div class="d-flex gap-2">
                        <button
                            id="compare-now-btn"
                            :disabled="compareList.length !== 2"
                            @click="handleCompareShow"
                            class="btn btn-primary flex-fill">
                            Compare
                        </button>
                        <button
                            id="compare-clear-btn"
                            @click="clearCompare"
                            class="btn btn-outline-secondary flex-fill">
                            Clear
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// ============================================================================
// CONSTANTS & SVG ICONS
// ============================================================================
const datasetId = "d_db1faeea02c646fa3abccfa5aba99214";
const apiUrl = "https://data.gov.sg/api/action/datastore_search?resource_id=" + datasetId + "&limit=300";
const MOCK_USER_ID = 'user-123-abc';

const heartIconOutline = `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 19.5l-7.682-7.682a4.5 4.5 0 010-6.364z"></path></svg>`;
const heartIconSolid = `<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M3.172 5.172a4.5 4.5 0 016.364 0L12 7.5l2.464-2.328a4.5 4.5 0 116.364 6.364L12 19.5l-8.828-8.828a4.5 4.5 0 010-6.364z" clip-rule="evenodd"></path></svg>`;
const bookmarkIconOutline = `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>`;
const bookmarkIconSolid = `<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M5 4a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 20V4z"></path></svg>`;
const shareIcon = `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12v8c0 1.1.9 2 2 2h12a2 2 0 002-2v-8m-4-6l-4-4-4 4m4 4V4"></path></svg>`;
const compareIcon = `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m6 5H4m0 0l4 4m-4-4l4-4"></path></svg>`;

// ============================================================================
// STATE MANAGEMENT
// ============================================================================
const isLoading = ref(true);
const error = ref(null);
const openAccordion = ref(null);
const allSchools = ref([]);
const allLikes = ref({});
const savedSchools = ref([]);
const compareList = ref([]);
const filterLevel = ref('all');
const filterProgramme = ref('all');
const searchQuery = ref('');
const showSaved = ref(false);
const showSuggestions = ref(false);
const isModalOpen = ref(false);
const modalSchool = ref(null);
const isCompareMode = ref(false);
const notificationMessage = ref('');

// ============================================================================
// COMPUTED PROPERTIES
// ============================================================================
const filteredSchools = computed(() => {
    const query = searchQuery.value.toLowerCase().trim();

    return allSchools.value
        .filter(school => {
            const levelMatch = filterLevel.value === 'all' ||
                (filterLevel.value === 'primary' && school.school_name.toLowerCase().includes('primary')) ||
                (filterLevel.value === 'secondary' && school.school_name.toLowerCase().includes('secondary'));

            const programmeMatch = filterProgramme.value === 'all' ||
                (filterProgramme.value === 'alp' && school.alp_domain) ||
                (filterProgramme.value === 'llp' && school.llp_domain1);

            const searchMatch = !query ||
                (school.school_name && school.school_name.toLowerCase().includes(query)) ||
                (school.alp_domain && school.alp_domain.toLowerCase().includes(query)) ||
                (school.alp_title && school.alp_title.toLowerCase().includes(query)) ||
                (school.llp_title && school.llp_title.toLowerCase().includes(query));

            const savedMatch = !showSaved.value || (showSaved.value && savedSchools.value.includes(String(school._id)));

            return levelMatch && programmeMatch && searchMatch && savedMatch;
        })
        .map(school => {
            const schoolIdStr = String(school._id);
            const likeUsers = allLikes.value[schoolIdStr] || [];
            const inCompareList = compareList.value.some(s => String(s._id) === schoolIdStr);

            return {
                ...school,
                schoolIdStr,
                likeUsers,
                likeCount: likeUsers.length,
                userHasLiked: likeUsers.includes(MOCK_USER_ID),
                isSaved: savedSchools.value.includes(schoolIdStr),
                inCompareList,
                isCompareDisabled: inCompareList || compareList.value.length >= 2
            };
        });
});

const suggestions = computed(() => {
    const query = searchQuery.value.toLowerCase().trim();
    if (query.length < 1) return [];

    const seen = new Set();
    return allSchools.value.flatMap(school => {
        const matches = [];
        if (school.school_name && school.school_name.toLowerCase().includes(query) && !seen.has(school.school_name)) {
            matches.push(school.school_name);
            seen.add(school.school_name);
        }
        if (school.alp_title && school.alp_title.toLowerCase().includes(query) && !seen.has(school.alp_title)) {
            matches.push(school.alp_title);
            seen.add(school.alp_title);
        }
        if (school.llp_title && school.llp_title.toLowerCase().includes(query) && !seen.has(school.llp_title)) {
            matches.push(school.llp_title);
            seen.add(school.llp_title);
        }
        return matches;
    }).slice(0, 10);
});

const modalTitle = computed(() => {
    if (isCompareMode.value) return "Comparing Schools";
    if (modalSchool.value) return modalSchool.value.school_name;
    return "School Details";
});

const isCompareBarOpen = computed(() => compareList.value.length > 0);

// ============================================================================
// LIFECYCLE HOOKS
// ============================================================================
onMounted(async () => {
    loadSavedData();

    const urlParams = new URLSearchParams(window.location.search);
    const schoolNameFromUrl = urlParams.get('school_name');
    if (schoolNameFromUrl) {
        searchQuery.value = schoolNameFromUrl;
    }

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();

        allSchools.value = data.result.records.map(school => {
            school.school_name = fixEncodingIssues(school.school_name);
            school.alp_domain = fixEncodingIssues(school.alp_domain);
            school.alp_title = fixEncodingIssues(school.alp_title);
            school.llp_domain1 = fixEncodingIssues(school.llp_domain1);
            school.llp_title = fixEncodingIssues(school.llp_title);
            return school;
        });

    } catch (err) {
        console.error('Fetch error:', err);
        error.value = 'Could not fetch school data. Please try refreshing the page.';
    } finally {
        isLoading.value = false;
    }

    document.addEventListener('add-from-modal', (e) => {
        const schoolId = e.detail;
        const school = allSchools.value.find(s => String(s._id) === schoolId);
        if (school) {
            addFromModalAndClose(school);
        }
    });
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function fixEncodingIssues(value) {
    if (typeof value !== 'string') return value;
    let cleanedValue = value;
    cleanedValue = cleanedValue.replace(/St Hilda\uFFFDs Secondary/g, "St Hilda's Secondary School");
    cleanedValue = cleanedValue.replace(/St Andrew\uFFFDs Secondary/g, "St Andrew's Secondary School");
    cleanedValue = cleanedValue.replace(/\s\uFFFD\s/g, ' – ');
    cleanedValue = cleanedValue.replace(/\uFFFD/g, "'");
    return cleanedValue;
}

function onSearchBlur() {
    setTimeout(() => {
        showSuggestions.value = false;
    }, 200);
}

function selectSuggestion(suggestion) {
    searchQuery.value = suggestion;
    showSuggestions.value = false;
}

function handleSchoolClick(school) {
    modalSchool.value = school;
    isCompareMode.value = false;
    isModalOpen.value = true;
}

function handleLikeClick(school) {
    const likeUsers = allLikes.value[school.schoolIdStr] || [];
    const userIndex = likeUsers.indexOf(MOCK_USER_ID);

    if (userIndex > -1) {
        likeUsers.splice(userIndex, 1);
    } else {
        likeUsers.push(MOCK_USER_ID);
    }

    allLikes.value[school.schoolIdStr] = likeUsers;
    saveLikes(allLikes.value);
}

function handleSaveClick(school) {
    const index = savedSchools.value.indexOf(school.schoolIdStr);

    if (index > -1) {
        savedSchools.value.splice(index, 1);
    } else {
        savedSchools.value.push(school.schoolIdStr);
    }
    saveSavedSchools(savedSchools.value);
}

function handleShareClick(school) {
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?school_name=${encodeURIComponent(school.school_name)}`;
    copyToClipboard(shareUrl);
    showNotification("Link copied to clipboard!");
}

function handleCompareAdd(school) {
    if (compareList.value.length >= 2 || school.inCompareList) return;
    compareList.value.push(school);
}

function handleCompareRemove(school) {
    compareList.value = compareList.value.filter(s => s._id !== school._id);
}

function handleCompareShow() {
    isCompareMode.value = true;
    modalSchool.value = null;
    isModalOpen.value = true;
}

function clearCompare() {
    compareList.value = [];
}

function closeModal() {
    isModalOpen.value = false;
    setTimeout(() => {
        modalSchool.value = null;
        isCompareMode.value = false;
    }, 300);
}

function addFromModalAndClose(school) {
    handleCompareAdd(school);
    closeModal();
}

// ============================================================================
// HTML GENERATOR FUNCTIONS
// ============================================================================
function generateAlpHtml(school) {
    if (school && school.alp_domain) {
        return `
           <div class="mb-3">
               <span class="badge alp-badge me-2">ALP</span>
               <h4 class="h6 fw-bold mt-2">${school.alp_domain}</h4>
               <p>${school.alp_title}</p>
           </div>`;
    }
    return '<p class="text-muted fst-italic">No Applied Learning Programme (ALP) information available.</p>';
}

function generateLlpHtml(school) {
    if (school && school.llp_domain1) {
        return `
           <div class="mb-3">
               <span class="badge llp-badge me-2">LLP</span>
               <h4 class="h6 fw-bold mt-2">${school.llp_domain1}</h4>
               <p>${school.llp_title}</p>
           </div>`;
    }
    return '<p class="text-muted fst-italic">No Learning for Life Programme (LLP) information available.</p>';
}

function generateAboutHtml(school) {
    return `
        <div>
            <p>This is a placeholder for school details.</p>
            <p>Information about the school's history, mission, vision, and facilities would be displayed here. You could also include links to the school's official website, contact information, and its location on a map.</p>
        </div>`;
}

function generateSchoolDetailHtml(school) {
    return `
        <div>
            ${generateAlpHtml(school)}
            ${generateLlpHtml(school)}
        </div>
    `;
}

function generateModalFooterHtml(school) {
    const schoolIdStr = String(school._id);
    const inCompareList = compareList.value.some(s => String(s._id) === schoolIdStr);
    const compareFull = compareList.value.length >= 2;

    let disabledReason = '';
    if (inCompareList) disabledReason = 'Added to Compare';
    if (!inCompareList && compareFull) disabledReason = 'Compare list is full';

    const isDisabled = inCompareList || compareFull;

    return `
        <button
            class="btn btn-primary w-100"
            data-id="${schoolIdStr}"
            onclick="document.dispatchEvent(new CustomEvent('add-from-modal', { detail: '${schoolIdStr}' }))"
            ${isDisabled ? 'disabled' : ''}
        >
            ${disabledReason || 'Add to Compare'}
        </button>
    `;
}

// ============================================================================
// LOCALSTORAGE & UTILITY FUNCTIONS
// ============================================================================
function loadSavedData() {
    allLikes.value = JSON.parse(localStorage.getItem('schoolLikesV2')) || {};
    savedSchools.value = JSON.parse(localStorage.getItem('savedSchools')) || [];
}

function saveLikes(likes) {
    localStorage.setItem('schoolLikesV2', JSON.stringify(likes));
}

function saveSavedSchools(schools) {
    localStorage.setItem('savedSchools', JSON.stringify(schools));
}

function showNotification(message) {
    notificationMessage.value = message;
    setTimeout(() => {
        notificationMessage.value = '';
    }, 3000);
}

function copyToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "absolute";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
    document.body.removeChild(textArea);
}
</script>

<style scoped>
.container {
  max-width: 1200px;
}

.content-card {
  background: #ffffff;
  padding: 1.5rem;
  border: 5px solid #FFA18D;
  border-radius: 0 30px 0 30px;
  box-shadow: none;
}

.accordion-toggle {
  background: transparent;
  color: #313131;
}

.accordion-toggle:hover {
  background-color: rgba(255, 161, 141, 0.1);
}

.accordion-icon {
  transition: transform 0.2s ease-in-out;
  flex-shrink: 0;
}

.accordion-toggle[aria-expanded="true"] .accordion-icon {
  transform: rotate(180deg);
}

.suggestions-dropdown {
  position: absolute;
  z-index: 1000;
  width: 100%;
  background: white;
  border: 2px solid #FFA18D;
  border-radius: 0 10px 0 10px;
  margin-top: 0.25rem;
  max-height: 15rem;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.suggestion-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.suggestion-item:hover {
  background-color: rgba(255, 161, 141, 0.1);
}

.school-card {
  border: 3px solid #FFA18D;
  border-radius: 0 20px 0 20px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.school-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}

.cursor-pointer {
  cursor: pointer;
}

.alp-badge {
  background-color: #cfe2ff;
  color: #084298;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
}

.llp-badge {
  background-color: #d1e7dd;
  color: #0f5132;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
}

.btn-icon {
  border: none;
  background: transparent;
  padding: 0.25rem;
  color: #6c757d;
  transition: color 0.15s ease;
}

.btn-icon:hover {
  color: #56bdb6;
}

.btn-icon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.notification-toast {
  position: fixed;
  bottom: 1.25rem;
  right: 1.25rem;
  background-color: #313131;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 0 10px 0 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.2);
  z-index: 9999;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.compare-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 3px solid #FFA18D;
  padding: 1rem 0;
  box-shadow: 0 -4px 6px rgba(0,0,0,0.1);
  transform: translateY(100%);
  transition: transform 0.3s ease;
  z-index: 1030;
}

.compare-bar.show {
  transform: translateY(0);
}

.compare-slot {
  background-color: #f8f9fa;
  border: 2px solid #dee2e6;
  border-radius: 0 10px 0 10px;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 3rem;
}

.modal.show {
  display: block;
}

.modal-backdrop {
  background-color: rgba(0,0,0,0.5);
}

.spinner-border.text-primary {
  color: #56bdb6 !important;
}

.btn-primary {
  background-color: #56bdb6;
  border-color: #56bdb6;
}

.btn-primary:hover,
.btn-primary:focus {
  background-color: #4aa8a2;
  border-color: #4aa8a2;
}

.btn-outline-secondary {
  border-color: #FFA18D;
  color: #FFA18D;
}

.btn-outline-secondary:hover,
.btn-outline-secondary:focus {
  background-color: #FFA18D;
  border-color: #FFA18D;
  color: white;
}

.alert-danger {
  border-color: rgba(255, 161, 141, 0.5);
  background-color: rgba(255, 161, 141, 0.1);
  color: #313131;
}
</style>
