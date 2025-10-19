// useSchoolMap.js: logic for school map functionality
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import SCHOOL_COORDINATES from '../data/schoolCoordinates.json'

// Composable function to manage school map interactions
export function useSchoolMap() {
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
    window.initMap = initMap
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
                  // Fetch and display distances
                  getDistanceOfTargets()
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
    const sourceCoord = L_COORDINATES[source.value]
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
        markerContent.style.width = '48px'
        markerContent.style.height = '48px'

        const homeMarker = new google.maps.marker.AdvancedMarkerElement({
          position: location,
          map,
          content: markerContent,
          title: 'Home Location'
        })

        // Get distance of home marker when clicked
        homeMarker.addListener('click', () => {
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

  return {
    homeAddress,
    source,
    destination,
    handleSubmit,
    setActiveInput,
    sourceInput,
    destinationInput,
    inputMsg
  }
}