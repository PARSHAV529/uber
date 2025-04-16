// function toggleDropdown() {
//   const dropdown = document.getElementById("aboutDropdown");
//   const toggleLink = document.querySelector("#About");
//   dropdown.classList.toggle("show");
//   toggleLink.setAttribute("aria-expanded", dropdown.classList.contains("show"));
// }

// window.onclick = function (event) {
//   if (!event.target.matches("#About")) {
//     const dropdowns = document.getElementsByClassName("dropdown");
//     for (let i = 0; i < dropdowns.length; i++) {
//       const openDropdown = dropdowns[i];
//       if (openDropdown.classList.contains("show")) {
//         openDropdown.classList.remove("show");
//         const toggleLink = document.querySelector("#About");
//         toggleLink.setAttribute("aria-expanded", "false");
//       }
//     }
//   }
// };

async function routeCheck() {
  try {
    const resp = await fetch("/uber/api/rider/protected-route", {
      headers: {
        "X-Requested-With": "XMLHttpRequest", 
      },
    });

    const data = await resp.json();
    if (resp.status == 200) {
      // // console.log(data.message);
      document.getElementById("map").style.display = "block";
      let lat = 23.0736298;
      let lng = 72.5141419;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        });
      }

      map = new MapmyIndia.Map("map", {
        center: [lat, lng],
        zoomControl: true,
        location: true,
        zoom: 16,
        backgroundColor: "red",
      });
      new MapmyIndia.Marker({
        map: map,
        position: { lat: lat, lng: lng },
      });
      history();
      getpfp();
    } else if (resp.status == 403) {
      window.location.href = "/uber/driver";
    } else if (resp.status == 203) {
      document.querySelector(".history").style.display = "none";
      document.getElementById("img").style.display = "block";
      document.querySelector(".profile").style.display = "none";
    }
  } catch (e) {
    // console.log(e);
  }
}

document.getElementById("submit").addEventListener("click", async (e) => {
  // console.log("clicked");
  e.preventDefault();
  // console.log("calling submit");
  try {
    const resp = await fetch("/uber/api/rider/protected-route", {
     headers: {
        "X-Requested-With": "XMLHttpRequest", 
      },
    });
    const data = await resp.json();
    // console.log("data",data);
    if (resp.status === 200) {
      // // console.log(data.message);
      let startLocation = document.getElementById("pickup").value;
      let destinationLocation = document.getElementById("dropoff").value;
      // console.log(startLocation, destinationLocation);

      window.location.href = `uber/rider/go?start=${startLocation}&dest=${destinationLocation}`;
    } else if (resp.status == 403) {
      location.href = "/uber/driver";
    } else if (resp.status == 401) {
      location.href = "/uber/login";
    } else if (resp.status === 203) {
      location.href = "/uber/signup";
    }
  } catch (e) {
    // console.log(e);
  }
});

async function history() {
  let history_activity = document.getElementById("history-container");
  history_activity.innerHTML = "";

  try {
    const resp = await fetch("/uber/api/rider/history", {
      method: "GET",
    });
    const data = await resp.json();

    let historyData = data.data;
    // console.log(historyData);
    if (resp.status === 201) {
      if (historyData.length > 0) {
        historyData.forEach((history) => {
          let activity_item = document.createElement("tr");
          activity_item.className = "activity-item";

          activity_item.innerHTML = `
        <td><i class="fas fa-history"></i></td>
        <td id='name'>${history.pickup_location}</td>
        <td id='name'>${history.drop_location}</td>
        <td><button onclick='bookAgain("${history.pickup_location}", "${history.drop_location}")' class="activity-action" id='btn'>
                <i class="fa-solid fa-arrow-right-long"></i>
              </button></td>
    `;
          history_activity.appendChild(activity_item);
        });
      } else {
        history_activity.innerHTML = "<p>No pending requests are there</p>";
      }
    } else if (resp.status === 401 || (await resp.status) === 403) {
    }
  } catch (e) {
    // console.log(e);
  }
}

async function getpfp() {
  let pfp = document.getElementById("userpfp");
  let name = document.getElementById("username");
  
  try {
    const resp = await fetch("/uber/api/rider/get-profile", {
      method: "GET",
    });
    const data = await resp.json();
    // console.log("pfp data:",data.data[0][0].id);
    // console.log("pfp data:",data);

    name.innerText = data.data[0][0].first_name + data.data[0][0].last_name;
    pfp.setAttribute("src",`${data.data[0][0].profile_photo}`)
  } catch (e) {
    // console.log(e);
  }
}

function bookAgain(startLocation, destinationLocation) {
  window.location.href = `uber/rider/go?start=${startLocation}&dest=${destinationLocation}`;
}

// document.getElementById("profile").addEventListener("click", function () {
//   window.location.href = "/uber/rider/profile";
// });

//
document.addEventListener("DOMContentLoaded", function () {
  const pickupInput = document.getElementById("pickup");
  const dropoffInput = document.getElementById("dropoff");
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
