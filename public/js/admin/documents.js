const lastWeek = document.getElementById("last-week");
const lastMonth = document.getElementById("last-month");
const chartDiv = document.getElementById("chart-div");

async function routeCheck() {
  try {
    const resp = await fetch("/uber/api/admin/protected-route", {
      method: "GET",
    });

    const data = await resp.json();
    if (resp.status == 200) {
      // console.log(data.message);
      docVerificationPanel();
    } else if (resp.status == 401 || resp.status == 403) {
      window.location.href = "/uber/admin/login";
    }
  } catch (e) {
    console.log(e);
  }
}

async function docVerificationPanel() {

  try {
    const resp = await fetch("/uber/api/admin/driver-request", {
      method: "GET",
    });
    const data = await resp.json();
    if (resp.status === 200) {
      setRequests(data.data.driverRequests);
    } else if (resp.status === 401 || (await resp.status) === 403) {
      window.location.href = "/uber/admin/login";
    }
  } catch (e) {
    console.log(e);
  }

}

function setRequests(data) {
  let recent_activity = document.getElementById("recent-activity-container");
  recent_activity.innerHTML = "";

  if (data.length > 0) {
    data.forEach((driver) => {
      let activity_item = document.createElement("div");
      activity_item.className = "activity-item";

      activity_item.innerHTML = `
        <i class="fa-solid fa-bell"></i>
            <span class="driver-name">${driver.first_name} ${
        driver.last_name
      }</span>
            <span class="activity-status">${driver.document_status}</span>
            <div class="activity-time">${getUserTime(driver.created_at)}</div>
            <button onclick="viewDocs(
              ${driver.driver_id}
            )" class="activity-action">
              <i class="fa-solid fa-arrow-right-long"></i>
            </button>
      `;
      recent_activity.appendChild(activity_item);
    });
  } else {
    recent_activity.innerHTML = "<p>No pending requests are there</p>";
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

function viewDocs(driver_id) {
  localStorage.setItem("driverId", driver_id);
  window.location.href = "/uber/admin/doc-verification";
}

