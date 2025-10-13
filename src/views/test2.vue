<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import 'bootstrap/dist/js/bootstrap.bundle.js'

const router = useRouter()
const form = reactive({ email: '', password: '' })
const error = ref('')
const allSchools = ref([]);
const priSch = ref([]);
const secSch = ref([]);
const jc = ref([]);
const selectedSchool1 = ref(null)
const selectedSchool2 = ref(null)
const searchTerm1 = ref('')
const searchTerm2 = ref('')
const showPri = ref(true)
const showSec = ref(true)
const showJc = ref(true)
const postalCode = ref('')
const postalCodeSubmitted = ref(false)

const schools = computed(() => {
  let result = []
  if (showPri.value) {
    result = result.concat(priSch.value)
  }
  if (showSec.value) {
    result = result.concat(secSch.value)
  }
  if (showJc.value) {
    result = result.concat(jc.value)
  }
  return result
})

const filteredSchools1 = computed(() => {
  if (!searchTerm1.value) {
    return schools.value
  }
  return schools.value.filter(school =>
    school.school_name.toLowerCase().includes(searchTerm1.value.toLowerCase())

  )
})

const filteredSchools2 = computed(() => {
  if (!searchTerm2.value) {
    return schools.value
  }
  return schools.value.filter(school =>
    school.school_name.toLowerCase().includes(searchTerm2.value.toLowerCase())
  )
})

const combineMotherTongues = (mothertongue1_code, mothertongue2_code, mothertongue3_code) => {
  var res = "";
  if(mothertongue1_code != "na"){
    res+= mothertongue1_code + ", ";
  }
  if(mothertongue2_code != "na"){
    res+= mothertongue2_code + ", ";
  }
  if(mothertongue3_code != "na"){
    res+= mothertongue3_code;
  }
  return res
}

const randomDistance = () => {
  return (Math.random(0,10)*10).toFixed(1) + "KM";
}

const searchData = async () => {
  try {
    // Make API call to the signin endpoint
    const response = await axios.get('https://api-production.data.gov.sg/v2/public/api/datasets/d_688b934f82c1059ed0a6993d2a829089/list-rows?limit=338')
    allSchools.value = response.data.data.rows
    //make into 3
    priSch.value = allSchools.value.filter(school => school.mainlevel_code === "PRIMARY")
    secSch.value = allSchools.value.filter(school => school.mainlevel_code === "SECONDARY (S1-S5)")
    jc.value = allSchools.value.filter(school => school.mainlevel_code === "JUNIOR COLLEGE")
  } catch (err) {
    // Handle login errors (e.g., wrong password)
    error.value = err.response?.data?.message || 'Invalid credentials or server error.'
  }
}

const selectSchool1 = (school) => {
  selectedSchool1.value = school
  selectedSchool1.value.distance = randomDistance()
}

const selectSchool2 = (school) => {
  selectedSchool2.value = school
  selectedSchool2.value.distance = randomDistance()
}

const handleCheckbox1Change = (event) => {
  showPri.value = event.target.checked
}

const handleCheckbox2Change = (event) => {
  showSec.value = event.target.checked
}

const handleCheckbox3Change = (event) => {
  showJc.value = event.target.checked
}

const submitPostalCode = () => {
  if (postalCode.value) {
    postalCodeSubmitted.value = true
    // You can now use the postal code for an API call or other logic
    console.log('Postal code submitted:', postalCode.value)
  }
}

onMounted(searchData)
</script>

<template>
  <div>
    <header class="bg-light shadow-sm">
      <div class="container py-4">
        <h1 class="display-5 fw-bold">Compare</h1>
      </div>
    </header>

    <main>
      <div class="container py-5">
        <div class="p-5 mb-4 bg-body-tertiary rounded-3">
          <div class="container-fluid py-3 text-center">
            
            <div class="row justify-content-center mb-4">
              <div class="col-md-4">
                <div class="input-group">
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Enter Postal Code" 
                    aria-label="Postal Code"
                    v-model="postalCode"
                    :disabled="postalCodeSubmitted">
                  <button class="btn btn-primary" type="button" @click="submitPostalCode" :disabled="postalCodeSubmitted || !postalCode">Submit</button>
                </div>
              </div>
            </div>

            <!-- Checkboxes -->
            <div class="d-flex justify-content-center gap-4 mb-4">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="checkbox1" :checked="showPri" @change="handleCheckbox1Change" />
                <label class="form-check-label" for="checkbox1">
                  Primary Schools
                </label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="checkbox2" :checked="showSec" @change="handleCheckbox2Change" />
                <label class="form-check-label" for="checkbox2">
                  Secondary Schools
                </label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="checkbox3" :checked="showJc" @change="handleCheckbox3Change" />
                <label class="form-check-label" for="checkbox3">
                  Junior Colleges
                </label>
              </div>
            </div>



            <div class="d-flex gap-3 align-items-center">
              <!-- text -->
              <div class="col-1 align-middle">
                <a>Select:</a>
              </div>

              <div class="dropdown w-100">
                <button class="btn btn-secondary dropdown-toggle w-100" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                  {{ selectedSchool1 ? selectedSchool1.school_name : 'Select a school' }}
                </button>
                <ul class="dropdown-menu w-100" aria-labelledby="dropdownMenuButton1" style="max-height: 280px; overflow-y: auto;">
                  <li class="p-2"><input type="text" class="form-control" placeholder="Search schools..." v-model="searchTerm1" @click.stop /></li>
                  <li v-for="school in filteredSchools1" :key="school._id">
                    <a class="dropdown-item" href="#" @click.prevent="selectSchool1(school)">{{ school.school_name }}</a>
                  </li>
                  <li v-if="filteredSchools1.length === 0" class="px-3 text-muted">No schools found.</li>
                </ul>
              </div>

              <!-- Dropdown 2 -->
              <div class="dropdown w-100">
                <button class="btn btn-secondary dropdown-toggle w-100" type="button" id="dropdownMenuButton2" data-bs-toggle="dropdown" aria-expanded="false">
                  {{ selectedSchool2 ? selectedSchool2.school_name : 'Select a school' }}
                </button>
                <ul class="dropdown-menu w-100" aria-labelledby="dropdownMenuButton2" style="max-height: 280px; overflow-y: auto;">
                  <li class="p-2"><input type="text" class="form-control" placeholder="Search schools..." v-model="searchTerm2" @click.stop /></li>
                  <li v-for="school in filteredSchools2" :key="school._id">
                    <a class="dropdown-item" href="#" @click.prevent="selectSchool2(school)">{{ school.school_name }}</a>
                  </li>
                  <li v-if="filteredSchools2.length === 0" class="px-3 text-muted">No schools found.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        
        <div class="p-5 mb-4 bg-body-tertiary rounded-3">
          <div class="table-responsive">
            <table class="table table-bordered align-middle">
              <thead class="table-dark">
                <tr>
                  <th scope="col" class="py-3 align-middle"style="width: 10%;">Details</th>
                  <th scope="col" class="text-center align-middle" style="width:45%" >{{ selectedSchool1 ? selectedSchool1.school_name : 'Select School 1' }}</th>
                  <th scope="col" class="text-center align-middle" style="width:45%">{{ selectedSchool2 ? selectedSchool2.school_name : 'Select School 2' }}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Address</th>
                  <td class="text-center py-1"><span v-if="selectedSchool1">{{ selectedSchool1.address }}</span><span v-else class="text-muted"> - </span></td>
                  <td class="text-center"><span v-if="selectedSchool2">{{ selectedSchool2.address }}</span><span v-else class="text-muted"> - </span></td>
                </tr>
                <tr>
                  <th scope="row">Contact No.</th>
                  <td class="text-center py-1"><span v-if="selectedSchool1">{{ selectedSchool1.telephone_no }}</span><span v-else class="text-muted"> - </span></td>
                  <td class="text-center"><span v-if="selectedSchool2">{{ selectedSchool2.telephone_no }}</span><span v-else class="text-muted"> - </span></td>
                </tr>
                <tr>
                  <th scope="row">Email</th>
                  <td class="text-center py-1"><span v-if="selectedSchool1">{{ selectedSchool1.email_address }}</span><span v-else class="text-muted"> - </span></td>
                  <td class="text-center"><span v-if="selectedSchool2">{{ selectedSchool2.email_address }}</span><span v-else class="text-muted"> - </span></td>
                </tr>
                <tr>
                  <th scope="row">Website</th>
                  <td class="text-center py-1"><a v-if="selectedSchool1" :href="selectedSchool1.url_address" target="_blank">{{ selectedSchool1.url_address }}</a><span v-else class="text-muted"> - </span></td>
                  <td class="text-center"><a v-if="selectedSchool2" :href="selectedSchool2.url_address" target="_blank">{{ selectedSchool2.url_address }}</a><span v-else class="text-muted"> - </span></td>
                </tr>
                <tr>
                  <th scope="row">Level</th>
                  <td class="text-center py-1"><span v-if="selectedSchool1">{{ selectedSchool1.mainlevel_code }}</span><span v-else class="text-muted"> - </span></td>
                  <td class="text-center"><span v-if="selectedSchool2">{{ selectedSchool2.mainlevel_code }}</span><span v-else class="text-muted"> - </span></td>
                </tr>
                <tr>
                  <th scope="row">Nearest MRT</th>
                  <td class="text-center py-1"><span v-if="selectedSchool1">{{ selectedSchool1.mrt_desc }}</span><span v-else class="text-muted"> - </span></td>
                  <td class="text-center"><span v-if="selectedSchool2">{{ selectedSchool2.mrt_desc }}</span><span v-else class="text-muted"> - </span></td>
                </tr>
                <tr>
                  <th scope="row">Distance From You</th>
                  <td class="text-center py-1"><span v-if="selectedSchool1">{{ selectedSchool1.distance}}</span><span v-else class="text-muted"> - </span></td>
                  <td class="text-center"><span v-if="selectedSchool2">{{ selectedSchool2.distance }}</span><span v-else class="text-muted"> - </span></td>
                </tr>
                <tr>
                  <th scope="row">Offered Secondary Languages</th>
                  <td class="text-center py-1"><span v-if="selectedSchool1">{{ combineMotherTongues(selectedSchool1.mothertongue1_code,selectedSchool1.mothertongue2_code,selectedSchool1.mothertongue3_code) }}</span><span v-else class="text-muted"> - </span></td>
                  <td class="text-center"><span v-if="selectedSchool2">{{ combineMotherTongues(selectedSchool2.mothertongue1_code,selectedSchool2.mothertongue2_code,selectedSchool2.mothertongue3_code) }}</span><span v-else class="text-muted"> - </span></td>
                </tr>
                
              </tbody>
            </table>
            <p v-if="!selectedSchool1 && !selectedSchool2" class="text-center text-muted mt-3">Select schools from the dropdowns above to compare their details.</p>
            </div>
          </div>
        </div>
        

    </main>
  </div>
</template>
