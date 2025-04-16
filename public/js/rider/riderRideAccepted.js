let mapInstance,
  olaMapsInstance,
  sourceMarker,
  destMarker,
  driverMarker,
  routePolyline = [];
let isPickedUp = false;
let vehicleType = "";

const olaMaps = new OlaMaps({
  apiKey: "BLNwFEGKM4Xsj1EcHTCTo0abDSIXP8aFJlRZFrKb",
});
olaMapsInstance = olaMaps;
mapInstance = olaMaps.init({
  style:
    "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
  container: "map",
  center: [72.6245, 23.0339],
  zoom: 12,
});

function findClosestRouteIndex(liveCoords) {
  let minDistance = Infinity;
  let closestIndex = 0;
  for (let i = 0; i < routePolyline.length; i++) {
    const routePoint = routePolyline[i];
    const distance = Math.sqrt(
      Math.pow(liveCoords[0] - routePoint[0], 2) +
        Math.pow(liveCoords[1] - routePoint[1], 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = i;
    }
  }
  return closestIndex;
}
// console.log("connecting");
let socket = io();
// console.log("connected");

socket.on("connection", () => {
  console.log("Connected to server");
});

// socket.emit("registerRider", 1);

socket.on("driver-location/9", (data) => {
  console.log("received", data);
  const liveCoords = [data.lng, data.lat];
  // console.log("Received Live Driver Coordinates:", liveCoords);

  const closestIndex = findClosestRouteIndex(liveCoords);
  const newDriverCoords = routePolyline[closestIndex];
  driverMarker.setLngLat(newDriverCoords);
  // console.log("Driver snapped to route at:", newDriverCoords);

  const remainingPolyline = routePolyline.slice(closestIndex);
  const routeGeojson = {
    type: "Feature",
    geometry: { type: "LineString", coordinates: remainingPolyline },
  };
  mapInstance.getSource("route-source").setData(routeGeojson);

  const destCoords = routePolyline[routePolyline.length - 1];
  const distanceToDest = Math.sqrt(
    Math.pow(liveCoords[0] - destCoords[0], 2) +
      Math.pow(liveCoords[1] - destCoords[1], 2)
  );
  if (distanceToDest < 0.0001) {
    if (!isPickedUp) {
      alert("Your driver has arrived at pickup");
      isPickedUp = true;
      startTimeOutOtp();
      let cancelBtn = document.getElementById("cancel-ride-btn");
      cancelBtn.parentElement.removeChild(cancelBtn);
      sourceMarker.remove();
    } else {
      alert("You have reached your destination");
      setTimeout(() => {
        document.getElementsByClassName("reviewRideModal")[0].style.display =
          "flex";
      }, 3000);
    }
  }
});

async function geocodeAddress(address) {
  try {
    const response = await fetch(
      `https://api.olamaps.io/places/v1/geocode?address=${encodeURIComponent(
        address
      )}&api_key=BLNwFEGKM4Xsj1EcHTCTo0abDSIXP8aFJlRZFrKb`
    );
    const data = await response.json();
    if (data.geocodingResults && data.geocodingResults.length > 0) {
      return [
        data.geocodingResults[0].geometry.location.lng,
        data.geocodingResults[0].geometry.location.lat,
      ];
    }
    throw new Error("No results found for address");
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

function decodePolyline(encoded) {
  let points = [];
  let index = 0,
    len = encoded.length;
  let lat = 0,
    lng = 0;
  while (index < len) {
    let b,
      shift = 0,
      result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;
    points.push([lng / 1e5, lat / 1e5]);
  }
  return points;
}

async function calculateRoute(sourceCoords, destCoords) {
  try {
    const response = await fetch(
      `https://api.olamaps.io/routing/v1/directions?origin=${sourceCoords[1]},${sourceCoords[0]}&destination=${destCoords[1]},${destCoords[0]}&api_key=BLNwFEGKM4Xsj1EcHTCTo0abDSIXP8aFJlRZFrKb`,
      { method: "POST" }
    );
    const data = await response.json();
    if (data.status === "SUCCESS" && data.routes && data.routes.length > 0) {
      routePolyline = decodePolyline(data.routes[0].overview_polyline);
      routePolyline.unshift(sourceCoords);
      routePolyline.push(destCoords);

      const routeGeojson = {
        type: "Feature",
        geometry: { type: "LineString", coordinates: routePolyline },
      };
      if (mapInstance.getSource("route-source")) {
        mapInstance.removeLayer("route-layer");
        mapInstance.removeSource("route-source");
      }
      mapInstance.addSource("route-source", {
        type: "geojson",
        data: routeGeojson,
      });
      mapInstance.addLayer({
        id: "route-layer",
        type: "line",
        source: "route-source",
        paint: { "line-color": "blue", "line-width": 5, "line-opacity": 1 },
      });

      if (!isPickedUp) {
        if (sourceMarker) sourceMarker.remove();
        const sourceMarkerElement = document.createElement("div");
        sourceMarkerElement.classList.add(
          "sourceMarker",
          "fa-solid",
          "fa-person"
        );
        sourceMarker = olaMapsInstance
          .addMarker({
            element: sourceMarkerElement,
            offset: [0, 0],
            anchor: "center",
          })
          .setLngLat(destCoords)
          .addTo(mapInstance);
      }

      if (isPickedUp) {
        if (destMarker) destMarker.remove();
        const destMarkerElement = document.createElement("div");
        destMarkerElement.classList.add(
          "destMarker",
          "fa-solid",
          "fa-location-dot"
        );
        destMarker = olaMapsInstance
          .addMarker({
            element: destMarkerElement,
            offset: [0, 0],
            anchor: "center",
          })
          .setLngLat(destCoords)
          .addTo(mapInstance);
      }

      if (driverMarker) driverMarker.remove();
      // console.log(("vehicle", vehicleType));
      const driverMarkerElement = document.createElement("div");
      driverMarkerElement.classList.add("driverMarker", `${vehicleType}`);
      driverMarker = olaMapsInstance
        .addMarker({
          element: driverMarkerElement,
          offset: [0, 0],
          anchor: "center",
        })
        .setLngLat(sourceCoords)
        .addTo(mapInstance);

      const bounds = routePolyline.reduce(
        (bounds, coord) => [
          [Math.min(bounds[0][0], coord[0]), Math.min(bounds[0][1], coord[1])],
          [Math.max(bounds[1][0], coord[0]), Math.max(bounds[1][1], coord[1])],
        ],
        [sourceCoords, sourceCoords]
      );
      mapInstance.fitBounds(bounds, { padding: 100, maxZoom: 15 });
    } else {
      console.error("No route found");
    }
  } catch (error) {
    console.error("Routing error:", error);
  }
}

async function startTrip() {
  let data;
  const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
// console.log(id);

  try {
    const response = await fetch(`/uber/api/rider/get-directions?id=${id}`);
    data = await response.json();
  } catch (error) {
    console.error("Failed to fetch directions, using mock data:", error);
  }
console.log(" for otpppppppppppp",data);


    document.getElementById(
      "vehicle-info"
    ).innerText = `${data.data[0][0].type} • ${data.data[0][0].number_plate} • ${data.data[0][0].colour}`;
    document.getElementById("otp-text").innerText = data.data[0][0].otp;
    document.getElementById(
      "driver-name"
    ).innerText = `${data.data[0][0].first_name} ${data.data[0][0].last_name}`;
    // console.log("directions", data.data[0][0].fare_amount);
    document.getElementById("pickup-location").innerText =
      data.data[0][0].pickup_location;
    pickup_location = data.data[0][0].pickup_location;
    document.getElementById("drop-location").innerText =
      data.data[0][0].drop_location;
  

  if (data.data[0][0].type === "moto") {
    vehicleType = "bikeMarker";
  } else if (data.data[0][0].type === "auto") {
    vehicleType = "autoMarker";
  } else {
    vehicleType = "taxiMarker";
  }

  if (isPickedUp) {
    // Phase 2: Pickup to Drop-off
    const destCoords = await geocodeAddress(data.data[0][0].drop_location);
    // console.log("destcoords", destCoords);

    await calculateRoute([data.data[0][0].live_location.lng, data.data[0][0].live_location.lat], destCoords);
  } else {
    // Phase 1: Driver to Pickup
    const destCoords = await geocodeAddress(data.data[0][0].pickup_location);
    await calculateRoute([data.data[0][0].live_location.lng, data.data[0][0].live_location.lat], destCoords);
    // await calculateRoute(
    //   [data.data[0][0].live_location.lng, data.data[0][0].live_location.lat],
    //   destCoords
    // );
  }
}

document
  .getElementById("cancel-ride-btn")
  .addEventListener("click", async () => {
    const response = { status: 201 };
    if (response.status === 201) {
      clearInterval(trackingInterval);
      location.href = "/uber/rider/go";
    } else {
      // console.log("Cancel failed");
    }
  });

mapInstance.on("load", () => {
  // console.log("Map fully loaded");
  startTrip();
});

const cancelRideBtn = document.getElementById("cancel-ride-btn");
const modal = document.getElementById("cancelRideModal");
const closeModal = document.getElementById("closeModal");
const reasonSelect = document.getElementById("cancelReason");
const otherReasonTextarea = document.getElementById("otherReason");
const cancelReasonForm = document.getElementById("cancelReasonForm");

cancelRideBtn.addEventListener("click", () => {
  document.body.classList.add("blur-background");
  modal.style.display = "flex";
});

closeModal.addEventListener("click", () => {
  modal.style.display = "none";
  document.body.classList.remove("blur-background");
});

reasonSelect.addEventListener("change", () => {
  otherReasonTextarea.style.display =
    reasonSelect.value === "other" ? "block" : "none";
});

cancelReasonForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const reason =
    reasonSelect.value === "other"
      ? otherReasonTextarea.value
      : reasonSelect.value;
  if (!reason) {
    alert("Please provide a reason.");
    return;
  }
  try {
    const response = await fetch("/uber/api/rider/cancel-ride", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    if (response.status === 201) {
      location.href = "/uber/rider/go";
    } else {
      let data = await response.json();
      // console.log(data.message);
    }
  } catch (error) {
    console.error("Error canceling ride:", error);
  }
  modal.style.display = "none";
  document.body.classList.remove("blur-background");
});

document
  .getElementsByClassName("copy-btn")[0]
  .addEventListener("click", (e) => {
    const copyText = document.getElementById("otp-text").innerText;
    navigator.clipboard.writeText(copyText).then(() => {
      e.target.classList.remove("fa-regular");
      e.target.classList.add("fa-solid");
      setTimeout(() => {
        e.target.classList.remove("fa-solid");
        e.target.classList.add("fa-regular");
      }, 1000);
    });
  });

function toggleDropdown() {
  const dropdown = document.getElementById("aboutDropdown");
  dropdown.style.display =
    dropdown.style.display === "block" ? "none" : "block";
}

const rateButtons = document.getElementsByClassName("rate");
for (let button of rateButtons) {
  button.addEventListener("click", addRating);
}

function addRating(e) {
  for (let button of rateButtons) {
    if (button.classList.contains("fa-solid")) {
      button.classList.remove("fa-solid");
      button.classList.add("fa-regular");
    }
  }
  if (e.target.classList.contains("fa-regular")) {
    e.target.classList.remove("fa-regular");
    e.target.classList.add("fa-solid");
  } else {
    e.target.classList.remove("fa-solid");
    e.target.classList.add("fa-regular");
  }
}

const closeReviewModal = document.getElementById("closeReviewModal");
const reviewModal = document.getElementsByClassName("reviewRideModal")[0];

closeReviewModal.addEventListener("click", () => {
  reviewModal.style.display = "none";
  location.href = "/uber/rider/go";
});

document
  .getElementsByClassName("rate-btn")[0]
  .addEventListener("click", async (e) => {
    let rateText;
    for (let button of rateButtons) {
      if (button.classList.contains("fa-solid")) {
        rateText = button.dataset.value;
      }
    }
    // console.log(rateText);
    const response = await fetch("/uber/api/rider/ride-review", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ rateText, trip_id: 3 }),
    });
    if (response.status === 201) {
      location.href = "/uber/rider/go";
    }
  });

function startTimeOutOtp() {
  const rideOtp = document.getElementsByClassName("ride-otp")[0];
  rideOtp.style.display = "flex";
  rideOtp.style.alignItems = "center";
  const div = document.createElement("div");
  rideOtp.appendChild(div);
  function startTimer() {
    let timeLeft = 10;

    const timer = setInterval(() => {
      if (timeLeft <= 0) {
        clearInterval(timer);
        startTrip();
        rideOtp.parentElement.removeChild(rideOtp);
        // console.log("Timer finished!");
      } else {
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        div.innerText = `${minutes} : ${
          seconds < 10 ? "0" + seconds : seconds
        }`;
        // console.log(`${minutes} : ${seconds < 10 ? "0" + seconds : seconds}`);
        timeLeft--;
      }
    }, 1000);
  }

  startTimer();
}
