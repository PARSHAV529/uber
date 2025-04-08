var source, destination;
var pts = [];
let price;
let distance;

function initMap1() {
  map = new MapmyIndia.Map("map", {
    center: [23.0736298, 72.5141419],
    zoomControl: true,
    location: true,
    backgroundColor: "red",
  });
}

async function getCoordinates(place) {
  console.log(place);

  const response = await fetch(
    `https://maps.gomaps.pro/maps/api/geocode/json?address=${place}&key=AlzaSyzq4aBSOOGhS0QAvkqblTrgu4vM10U1wWu`
  );
  const data = await response.json();
  console.log(data);

  if (data.results && data.results.length > 0) {
    return {
      lat: data.results[0].geometry.location.lat,
      lng: data.results[0].geometry.location.lng,
    };
  } else {
    throw new Error("Place not found!");
  }
}

async function fetchMap(start, end) {
  const apiKey = "7baa4e6a-41d3-4eab-a679-fdbbebabc12a";
  const response = await fetch(
    `https://graphhopper.com/api/1/route?point=${start}&point=${end}&vehicle=car&key=${apiKey}&points_encoded=false`
  );
  const data = await response.json();

  if (!data.paths || !data.paths[0]) {
    throw new Error("No route found in response");
  }

  const route = data.paths[0].points.coordinates;
  console.log(route);

  route.forEach((pt) => {
    var newpt = { lat: pt[1], lng: pt[0] };
    pts.push(newpt);
  });
  pts.push({ lat: destination.lat, lng: destination.lng });

  console.log(pts);
}

function initMap(source, destination) {
  const map = new MapmyIndia.Map("map", {
    center: [source.lat, source.lng],
    zoomControl: true,
    location: true,
    // minZoom: 10,
  });

  new MapmyIndia.Marker({
    map: map,
    position: { lat: source.lat, lng: source.lng },
    draggable: true,
  });

  new MapmyIndia.Marker({
    map: map,
    position: { lat: destination.lat, lng: destination.lng },
    draggable: true,
  });

  new MapmyIndia.Circle({
    map: map,
    center: { lat: source.lat, lng: source.lng },
    radius: 100, // Radius in meters
    fillOpacity: 0.3,
    fillColor: "black",
    strokeColor: "red",
    strokeOpacity: 0.8,
    strokeWeight: 2,
  });

  new MapmyIndia.Polyline({
    map: map,
    paths: pts,
    strokeColor: "blue",
    strokeOpacity: 1.0,
    strokeWeight: 4,
    fitbounds: true,
  });

  document.getElementById("loader").classList.remove("loader");
}

document.addEventListener("DOMContentLoaded", () => {
  //initMap1();

  const pickupLocation = document.getElementById("pickup-location");
  const dropoffLocation = document.getElementById("dropoff-location");

  const clearPickup = document.getElementById("pickup-location-clear");
  const clearDropoff = document.getElementById("dropoff-location-clear");
  const btn = document.getElementById("search-btn");

  btn.addEventListener("click", searchRide);

  handleSearchBtn();

  clearPickup.style.display = pickupLocation.value.length > 0 ? "flex" : "none";

  pickupLocation.addEventListener("input", () => {
    console.log("hiiiiii");
    clearPickup.style.display =
      pickupLocation.value.length > 0 ? "flex" : "none";

    handleSearchBtn();
  });

  clearDropoff.style.display =
    dropoffLocation.value.length > 0 ? "inline" : "none";

  dropoffLocation.addEventListener("input", () => {
    clearDropoff.style.display =
      dropoffLocation.value.length > 0 ? "inline" : "none";

    handleSearchBtn();
  });

  clearPickup.addEventListener("click", () => {
    pickupLocation.value = "";
    clearPickup.style.display = "none";

    handleSearchBtn();
  });

  clearDropoff.addEventListener("click", () => {
    dropoffLocation.value = "";
    clearDropoff.style.display = "none";
    handleSearchBtn();
  });

  function handleSearchBtn() {
    if (pickupLocation.value.length > 0 && dropoffLocation.value.length > 0) {
      btn.disabled = false;
      btn.style.cursor = "pointer";
      btn.style.color = "#ffff";
      btn.style.backgroundColor = "rgb(40, 40, 40)";
    } else {
      btn.disabled = true;
      btn.style.cursor = "not-allowed";
      btn.style.color = "rgb(145, 145, 145)";
      btn.style.backgroundColor = "rgb(243, 243, 243)";
    }
  }

  async function searchRide() {
    console.log("called");
    btn.disabled = true;
    btn.style.cursor = "not-allowed";
    btn.style.color = "rgb(145, 145, 145)";
    btn.style.backgroundColor = "rgb(243, 243, 243)";
    document.getElementById("loader").style.display = "block";
    pts = [];

    let loader = document.getElementById("loader");

    loader.classList.add("loader");

    source = document.getElementById("pickup-location").value;
    destination = document.getElementById("dropoff-location").value;

    try {
      source = await getCoordinates(source);
    } catch (error) {
      console.log("error", error);
      document.getElementById("loader").classList.remove("loader");
      Toastify({
        text: "Source not found",
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        backgroundColor: "#e74c3c",
        stopOnFocus: true,
        className: "toastify",
      }).showToast();
    }

    try {
      destination = await getCoordinates(destination);
    } catch (error) {
      console.log("error", error);
      document.getElementById("loader").classList.remove("loader");

      Toastify({
        text: "Destination not found",
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        backgroundColor: "#e74c3c",
        stopOnFocus: true,
        className: "toastify",
      }).showToast();
    }

    console.log(`Source: ${source.lat}, ${source.lng}`);
    console.log(`Destination: ${destination.lat}, ${destination.lng}`);

    pts.push({ lat: source.lat, lng: source.lng });

    await fetchMap(
      `${source.lat},${source.lng}`,
      `${destination.lat},${destination.lng}`
    );

    initMap(source, destination);
    source = document.getElementById("pickup-location").value;
    destination = document.getElementById("dropoff-location").value;
    let url = `https://maps.gomaps.pro/maps/api/distancematrix/json?origins=${source}&destinations=${destination}&key=AlzaSy5Oly-gmyMVfGUBxTpNiKWIqMjTfdKe-1I`;
    console.log(url);
    const response = await fetch(
      `https://maps.gomaps.pro/maps/api/distancematrix/json?origins=${source}&destinations=${destination}&key=AlzaSy5Oly-gmyMVfGUBxTpNiKWIqMjTfdKe-1I`
    );

    const json = await response.json();
    console.log("json data", json);
    console.log(json.rows[0].elements[0].duration.text);
    const mymin = Math.floor(json.rows[0].elements[0].duration.value / 60);
    const date = new Date();

    var hours = date.getHours();
    var minutes = date.getMinutes() + mymin;

    if (minutes > 59) {
      hours += Math.floor(minutes / 60);
      minutes = minutes % 60;
    }

    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var ampm = hours >= 12 ? "pm" : "am";
    var strTime = hours + ":" + minutes + " " + ampm;
    console.log(json.rows[0].elements[0].distance.value);

    distance = json.rows[0].elements[0].distance.value;

    let bikeAmount = Math.round(
      json.rows[0].elements[0].distance.value * 0.0103
    );
    let autoAmount = Math.round(
      json.rows[0].elements[0].distance.value * 0.014
    );
    let carAmount = Math.round(json.rows[0].elements[0].distance.value * 0.025);
    document.getElementById(
      "vehicle-cards"
    ).innerHTML = `<div class="cards" data-selected="true" data-type="cab">
              <div>
                <img
                  alt="Premier"
                  height="100"
                  src="https://d1a3f4spazzrp4.cloudfront.net/car-types/haloProductImages/package_UberComfort_new_2022.png"
                />
              </div>
              <div>
                <h2>Go Sedan</h2>
                <p class="dist">${json.rows[0].elements[0].duration.text} away <span class="time">${strTime}</span></p>
              </div>
              <div>
                <p class="amt">₹${carAmount}</p>
              </div>
            </div>
            <div class="cards" data-selected="false" data-type="auto">
              <div>
                <img
                  alt="Auto"
                  height="124"
                  src="https://d1a3f4spazzrp4.cloudfront.net/car-types/haloProductImages/v1.1/TukTuk_Green_v1.png"
                />
              </div>
              <div>
                <h2>Auto</h2>
                <p class="dist">${json.rows[0].elements[0].duration.text} away <span class="time">${strTime}</span></p>
              </div>
              <div>
                <p class="amt">₹${autoAmount}</p>
              </div>
            </div>
            <div class="cards" data-selected="false" data-type="moto">
              <div>
                <img
                  alt="Moto"
                  height="124"
                  src="https://d1a3f4spazzrp4.cloudfront.net/car-types/haloProductImages/v1.1/Uber_Moto_India1.png"
                />
                
              </div>
              <div>
                <h2>Moto</h2>
                <p class="dist">${json.rows[0].elements[0].duration.text} away <span class="time">${strTime}</span></p>
              </div>
              <div>
                <p class="amt">₹${bikeAmount}</p>
              </div>
            </div>`;
    document.getElementById("loader").style.display = "none";
    const content = document.getElementsByClassName("content")[0];
    const header = document.getElementById("header");
    const mainContent = document.getElementsByClassName("main-content")[0];
    const mainMap = document.getElementsByClassName("main-map")[0];
    const sidebar = document.getElementsByClassName("sidebar")[0];
    const rideInfoHeader =
      document.getElementsByClassName("ride-info-header")[0];

    rideInfoHeader.innerText = "Ride details";

    const cards = document.getElementsByClassName("cards");

    for (let card of cards) {
      cards[0].style.border = "2px solid black";
      card.addEventListener("click", selectRide);
      card.style.border = "2px solid #ffff";
    }

    // sidebar.style.width = "10%";
    mainMap.style.width = "35%%";
    mainContent.style.width = "65%";

    content.classList.remove("hidden");
    header.classList.remove("hidden");
  }
  function selectRide(event) {
    const cards = document.getElementsByClassName("cards");

    for (let card of cards) {
      card.style.border = "2px solid #ffff";
      card.dataset.selected = "false";
    }

    if (event.target.className == "cards") {
      event.target.style.border = "2px solid black";
      event.target.dataset.selected = "true";
    } else if (event.target.parentElement.className == "cards") {
      event.target.parentElement.style.border = "2px solid black";
      event.target.parentElement.dataset.selected = "true";
    } else if (event.target.parentElement.parentElement.className == "cards") {
      event.target.parentElement.parentElement.style.border = "2px solid black";
      event.target.parentElement.parentElement.dataset.selected = "true";
    } else if (
      event.target.parentElement.parentElement.parentElement.className ==
      "cards"
    ) {
      event.target.parentElement.parentElement.parentElement.style.border =
        "2px solid black";
      event.target.parentElement.parentElement.parentElement.dataset.selected =
        "true";
    }
  }
});
const requestRide = document.getElementsByClassName("request-btn")[0];

requestRide.addEventListener("click", async () => {
  console.log("request for the ride");

  const source = document.getElementById("pickup-location").value;
  const destination = document.getElementById("dropoff-location").value;

  const vehicles = document.getElementsByClassName("cards");
  let vehicleType = "";

  for (let vehicle of vehicles) {
    if (vehicle.dataset.selected === "true") {
      vehicleType = vehicle.dataset.type;
    }
  }

  let fare_amount;

  if (vehicleType === "moto") {
    fare_amount = Math.round(distance * 0.0103);
  } else if (vehicleType === "auto") {
    fare_amount = Math.round(distance * 0.014);
  } else {
    fare_amount = Math.round(distance * 0.025);
  }

  console.log("type", vehicleType);

  distance = distance / 1000;

  const response = await fetch("/uber/api/rider/request-ride/", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      source: source,
      destination: destination,
      vehicleType: vehicleType,
      distance: distance,
      fare_amount: fare_amount,
    }),
  });
  if (response.status === 201) {
    let data = await response.json();
    console.log(data.message);

    location.href = "/uber/rider/request";
  } else {
    let data = await response.json();
    console.log(data.message);
  }
});
function toggleDropdown() {
  console.log("toggle");
  const dropdown = document.getElementById("aboutDropdown");
  const toggleLink = document.querySelector("#About");
  dropdown.classList.toggle("show");
  toggleLink.setAttribute("aria-expanded", dropdown.classList.contains("show"));
}

window.onclick = function (event) {
  if (!event.target.matches("#About")) {
    const dropdowns = document.getElementsByClassName("dropdown");
    for (let i = 0; i < dropdowns.length; i++) {
      const openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
        const toggleLink = document.querySelector("#About");
        toggleLink.setAttribute("aria-expanded", "false");
      }
    }
  }
};

document.addEventListener("DOMContentLoaded", function () {
  const pickupInput = document.getElementById("pickup-location");
  const dropoffInput = document.getElementById("dropoff-location");
  const sourceSuggestions = document.getElementById("source-suggestions");
  const destSuggestions = document.getElementById("destination-suggestions");
  let debounceTimer;

  function setupAutocomplete(input, suggestionsDiv, isSource = false) {
    input.addEventListener("click", function () {
      if (
        isSource &&
        (!suggestionsDiv.style.display ||
          suggestionsDiv.style.display === "none")
      ) {
        showCurrentLocationOption(input, suggestionsDiv);
      }
    });

    input.addEventListener("input", function () {
      clearTimeout(debounceTimer);
      suggestionsDiv.style.display = "none";
      debounceTimer = setTimeout(async () => {
        const query = input.value;
        if (query.length > 0) {
          try {
            const response = await fetch(
              `https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(
                query
              )}&api_key=jkVOPvqEWskRwgMNvZDbpXevwGfdagTFu9gj4hdz`
            );
            const data = await response.json();
            if (data.status === "ok" && data.predictions.length > 0) {
              displaySuggestions(
                input,
                suggestionsDiv,
                data.predictions,
                isSource
              );
            } else if (isSource) {
              showCurrentLocationOption(input, suggestionsDiv);
            }
          } catch (error) {
            console.error("Autocomplete error:", error);
            if (isSource) showCurrentLocationOption(input, suggestionsDiv);
          }
        } else if (isSource) {
          showCurrentLocationOption(input, suggestionsDiv);
        }
      }, 300);
    });

    document.addEventListener("click", function (e) {
      if (!suggestionsDiv.contains(e.target) && e.target !== input) {
        suggestionsDiv.style.display = "none";
      }
    });
  }

  function showCurrentLocationOption(input, suggestionsDiv) {
    suggestionsDiv.innerHTML = "";
    const currentLocationItem = document.createElement("div");
    currentLocationItem.className = "suggestion-item";
    currentLocationItem.innerHTML =
      '<i class="fa-solid fa-location-crosshairs"></i> Current Location';

    currentLocationItem.addEventListener("click", async () => {
      if (navigator.geolocation) {
        // Replace text with loader while fetching
        currentLocationItem.innerHTML =
          '<div class="suggestion-loader"></div> Fetching Location...';
        currentLocationItem.style.pointerEvents = "none"; // Disable clicking while loading

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            try {
              const response = await fetch(
                `https://api.olamaps.io/places/v1/reverse-geocode?latlng=${lat},${lng}&api_key=jkVOPvqEWskRwgMNvZDbpXevwGfdagTFu9gj4hdz`
              );
              const data = await response.json();
              if (data.status === "ok" && data.results.length > 0) {
                input.value = data.results[0].formatted_address;
              } else {
                input.value = "Current Location";
              }
            } catch (error) {
              console.error("Reverse geocoding error:", error);
              input.value = "Current Location";
            }
            const clearPickup = document.getElementById(
              "pickup-location-clear"
            );
            clearPickup.style.display =
              input.value.length > 0 ? "flex" : "none";
            suggestionsDiv.style.display = "none";
            // Reset item after fetch (though it’s hidden now, good for consistency)
            currentLocationItem.innerHTML =
              '<i class="fa-solid fa-location-crosshairs"></i> Current Location';
            currentLocationItem.style.pointerEvents = "auto";
          },
          (error) => {
            console.error("Geolocation error:", error);
            alert("Unable to retrieve current location");
            suggestionsDiv.style.display = "none";
            currentLocationItem.innerHTML =
              '<i class="fa-solid fa-location-crosshairs"></i> Current Location';
            currentLocationItem.style.pointerEvents = "auto";
          }
        );
      } else {
        alert("Geolocation is not supported by this browser");
        suggestionsDiv.style.display = "none";
      }
    });
    suggestionsDiv.appendChild(currentLocationItem);
    suggestionsDiv.style.display = "block";
  }

  function displaySuggestions(input, suggestionsDiv, predictions, isSource) {
    suggestionsDiv.innerHTML = "";
    if (isSource) {
      const currentLocationItem = document.createElement("div");
      currentLocationItem.className = "suggestion-item";
      currentLocationItem.innerHTML =
        '<i class="fa-solid fa-location-crosshairs"></i> Current Location';

      currentLocationItem.addEventListener("click", async () => {
        if (navigator.geolocation) {
          // Show loader while fetching
          currentLocationItem.innerHTML =
            '<div class="suggestion-loader"></div> Fetching Location...';
          currentLocationItem.style.pointerEvents = "none";

          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              try {
                const response = await fetch(
                  `https://api.olamaps.io/places/v1/reverse-geocode?latlng=${lat},${lng}&api_key=jkVOPvqEWskRwgMNvZDbpXevwGfdagTFu9gj4hdz`
                );
                const data = await response.json();
                if (data.status === "ok" && data.results.length > 0) {
                  input.value = data.results[0].formatted_address;
                } else {
                  input.value = "Current Location";
                }
              } catch (error) {
                console.error("Reverse geocoding error:", error);
                input.value = "Current Location";
              }
              const clearPickup = document.getElementById(
                "pickup-location-clear"
              );
              clearPickup.style.display =
                input.value.length > 0 ? "flex" : "none";
              suggestionsDiv.style.display = "none";
              currentLocationItem.innerHTML =
                '<i class="fa-solid fa-location-crosshairs"></i> Current Location';
              currentLocationItem.style.pointerEvents = "auto";
            },
            (error) => {
              console.error("Geolocation error:", error);
              alert("Unable to retrieve current location");
              suggestionsDiv.style.display = "none";
              currentLocationItem.innerHTML =
                '<i class="fa-solid fa-location-crosshairs"></i> Current Location';
              currentLocationItem.style.pointerEvents = "auto";
            }
          );
        } else {
          alert("Geolocation is not supported by this browser");
          suggestionsDiv.style.display = "none";
        }
      });
      suggestionsDiv.appendChild(currentLocationItem);
    }

    predictions.forEach((prediction) => {
      const item = document.createElement("div");
      item.className = "suggestion-item";
      item.textContent = prediction.description;
      item.addEventListener("click", () => {
        input.value = prediction.description;
        suggestionsDiv.style.display = "none";
      });
      suggestionsDiv.appendChild(item);
    });
    suggestionsDiv.style.display = "block";
  }

  setupAutocomplete(pickupInput, sourceSuggestions, true);
  setupAutocomplete(dropoffInput, destSuggestions, false);
});
