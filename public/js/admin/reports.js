async function routeCheck() {
  try {
    const resp = await fetch("/uber/api/admin/protected-route", {
      method: "GET",
    });

    const result = await resp.json();
    if (resp.status == 200) {
      //   console.log(result.message);
      getReportsData();
    } else if (resp.status == 401 || resp.status == 403) {
      window.location.href = "/uber/admin/login";
    }
  } catch (e) {
    console.log(e);
  }
}

async function getReportsData() {
  try {
    const resp = await fetch("/uber/api/admin/payment-overview", {
      method: "GET",
    });
    const result = await resp.json();
    if (resp.status === 200) {
      // console.log(result);

      setPaymentOverview(result.data);
    } else if (resp.status === 401 || resp.status === 403) {
      window.location.href = "/uber/admin/login";
    }
  } catch (e) {
    console.log(e);
  }

  try {
    const resp = await fetch("/uber/api/admin/todays-rides-details", {
      method: "GET",
    });
    const result = await resp.json();
    if (resp.status === 200) {
      //   setRequests(result.data.driverRequests);
    } else if (resp.status === 401 || resp.status === 403) {
      window.location.href = "/uber/admin/login";
    }
  } catch (e) {
    console.log(e);
  }

  try {
    const resp = await fetch("/uber/api/admin/top-performing-drivers", {
      method: "GET",
    });
    const result = await resp.json();
    if (resp.status === 200) {
      // console.log(result.data);

      setPerformanceOverviewData(
        result.data.topPerformingDriversList,
        "top-rated-drivers-container"
      );

      setPerformanceOverviewData(
        result.data.mostRidesCompletedDrivers,
        "most-completed-rides-drivers-container"
      );

      setPerformanceOverviewData(
        result.data.lowRatedDrivers,
        "low-rated-drivers-container"
      );
      //   setRequests(result.data.driverRequests);
    } else if (resp.status === 401 || resp.status === 403) {
      window.location.href = "/uber/admin/login";
    }
  } catch (e) {
    console.log(e);
  }
}

function setPaymentOverview(data) {
  // console.log(data);
  const totalRevenue = document.getElementById("total-revenue");
  const totalTransactions = document.getElementById("total-transactions-count");
  const totalFailedTransactions = document.getElementById(
    "total-failed-transactions-count"
  );
  // const RevenueDiv = document.getElementById("today-revenue-count");

  totalRevenue.innerHTML = data.totalRevenue[0].totalRevenue;
  totalTransactions.innerHTML = data.totalTansactionsCount[0].totalTransactions;
  totalFailedTransactions.innerHTML =
    data.failedTansactionsCount[0].totalFailedTransactions;
}

function setPerformanceOverviewData(data, id) {
  let performance_overview = document.getElementById(id);
  // performance_overview.innerHTML = "";

  if (data.length > 0) {
    data.forEach((driver) => {
      let top_rated_drivers = document.createElement("div");
      top_rated_drivers.className = "top-rated-drivers";

      top_rated_drivers.innerHTML = `
        <span class="driver-name">${driver.first_name} &nbsp${driver.last_name}</span>
          <span class="activity-status">${driver.rating} &#9733;</span>
          <span class="activity-status">${driver.completed_rides} rides</span>
          <span class="activity-status">${driver.earning} &#36</span>
          <button onclick="viewDriver(
              ${driver.driver_id}
            )" class="activity-action">
              <i class="fa-solid fa-eye"></i>
            </button>
        `;
      performance_overview.appendChild(top_rated_drivers);
    });
  } else {
    performance_overview.innerHTML = "<p>No data found</p>";
  }
}

async function viewDriver(driver_id) {
  localStorage.setItem("driverProfile", driver_id);
  window.location.href = "/uber/admin/driver-detail";
}
