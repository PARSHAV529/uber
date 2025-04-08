let socket = io();
socket.on("connect", (data) => {
  console.log(data);
  
  setInterval(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      // console.log(position);
      let data = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      socket.emit("update-driver-location", data);
    });
  }, 5000);
});

let data;

let map, marker;
// log
function initMap1() {
  map = new MapmyIndia.Map("map", {
    center: [23.071778569248764, 72.51971063973592],
    zoomControl: true,
    location: true,
    backgroundColor: "red",
    zoom: 15,
  });

  marker = new MapmyIndia.Marker({
    map: map,
    position: { lat: 23.071778569248764, lng: 72.51971063973592 },
    draggable: true,
  });
}
socket.on("driver-location", (data) => {
    console.log(data);
    if(marker)
    marker.setPosition({ lat: data.lat, lng: data.lng });
    if(map){
        map.setCenter({ lat: data.lat, lng: data.lng });
    }
  });

// const requestRide = document.getElementsByClassName("request-btn")[0];

// requestRide.addEventListener("click", async () => {
//   console.log("request for the ride");

//   const source = document.getElementById("pickup-location").value;
//   const destination = document.getElementById("dropoff-location").value;

//   const vehicles = document.getElementsByClassName("cards");
//   let vehicleType = "";

//   for (let vehicle of vehicles) {
//     if (vehicle.dataset.selected === "true") {
//       vehicleType = vehicle.dataset.type;
//     }
//   }

//   let fare_amount;

//   if (vehicleType === "moto") {
//     fare_amount = Math.round(distance * 0.0103);
//   } else if (vehicleType === "auto") {
//     fare_amount = Math.round(distance * 0.014);
//   } else {
//     fare_amount = Math.round(distance * 0.025);
//   }

//   console.log("type", vehicleType);

//   distance = distance / 1000;

//   const response = await fetch("/uber/api/rider/request-ride/", {
//     method: "POST",
//     headers: {
//       "content-type": "application/json",
//     },
//     body: JSON.stringify({
//       source: source,
//       destination: destination,
//       vehicleType: vehicleType,
//       distance: distance,
//       fare_amount: fare_amount,
//     }),
//   });
//   if (response.status === 201) {
//     let data = await response.json();
//     console.log(data.message);

//     location.href = "/uber/rider/request";
//   } else {
//     let data = await response.json();
//     console.log(data.message);
//   }
// })
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

// fetchMap("23.07114789394046, 72.51960383672555", "23.01936830563721, 72.5330915321691")
