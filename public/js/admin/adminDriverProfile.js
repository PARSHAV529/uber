async function routeCheck() {
  try {
    const resp = await fetch("/uber/api/admin/protected-route", {
      method: "GET",
    });

    const data = await resp.json();
    if (resp.status === 200) {
      const defaultTab = document.querySelector(".tab.active-tab");
      if (defaultTab) {
        await setTabs({ currentTarget: defaultTab });
      }
      fetchDetails();
    } else if (resp.status === 401 || resp.status === 403) {
      window.location.href = "/uber/admin/login";
    }
  } catch (e) {
    console.log(e);
  }
}

async function fetchDetails() {
  const driver_id = localStorage.getItem("driverProfile");
  try {
    const resp = await fetch("/uber/api/admin/driver", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ driver_id: driver_id }),
    });
    const data = await resp.json();
    if (resp.status === 200) {
      setDetails(data.data);
      localStorage.removeItem("driverId");
    } else if (resp.status === 401 || resp.status === 403) {
      window.location.href = "/uber/admin/login";
      localStorage.removeItem("driverId");
    }
  } catch (e) {
    console.log(e);
  }
}

function displayStarRating(rating) {
  const starContainer = document.getElementById("star-rating");
  starContainer.innerHTML = "";

  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;

  for (let i = 0; i < fullStars; i++) {
    const star = document.createElement("span");
    star.className = "star filled";
    star.innerHTML = '<i class="fas fa-star"></i>';
    starContainer.appendChild(star);
  }

  // Create half star if applicable
  if (halfStar) {
    const star = document.createElement("span");
    star.className = "star filled";
    star.innerHTML = '<i class="fas fa-star-half-alt"></i>';
    starContainer.appendChild(star);
  }

  // Create empty stars
  for (let i = 0; i < emptyStars; i++) {
    const star = document.createElement("span");
    star.className = "star";
    star.innerHTML = '<i class="far fa-star"></i>';
    starContainer.appendChild(star);
  }
}

function setDetails(data) {
  let dd = data.driver_details[0];
  let counts = data.topPerformingDriversList[0];
  let rides = data.totalRides[0];
  let vd = data.vehicalDetails[0];

  console.log(dd);
  console.log(counts);
  console.log(rides);
  console.log(vd);

  document.getElementById("driver-profile-img").src = `${dd.profile_photo}`;

  document.getElementById("driver-name").innerHTML =
    `${dd.first_name} ${dd.last_name}` +
    `${dd.is_online === 1 ? " (Online) " : " (Offline) "}`;

  document.getElementById("rating-count").innerHTML = `${counts.rating}`;

  displayStarRating(`${counts.rating}`);

  document.getElementById("total-ride-count").innerHTML = `${rides.totalRides}`;

  document.getElementById(
    "completed-ride-count"
  ).innerHTML = `${counts.completed_rides}`;

  document.getElementById("earning-count").innerHTML = `${counts.earning}`;

  document.getElementById("vehicle-type").innerHTML = `${vd.type}`;

  document.getElementById(
    "vehical-approved"
  ).innerHTML = `${dd.vehicle_approved}`;

  document.getElementById("capacity").innerHTML = `${vd.capacity}`;

  document.getElementById("colour").innerHTML = `${vd.colour}`;

  document.getElementById(
    "insurance-exp-date"
  ).innerHTML = `${vd.insurance_exp_date}`;

  document.getElementById("number_plate").innerHTML = `${vd.number_plate}`;

  document.getElementById("puc-exp-date").innerHTML = `${vd.puc_exp_date}`;

  document.getElementById("DOB").innerHTML = `${dd.DOB}`;

  document.getElementById("driver-email").innerHTML = `${dd.email}`;

  document.getElementById(
    "document-status"
  ).innerHTML = `${dd.document_status}`;

  document.getElementById("longitude").innerHTML = `${dd.live_location.lng}`;

  document.getElementById("latitude").innerHTML = `${dd.live_location.lat}`;

  document.getElementById("phone-number").innerHTML = `${dd.phone_number}`;

  document.getElementById("dl-number").innerHTML = `${dd.dl_number}`;

  document.getElementById("dl-exp-date").innerHTML = `${dd.dl_exp_date}`;
}

async function setTabs(event) {
  const links = document.querySelectorAll(".tab");
  links.forEach((link) => link.classList.remove("active-tab"));
  event.currentTarget.classList.add("active-tab");

  const selectedValue = event.currentTarget.value || "vehicle";

  if (selectedValue === "vehicle") {
    document.getElementById("lower-left").style.display = "flex";
    document.getElementById("lower-right").style.display = "none";
  } else {
    document.getElementById("lower-left").style.display = "none";
    document.getElementById("lower-right").style.display = "flex";
  }
}
