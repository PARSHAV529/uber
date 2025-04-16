const startBtn = document.getElementById("btnRideStart");
const completeBtn = document.getElementById("btnRidecomplete");
const blurBg = document.getElementById("blur-background");

const inputs = document.querySelector(".code-inputs")
const input = document.querySelectorAll(".otp");
let isPickedup = false;
const accessToken = document.cookie.split("accessToken=")[1].split(";")[0];
const decoded = JSON.parse(atob(accessToken.split(".")[1]));
const driver_id = decoded.id.toString();
console.log(driver_id)
input.forEach(element => {
  if(element.id === input[0].id && element.value === ""){
    element.focus();
    element.style.pointerEvents = "auto"
    element.style.cursor = "pointer"
  }else if(element.id === input[input.length - 1].id && element.value != ""){
    element.focus();
    element.style.pointerEvents = "auto"
    element.style.cursor = "pointer"
  }else{
    if(element.id != input[0].id && element.value != "" && element.nextElementSibling.id != input[input.length - 1].id && element.previousElementSibling.value != "" && element.nextElementSibling.value === ""){
      element.focus();
      element.style.pointerEvents = "auto"
    element.style.cursor = "pointer"
    }
  }
})

inputs.addEventListener("input", function (e) {
  const target = e.target;
  const val = target.value;

  if (isNaN(val)) {
      target.value = "";
      return;
  }

  if (val != "") {
      const next = target.nextElementSibling;
      console.log("next :",next)
      if (next) {
          next.focus();
      }
  }
});

inputs.addEventListener("keyup", function (e) {
  
  const target = e.target;
  const key = e.key.toLowerCase();

  if (key == "backspace" || key == "delete") {
      target.value = "";
      const prev = target.previousElementSibling;
      if (prev) {
          prev.focus();
      }
      return;
  }
});

startBtn.addEventListener("click", () => {
  const otpSection = document.getElementById("otp-section");
  otpSection.style.display = "block";
  blurBg.style.display = "block";
});

completeBtn.addEventListener("click", () => {
  const compleRideSection = document.getElementById("complete-ride");
  compleRideSection.style.display = "block";
  blurBg.style.display = "block";
});

function closeOtpSection() {
  const otpSection = document.getElementById("otp-section");
  otpSection.style.display = "none";
  blurBg.style.display = "none";
}

function closeCompRideSection() {
  const compRideSection = document.getElementById("complete-ride");
  compRideSection.style.display = "none";
  blurBg.style.display = "none";
}

let socket = io();
socket.on("connect", () => {

  if ("geolocation" in navigator) {
    navigator.geolocation.watchPosition(
      (position) => {
        let data = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          decoded,
        };
        //socket.emit("update-driver-location", data);
        socket.emit("update-driver-location", data);
      },
      (err) => {
        console.log(err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );
  } else {
    console.log("geolocation not supported");
  }
});

let source, destination;
let mapInstance;
let rideOtp;
let olaMarker, endLocation;
let routePolyline = [];
let rideId, amount;

async function getRideDetail() {
  const responsetxt = await fetch(`/uber/api/driver/active-ride/${driver_id}`, {
    method: "GET",
  });

  const response = await responsetxt.json();

  // console.log("driver_details");
  // console.log(driver_details[0][0].live_location);
  
  rideId = response.data.activeRide[0].id;
  renderRideDetail(response.data);
}

socket.on("driver-location", (data) => {
  console.log("Driver location");
  console.log(data);
  
  // console.log(data);
  // console.log(olaMarker);

  olaMarker.setLngLat([data.lng, data.lat]);
  console.log(destination.lng, destination.lat);
  
  calculateRoute([data.lng, data.lat], [destination.lng, destination.lat]);
});

async function renderRideDetail(data) {
  const driver_liveLocation = data.driver_details[0][0].live_location
  console.log("driver_liveLocation");
  console.log(driver_liveLocation);
  
  if(isPickedup){
    source = await getCoordinates(data.rideDetail[0].pickup_location);
    destination = await getCoordinates(data.rideDetail[0].drop_location);
  }else{
    console.log('lkljlkjhugyuoi');
    
    console.log(data.rideDetail[0]);
    
    source = driver_liveLocation
    destination = await getCoordinates(data.rideDetail[0].pickup_location);
   
  }
  const pickup = document.getElementById("pickup");
  let pickupFlag = data.rideDetail[0].pickup_location;
  let [location] = pickupFlag.split(",");
  pickup.innerHTML = location;
  const drop = document.getElementById("drop");
  let dropFlag = data.rideDetail[0].drop_location;
  [location] = dropFlag.split(",");
  drop.innerHTML = location;
  const distance = document.getElementById("distance");
  distance.innerHTML = data.rideDetail[0].distance + "km";
  const fare = document.getElementById("fare");
  fare.innerHTML = "₹" + data.activeRide[0].fare_amount;
  amount = data.activeRide[0].fare_amount;
  const fareComplete = document.getElementById("fareComplete");
  fareComplete.innerHTML = "₹" + data.activeRide[0].fare_amount;
  const username = document.getElementById("username");
  username.innerHTML = data.user[0].name;
  const mobile = document.getElementById("mobile");
  mobile.innerHTML = data.user[0].phone_number;


  rideOtp = data.activeRide[0].otp;
  console.log(rideOtp);

  initializeMap(source, destination, "Initial load");
}
getRideDetail();

async function initializeMap(source, destination, msg) {
  const olaMaps = new OlaMaps({
    apiKey: "jkVOPvqEWskRwgMNvZDbpXevwGfdagTFu9gj4hdz",
  });

  if (!mapInstance) {
    mapInstance = olaMaps.init({
      style:
        "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
      container: "map",
      center: [source.lng, source.lat],
      zoom: 13,
    });
  } else {
    mapInstance.setCenter([source.lng, source.lat]);
  }

  if (olaMarker) {
    olaMarker.setLngLat([source.lng, source.lat]);
  } else {
    olaMarker = olaMaps
      .addMarker({ offset: [0, 6], anchor: "bottom", color: "blue" })
      .setLngLat([source.lng, source.lat])
      .addTo(mapInstance);
  }

  if (endLocation) {
    endLocation.setLngLat([destination.lng, destination.lat]);
  } else {
    endLocation = olaMaps
      .addMarker({ offset: [0, 6], anchor: "bottom", color: "red" })
      .setLngLat([destination.lng, destination.lat])
      .addTo(mapInstance);
  }

  await calculateRoute(
    [source.lng, source.lat],
    [destination.lng, destination.lat]
  );
}

async function getCoordinates(place) {
  const response = await fetch(
    `https://api.olamaps.io/places/v1/geocode?address=${place}&language=hi&api_key=4CMJEHfgehtEOnwG7ucBlhFv7xJRpA3gIrsRvE36`
  );
  const data = await response.json();

  if (data.geocodingResults) {
    return {
      lat: data.geocodingResults[0].geometry.location.lat,
      lng: data.geocodingResults[0].geometry.location.lng,
    };
  } else {
    throw new Error("Place not found!");
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
      `https://api.olamaps.io/routing/v1/directions?origin=${sourceCoords[1]},${sourceCoords[0]}&destination=${destCoords[1]},${destCoords[0]}&api_key=4CMJEHfgehtEOnwG7ucBlhFv7xJRpA3gIrsRvE36`,
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
        mapInstance.getSource("route-source").setData(routeGeojson);
      } else {
        mapInstance.addSource("route-source", {
          type: "geojson",
          data: routeGeojson,
        });

        mapInstance.addLayer({
          id: "route-layer",
          type: "line",
          source: "route-source",
          paint: {
            "line-color": "blue",
            "line-width": 5,
            "line-opacity": 1,
          },
        });
      }

      const bounds = routePolyline.reduce(
        (bounds, coord) => [
          [Math.min(bounds[0][0], coord[0]), Math.min(bounds[0][1], coord[1])],
          [Math.max(bounds[1][0], coord[0]), Math.max(bounds[1][1], coord[1])],
        ],
        [sourceCoords, sourceCoords]
      );
      mapInstance.fitBounds(bounds, { padding: 100, maxZoom: 15 });
    } else {
      alert("No route found");
    }
  } catch (error) {
    setTimeout(() => calculateRoute(sourceCoords, destCoords), 1000);
  }
}

function verifyOtp() {
  let otp = "";
  for (let index = 1; index <= 6; index++) {
    const element = document.getElementById(`otp${index}`);
    otp += element.value;
  }
  console.log("Input otp",otp)
  if (otp == rideOtp) {
    const otpSection = document.getElementById("otp-section");
    otpSection.style.display = "none";
    startBtn.style.display = "none";
    completeBtn.style.display = "block";
    blurBg.style.display = "none";

    getCurrentLocation()
      .then((location) => {
        source = location;
        initializeMap(source, destination, "After OTP verification");
        startTrip();
      })
      .catch((error) => {
        alert("Failed to get current location. Please try again.");
      });
  } else {
    alert("Wrong OTP! Try again");
  }
}

function getCurrentLocation() {

  if (!navigator.geolocation) {
    return Promise.reject(
      new Error("Geolocation is not supported by this browser.")
    );
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLat = position.coords.latitude;
        const currentLng = position.coords.longitude;
        console.log("Location retrieved:", {
          lat: currentLat,
          lng: currentLng,
        });
        resolve({ lat: currentLat, lng: currentLng });
      },
      (error) => {
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  });
}

let currentDriverIndex = 0;
function updateDriverPosition() {
  if (currentDriverIndex < routePolyline.length - 1) {
    currentDriverIndex += 10;
    if (currentDriverIndex >= routePolyline.length) {
      currentDriverIndex = routePolyline.length - 1;
    }

    const newDriverCoords = routePolyline[currentDriverIndex];
    olaMarker.setLngLat(newDriverCoords);
    socket.emit("update-driver-location", {
      lat: newDriverCoords[1],
      lng: newDriverCoords[0],
      decoded
    });

    const remainingPolyline = routePolyline.slice(currentDriverIndex);
    const routeGeojson = {
      type: "Feature",
      geometry: { type: "LineString", coordinates: remainingPolyline },
    };
    mapInstance.getSource("route-source").setData(routeGeojson);
  } else {
    clearInterval(trackingInterval);
  }
}

let trackingInterval;
function startTrip() {
  currentDriverIndex = 0;
  calculateRoute(
    [source.lng, source.lat],
    [destination.lng, destination.lat]
  ).then(() => {
    clearInterval(trackingInterval);
    trackingInterval = setInterval(updateDriverPosition, 1000);
  });
}

async function generateQr() {
  let responsetxt = await fetch(`/uber/api/generate-qr-code/${100}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const response = await responsetxt.json();
  const imgQr = document.getElementById("imgQr");
  imgQr.src = response.data;
  imgQr.style.display = "block";
}

function checkMethod() {
  let flag = document.getElementById("payment-type").value;
  if (flag == "online") {
    generateQr();
  } else {
    const qrDiv = document.getElementById("imgQr");
    qrDiv.style.display = "none";
  }
}

async function completeRide() {
  let mode = document.getElementById("payment-type").value;
  let responsetxt = await fetch(
    `/uber/api/complete-ride/${rideId}/${mode}/${amount}`,{
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  let response = await responsetxt.json();
  
}

const FinalSubmit = document.getElementById("FinalSubmit");
FinalSubmit.addEventListener("click", () => {
  completeRide();
});
