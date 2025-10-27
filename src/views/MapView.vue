<script setup defer>

// useSchoolMap.js: logic for school map functionality
import { ref, onMounted, watch, onBeforeUnmount, computed } from 'vue'
import SCHOOL_COORDINATES from '../data/schoolCoordinates.json'

// Composable function to manage school map interactions
  let map
  const homeAddress = ref('')
  const source = ref('')
  const destination = ref('')
  const activeInputId = ref(null)

  const sourceInput = ref(null)
  const destinationInput = ref(null)
  const inputMsg = ref(null)

  const allInfoWindows = []
  const allMarkerRoutes = []

  const homeMarker = ref(null)

  // ==========Function to set active input (source/destination)==========
  function setActiveInput(id) {
    activeInputId.value = id
    if (id === 'source') {
      sourceInput.value.style.border = '2px solid blue'
      destinationInput.value.style.border = ''
    } else {
      destinationInput.value.style.border = '2px solid blue'
      sourceInput.value.style.border = ''
    }
  }

  // ==========Function to close active input when clicking outside==========
  function handleDocumentClick(event) {
    const sourceEl = sourceInput.value;
    const destEl = destinationInput.value;
    if (
      sourceEl &&
      destEl &&
      !sourceEl.contains(event.target) &&
      !destEl.contains(event.target)
    ) {
      activeInputId.value = null;
      sourceEl.style.border = '';
      destEl.style.border = '';
    }
  }


  // Watch for changes in source and destination to update distances
  watch([source, destination], () => {
    if (source.value && destination.value) {
      getDistanceOfTargets()
    }
  })

  // Initialize Google Maps when component is mounted
  onMounted(() => {
    // Load Google Maps script
    initMap()

    // Add event listener for clicks outside input fields
    document.addEventListener('click', handleDocumentClick);
  })

  // Clean up event listener on unmount
  onBeforeUnmount(() => {
    document.removeEventListener('click', handleDocumentClick);
  });

  // ==========Function to initialize Google Map and load school markers==========
  function initMap() {
    console.log("Google Maps loaded successfully!")

    // Initialize the map coordinates
    const center = { lat: 1.3621, lng: 103.8198 }
    const CUSTOM_BOUNDS = {
      north: 1.54,
      south: 1.22,
      west: 103.55,
      east: 104.08,
    }

    // Create the map
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 11,
      center,
      disableDefaultUI: true,
      scaleControl: true,
      mapId: 'f41a3f2d53c48eebef372bfa',
      gestureHandling: 'greedy',
      restriction: {
        latLngBounds: CUSTOM_BOUNDS,
        strictBounds: true
      }
    })

    // Close all info windows when clicking on the map
    map.addListener('click', () => {
      allInfoWindows.forEach(({ infoW }) => infoW.close())
    })

    // Fetch and display school markers from gov.data.sg API
    const datasetId = 'd_688b934f82c1059ed0a6993d2a829089'
    const url = `https://data.gov.sg/api/action/datastore_search?resource_id=${datasetId}&limit=500`

    fetch(url)
      .then(res => res.json())
      .then(data => {
        const allSchools = data.result.records

        console.log(`Fetched ${allSchools.length} schools from API.`)

        allSchools.forEach(school => {
              const location = SCHOOL_COORDINATES[school.school_name]
              if (!location || !location.lat || !location.lng) {
                console.warn(`Missing coordinates for ${school.school_name}, skipping marker creation.`)
                return
              }
              const iconEle = document.createElement('img')
              iconEle.src = 'school.png'
              iconEle.style.width = '48px'
              iconEle.style.height = '48px'

              // Create school marker
              const marker = new google.maps.marker.AdvancedMarkerElement({
                position: location,
                map,
                content: iconEle
              })

              // Create school info window
              const infoWindow = new google.maps.InfoWindow({
                content: `
                  <div style="
                    font-family: Arial, sans-serif;
                    padding: 10px; 
                    max-width: 250px;
                    color: #333;
                  ">
                    <strong>${school.school_name}</strong>
                    <p>URL Address: ${school.url_address}</p>
                    <p>Address: ${school.address}</p>
                    <p>MRT: ${school.mrt_desc}</p>
                    <p>Bus: ${school.bus_desc}</p>
                  </div>`
              })

              // Track all info windows
              allInfoWindows.push({ name: school.school_name, infoW: infoWindow })

              // Marker click event to open info window and set as source/destination
              marker.addListener('click', () => {
                // Close all other info windows
                allInfoWindows.forEach(({ infoW }) => infoW.close())

                // If an input (school / destination) is active, set its value to the school name
                if (activeInputId.value) {
                  const activeInput = activeInputId.value === 'source' ? source : destination
                  activeInput.value = school.school_name

                  // Close other info windows
                  allInfoWindows.forEach(({ name, infoW }) => {
                    if (name !== source.value && name !== destination.value) {
                      infoW.close()
                    }
                  })
                }
                // Open the info window
                infoWindow.open({ anchor: marker, map })
              })
        })
      })
  }


  // ==========Function to get distances for different travel modes==========
  async function getDistanceOfTargets() {
    // Clear previous routes and messages
    allMarkerRoutes.forEach(route => route.setMap(null))
    inputMsg.value.innerHTML = ''

    // Get coordinates for source and destination
    const sourceCoord = SCHOOL_COORDINATES[source.value]
    const destinationCoord = SCHOOL_COORDINATES[destination.value]

    // Initialize Directions Service
    const directionsService = new google.maps.DirectionsService()

    // Define travel modes with colors and icons
    const travelModes = [
      { mode: 'TRANSIT', color: 'pink', icon: 'subway' },
      { mode: 'DRIVING', color: 'red', icon: 'car' },
      { mode: 'WALKING', color: 'orange', icon: 'person-walking' }
    ]

    // Fetch and render routes for each travel mode
    for (const { mode, color, icon } of travelModes) {
      // Request directions
      directionsService.route(
        {
          origin: sourceCoord,
          destination: destinationCoord,
          travelMode: mode
        },
        (response, status) => {
          if (status === 'OK') {
            const renderer = new google.maps.DirectionsRenderer({
              map,
              polylineOptions: { strokeColor: color, strokeWeight: 5 }
            })
            renderer.setDirections(response)
            allMarkerRoutes.push(renderer)

            const { distance, duration } = response.routes[0].legs[0]
            // Append distance and duration info to the message container
            inputMsg.value.innerHTML += `
              <div class="distance-item">
                <i class="fas fa-${icon} icon"></i>
                <div class="distance-text">
                  ${mode} distance: <strong>${distance.text} (${duration.text})</strong>
                </div>
              </div>
            `

            // Save distance data to session storage
            const sessionDistanceData = {
              source: source.value,
              destination: destination.value,
              icon: icon,
              mode: mode,
              distance: distance.text,
              duration: duration.text
            };
            let savedDistances = JSON.parse(sessionStorage.getItem("distances")) || [];
            savedDistances.push(sessionDistanceData);
            sessionStorage.setItem("distances", JSON.stringify(savedDistances));
          } else {
            console.warn(`${mode} directions failed: ${status}`)
          }
        }
      )
    }
  }

  // ==========Function to handle home address submission==========
  function handleSubmit() {
    const address = homeAddress.value.trim()
    if (!address) {
      alert('Please input a home address')
      return
    }

    // Geocode the home address to get coordinates
    const geocoder = new google.maps.Geocoder()
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK') {
        const location = results[0].geometry.location
        const markerContent = document.createElement('div')
        markerContent.style.backgroundImage = `url(home.png)`
        markerContent.style.backgroundSize = 'cover'
        markerContent.style.width = '68px'
        markerContent.style.height = '68px'

        if (homeMarker.value) {
          homeMarker.value.setMap(null)
        }

        homeMarker.value = new google.maps.marker.AdvancedMarkerElement({
          position: location,
          map,
          content: markerContent,
          title: 'Home Location'
        })

        // Get distance of home marker when clicked
        homeMarker.value.addListener('click', () => {
          if (activeInputId.value) {
            const activeInput = activeInputId.value === 'source' ? source : destination
            activeInput.value = address
            getDistanceOfTargets()
          }
        })
      } else {
        console.error('Home geocode failed:', status)
        alert('Could not find the address. Please check and try again.')
      }
    })
  }

  const distances = ref([])

  // Group distances by "source → destination"
  const groupedDistances = computed(() => {
    const grouped = {}
    distances.value.forEach(item => {
      const key = `${item.source} → ${item.destination}`
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(item)
    })
    return grouped
  })

  // Load distances from sessionStorage
  const loadFromSession = () => {
    distances.value = JSON.parse(sessionStorage.getItem("distances")) || []
  }

  // Clear sessionStorage and reset state
  const clearStorage = () => {
    sessionStorage.removeItem("distances")
    distances.value = []
  }

  // Get a mode-specific distance string
  const getDistance = (records, mode) => {
    const found = records.find(r => r.mode.toLowerCase() === mode.toLowerCase())
    return found ? `${found.mode} Distance ${found.distance} \n(${found.duration})` : '—'
  }

  // Load distances on component mount
  onMounted(() => {
    loadFromSession()
  })

</script>

<template>
    <!-- SchoolFinders (School distance mapping) from Nic -->
  <div id="bodybg">
    <div class="container py-6 my-5 rounded-4 shadow-lg">
      <h1 class="text-center mb-4">SchoolFinders</h1>
      <br>
        <div class="row">
          <div class="col-md-3">
            <form @submit.prevent="handleSubmit()">
              <div class="mb-3">
                <label for="home" class="form-label">Where is your home?</label>
                <input
                  v-model="homeAddress"
                  type="text"
                  id="home"
                  name="home"
                  class="form-control"
                  placeholder="Key in your home address!"
                />
              </div>
              <button
                type="submit"
                class="btn btn-primary mb-4"
              >
                Submit
              </button>
            </form>

            <div class="mb-3">
              <label for="source" class="form-label">Source</label>
              <input
                type="text"
                id="source"
                name="source"
                class="form-control"
                ref="sourceInput"
                v-model="source"
                @focus="setActiveInput('source')"
                placeholder="Choose a source!"
              />
            </div>
            <div class="mb-3">
              <label for="destination" class="form-label">Destination</label>
              <input
                type="text"
                id="destination"
                name="destination"
                class="form-control"
                ref="destinationInput"
                v-model="destination"
                @focus="setActiveInput('destination')"
                placeholder="Choose a destination!"
              />
            </div>
            <div
              id="inputMsg"
              ref="inputMsg"
              class="mt-3 d-flex justify-content-start align-items-center gap-3"
            ></div>
          </div>

        <div class="col-md-9 d-flex flex-column">
          <div
            id="map"
            class="flex-grow-1"
            style="height: 40rem; border-radius: 0.5rem; box-shadow: 0 5px 15px rgba(8, 66, 152, 0.3); background: #f0f7ff;"
          ></div>
        </div>
      </div>
    </div>
    <div class="container py-5">
      <div id="compareSection">
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-4">
          <h3 class="mb-2 mb-md-0">Compare Distances</h3>
          <div>
            <button class="btn btn-danger me-2" @click="clearStorage">
              <i class="fas fa-trash-alt me-1"></i> Clear All
            </button>
            <button class="btn btn-secondary" @click="loadFromSession">
              <i class="fas fa-sync-alt me-1"></i> Reload
            </button>
          </div>
        </div>

        <div v-for="(records, route) in groupedDistances" :key="route" class="distance-card">
          <h5 class="route-title">{{ route }}</h5>
          <div class="row text-center g-3">
            <div class="col-4 distance-mode walking">
              <i class="fas fa-person-walking fa-2x mb-2"></i>
              <div>{{ getDistance(records, 'Walking') }}</div>
            </div>
            <div class="col-4 distance-mode transit">
              <i class="fas fa-subway fa-2x mb-2"></i>
              <div>{{ getDistance(records, 'Transit') }}</div>
            </div>
            <div class="col-4 distance-mode driving">
              <i class="fas fa-car fa-2x mb-2"></i>
              <div>{{ getDistance(records, 'Driving') }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  #compareSection {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .distance-card {
    background-color: #cce5ff;
    border-radius: 0.75rem;
    padding: 1rem;
    box-shadow: 0 4px 12px rgba(0, 75, 173, 0.25);
  }

  .distance-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 18px rgba(0, 75, 173, 0.35);
  }

  .route-title {
    text-align: center;
    font-weight: 700;
    margin-bottom: 1rem;
    color: #002244;
  }

  .distance-mode {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    font-weight: 600;
    border-radius: 0.5rem;
    transition: background-color 0.2s ease;
  }

  .distance-mode.walking:hover {
    background-color: orange;
  }

  .distance-mode.transit:hover {
    background-color: pink;
  }

  .distance-mode.driving:hover {
    background-color: red;
  }

  .distance-mode i {
    color: #004aad;
  }

  #bodybg {
      background: linear-gradient(135deg, #1e3c72, #2a5298);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #0b4b82;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      padding-top: 3rem;
      padding-bottom: 3rem;
  }

  h1 {
      font-weight: 800;
      color: #cce5ff;
      text-shadow: 2px 2px 6px rgba(0, 0, 80, 0.7);
      letter-spacing: 2px;
      margin-bottom: 3rem;
  }

  h3 {
      font-weight: 700;
      color: #cce5ff;
      text-shadow: 1px 1px 4px rgba(0, 0, 80, 0.6);
      letter-spacing: 1.5px;
      margin-bottom: 2rem;
  }

  .container {
      background: #ffffffdd;
      border-radius: 1rem;
      box-shadow: 0 8px 24px rgb(0 0 0 / 0.15);
      padding: 2.5rem 3rem;
      max-width: 90%;
  }

  label {
      font-weight: 600;
      color: #003366;
  }

  input.form-control {
      border: 2px solid #004aad;
      transition: border-color 0.3s ease;
      font-size: 1.15rem;
      background-color: #f0f8ff;
      color: #003366;
  }

  input.form-control:focus {
      border-color: #003366;
      box-shadow: 0 0 8px #003366aa;
      background-color: #ffffff;
      color: #002244;
  }

  button.btn-primary {
      background-color: #004aad;
      border-color: #003366;
      font-weight: 700;
      font-size: 1.25rem;
      transition: background-color 0.3s ease, border-color 0.3s ease;
  }

  button.btn-primary:hover {
      background-color: #003366;
      border-color: #002244;
  }

  #inputMsg {
      min-height: 70px;
      font-size: 1.1rem;
      color: #003366;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1.5rem;
      flex-wrap: wrap;
      margin-top: 2rem;
  }

  .distance-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background-color: #cce5ff;
      border-radius: 0.5rem;
      padding: 0.6rem 1.2rem;
      box-shadow: 0 3px 8px rgb(0 75 173 / 0.3);
      font-weight: 700;
      color: #002244;
      animation: fadeIn 0.6s ease forwards;
  }

  .icon {
      font-size: 1.6rem;
      animation: bounce 1.2s infinite alternate;
      color: #004aad;
  }

  #map {
      height: 40rem;
      width: 100%;
      border-radius: 1rem;
      box-shadow: 0 8px 24px rgb(0 0 0 / 0.2);
      background: #e1ecff;
  }

      
  @keyframes fadeIn {
      from {opacity: 0;}
      to {opacity: 1;}
  }

  @keyframes bounce {
      0% {transform: translateY(0);}
      100% {transform: translateY(-8px);}
  }

  @media (max-width: 576px) {
      .container {
          padding: 2rem 1.5rem;
      }
      #inputMsg {
          justify-content: center !important;
      }
  }

  /* Remove Default UI options for map, main.js disableDefaultUI: true does not work */
  .gm-ui-hover-effect, 
  .gm-style .gm-style-mtc, 
  .gm-style .gm-style-cc {
    display: none !important;
  }
</style>

<style>
  .icon {
      font-size: 1.6rem;
      animation: bounce 1.2s infinite alternate;
      color: #004aad;
  }

  .distance-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background-color: #cce5ff;
      border-radius: 0.5rem;
      padding: 0.6rem 1.2rem;
      box-shadow: 0 3px 8px rgb(0 75 173 / 0.3);
      font-weight: 700;
      color: #002244;
      animation: fadeIn 0.6s ease forwards;
  }
  
  @keyframes bounce {
      0% {transform: translateY(0);}
      100% {transform: translateY(-8px);}
  }
</style>

