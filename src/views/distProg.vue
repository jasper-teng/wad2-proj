<template>
    <!-- Main Container -->
    <div class="container mx-auto max-w-7xl px-4 py-8 md:py-12">

        <!-- Header -->
        <header class="text-center mb-8">
            <h1 class="text-3xl md:text-4xl font-bold text-gray-900">School Distinctive Programmes</h1>
            <p class="mt-2 text-lg text-gray-600">Find distinctive programmes (ALP & LLP) in Singapore schools.</p>
        </header>

        <!-- Accordion for ALP/LLP Descriptions -->
        <div class="space-y-4 mb-8 max-w-4xl mx-auto">
            <!-- ALP Description -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200">
                <h2>
                    <button 
                        type="button" 
                        class="accordion-toggle flex items-center justify-between w-full p-5 font-medium text-left text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 rounded-lg" 
                        @click="openAccordion = openAccordion === 'alp' ? null : 'alp'"
                        :aria-expanded="openAccordion === 'alp'"
                    >
                        <span class="text-lg font-semibold">What is the Applied Learning Programme (ALP)?</span>
                        <svg class="accordion-icon w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                </h2>
                <div v-if="openAccordion === 'alp'" class="p-5 border-t border-gray-200">
                    <p class="text-gray-600 mb-4">The Applied Learning Programme (ALP) helps students connect academic knowledge and skills with the real world. It's intended to help students appreciate the relevance and value of what they are learning and to develop stronger motivation and purpose.</p>
                    <p class="text-gray-600 mb-4">ALP is non-examinable, and its emphasis is on the application of knowledge and thinking skills, stretching the imagination, and applying these to authentic settings in society and industries.</p>
                    <p class="text-gray-700 font-semibold mb-2">Schools may offer ALP in areas like:</p>
                    <ul class="list-disc list-inside text-gray-600 space-y-1">
                        <li>Science, Technology, Engineering & Mathematics (STEM) (e.g., Cities and Urban Technology, Emerging Technologies, Future of Transportation, Health and Food Science, Sustainability)</li>
                        <li>Languages (e.g., Drama and Debate, Journalism and Broadcasting, Speech and Drama)</li>
                        <li>Humanities (e.g., Digital Media, Field Studies, Media Literacy, Business and Entrepreneurship)</li>
                        <li>Aesthetics</li>
                        <li>Interdisciplinary (e.g., Thinking Skills)</li>
                    </ul>
                </div>
            </div>

            <!-- LLP Description -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200">
                <h2>
                    <button 
                        type="button" 
                        class="accordion-toggle flex items-center justify-between w-full p-5 font-medium text-left text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 rounded-lg" 
                        @click="openAccordion = openAccordion === 'llp' ? null : 'llp'"
                        :aria-expanded="openAccordion === 'llp'"
                    >
                        <span class="text-lg font-semibold">What is the Learning for Life Programme (LLP)?</span>
                        <svg class="accordion-icon w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                </h2>
                <div v-if="openAccordion === 'llp'" class="p-5 border-t border-gray-200">
                    <p class="text-gray-600 mb-4">The Learning for Life Programme (LLP) exposes students to a wide range of experiences to build their social-emotional competencies and to acquire sound values.</p>
                    <p class="text-gray-600 mb-4">LLP is intended to instill in students a sense of rootedness and responsibility for their community and fellow Singaporeans and an appreciation of aesthetics, sports and outdoor education.</p>
                    <p class="text-gray-700 font-semibold mb-2">Schools may offer LLP in areas like:</p>
                    <ul class="list-disc list-inside text-gray-600 space-y-1">
                        <li>Community and Youth Leadership</li>
                        <li>Music and Performing Arts / Visual Arts and Design</li>
                        <li>Sports and Outdoor Education</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Filters Card -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 sticky top-4 z-20">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Filter: School Level -->
                <div>
                    <label for="filter-level" class="block text-sm font-medium text-gray-700">School Level</label>
                    <select id="filter-level" v-model="filterLevel" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg">
                        <option value="all">All Levels</option>
                        <option value="primary">Primary</option>
                        <option value="secondary">Secondary</option>
                    </select>
                </div>

                <!-- Filter: Programme Type -->
                <div>
                    <label for="filter-programme" class="block text-sm font-medium text-gray-700">Programme Type</label>
                    <select id="filter-programme" v-model="filterProgramme" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg">
                        <option value="all">All Programmes</option>
                        <option value="alp">ALP</option>
                        <option value="llp">LLP</option>
                    </select>
                </div>
              
                <!-- Search Input with Suggestions -->
                <div class="relative md:col-span-1">
                    <label for="search-input" class="block text-sm font-medium text-gray-700">Search by School or Programme</label>
                    <input 
                        type="text" 
                        id="search-input" 
                        v-model="searchQuery"
                        @focus="showSuggestions = true"
                        @blur="onSearchBlur"
                        class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg" 
                        placeholder="e.g., 'Clementi' or 'STEM'">
                    <!-- Suggestions Box -->
                    <div v-if="suggestions.length > 0 && showSuggestions" class="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                        <div
                            v-for="suggestion in suggestions"
                            :key="suggestion"
                            class="p-3 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                            @mousedown.prevent="selectSuggestion(suggestion)"
                        >
                            {{ suggestion }}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- "Show Saved" filter -->
            <div class="mt-4 flex items-center justify-end">
                <input type="checkbox" id="show-saved-filter" v-model="showSaved" class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                <label for="show-saved-filter" class="ml-2 block text-sm font-medium text-gray-700">Show Saved Schools Only</label>
            </div>
        </div>

        <!-- Main Content: School List -->
        <div>
            <!-- Loading Spinner -->
            <div v-if="isLoading" class="flex justify-center items-center py-12">
                <svg class="animate-spin -ml-1 mr-3 h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="text-lg text-gray-600">Loading school data...</span>
            </div>
            
            <!-- Error Message -->
            <div v-else-if="error" class="text-center py-12">
                <h3 class="text-lg font-semibold text-red-600">{{ error }}</h3>
            </div>
            
            <!-- No Results Message -->
            <div v-else-if="filteredSchools.length === 0" class="text-center py-12">
                <h3 class="text-lg font-semibold text-gray-600">No schools match your filters.</h3>
            </div>

            <!-- School Grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div 
                    v-for="school in filteredSchools" 
                    :key="school._id" 
                    :data-id="school.schoolIdStr" 
                    :data-name="school.school_name"
                    class="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-200 flex flex-col"
                >
                    <!-- Main Card Body (Clickable) -->
                    <div class="card-body flex-grow p-6 cursor-pointer" @click="handleSchoolClick(school)">
                        <h3 class="text-xl font-bold text-gray-900 mb-4">{{ school.school_name }}</h3>
                        <div class="space-y-4">
                            <!-- ALP -->
                            <div>
                                <span class="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">ALP</span>
                                <div v-if="school.alp_domain">
                                    <h4 class="text-md font-semibold text-gray-700 mt-1">{{ school.alp_domain }}</h4>
                                    <p class="text-sm text-gray-600">{{ school.alp_title }}</p>
                                </div>
                                <p v-else class="text-sm text-gray-500 italic mt-1">No ALP information available.</p>
                            </div>
                            <!-- LLP -->
                            <div>
                                <span class="inline-block bg-green-100 text-green-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">LLP</span>
                                <div v-if="school.llp_domain1">
                                    <h4 class="text-md font-semibold text-gray-700 mt-1">{{ school.llp_domain1 }}</h4>
                                    <p class="text-sm text-gray-600">{{ school.llp_title }}</p>
                                </div>
                                <p v-else class="text-sm text-gray-500 italic mt-1">No LLP information available.</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Button container -->
                    <div class="flex-shrink-0 flex items-center justify-between space-x-2 p-4 border-t border-gray-100">
                        <!-- Like Button -->
                        <button 
                            class="like-btn flex items-center text-gray-500 hover:text-red-500 transition-colors"
                            :class="{ 'text-red-500': school.userHasLiked }"
                            title="Like"
                            @click="handleLikeClick(school)"
                        >
                            <span class="like-icon" v-html="school.userHasLiked ? heartIconSolid : heartIconOutline"></span>
                            <span class="like-count ml-1 text-sm font-medium">{{ school.likeCount }}</span>
                        </button>
                        
                        <div class="flex items-center">
                            <!-- Compare Button -->
                            <button 
                                class="compare-btn w-11 h-11 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-blue-500 transition-colors disabled:text-gray-300 disabled:hover:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed" 
                                title="Add to Compare" 
                                :disabled="school.isCompareDisabled"
                                @click="handleCompareAdd(school)"
                                v-html="compareIcon">
                            </button>
                            <!-- Save Button -->
                            <button 
                                class="save-btn w-11 h-11 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-blue-500 transition-colors"
                                :class="{ 'text-blue-500': school.isSaved }" 
                                title="Save"
                                @click="handleSaveClick(school)"
                                v-html="school.isSaved ? bookmarkIconSolid : bookmarkIconOutline">
                            </button>
                            <!-- Share Button -->
                            <button 
                                class="share-btn w-11 h-11 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-green-500 transition-colors" 
                                title="Share Link"
                                @click="handleShareClick(school)"
                                v-html="shareIcon">
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <footer class="text-center mt-12 text-sm text-gray-500">
            <p>Data sourced from <a href="https://data.gov.sg" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">data.gov.sg</a>.</p>
        </footer>
    </div>

    <!-- Notification pop-up for "Link Copied" -->
    <div v-if="notificationMessage" class="fixed bottom-5 right-5 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg z-60 transition-opacity duration-300 opacity-100">
        {{ notificationMessage }}
    </div>

    <!-- Details Modal -->
    <div v-if="isModalOpen" class="modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" :class="{ 'open': isModalOpen }" @click.self="closeModal">
        <div class="modal-content max-w-4xl w-full max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col">
            <!-- Modal Header -->
            <div class="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200">
                <h2 class="text-2xl font-bold text-gray-900">{{ modalTitle }}</h2>
                <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            
            <!-- Modal Body (Scrollable) -->
            <div class="flex-grow p-8 overflow-y-auto">
                <!-- Single School View -->
                <div v-if="!isCompareMode && modalSchool" class="space-y-6">
                    <div>
                        <h3 class="text-2xl font-semibold text-gray-900 border-b-2 border-blue-600 pb-2 mb-4">Programmes</h3>
                        <div class="space-y-6" v-html="generateSchoolDetailHtml(modalSchool)"></div>
                    </div>
                    <div>
                        <h3 class="text-2xl font-semibold text-gray-900 border-b-2 border-green-600 pb-2 mb-4">About the School</h3>
                        <div v-html="generateAboutHtml(modalSchool)"></div>
                    </div>
                </div>

                <!-- Comparison View -->
                <div v-if="isCompareMode && compareList.length === 2" class="space-y-8">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div class="pb-2 border-b-2 border-gray-300">
                            <h2 class="text-2xl font-bold text-gray-900">{{ compareList[0].school_name }}</h2>
                        </div>
                        <div class="pb-2 border-b-2 border-gray-300">
                            <h2 class="text-2xl font-bold text-gray-900">{{ compareList[1].school_name }}</h2>
                        </div>
                    </div>
                    <!-- ALP -->
                    <div>
                        <h3 class="text-2xl font-semibold text-gray-900 border-b-2 border-blue-600 pb-2 mb-4">Applied Learning Programme (ALP)</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            <div class="min-h-[150px]" v-html="generateAlpHtml(compareList[0])"></div>
                            <div class="min-h-[150px] md:border-l md:pl-8 border-gray-200" v-html="generateAlpHtml(compareList[1])"></div>
                        </div>
                    </div>
                    <!-- LLP -->
                    <div>
                        <h3 class="text-2xl font-semibold text-gray-900 border-b-2 border-green-600 pb-2 mb-4">Learning for Life Programme (LLP)</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            <div class="min-h-[150px]" v-html="generateLlpHtml(compareList[0])"></div>
                            <div class="min-h-[150px] md:border-l md:pl-8 border-gray-200" v-html="generateLlpHtml(compareList[1])"></div>
                        </div>
                    </div>
                    <!-- About -->
                    <div>
                        <h3 class="text-2xl font-semibold text-gray-900 border-b-2 border-gray-400 pb-2 mb-4">About the School</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            <div class="min-h-[150px]" v-html="generateAboutHtml(compareList[0])"></div>
                            <div class="min-h-[150px] md:border-l md:pl-8 border-gray-200" v-html="generateAboutHtml(compareList[1])"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Modal Footer -->
            <div v-if="!isCompareMode && modalSchool" class="flex-shrink-0 p-6 bg-gray-50 border-t border-gray-200 rounded-b-xl" v-html="generateModalFooterHtml(modalSchool)">
            </div>
        </div>
    </div>

    <!-- Comparison Bar -->
    <div id="compare-bar" class="fixed bottom-0 left-0 w-full bg-white shadow-2xl border-t border-gray-200 z-40" :class="{ 'open': isCompareBarOpen }">
        <div class="container mx-auto max-w-7xl p-4">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <!-- Title & Slots -->
                <div class="flex-1 w-full">
                    <h3 class="font-semibold text-gray-800 mb-2">Compare Schools (Max 2)</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <!-- Slot 1 -->
                        <div class="flex items-center justify-between p-3 bg-gray-100 rounded-lg text-sm">
                            <span v-if="compareList[0]" class="font-medium text-gray-900 truncate">{{ compareList[0].school_name }}</span>
                            <span v-else class="text-gray-500 italic">Select a school...</span>
                            <button v-if="compareList[0]" @click="handleCompareRemove(compareList[0])" class="compare-remove-btn flex-shrink-0 ml-2 text-gray-400 hover:text-red-500" :data-id="compareList[0]._id">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>
                            </button>
                        </div>
                        <!-- Slot 2 -->
                        <div class="flex items-center justify-between p-3 bg-gray-100 rounded-lg text-sm">
                            <span v-if="compareList[1]" class="font-medium text-gray-900 truncate">{{ compareList[1].school_name }}</span>
                            <span v-else class="text-gray-500 italic">Select a school...</span>
                             <button v-if="compareList[1]" @click="handleCompareRemove(compareList[1])" class="compare-remove-btn flex-shrink-0 ml-2 text-gray-400 hover:text-red-500" :data-id="compareList[1]._id">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Buttons -->
                <div class="flex-shrink-0 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button 
                        id="compare-now-btn" 
                        :disabled="compareList.length !== 2" 
                        @click="handleCompareShow"
                        class="w-full sm:w-auto px-6 py-2 text-white font-semibold bg-blue-600 rounded-lg shadow hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
                        Compare
                    </button>
                    <button 
                        id="compare-clear-btn" 
                        @click="clearCompare"
                        class="w-full sm:w-auto px-6 py-2 text-gray-700 font-semibold bg-gray-200 rounded-lg shadow hover:bg-gray-300 transition-colors">
                        Clear
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// --- 1. Constants & SVG Icons ---
const datasetId = "d_db1faeea02c646fa3abccfa5aba99214";
const apiUrl = "https://data.gov.sg/api/action/datastore_search?resource_id=" + datasetId + "&limit=300";
const MOCK_USER_ID = 'user-123-abc'; // Simulated logged-in user

const heartIconOutline = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 19.5l-7.682-7.682a4.5 4.5 0 010-6.364z"></path></svg>`;
const heartIconSolid = `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M3.172 5.172a4.5 4.5 0 016.364 0L12 7.5l2.464-2.328a4.5 4.5 0 116.364 6.364L12 19.5l-8.828-8.828a4.5 4.5 0 010-6.364z" clip-rule="evenodd"></path></svg>`;
const bookmarkIconOutline = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>`;
const bookmarkIconSolid = `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5 4a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 20V4z"></path></svg>`;
const shareIcon = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12v8c0 1.1.9 2 2 2h12a2 2 0 002-2v-8m-4-6l-4-4-4 4m4 4V4"></path></svg>`;
const compareIcon = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m6 5H4m0 0l4 4m-4-4l4-4"></path></svg>`;

// --- 2. Reactive State ---
// App Status
const isLoading = ref(true);
const error = ref(null);
const openAccordion = ref(null);

// Main Data
const allSchools = ref([]);
const allLikes = ref({});
const savedSchools = ref([]);
const compareList = ref([]);

// Filter State
const filterLevel = ref('all');
const filterProgramme = ref('all');
const searchQuery = ref('');
const showSaved = ref(false);
const showSuggestions = ref(false);

// Modal & Notification State
const isModalOpen = ref(false);
const modalSchool = ref(null); // For single school view
const isCompareMode = ref(false); // For comparison view
const notificationMessage = ref('');

// --- 3. Computed Properties ---

/**
 * The main computed property that filters and processes the school list.
 */
const filteredSchools = computed(() => {
    const query = searchQuery.value.toLowerCase().trim();

    return allSchools.value
        .filter(school => {
            // Filter: Level
            const levelMatch = filterLevel.value === 'all' ||
                (filterLevel.value === 'primary' && school.school_name.toLowerCase().includes('primary')) ||
                (filterLevel.value === 'secondary' && school.school_name.toLowerCase().includes('secondary'));
            
            // Filter: Programme
            const programmeMatch = filterProgramme.value === 'all' ||
                (filterProgramme.value === 'alp' && school.alp_domain) ||
                (filterProgramme.value === 'llp' && school.llp_domain1);
            
            // Filter: Search Query
            const searchMatch = !query ||
                (school.school_name && school.school_name.toLowerCase().includes(query)) ||
                (school.alp_domain && school.alp_domain.toLowerCase().includes(query)) ||
                (school.alp_title && school.alp_title.toLowerCase().includes(query)) ||
                (school.llp_title && school.llp_title.toLowerCase().includes(query));
            
            // Filter: Show Saved
            const savedMatch = !showSaved.value || (showSaved.value && savedSchools.value.includes(String(school._id)));

            return levelMatch && programmeMatch && searchMatch && savedMatch;
        })
        .map(school => {
            // Map: Add computed state for easy rendering in the template
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

/**
 * Computed property for search suggestions.
 */
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
    }).slice(0, 10); // Limit to 10
});

/**
 * Computed property for the modal title.
 */
const modalTitle = computed(() => {
    if (isCompareMode.value) return "Comparing Schools";
    if (modalSchool.value) return modalSchool.value.school_name;
    return "School Details";
});

/**
 * Computed property for the compare bar visibility.
 */
const isCompareBarOpen = computed(() => compareList.value.length > 0);

// --- 4. Lifecycle Hooks ---

/**
 * On component mount, load saved data and fetch school data.
 */
onMounted(async () => {
    loadSavedData();
    
    // Check for URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const schoolNameFromUrl = urlParams.get('school_name');
    if (schoolNameFromUrl) {
        searchQuery.value = schoolNameFromUrl;
    }

    // Fetch data
    try {
        // --- Use Live API ---
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        
        // --- Use Mock Data (Uncomment for testing) ---
        // await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
        // const data = mockApiResponse;
        // ---
        
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
});

// --- 5. Methods ---

/**
 * Fixes known encoding issues in the API data.
 */
function fixEncodingIssues(value) {
    if (typeof value !== 'string') return value;
    let cleanedValue = value;
    cleanedValue = cleanedValue.replace(/St Hilda\uFFFDs Secondary/g, "St Hilda's Secondary School");
    cleanedValue = cleanedValue.replace(/St Andrew\uFFFDs Secondary/g, "St Andrew's Secondary School");
    cleanedValue = cleanedValue.replace(/\s\uFFFD\s/g, ' – ');
    cleanedValue = cleanedValue.replace(/\uFFFD/g, "'");
    return cleanedValue;
}

/**
 * Hides search suggestions on blur (with a delay).
 */
function onSearchBlur() {
    setTimeout(() => {
        showSuggestions.value = false;
    }, 200);
}

/**
 * Selects a suggestion and hides the box.
 */
function selectSuggestion(suggestion) {
    searchQuery.value = suggestion;
    showSuggestions.value = false;
}

/**
 * Opens the modal for a single school.
 */
function handleSchoolClick(school) {
    modalSchool.value = school;
    isCompareMode.value = false;
    isModalOpen.value = true;
}

/**
 * Toggles the "like" status for a school.
 */
function handleLikeClick(school) {
    const likeUsers = allLikes.value[school.schoolIdStr] || [];
    const userIndex = likeUsers.indexOf(MOCK_USER_ID);

    if (userIndex > -1) {
        likeUsers.splice(userIndex, 1); // Unlike
    } else {
        likeUsers.push(MOCK_USER_ID); // Like
    }
    
    allLikes.value[school.schoolIdStr] = likeUsers;
    saveLikes(allLikes.value);
}

/**
 * Toggles the "save" status for a school.
 */
function handleSaveClick(school) {
    const index = savedSchools.value.indexOf(school.schoolIdStr);

    if (index > -1) {
        savedSchools.value.splice(index, 1); // Unsave
    } else {
        savedSchools.value.push(school.schoolIdStr); // Save
    }
    saveSavedSchools(savedSchools.value);
}

/**
 * Copies a shareable link to the clipboard.
 */
function handleShareClick(school) {
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?school_name=${encodeURIComponent(school.school_name)}`;
    copyToClipboard(shareUrl);
    showNotification("Link copied to clipboard!");
}

/**
 * Adds a school to the comparison list.
 */
function handleCompareAdd(school) {
    if (compareList.value.length >= 2 || school.inCompareList) return;
    compareList.value.push(school);
}

/**
 * Removes a school from the comparison list.
 */
function handleCompareRemove(school) {
    compareList.value = compareList.value.filter(s => s._id !== school._id);
}

/**
 * Shows the comparison modal.
 */
function handleCompareShow() {
    isCompareMode.value = true;
    modalSchool.value = null; // Ensure single view is hidden
    isModalOpen.value = true;
}

/**
 * Clears the entire comparison list.
 */
function clearCompare() {
    compareList.value = [];
}

/**
 * Closes the modal and resets its state.
 */
function closeModal() {
    isModalOpen.value = false;
    // Clear content after animation
    setTimeout(() => {
        modalSchool.value = null;
        isCompareMode.value = false;
    }, 300);
}

/**
 * Adds a school to compare from the modal and closes it.
 */
function addFromModalAndClose(school) {
    handleCompareAdd(school);
    closeModal();
}

// --- 6. HTML Generator Functions (for v-html) ---

function generateAlpHtml(school) {
    if (school && school.alp_domain) {
        return `
           <div class="mb-6">
               <span class="inline-block bg-blue-100 text-blue-800 text-lg font-semibold mr-2 px-3 py-1 rounded-full">ALP</span>
               <h4 class="text-xl font-bold text-gray-800 mt-2">${school.alp_domain}</h4>
               <p class="text-lg text-gray-700">${school.alp_title}</p>
           </div>`;
    }
    return '<p class="text-gray-500 italic text-lg">No Applied Learning Programme (ALP) information available.</p>';
}

function generateLlpHtml(school) {
    if (school && school.llp_domain1) {
        return `
           <div class="mb-6">
               <span class="inline-block bg-green-100 text-green-800 text-lg font-semibold mr-2 px-3 py-1 rounded-full">LLP</span>
               <h4 class="text-xl font-bold text-gray-800 mt-2">${school.llp_domain1}</h4>
               <p class="text-lg text-gray-700">${school.llp_title}</p>
           </div>`;
    }
    return '<p class="text-gray-500 italic text-lg">No Learning for Life Programme (LLP) information available.</p>';
}

function generateAboutHtml(school) {
    return `
        <div class="space-y-4 text-gray-700 text-lg">
            <p>This is a placeholder for school details.</p>
            <p>Information about the school's history, mission, vision, and facilities would be displayed here. You could also include links to the school's official website, contact information, and its location on a map.</p>
        </div>`;
}

function generateSchoolDetailHtml(school) {
    return `
        <div class="space-y-6">
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

    // We must add an event listener manually since this is v-html
    // A better Vue-way would be to make the footer a component, but this matches the HTML logic
    return `
        <button 
            class="modal-compare-btn w-full px-6 py-2 text-white font-semibold bg-blue-600 rounded-lg shadow hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            data-id="${schoolIdStr}"
            onclick="document.dispatchEvent(new CustomEvent('add-from-modal', { detail: '${schoolIdStr}' }))"
            ${isDisabled ? 'disabled' : ''}
        >
            ${disabledReason || 'Add to Compare'}
        </button>
    `;
}

// Event listener for the v-html button
// This is a small workaround to connect v-html to the script setup
onMounted(() => {
    document.addEventListener('add-from-modal', (e) => {
        const schoolId = e.detail;
        const school = allSchools.value.find(s => String(s._id) === schoolId);
        if (school) {
            addFromModalAndClose(school);
        }
    });
});


// --- 7. LocalStorage & Helper Functions ---

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
    }, 3000); // Show for 3 seconds
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

<style>
/* NOTE: This is unscoped, just like the original index.html file,
   to ensure styles for body, modal, scrollbar, etc., apply globally. */

/* Set the default font for the entire page */
body {
    font-family: 'Inter', sans-serif;
    background-color: #f9fafb; /* Light gray background */
}
/* Custom scrollbar for aesthetics */
::-webkit-scrollbar {
    width: 8px;
}
::-webkit-scrollbar-track {
    background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
    background: #cbd5e1; /* gray-400 */
    border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
    background: #94a3b8; /* gray-500 */
}

/* Styles for Modal */
.modal {
    transition: opacity 0.3s ease, visibility 0.3s ease;
    opacity: 0;
    visibility: hidden;
}
.modal.open {
    visibility: visible;
    opacity: 1;
}
.modal-content {
    transition: transform 0.3s ease;
    transform: translateY(20px);
}
.modal.open .modal-content {
    transform: translateY(0);
}

/* Styles for Compare Bar */
#compare-bar {
    transform: translateY(100%);
    transition: transform 0.3s ease-in-out;
}
#compare-bar.open {
    transform: translateY(0);
}

/* Styles for Accordion */
.accordion-icon {
    transition: transform 0.2s ease-in-out;
}
.accordion-toggle[aria-expanded="true"] .accordion-icon {
    transform: rotate(180deg);
}

/* FIX: Ensure clicks go to the button, not the icon */
.compare-btn svg,
.save-btn svg,
.share-btn svg {
    pointer-events: none;
}

/* Pink outline for ALL input fields - override Tailwind */
select,
input[type="text"],
input[type="checkbox"] {
    border-width: 2px !important;
    border-style: solid !important;
    border-color: #FDA08C !important;
    transition: all 0.3s ease !important;
}

select:hover,
input[type="text"]:hover {
    border-color: #FF8C86 !important;
    background-color: rgba(253, 160, 140, 0.05) !important;
}

select:focus,
input[type="text"]:focus {
    outline: none !important;
    border-color: #FDA08C !important;
    box-shadow: 0 0 0 3px rgba(253, 160, 140, 0.25) !important;
    background-color: white !important;
}

/* Override Tailwind focus ring colors */
select:focus-visible,
input[type="text"]:focus-visible {
    outline: none !important;
    border-color: #FDA08C !important;
    box-shadow: 0 0 0 3px rgba(253, 160, 140, 0.25) !important;
    --tw-ring-color: rgba(253, 160, 140, 0.25) !important;
}

/* Pink hover effect on school cards - more specific */
div[data-id] {
    transition: all 0.3s ease !important;
}

div[data-id]:hover {
    border-color: #FDA08C !important;
    box-shadow: 0 6px 20px rgba(253, 160, 140, 0.3) !important;
}

/* Pink border for sticky filters card */
.sticky {
    border-width: 2px !important;
    border-color: #FDA08C !important;
    transition: all 0.3s ease !important;
}

.sticky:hover {
    box-shadow: 0 6px 20px rgba(253, 160, 140, 0.3) !important;
}

/* Pink border for accordion items */
.space-y-4 > div {
    border-width: 2px !important;
    border-color: #FDA08C !important;
    transition: all 0.3s ease !important;
}

.space-y-4 > div:hover {
    box-shadow: 0 6px 20px rgba(253, 160, 140, 0.3) !important;
    border-color: #FF8C86 !important;
}
</style>