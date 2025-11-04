<script setup defer>

// useSchoolMap.js: logic for school map functionality
import { ref, onMounted, watch, onBeforeUnmount, computed } from 'vue'
import SCHOOL_COORDINATES from '../data/schoolCoordinates.json'
import schoolIcon from '@/assets/school-Icon.png'
import homeIcon from '@/assets/home-Icon.png'
import '@/assets/mapview.css'

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
  let allMarkerRoutes = []
  const allMarkers = ref([])
  const allSchools = ref([]);
  const routedSchools = ref([]);

  const isDrawerOpen = ref(false)
  const homeMarker = ref(null)
  const showHomeForm = ref(true)

  // Toggle drawer function
  function toggleDrawer() {
    isDrawerOpen.value = !isDrawerOpen.value
  }

  // ==========Function to set active input (source/destination)==========
  function setActiveInput(id) {
    activeInputId.value = id
    if (id === 'destination') {
      destinationInput.value.style.border = '2px solid pink'
    } else {
      destinationInput.value.style.border = ''
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
  watch([source, destination], ([src, dest]) => {
    if (src && dest) {
      getDistanceOfTargets()
    }
  })


  // Wait for Google Maps API to load
  function waitForGoogleMaps() {
    return new Promise((resolve) => {
      if (window.google && window.google.maps && window.google.maps.Map) {
        resolve()
      } else {
        const checkInterval = setInterval(() => {
          if (window.google && window.google.maps && window.google.maps.Map) {
            clearInterval(checkInterval)
            resolve()
          }
        }, 100)
      }
    })
  }

  // Function to read and input them into the map
  function readUrlParams() {
    const urlParams = new URLSearchParams(window.location.search)
    const params = {}

    for (const [key, value] of urlParams.entries()) {
      params[key] = value
    }

    console.log('URL Parameters:', params)
    if(params.source && params.school){
      source.value = params.source
      destination.value = params.school
      toggleDrawer()
      // Don't call getDistanceOfTargets() here - the watcher will handle it
    }

    return

  }

  // Initialize Google Maps when component is mounted
  onMounted(async () => {
    // Wait for Google Maps to load
    await waitForGoogleMaps()

    // Read and log URL parameters
    readUrlParams()

    // Load Google Maps script
    initMap()

    // Get Home coordinates from session (if present)
    loadHomeCoords()

    // Get route data from session
    loadSavedRoutesFromSession()

    // Add event listener for clicks outside input fields
    document.addEventListener('click', handleDocumentClick);
  })

  // Clean up event listener on unmount
  onBeforeUnmount(() => {
    document.removeEventListener('click', handleDocumentClick);
  });

  // Remove all route overlays (DirectionsRenderer and Polyline) from the map
  function clearAllRoutes() {
    allMarkerRoutes.forEach(route => {
      try {
        // DirectionsRenderer instances: have setDirections / setMap
        if (typeof route.setDirections === 'function' || (route.savedResult)) {
          try { route.setMap(null) } catch (e) {}
          try { route.setDirections({ routes: [] }) } catch (e) {}
          try { google.maps.event.clearInstanceListeners(route) } catch (e) {}
          return
        }
    
        // Polyline instances: have getPath()
        if (typeof route.getPath === 'function') {
          try { route.setMap(null) } catch (e) {}
          try { google.maps.event.clearInstanceListeners(route) } catch (e) {}
          return
        }
    
        // Fallback
        if (route && typeof route.setMap === 'function') {
          try { route.setMap(null) } catch (e) {}
        }
      } catch (e) {
        console.warn('clearAllRoutes: failed to remove route', e)
      }
    })
    allMarkerRoutes.length = 0
  }

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
      mapId: '8d43aa63b6c723647e82b411',
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
        allSchools.value = data.result.records;

        console.log(`Fetched ${allSchools.value.length} schools from API.`)

        allSchools.value.forEach(school => {
              const location = SCHOOL_COORDINATES[school.school_name]
              if (!location || !location.lat || !location.lng) {
                console.warn(`Missing coordinates for ${school.school_name}, skipping marker creation.`)
                return
              }
              const iconEle = document.createElement('img')
              iconEle.src = schoolIcon
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
                    padding: 12px;
                    max-width: 280px;
                    background-color: #ffe6f2; /* light pink background */
                    border-left: 4px solid #e91e63; /* deep pink accent */
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(233, 30, 99, 0.2); /* pinkish shadow */
                    color: #4a0033; /* dark plum text for contrast */
                  ">
                    <h3 style="
                      margin: 0 0 6px 0;
                      font-size: 16px;
                      color: #d81b60; /* rich pink header */
                    ">
                      ${school.school_name}
                    </h3>

                    <p style="margin: 4px 0; font-size: 14px;">
                      <strong>URL:</strong>
                      <a href="${school.url_address}" target="_blank" style="color:#ad1457; text-decoration:underline;">
                        ${school.url_address}
                      </a>
                    </p>

                    <p style="margin: 4px 0; font-size: 14px;">
                      <strong>Address:</strong> ${school.address}
                    </p>

                    <p style="margin: 4px 0; font-size: 14px;">
                      <strong>MRT:</strong> ${school.mrt_desc}
                    </p>

                    <p style="margin: 4px 0; font-size: 14px;">
                      <strong>Bus:</strong> ${school.bus_desc}
                    </p>
                  </div>
                `
              });

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
              // Store marker + school name
              allMarkers.value.push({ schoolName: school.school_name, marker })
        })
      })
  }


  // ==========Function to get distances for different travel modes==========
  async function getDistanceOfTargets() {
    // Clear previous routes and messages
    clearAllRoutes();
    inputMsg.value.innerHTML = '';

    const directionsService = new google.maps.DirectionsService();

    // Normalize origin and destination
    const normalizeLocation = (input) => {
      if (!input) return null;

      // Case 1: School name lookup
      const schoolCoords = SCHOOL_COORDINATES[input];
      if (schoolCoords) return schoolCoords;

      // Case 2: Home name (string match)
      const savedHomeName = JSON.parse(sessionStorage.getItem("home name") || "null");
      if (input === savedHomeName) {
        const homeCoords = JSON.parse(sessionStorage.getItem("home"));
        return homeCoords && typeof homeCoords.lat === "number" && typeof homeCoords.lng === "number"
          ? homeCoords
          : null;
      }

      // Case 3: Plain address string (fallback)
      if (typeof input === "string") return input.trim();

      // Case 4: LatLngLiteral already
      if (input.lat && input.lng) return input;

      return null;
    };

    const originPoint = normalizeLocation(source.value);
    const destinationPoint = normalizeLocation(destination.value);

    if (!originPoint || !destinationPoint) {
      console.warn("Invalid origin or destination", { originPoint, destinationPoint });
      return;
    }

    // Define travel modes with colors and icons
    const travelModes = [
      { mode: 'TRANSIT', color: 'orange', icon: 'subway' },
      { mode: 'DRIVING', color: 'red', icon: 'car' },
      { mode: 'WALKING', color: 'pink', icon: 'person-walking' }
    ];

    for (const { mode, color, icon } of travelModes) { 
      console.log("test");
      directionsService.route(
        {
          origin: originPoint,
          destination: destinationPoint,
          travelMode: mode
        },
        (response, status) => {
          if (status === 'OK') {
            console.log(response);
            const renderer = new google.maps.DirectionsRenderer({
              map,
              polylineOptions: { strokeColor: color, strokeWeight: 5 }
            });
            renderer.routeName = `${source.value} → ${destination.value}`;
            renderer.savedResult = response;
            renderer.setDirections(response);
            allMarkerRoutes.push(renderer);

            const { distance, duration } = response.routes[0].legs[0];
            inputMsg.value.innerHTML += `
              <div class="distance-item">
                <i class="fas fa-${icon} icon"></i>
                <div class="distance-text">
                  ${mode} distance: <strong>${distance.text} (${duration.text})</strong>
                </div>
              </div>
            `;

            const sessionDistanceData = {
              path: response.routes[0].overview_path.map(p => ({ lat: p.lat(), lng: p.lng() })),
              source: source.value,
              destination: destination.value,
              icon,
              mode,
              distance: distance.text,
              duration: duration.text
            };
            const savedDistances = JSON.parse(sessionStorage.getItem("distances")) || [];
            savedDistances.push(sessionDistanceData);
            sessionStorage.setItem("distances", JSON.stringify(savedDistances));
          } else {
            console.warn(`${mode} directions failed: ${status}`);
          }
        }
      );
    }
  }

  // ==========Function to load the homes address if present in session==========
  function loadHomeCoords() {
    if (sessionStorage.getItem("home")){
      source.value = JSON.parse(sessionStorage.getItem("home name"))
      sourceInput.value = JSON.parse(sessionStorage.getItem("home name"))
      showHomeForm.value = false;
    }

    const homeItem = sessionStorage.getItem("home")
    const homeName = sessionStorage.getItem("home name")
    if (!homeItem) return
    const position = JSON.parse(homeItem);
    const homeAddressName = JSON.parse(homeName)
    const markerContent = document.createElement('div')
    markerContent.style.backgroundImage = `url(${homeIcon})`
    markerContent.style.backgroundSize = 'cover'
    markerContent.style.width = '68px'
    markerContent.style.height = '68px'
    homeMarker.value = new google.maps.marker.AdvancedMarkerElement({
                        position: position,
                        map,
                        content: markerContent,
                        title: 'Home Location',
                        zIndex: 1000
                      })
  
    map.setCenter(homeMarker.value.position);
    map.setZoom(15);

    // Get distance of home marker when clicked
    homeMarker.value.addListener('click', () => {
      if (activeInputId.value) {
        const activeInput = activeInputId.value === 'source' ? source : destination
        activeInput.value = homeAddressName
      }
    })
  }

  // ==========Function to handle home address submission==========
  function handleHomeSubmit() {
    if (sessionStorage.getItem("home") != null) return
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
        markerContent.style.backgroundImage = `url(${homeIcon})`
        markerContent.style.backgroundSize = 'cover'
        markerContent.style.width = '68px'
        markerContent.style.height = '68px'

        if (homeMarker.value) {
          homeMarker.value.setMap(null)
        }

        const loc = { lat: location.lat(), lng: location.lng() };
        sessionStorage.setItem("home", JSON.stringify(loc));
        sessionStorage.setItem("home name", JSON.stringify(address));

        homeMarker.value = new google.maps.marker.AdvancedMarkerElement({
          position: location,
          map,
          content: markerContent,
          title: 'Home Location'
        })

        map.setCenter(homeMarker.value.position);
        map.setZoom(15);

        // Get distance of home marker when clicked
        homeMarker.value.addListener('click', () => {
          if (activeInputId.value) {
            const activeInput = activeInputId.value === 'source' ? source : destination
            activeInput.value = address
          }
        })

        // Update Source
        source.value = address
        sourceInput.value = address;

        // Hide Get Home Address
        showHomeForm.value = !showHomeForm.value;

      } else {
        console.error('Home geocode failed:', status)
        alert('Could not find the address. Please check and try again.')
      }
    })
  }

  const distances = ref([])

  // Group distances by "source → destination"
  const selectedTravelMode = ref('WALKING')

  // Function to sort
  const sortedGroupedDistances = computed(() => {
    const grouped = {}
    distances.value.forEach(item => {
      const key = `${item.source} → ${item.destination}`
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(item)
    })

    // Helper to parse duration strings like "1 hr 15 mins" to total minutes
    const parseDurationToMinutes = durationStr => {
      const hrMatch = durationStr.match(/(\d+)\s*hr/);
      const minMatch = durationStr.match(/(\d+)\s*min/);
      return (hrMatch ? parseInt(hrMatch[1]) * 60 : 0) + (minMatch ? parseInt(minMatch[1]) : 0);
    };

    // Convert grouped object to array for sorting
    const groupedEntries = Object.entries(grouped)

    // Sort groups by selected mode's duration ascending; put those missing mode at end
    groupedEntries.sort((a, b) => {
      const routeA = (a[0] || '').toString();
      const routeB = (b[0] || '').toString();
      const src = (source.value || '').toString().toLowerCase();

      // 1) Prioritise entries whose route name includes the current source.value
      //    (case-insensitive). If source is empty, this step is skipped.
      if (src) {
        const aHasSource = routeA.toLowerCase().includes(src);
        const bHasSource = routeB.toLowerCase().includes(src);
        if (aHasSource && !bHasSource) return -1;
        if (bHasSource && !aHasSource) return 1;
        // if both have or both don't have source, continue to next criteria
      }

      // 2) Then sort by whether the selected travel mode exists for the group
      const aRecords = a[1];
      const bRecords = b[1];
      const mode = (selectedTravelMode.value || '').toUpperCase();

      const aMatch = aRecords.find(r => (r.mode || '').toUpperCase() === mode);
      const bMatch = bRecords.find(r => (r.mode || '').toUpperCase() === mode);

      if (!aMatch && bMatch) return 1;  // put a after b if a doesn't have the mode
      if (!bMatch && aMatch) return -1; // put b after a if b doesn't have the mode

      // 3) Finally, if both have the mode, sort by parsed duration (ascending)
      if (aMatch && bMatch) {
        const aMinutes = parseDurationToMinutes(aMatch.duration || '');
        const bMinutes = parseDurationToMinutes(bMatch.duration || '');
        return aMinutes - bMinutes;
      }

      // 4) Otherwise keep original order
      return 0;
    });

    // Convert back to object for template iteration keeping grouping structure
    const sortedGrouped = {}
    groupedEntries.forEach(([key, val]) => { sortedGrouped[key] = val })

    return sortedGrouped
  })

  // C===========lear sessionStorage and reset state===========
  const clearStorage = () => {
    sessionStorage.removeItem("distances")
    distances.value = []
  }

  // ===========Get a mode-specific distance string===========
  const getDistance = (records, mode) => {
    const found = records.find(r => r.mode.toLowerCase() === mode.toLowerCase())
    return found ? `${found.mode} Distance ${found.distance} \n(${found.duration})` : '—'
  }

  // ===========Displays a route on the map===========
  const displayRoute = (routeName, mode = null) => {
    inputMsg.value.innerHTML = '';

    // Open Drawer
    if (!isDrawerOpen.value){
      toggleDrawer()
    }

    // Clear all existing routes from the map
    clearAllRoutes();

    loadSavedRoutesFromSession();

    // Clear Routed Schools
    routedSchools.value = []

    // Filter routes that match routeName and mode
    const savedDistances = JSON.parse(sessionStorage.getItem("distances")) || [];
    const matchingRoutes = savedDistances.filter(item => {
      const matchRoute = `${item.source} → ${item.destination}` === routeName;
      const matchMode = mode ? item.mode === mode : true;
      return matchRoute && matchMode;
    });

    // If no matching routes, exit
    if (!matchingRoutes.length) return;

    // Save Routed Schools if they are filtered out
    for (const route of matchingRoutes) {
      routedSchools.value.push(route.destination);
      routedSchools.value.push(route.source);
    }

    // Update the filtered displayed markers
    updateMarkers()

    // Show the matching polylines on the map
    const bounds = new google.maps.LatLngBounds();
    allMarkerRoutes.forEach(polyline => {
      const matchRoute = polyline.routeName === routeName;
      const matchMode = mode ? polyline.travelMode === mode : true;

      if (matchRoute && matchMode) {
        polyline.setMap(map);
        polyline.getPath().forEach(latlng => bounds.extend(latlng));
      } else {
        polyline.setMap(null);
      }
    });

    // Fit map to visible polylines
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds);
      google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
        if (map.getZoom() > 14) map.setZoom(14);
      });
    }

    // Display distance cards
    const icons = { WALKING: 'person-walking', DRIVING: 'car', TRANSIT: 'subway' };
    inputMsg.value.innerHTML = '';
    
    matchingRoutes.forEach(item => {
      const icon = icons[item.mode?.toUpperCase()] || 'question';
      inputMsg.value.innerHTML = `
        <div class="distance-item d-inline-block text-center m-2 p-3 border rounded shadow-sm" style="min-width: 180px;">
          <i class="fas fa-${icon} icon mb-2"></i>
          <div class="distance-text">
            ${item.mode} distance: <strong>${item.distance} (${item.duration})</strong>
          </div>
        </div>
      `;
    });

    // Saving previous distance cards code for future testing
    // // Display distance cards
    // const icons = { WALKING: 'person-walking', DRIVING: 'car', TRANSIT: 'subway' };
    // matchingRoutes.forEach(item => {
    //   const icon = icons[item.mode?.toUpperCase()] || 'question';
    //   inputMsg.value.innerHTML += `
    //     <div class="distance-item">
    //       <i class="fas fa-${icon} icon"></i>
    //       <div class="distance-text">
    //         ${item.mode} distance: <strong>${item.distance} (${item.duration})</strong>
    //       </div>
    //     </div>
    //   `;
    // });

    // Scroll to map
    const mapEl = document.getElementById('map'); 
    if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ===========Reload saved routes from session===========
  const loadSavedRoutesFromSession = () => {
    clearAllRoutes();
    const savedDistances = JSON.parse(sessionStorage.getItem("distances")) || [];

    allMarkerRoutes.length = 0;

    const modeColors = { WALKING: 'pink', TRANSIT: 'orange', DRIVING: 'red' };

    savedDistances.forEach(item => {
      const path = item.path.map(p => new google.maps.LatLng(p.lat, p.lng));

      const polyline = new google.maps.Polyline({
        path,
        strokeColor: modeColors[item.mode?.toUpperCase()] || 'yellow',
        strokeWeight: 5,
        map: null
      });

      polyline.routeName = `${item.source} → ${item.destination}`;
      polyline.travelMode = item.mode;

      allMarkerRoutes.push(polyline);
    });

    distances.value = savedDistances;
  };

/*  ===========Filter Code=========== */
const sharedFilters = ref({
  type: '',
  coed: '',
  region: ''
});

const hasActiveFilters = computed(() => {
  return Object.values(sharedFilters.value).some(value => value !== '');
});

function getSchoolType(school) {
  if (!school || !school.mainlevel_code) return 'Educational Institution';
  
  switch(school.mainlevel_code) {
    case 'PRIMARY':
      return 'Primary School';
    case 'SECONDARY':
      return 'Secondary School';
    case 'SECONDARY (S1-S4)':
      return 'Secondary School';
    case 'SECONDARY (S1-S5)':
      return 'Secondary School';
    case 'JUNIOR COLLEGE':
      return 'Junior College';
    case 'MIXED LEVEL (S1-JC2)':
      return 'Secondary School / Junior College';
    default:
      return 'Educational Institution';
  }
}

function getCoedStatus(schoolOrName) {
  let name = '';

  if (!schoolOrName) return 'true';
  if (typeof schoolOrName === 'string') {
    name = schoolOrName;
  } else if (typeof schoolOrName === 'object') {
    name = schoolOrName.school_name || schoolOrName.name || '';
  }

  name = name.toUpperCase();

  const boysKeywords = ['BOYS', 'ST. JOSEPH', 'ANGLO-CHINESE', "BOY'S", 'ANGLO CHINESE'];
  const girlsKeywords = ['GIRLS', 'CHIJ', 'METHODIST GIRLS', "GIRL'S"];

  if (boysKeywords.some(k => name.includes(k))) return 'false';
  if (girlsKeywords.some(k => name.includes(k))) return 'false';
  return 'true';
}

function getSchoolRegion(coords) {
  if (!coords || !coords.lat || !coords.lng) return '';
  
  if (coords.lat > 1.4) return 'NORTH';
  if (coords.lat < 1.3) return 'SOUTH';
  if (coords.lng > 103.9) return 'EAST';
  if (coords.lng < 103.7) return 'WEST';
  return 'CENTRAL';
}

function updateMarkers() {
  if (!allMarkers.value || !map) return;
  
  allMarkers.value.forEach(({ schoolName, marker }) => {
    const school = allSchools.value?.find(s => s.school_name === schoolName);
    if (!school) return;

    let isVisible = true;

    if (sharedFilters.value.type) {
      const schoolType = getSchoolType(school);
      isVisible = isVisible && schoolType.split(' / ').includes(sharedFilters.value.type);
    }

    if (sharedFilters.value.coed) {
      isVisible = isVisible && getCoedStatus(school) === sharedFilters.value.coed;
    }

    if (sharedFilters.value.region) {
      const coords = SCHOOL_COORDINATES[schoolName];
      isVisible = isVisible && getSchoolRegion(coords) === sharedFilters.value.region;
    }

    if (routedSchools.value.includes(schoolName)) {
      isVisible = true;
    }

    marker.setMap(isVisible ? map : null);
  });
}

const filteredSchools = computed(() => {
  const originalFiltered = (allSchools.value || []).filter(school => {
    let isVisible = true;

    // Type filter
    if (sharedFilters.value.type) {
      isVisible = isVisible && getSchoolType(school) === sharedFilters.value.type;
    }

    // Co-ed filter
    if (sharedFilters.value.coed) {
      isVisible = isVisible && getCoedStatus(school) === sharedFilters.value.coed;
    }

    // Region filter
    if (sharedFilters.value.region) {
      const coords = SCHOOL_COORDINATES[school.school_name];
      isVisible = isVisible && getSchoolRegion(coords) === sharedFilters.value.region;
    }

    return isVisible;
  });

  // Add routed schools back in
  const routedSchoolsIN = (allSchools.value || []).filter(school =>
    routedSchools.value.includes(school.school_name)
  );

  const combined = [...originalFiltered, ...routedSchoolsIN];
  return combined.filter((school, index, self) =>
    index === self.findIndex(s => s.school_name === school.school_name)
  );
});

function clearSharedFilters() {
  sharedFilters.value = {
    type: '',
    coed: '',
    region: ''
  };
  updateMarkers();
}

function resetSelections() {
  clearSharedFilters();
  source.value = '';
  destination.value = '';
  if (inputMsg.value) {
    inputMsg.value.innerHTML = '';
  }
  clearAllRoutes();
}

watch(sharedFilters, () => {
  updateMarkers();
}, { deep: true });

// Fix resetHomeAddress
function resetHomeAddress() {
  sessionStorage.removeItem("home");
  sessionStorage.removeItem("home name");
  showHomeForm.value = !showHomeForm.value;
  source.value = "";
  sourceInput.value = "";
}

// X button to remove distance card
function removeRoute(routeKey) {
  const [source, destination] = routeKey.split(' → ');

  distances.value = distances.value.filter(
    d => !(d.source === source && d.destination === destination)
  );
}

</script>

<template>
  <!-- SchoolFinders (School distance mapping) from Nic -->
  <div id="bodybg">
    <div class="container">

      <!-- Filters Section -->
      <div class="row justify-content-center mb-4">
        <div class="col-12 col-xl-11">
          <div class="filter-card glass-card rounded-4 shadow">
            <div class="filter-header">
              <h5 class="mb-0 text-center">Filter Schools</h5>
            </div>
            <div class="filter-body">
              <div class="row g-3 align-items-end">
                <div class="col-12 col-sm-6 col-lg-3">
                  <label class="filter-label d-block">School Type</label>
                  <select class="filter-select" v-model="sharedFilters.type" @change="updateMarkers">
                    <option value="">All Types</option>
                    <option value="Primary School">Primary School</option>
                    <option value="Secondary School">Secondary School</option>
                    <option value="Junior College">Junior College</option>
                    <option value="Educational Institution">Other</option>
                  </select>
                </div>

                <div class="col-12 col-sm-6 col-lg-3">
                  <label class="filter-label d-block">Co-educational</label>
                  <select class="filter-select" v-model="sharedFilters.coed" @change="updateMarkers">
                    <option value="">All</option>
                    <option value="true">Co-ed Only</option>
                    <option value="false">Single Gender</option>
                  </select>
                </div>

                <div class="col-12 col-sm-6 col-lg-3">
                  <label class="filter-label d-block">Region</label>
                  <select class="filter-select" v-model="sharedFilters.region" @change="updateMarkers">
                    <option value="">All Regions</option>
                    <option value="NORTH">North</option>
                    <option value="SOUTH">South</option>
                    <option value="EAST">East</option>
                    <option value="WEST">West</option>
                    <option value="CENTRAL">Central</option>
                  </select>
                </div>

                <div class="col-12 col-sm-6 col-lg-3">
                  <div class="d-flex gap-2">
                    <button class="filter-btn filter-btn-clear flex-fill" @click="clearSharedFilters">
                      Clear
                    </button>
                    <button class="filter-btn filter-btn-reset flex-fill" @click="resetSelections">
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              <!-- Filter Status -->
              <div class="row mt-4">
                <div class="col-12">
                  <div class="filter-status text-center">
                    <strong>Filtered Results:</strong> {{ filteredSchools.length }} schools
                    <span v-if="hasActiveFilters" class="filter-detail">
                      (from {{ allSchools.length }} total)
                    </span>
                    <div class="mt-2">
                      <span v-if="hasActiveFilters" class="filter-badge active">Filters Active</span>
                      <span v-else class="filter-badge">No Filters</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Map Section -->
      <div class="row justify-content-center mb-4">
        <div class="col-12 col-xl-11">
          <div class="glass-card assymetric-border shadow-lg map-only-container position-relative">
            <div class="d-flex flex-column" style="height: 40rem;">
              <div
                id="map"
                class="flex-grow-1 w-100"
                style="height: 100%; border-radius: 0.5rem; box-shadow: 0 5px 15px rgba(8, 66, 152, 0.3); background: #f0f7ff;"
              ></div>

              <!-- Drawer Toggle Button -->
              <button
                class="drawer-toggle-btn btn"
                @click="toggleDrawer"
                :class="{ 'drawer-open': isDrawerOpen }"
              >
                <i :class="isDrawerOpen ? 'fas fa-times' : 'fas fa-bars'"></i>
              </button>

              <!-- Side Drawer -->
              <div class="side-drawer" :class="{ 'open': isDrawerOpen }">
                <div class="drawer-content">
                  <h5 class="drawer-title">Map Controls</h5>

                  <!-- Home Address Form -->
                  <form v-if="showHomeForm" @submit.prevent="handleHomeSubmit()">
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
                      class="btn btn-primary w-100 mb-4"
                    >
                      Find Home Address
                    </button>
                  </form>

                  <!-- Reset Home Address -->
                  <button
                    v-if="!showHomeForm"
                    @click="resetHomeAddress()"
                    class="btn btn-primary w-100 mb-4"
                  >
                    Reset Home Address
                  </button>

                  <!-- Source Input -->
                  <div class="mb-3">
                    <label for="source" class="form-label">Source</label>
                    <input
                      type="text"
                      id="source"
                      name="source"
                      class="form-control"
                      ref="sourceInput"
                      v-model="source"
                      placeholder="Home Address"
                      readonly
                    />
                  </div>

                  <!-- Destination Input -->
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
                      placeholder="Click here to select a school marker!"
                      readonly
                    />
                  </div>

                  <!-- Distance Info -->
                  <div
                    id="inputMsg"
                    ref="inputMsg"
                    class="mt-3 d-flex flex-column gap-2"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Route Comparison Section -->
      <div class="row justify-content-center">
        <div class="col-12 col-xl-11">
          <div class="py-4">
            <div id="compareSection">
              <div class="row mb-4 g-3 align-items-center">
                <div class="col-12 col-md-6 col-lg-4">
                  <div class="d-flex align-items-center gap-2">
                    <label for="travelModeSelect" class="mb-0 text-nowrap fw-semibold">
                      Travel Mode:
                    </label>
                    <select
                      id="travelModeSelect"
                      v-model="selectedTravelMode"
                      class="form-select"
                    >
                      <option value="WALKING">Walking</option>
                      <option value="TRANSIT">Transit</option>
                      <option value="DRIVING">Driving</option>
                    </select>
                  </div>
                </div>
                <div class="col-12 col-md-6 col-lg-8">
                  <div class="d-flex justify-content-md-end gap-2">
                    <button class="btn btn-clear" @click="clearStorage">
                      <i class="fas fa-trash-alt me-1"></i> Clear All
                    </button>
                    <button class="btn btn-secondary" @click="loadSavedRoutesFromSession">
                      <i class="fas fa-sync-alt me-1"></i> Reload
                    </button>
                  </div>
                </div>
              </div>

              <div class="row g-3">
                <div
                  v-for="(records, route) in sortedGroupedDistances"
                  :key="route"
                  class="col-12"
                >
                  <div class="distance-card">
                    <div class="d-flex justify-content-between align-items-start">
                      <h5 class="route-title">{{ route }}</h5>
                      <!-- Remove button -->
                      <button 
                        type="button" 
                        class="btn-close" 
                        aria-label="Close"
                        @click.stop="removeRoute(route)"
                      ></button>
                    </div>
                    <div class="row text-center g-2 g-md-3">
                      <div
                        class="col-4 distance-mode walking"
                        @click.stop="displayRoute(route, 'WALKING')"
                      >
                        <i class="fas fa-person-walking fa-2x mb-2"></i>
                        <div class="small">{{ getDistance(records, 'Walking') }}</div>
                      </div>
                      <div
                        class="col-4 distance-mode transit"
                        @click.stop="displayRoute(route, 'TRANSIT')"
                      >
                        <i class="fas fa-subway fa-2x mb-2"></i>
                        <div class="small">{{ getDistance(records, 'Transit') }}</div>
                      </div>
                      <div
                        class="col-4 distance-mode driving"
                        @click.stop="displayRoute(route, 'DRIVING')"
                      >
                        <i class="fas fa-car fa-2x mb-2"></i>
                        <div class="small">{{ getDistance(records, 'Driving') }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

