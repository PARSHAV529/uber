

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
  center: [72.51410970979043, 23.07376796676892],
  zoom: 12,
});
// const olaMarker = new OlaMaps.Marker({
  
//   anchor: "bottom",
//   offset: [0, -20],
//   map: mapInstance,
//   element: customMarker,
//   position: { lat: 23.07376796676892, lng: 72.51410970979043 },
// });
const olaMarker =olaMaps
.addMarker({ offset: [0,6], anchor: "bottom" })
.setLngLat([72.51410970979043, 23.07376796676892])
.addTo(mapInstance)
// mapInstance.
let socket = io();
socket.on("connect", (data) => {
  console.log(data);

  if ("geolocation" in navigator) {
    navigator.geolocation.watchPosition(
      (position) => {
        console.log(position);
        let data = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        socket.emit("update-driver-location", data);
      },
      (err) => {
        console.log(err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 2000,
      }
    );
  } else {
    console.log("geolocation not supported");
  }
});
// const marker = olaMaps.addMarker({})
socket.on("driver-location", (data) => {
  console.log(data);
 console.log(olaMarker);
//  olaMaps.addMarker({
//   anchor: "bottom",
//   offset: [0, -20],
//   map: mapInstance,
//   element: customMarker,
//   id: "driverMarker",
//   position: { lat: data.lat, lng: data.lang },
// })
olaMarker.setLngLat([data.lng, data.lat])
  olaMaps.setCenter([data.lng, data.lat]);
  // olaMarker.setPosition({
  //   lat: data.lat,
  //   lng: data.lng,
  // });
  // olaMaps.setCenter({
  //   lat: data.lat,
  //   lng: data.lng,
  // });

  // olaMaps.updateMarker("driverMarker", {
  //   lat: data.lat,
  //   lng: data.lng,
  // });
  // olaMaps.setCenter({
  //   lat: data.lat,
  //   lng: data.lng,
  // });
  // olaMarker.setLngLat([data.lat, data.lng])
  //   .setCenter([data.lat, data.lng])
  //   .addTo(mapInstance);
  
  // marker.setLngLat([data.lat, data.lng])
  //   .setCenter([data.lat, data.lng])
  //   .addTo(mapInstance);
});
// setInterval(() => {
  // olaMaps.addMarker(customMarker)
  // .setLngLat([72.51410970979043, 23.07376796676892])
  // .addTo(mapInstance)
  // .setCenter([72.51410970979043, 23.07376796676892])

  // navigator.geolocation.getCurrentPosition((position) => {
  //     console.log("Latitude ",position.coords.latitude)
  //     console.log("Longitude ",position.coords.longitude)
  // })
// }, 3000);

// console.log(document.cookie);
