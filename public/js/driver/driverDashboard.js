// import { OlaMaps } from "olamaps-web-sdk";


const profile = document.querySelector(".profile");
profile.style.cursor = "pointer";

profile.addEventListener("click", (e) => {
  console.log(e.currentTarget);
  location.href = "/driver/profile";
});

const startRide = document.getElementById("btnStart");
startRide.addEventListener("click", () => {
  window.location.href = "/driver/rides";
});

const boxOnline = document.getElementById("box-online");
const boxOffline = document.getElementById("box-offline");
const d_id = 1;

async function changeStatus(status) {
  console.log(status);
  if (status == "online") {
    boxOffline.style.display = "none";
    boxOnline.style.display = "block";

    const responseTxt = await fetch(
      `/uber/api/driver/updateStatus/${status}/${d_id}`
    );
    const response = await responseTxt.json();
    console.log(response);
  } else {
    boxOffline.style.display = "block";
    boxOnline.style.display = "none";
    const responseTxt = await fetch(
      `/uber/api/driver/updateStatus/${status}/${d_id}`
    );

    const response = await responseTxt.json();
    console.log(response);
  }
}

async function getRides(ride_type) {
  const d_id = 1;
  const responsetxt = await fetch(
    `/uber/api/driver/all-rides/${d_id}/${ride_type}`,
    {
      method: "GET",
    }
  );

  const response = await responsetxt.json();

  console.log("response Text :", response);
  renderRides(response.data.rides);

  const dayEarning = document.getElementById("day-earning");
  dayEarning.innerHTML = "$" + response.data.dailyIncome;
  const completedRides = document.getElementById("completed-rides");
  completedRides.innerHTML = response.data.dailyRides;
}

function renderRides(rides) {
  console.log("data : ", rides);
  const ridesList = document.getElementById("recent-rides");
  ridesList.innerHTML = "";

  const h2 = document.createElement("h2");
  h2.textContent = "Recent Rides";
  ridesList.appendChild(h2);
  rides.slice(0, 3).forEach((ride) => {
    const ul = document.createElement("ul");
    const li = document.createElement("li");

    const dateDiv = document.createElement("div");
    const dateIcon = document.createElement("i");
    const dateSpan = document.createElement("span");

    dateDiv.setAttribute("class", "date");
    dateIcon.setAttribute("class", "fas fa-calendar-alt");

    dateSpan.textContent = convertTime(ride.date);

    dateDiv.appendChild(dateIcon);
    dateDiv.appendChild(dateSpan);

    const detailsDiv = document.createElement("div");
    detailsDiv.textContent = ride.drop_location;
    detailsDiv.setAttribute("class", "details");

    const amountDiv = document.createElement("div");
    amountDiv.textContent = "₹ " + ride.Fare_amount;
    amountDiv.setAttribute("class", "amount");

    const statusDiv = document.createElement("div");
    statusDiv.style.color = ride.status === "completed" ? "green" : "red";
    statusDiv.textContent = ride.status;
    statusDiv.setAttribute("class", "status");

    li.appendChild(dateDiv);
    li.appendChild(detailsDiv);
    li.appendChild(amountDiv);
    li.appendChild(statusDiv);
    ul.appendChild(li);

    ridesList.appendChild(ul);
  });
}

function convertTime(time) {
  let timestamp = new Date(time).getTime();
  let todate = new Date(timestamp).getDate();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let tomonth = monthNames[new Date(timestamp).getMonth() + 1];
  let toyear = new Date(timestamp).getFullYear();
  return tomonth + " " + todate + ", " + toyear;
}

getRides("completed");

let mapInstance;
//  let lat,long;
const olaMaps = new OlaMaps({
  apiKey: "jkVOPvqEWskRwgMNvZDbpXevwGfdagTFu9gj4hdz",
});
let olaMapsInstance = olaMaps;

let customMarker = document.createElement("div");
customMarker.classList.add("customMarkerClass");

mapInstance = olaMaps.init({
  style:
    "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
  container: "map",
  center: [77.61648476788898, 12.932323492103944 ],
  
  zoom: 15,
});
// const olaMarker = new OlaMaps.Marker({
  
//   anchor: "bottom",
//   offset: [0, -20],
//   map: mapInstance,
//   element: customMarker,
//   position: { lat: 23.07376796676892, lng: 72.51410970979043 },
// });
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

// Function to calculate initial route
let routePolyline
async function calculateRoute(sourceCoords, destCoords) {
  console.log();
  try {
    const response = await fetch(
      `https://api.olamaps.io/routing/v1/directions?origin=${sourceCoords[1]},${sourceCoords[0]}&destination=${destCoords[1]},${destCoords[0]}&api_key=jkVOPvqEWskRwgMNvZDbpXevwGfdagTFu9gj4hdz`,
      { method: "POST" }
    );
    const data = await response.json();
    console.log(data);

    if (data.status === "SUCCESS" && data.routes && data.routes.length > 0) {
      routePolyline = decodePolyline(data.routes[0].overview_polyline);
      routePolyline.unshift(sourceCoords);
      routePolyline.push(destCoords);

      const routeGeojson = {
        type: "Feature",
        geometry: { type: "LineString", coordinates: routePolyline },
      };

      if (mapInstance.getSource("route-source")) {
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
        paint: {
          "line-color": "blue",
          "line-width": 5,
          "line-opacity": 1,
        },
      });
      
      // Fit bounds
      const bounds = routePolyline.reduce(
        (bounds, coord) => [
          [Math.min(bounds[0][0], coord[0]), Math.min(bounds[0][1], coord[1])],
          [Math.max(bounds[1][0], coord[0]), Math.max(bounds[1][1], coord[1])],
        ],
        [sourceCoords, sourceCoords]
      );
      mapInstance.fitBounds(bounds, { padding: 100, maxZoom: 15 });
    } else {
      calculateRoute(sourceCoords,destCoords)
    }
  } catch (error) {
    console.error("Routing error:", error);
calculateRoute(sourceCoords,destCoords)
  }
}

const olaMarker =olaMaps
.addMarker({ offset: [0,6], anchor: "bottom",color: "red" })
.setLngLat([72.50688054342254,23.02835885023616 ])
.addTo(mapInstance)
const endLocation =olaMaps
.addMarker({ offset: [0,6], anchor: "bottom" })
.setLngLat([72.51421699689487,23.073935765844265 ])
.addTo(mapInstance)
// mapInstance.
let socket = io();

socket.on("connect", (data) => {
  // console.log(data);
  console.log(document.cookie);
  
const accessToken =document.cookie.split('accessToken=')[1].split(';')[0]
const decoded = JSON.parse(atob(accessToken.split('.')[1]));
  console.log(decoded);

  if ("geolocation" in navigator) {
    navigator.geolocation.watchPosition(
      (position) => {
        console.log(position);
        let data = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          decoded
          // token: document.cookie.split('accessToken=')[1].split(';')[0]
        };
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
const marker = olaMaps.addMarker({})
let driverpts=[]
async function fetchMap(start, end) {
  console.log(start, end);
  
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
    var newpt =  [pt[1],  pt[0]] 

    driverpts.push(newpt);
  });
  // driverpts.push([ 23.073906154257962, 72.5142062680596 ]);

  console.log(driverpts);
}

mapInstance.on('load', () => {
  console.log(driverpts);
  
  mapInstance.addSource('route', {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [77.61648476788898, 12.932323492103944],
          [77.61348476788898, 12.942223492103944],
          [77.61648476788898, 12.962223492103944],
          [77.62648476788898, 12.952223492103944],
          [77.65648476788898, 12.952223492103944],
        ]
      },
    },
  })
  mapInstance.addLayer({
    id: 'route',
    type: 'line',
    source: 'route',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      'line-color': '#f00',
      'line-width': 4,
    },
  })
})
window.onload = async () => {
  // await fetchMap
// calculateRoute([72.50688054342254,23.02835885023616], [72.51421699689487,23.073935765844265])
};

socket.on("driver-location", (data) => {
  console.log(data);
 console.log(olaMarker);

olaMarker.setLngLat([data.lng, data.lat])
calculateRoute([data.lng,data.lat], [72.51421699689487,23.073935765844265])

})