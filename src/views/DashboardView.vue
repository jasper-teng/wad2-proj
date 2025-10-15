<!-- Map Logic, School ditsnca mapping logic -->
<script setup>
  import { ref, onMounted, watch } from 'vue'

  let map
  const homeAddress = ref('')
  const source = ref('')
  const destination = ref('')
  const activeInputId = ref(null)

  const sourceInput = ref(null)
  const destinationInput = ref(null)
  const inputMsg = ref(null)

  const sourceMarkerBoundCoord = ref(null)
  const destinationMarkerBoundCoord = ref(null)
  const allInfoWindows = []
  const allMarkerRoutes = []

  const CUSTOM_BOUNDS = {
    north: 1.5,
    south: 1.22,
    west: 103.55,
    east: 104.08,
  }

  // Set focus styles for input
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

  // Watch input changes
  watch([source, destination], () => {
    if (source.value && destination.value) {
      getDistanceOfTargets()
    }
  })

  onMounted(() => {
    window.initMap = initMap
  })

  // === MAP INITIALIZATION ===
  function initMap() {
    console.log("Google Maps loaded successfully!")

    const center = { lat: 1.3621, lng: 103.8198 }

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

    // Open Source
    const datasetId = 'd_688b934f82c1059ed0a6993d2a829089'
    const url = `https://data.gov.sg/api/action/datastore_search?resource_id=${datasetId}`
    const geocoder = new google.maps.Geocoder()

    map.addListener('click', () => {
      allInfoWindows.forEach(({ infoW }) => infoW.close())
    })

    // Get all schools from data.gov API and create markers
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const allSchools = data.result.records

        allSchools.forEach(school => {
          geocoder.geocode({ address: school.school_name }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const location = results[0].geometry.location
              const iconEle = document.createElement('img')
              iconEle.src = './school.png'
              iconEle.style.width = '48px'
              iconEle.style.height = '48px'

              const marker = new google.maps.marker.AdvancedMarkerElement({
                position: location,
                map,
                content: iconEle
              })

              const infoWindow = new google.maps.InfoWindow({
                content: `
                  <div>
                    <strong>${school.school_name}</strong>
                    <p>URL Address: ${school.url_address}</p>
                    <p>Address: ${school.address}</p>
                    <p>MRT: ${school.mrt_desc}</p>
                    <p>Bus: ${school.bus_desc}</p>
                  </div>`
              })

              allInfoWindows.push({ name: school.school_name, infoW: infoWindow })

              marker.addListener('click', () => {
                if (activeInputId.value) {
                  const activeInput = activeInputId.value === 'source' ? source : destination
                  activeInput.value = school.school_name

                  if (activeInputId.value === 'source') {
                    sourceMarkerBoundCoord.value = marker.position
                  } else {
                    destinationMarkerBoundCoord.value = marker.position
                  }

                  allInfoWindows.forEach(({ name, infoW }) => {
                    if (name !== source.value && name !== destination.value) {
                      infoW.close()
                    }
                  })

                  // Trigger distance update
                  getDistanceOfTargets()
                }

                infoWindow.open({ anchor: marker, map })
              })
            }
          })
        })
      })
  }

  // === GET DISTANCE & ROUTES ===
  // If source and destination are filled, output time to travel for DRIVE,MRT,WALKING to #inputMsg
  async function getDistanceOfTargets() {
    allMarkerRoutes.forEach(route => route.setMap(null))
    inputMsg.value.innerHTML = ''

    const geocoder = new google.maps.Geocoder()
    const sourceResults = await geocoder.geocode({ address: source.value })
    const destinationResults = await geocoder.geocode({ address: destination.value })

    const sourceCoord = sourceResults.results[0].geometry.location
    const destinationCoord = destinationResults.results[0].geometry.location

    const bounds = new google.maps.LatLngBounds()
    bounds.extend(sourceMarkerBoundCoord.value)
    bounds.extend(destinationMarkerBoundCoord.value)
    map.fitBounds(bounds, 100)

    const directionsService = new google.maps.DirectionsService()

    const travelModes = [
      { mode: 'TRANSIT', color: 'pink', icon: 'subway' },
      { mode: 'DRIVING', color: 'red', icon: 'car' },
      { mode: 'WALKING', color: 'orange', icon: 'person-walking' }
    ]

    for (const { mode, color, icon } of travelModes) {
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

  // === HANDLE HOME ADDRESS SUBMIT ===
  function handleSubmit() {
    const address = homeAddress.value.trim()
    if (!address) {
      alert('Please input a home address')
      return
    }

    const geocoder = new google.maps.Geocoder()
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK') {
        const location = results[0].geometry.location
        const markerContent = document.createElement('div')
        markerContent.style.backgroundImage = `url(./home.png)`
        markerContent.style.backgroundSize = 'cover'
        markerContent.style.width = '48px'
        markerContent.style.height = '48px'

        const homeMarker = new google.maps.marker.AdvancedMarkerElement({
          position: location,
          map,
          content: markerContent,
          title: 'Home Location'
        })

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
</script>

<style src="../styles/style.css"></style>

<template>
  <div>
    <header class="shadow-sm">
      <div class="contsiner py-4">
        <h1 class="display-5 fw-bold">Dashboard</h1>
      </div>
    </header>

    <main>
      <div class="contsiner py-5">
        <div class="p-5 mb-4 rounded-3">
          <div class="container-fluid py-5 text-center">
            <p class="fs-4">Welcome! You are successfully logged in.</p>
          </div>
        </div>
      </div>
    </main>

    <!-- SchoolFinders (School distance mapping) from Nic -->
    <div class="container py-6">
      <h1 class="text-center mb-4">SchoolFinders</h1>
      <br>

      <div class="row">
        <div class="col-md-3">
          <form @submit.prevent="handleSubmit">
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
  </div>
</template>

