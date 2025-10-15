var map;
var citizenStatus = ""; 
let distanceText = "";

const sourceInput = document.getElementById("source");
const destInput = document.getElementById("destination");

// Keep tracks of all routes, and closes them when a new distance mapping is needed
const allMarkerRoutes = [];

// When user clicks an input, set activeInputId accordingly
let activeInputId = null;

// Keep tracks of the selected markers coordinations for dynamic bound
let sourceMarkerBoundCoord = null;
let destinationMarkerBoundCoord = null;

  sourceInput.addEventListener("click", () => {
    activeInputId = "source";
    sourceInput.style.border = "2px solid blue";
    destInput.style.border = "";
  });

  destInput.addEventListener("click", () => {
    activeInputId = "destination";
    destInput.style.border = "2px solid blue";
    sourceInput.style.border = "";
  });

  const CUSTOM_BOUNDS = {
    north: 1.5,
    south: 1.22,
    west: 103.55,
    east: 104.08,
  };

function initMap() {
    // Center map on Singapore
    const center = {lat: 1.3621, lng: 103.8198};
    const options = {
        zoom: 11, 
        scaleControl: true, 
        center: center, 
        disableDefaultUI: true,
        mapId: "f41a3f2d53c48eebef372bfa",
        restriction: {
        latLngBounds: CUSTOM_BOUNDS,
        strictBounds: true, 
        },
        gestureHandling: "greedy",
    };

    map = new google.maps.Map(document.getElementById('map'), options);

    // used to get the coordiates of schools to display them as markers on the map
    const geocoder = new google.maps.Geocoder();

    // Keep tracks of all windows, and closes them when background of map is clicked
    const allInfoWindows = [];

    // Close all infoWindows on map click
    map.addListener("click", () => {
        allInfoWindows.forEach(({ infoW }) => {
        infoW.close();
        });
    });

    // Schools API 
    const datasetId = "d_688b934f82c1059ed0a6993d2a829089"
    const url = "https://data.gov.sg/api/action/datastore_search?resource_id="  + datasetId; 

    // Get general school information 
    fetch(url)
        .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        return response.json();
        })
        .then(data => {
        let allSchools = data.result.records;
        allSchools.forEach(school => {
            const schoolName = school.school_name
            geocoder.geocode({ address: schoolName }, (results, status) => {
            if (status === "OK") {
                if (results[0]) {
                // Get the long lat coordinates of each school
                const location = results[0].geometry.location;

                // Marker icon image
                const icon = "./school.png" 
                let iconEle = document.createElement("img");
                iconEle.src = icon;
                iconEle.style.width = "48px";
                iconEle.style.height = "48px";

                // Create the school's marker
                var marker = new google.maps.marker.AdvancedMarkerElement ({
                                                                position: location, 
                                                                map: map,
                                                                content: iconEle,
                                                            });

                // Create an info window for each marker
                const infoWindow = new google.maps.InfoWindow({
                    content: `<div>
                                <strong>${schoolName}</strong>
                                <p>URL Address: ${school.url_address}</p>
                                <br>
                                <p>Address: ${school.address}</p>
                                <p>MRT: ${school.mrt_desc}</p>
                                <p>Bus: ${school.bus_desc}</p>
                            </div>`,
                });

                // Adds infoWindow to an array for closing logic
                allInfoWindows.push({ name: schoolName, infoW: infoWindow });

                // Click eventListener to view each marker's school details 
                marker.addListener("click", () => {
                    // Allows for easy select of input source and destination
                    if (activeInputId){
                    // Add the name of the location to input field
                    const activeInput = document.getElementById(activeInputId)
                    activeInput.value = schoolName;

                    if (activeInputId == "source"){
                        sourceMarkerBoundCoord = marker.position;
                    } else if (activeInputId == "destination"){
                        destinationMarkerBoundCoord = marker.position;
                    }

                    // Display only the infoWindow of selected markers
                    let sourceInputEle = document.getElementById("source");
                    let destinationInputEle = document.getElementById("destination");
                    let sourceName = sourceInputEle.value;
                    let destinationName = destinationInputEle.value;
                    if (sourceName != "" && destinationName != ""){
                        allInfoWindows.forEach(({name, infoW})=>{
                        if (name != sourceName && name != destinationName){
                            infoW.close();
                        }
                        })
                    } 

                    // Trigger input field eventListener to initiate distance mapping
                    const event = new Event('change');
                    activeInput.dispatchEvent(event);
                    }
                    // Opens infoWindow for marker clicked
                    infoWindow.open({
                    anchor: marker,
                    map,
                    });
                    //
                });
                } else {
                console.log("No results found for the given address.");
                }
            } else {
                console.log("Geocoder failed due to: " + status);
            }
            });
        });
        })
        .catch(error => {
        console.error('Error fetching data:', error);
        });
    }


  // input to get distance between 2 locations
  const sourceEle =  document.getElementById("source");
  const destinationEle =  document.getElementById("destination");

  sourceEle.addEventListener("change", () => {
    getDistanceOfTargets()
  })

  destinationEle.addEventListener("change", () => {
    getDistanceOfTargets()
  })

  async function getDistanceOfTargets(){
    // Remove all previous markerRoutes
    allMarkerRoutes.forEach((route)=>{
      route.setMap(null);
    })

    // Reset Distance msg 
    let inputMsgEle = document.getElementById("inputMsg");
    inputMsgEle.innerText = "";

    const geocoder = new google.maps.Geocoder();
    if (sourceEle.value == "" || destinationEle.value == ""){
      return;
    }

    const sourceAddress = sourceEle.value;
    const destinationAddress = destinationEle.value;

    try {
      const sourceResults = await geocoder.geocode({ address: sourceAddress });
      const destinationResults = await geocoder.geocode({ address: destinationAddress });

      const sourceCoord = sourceResults.results[0].geometry.location;
      const destinationCoord = destinationResults.results[0].geometry.location;

      // Get driving distance 
      let directionsService = new google.maps.DirectionsService();

      
      // TRANSIT
      const transitRoute = {
        origin: sourceCoord,
        destination: destinationCoord,
        travelMode: 'TRANSIT'
      };

      directionsService.route(transitRoute, function(response, status) {
        if (status !== 'OK') {
          window.alert('Directions request failed due to ' + status);
          return;
        }
        let directionsRenderer = new google.maps.DirectionsRenderer();
        // Add route to allMarkerRoutes array
        allMarkerRoutes.push(directionsRenderer);
        directionsRenderer.setMap(map);
        directionsRenderer.setOptions({
          polylineOptions: {
            strokeColor: 'pink',
            strokeWeight: 5
          }
        });
        directionsRenderer.setDirections(response);
        var directionsData = response.routes[0].legs[0];
        if (directionsData) {
            document.getElementById('inputMsg').innerHTML += `
            <div class="distance-item" style="animation-delay: 0.3s;">
                <i class="fas fa-subway icon"></i>
                <div class="distance-text">
                MRT distance is <strong>${directionsData.distance.text} (${directionsData.duration.text})</strong>
                </div>
            </div>
            `;
        }
      });

      // DRIVING
      const driveRoute = {
        origin: sourceCoord,
        destination: destinationCoord,
        travelMode: 'DRIVING'
      };

      directionsService.route(driveRoute, function(response, status) {
        if (status !== 'OK') {
          window.alert('Directions request failed due to ' + status);
          return;
        }
        let directionsRenderer = new google.maps.DirectionsRenderer();
        // Add route to allMarkerRoutes array
        allMarkerRoutes.push(directionsRenderer);
        directionsRenderer.setMap(map);
        directionsRenderer.setOptions({
          polylineOptions: {
            strokeColor: 'red',
            strokeWeight: 5
          }
        });
        directionsRenderer.setDirections(response);
        var directionsData = response.routes[0].legs[0];
        if (directionsData) {
            document.getElementById('inputMsg').innerHTML += `
            <div class="distance-item" style="animation-delay: 0.9s;">
                <i class="fas fa-car icon"></i>
                <div class="distance-text">
                Driving distance is <strong>${directionsData.distance.text} (${directionsData.duration.text})</strong>
                </div>
            </div>
            `;
        }
      });

      // WALKING
      const walkRoute = {
        origin: sourceCoord,
        destination: destinationCoord,
        travelMode: 'WALKING'
      };

      directionsService.route(walkRoute, function(response, status) {
        if (status !== 'OK') {
          window.alert('Directions request failed due to ' + status);
          return;
        }
        let directionsRenderer = new google.maps.DirectionsRenderer();
        // Add route to allMarkerRoutes array
        allMarkerRoutes.push(directionsRenderer);
        directionsRenderer.setMap(map);
        directionsRenderer.setOptions({
          polylineOptions: {
            strokeColor: 'orange',
            strokeWeight: 5
          }
        });
        directionsRenderer.setDirections(response);
        var directionsData = response.routes[0].legs[0];
        if (directionsData) {
            document.getElementById('inputMsg').innerHTML += `
            <div class="distance-item" style="animation-delay: 0.3s;">
                <i class="fas fa-person-walking icon"></i>
                <div class="distance-text">
                Walking distance is <strong>${directionsData.distance.text} (${directionsData.duration.text})</strong>
                </div>
            </div>
            `;
        }
      });
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  }

  function handleSubmit(event){
    event.preventDefault();

    let homeEle = document.getElementById("home");
    let homeAddrInput = homeEle.value.trim();
    if (homeAddrInput == ""){
      alert("Home address: Please input something");
      return;
    }

    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address: homeAddrInput }, (results, status) => {
      if (status === "OK") {
        // Location of home address
        const location = results[0].geometry.location;
        console.log("Latitude:", location.lat());
        console.log("Longitude:", location.lng());

        const homeMarkerIcon = './home.png';

        // Create a custom div with the image as background
        const markerContent = document.createElement("div");
        markerContent.style.backgroundImage = `url(${homeMarkerIcon})`;
        markerContent.style.backgroundSize = "cover";
        markerContent.style.width = "48px";
        markerContent.style.height = "48px";

        // Create the advanced marker
        const homeMarker = new google.maps.marker.AdvancedMarkerElement({
          position: location,
          map: map,
          content: markerContent,
          title: "Home Location", 
        });

        homeMarker.addListener("click",()=>{
          // Allows for easy select of input source and destination
          if (activeInputId){
            // Add the name of the location to input field
            const activeInput = document.getElementById(activeInputId)
            activeInput.value = homeAddrInput;

            // Trigger input field eventListener to initiate distance mapping
            const event = new Event('change');
            activeInput.dispatchEvent(event);
          }
        })
                                                  
      } else {
        console.log("Error is finding home address: ", status);
        alert("Could not find the address. Please check and try again.");
      }
    })
  }
