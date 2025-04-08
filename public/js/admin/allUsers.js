let riders = [];

async function routeCheck() {
  try {
    const resp = await fetch("/uber/api/admin/protected-route", {
      method: "GET",
    });

    const data = await resp.json();
    if (resp.status == 200) {
      const defaultTab = document.querySelector(".tab.active-user");
      if (defaultTab) {
        await setUsers({ currentTarget: defaultTab });
      }
    } else if (resp.status == 401 || resp.status == 403) {
      window.location.href = "/uber/admin/login";
    }
  } catch (e) {
    console.log(e);
  }
}

const getUserTime = (input) => {
  const date = input instanceof Date ? input : new Date(input);
  const formatter = new Intl.RelativeTimeFormat("en");
  const ranges = {
    years: 3600 * 24 * 365,
    months: 3600 * 24 * 30,
    weeks: 3600 * 24 * 7,
    days: 3600 * 24,
    hours: 3600,
    minutes: 60,
    seconds: 1,
  };
  const secondsElapsed = (date.getTime() - Date.now()) / 1000;
  for (let key in ranges) {
    if (ranges[key] < Math.abs(secondsElapsed)) {
      const delta = secondsElapsed / ranges[key];
      return formatter.format(Math.round(delta), key);
    }
  }
};

async function setUsers(event) {
  const links = document.querySelectorAll(".tab");
  links.forEach((link) => link.classList.remove("active-user"));
  event.currentTarget.classList.add("active-user");

  const selectedValue = event.currentTarget.value || "drivers";

  try {
    const res = await fetch("/uber/api/admin/users", {
      method: "GET",
    });

    if (res.status === 200) {
      const data = await res.json();

      drivers = data.data.Drivers;
      riders = data.data.Riders;

      let users = document.getElementById("users-list");
      users.innerHTML = "";
      const defaultAvatar = "/source/girl-avtar.png";

      if (selectedValue === "drivers") {
        if (drivers.length > 0) {
          drivers.forEach((driver) => {
            let activity_item = document.createElement("div");
            activity_item.className = "activity-item";

            const profilePhoto = driver.profile_photo || defaultAvatar;

            activity_item.innerHTML = `
            <div class="driver-info">
                <i class="fa-solid fa-user"></i>
                <img src="${profilePhoto}">
                <span class="driver-name">${driver.first_name} ${
              driver.last_name
            }</span>
              </div>
                <span class="activity-status">${driver.document_status}</span>
                <div class="activity-time">${getUserTime(
                  driver.created_at
                )}</div>
                <button onclick="viewDriverProfile(${
                  driver.id
                })" class="activity-action">
                  <i class="fa-solid fa-arrow-right-long"></i>
                </button>
            `;
            users.appendChild(activity_item);
          });
        } else {
          users.innerHTML = "<p>No pending requests are there</p>";
        }
      } else {
        if (riders.length > 0) {
          riders.forEach((rider) => {
            let activity_item = document.createElement("div");
            activity_item.className = "activity-item";

            const profilePhoto = rider.profile_photo || defaultAvatar;

            activity_item.innerHTML = `
            <div class="driver-info">
                <i class="fa-solid fa-user"></i>
                <img src="${profilePhoto}">
                <span class="driver-name">${rider.first_name} ${
              rider.last_name
            }</span>
              </div>
                <span class="activity-status">${rider.DOB}</span>
                <div class="activity-time">${getUserTime(
                  rider.created_at
                )}</div>
                <button onclick="viewProfile(${
                  rider.id
                })" class="activity-action">
                  <i class=" fa-solid fa-arrow-right-long"></i>
                </button>
            `;
            users.appendChild(activity_item);
          });
        } else {
          users.innerHTML = "<p>No pending requests are there</p>";
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
}

async function viewDriverProfile(driver_id) {
  localStorage.setItem("driverProfile", driver_id);
  window.location.href = "/uber/admin/driver-detail";
}

async function viewProfile(userId) {
  // Find the user in the respective array
  let user = riders.find((rider) => rider.id === userId);
  console.log(user);
  if (user) {
    const modalTitle = document.getElementById("modalTitle");
    const modalImage = document.getElementById("modalImage");
    const modalDetails = document.getElementById("modalDetails");

    modalTitle.innerText = `${user.first_name} ${user.last_name} (Rider)`;
    modalImage.src = user.profile_photo || "/source/girl-avtar.png";

    modalDetails.innerHTML = `
        <p><strong>Date of Birth:</strong> ${user.DOB}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Ph no.:</strong> ${user.phone_number}</p>
        <p><strong>Created At:</strong> ${getUserTime(user.created_at)}</p>
      `;

    document.getElementById("userProfileModal").style.display = "block";
  } else {
    console.log("User  not found");
  }
}

function closeModal() {
  document.getElementById("userProfileModal").style.display = "none";
}

window.onclick = function (event) {
  const modal = document.getElementById("userProfileModal");
  if (event.target === modal) {
    closeModal();
  }
};
