const lastWeek = document.getElementById("last-week");
const lastMonth = document.getElementById("last-month");
const custom = document.getElementById("custom");
const chartDiv = document.getElementById("chart-div");
const customRangeFrom = document.getElementById("customRangeFrom");
const customRangeFormDiv = document.getElementById("customRangeFormDiv");
const startDate = document.getElementById("startDate");
const endDate = document.getElementById("endDate");

async function routeCheck() {
  try {
    const resp = await fetch("/uber/api/admin/protected-route", {
      method: "GET",
    });

    const data = await resp.json();
    if (resp.status == 200) {
      setDashboardData();
    } else if (resp.status == 401 || resp.status == 403) {
      window.location.href = "/uber/admin/login";
    }
  } catch (e) {
    console.log(e);
  }
}

async function setDashboardData() {
  // key matrix data
  try {
    const resp = await fetch("/uber/api/admin/active-drivers", {
      method: "GET",
    });
    const data = await resp.json();
    console.log(data.data);

    if (resp.status === 200) {
      setKeyMetrics(data.data);
      customRangeFormDiv.style.display = "none";
    } else if (resp.status === 401 || (await resp.status) === 403) {
      window.location.href = "/uber/admin/login";
    }
  } catch (e) {
    console.log(e);
  }

  //chart data for last week

  try {
    const response = await fetch("/uber/api/admin/get-chart-data", {
      method: "GET",
    });

    const result = await response.json();
    if (response.status == 200) {
      prevWeekChartLoader(result.data.revenueLastWeek);

      lastWeek.addEventListener("click", () => {
        prevWeekChartLoader(result.data.revenueLastWeek);
        // loadChart(dates[0], dates[1]);
        lastWeek.classList.add("active");
        lastMonth.classList.remove("active");
        custom.classList.remove("active");
        customRangeFormDiv.style.display = "none";
      });

      lastMonth.addEventListener("click", () => {
        prevMonthChartLoader(result.data.lastMonthRevenue);
        lastWeek.classList.remove("active");
        custom.classList.remove("active");
        lastMonth.classList.add("active");
        customRangeFormDiv.style.display = "none";
      });

      custom.addEventListener("click", () => {
        lastWeek.classList.remove("active");
        lastMonth.classList.remove("active");
        custom.classList.add("active");
        customRangeFormDiv.style.display = "flex";

        document.getElementById("monthChart").style.display = "none";
        document.getElementById("weekChart").style.display = "none";
        document.getElementById("customChart").style.display = "block";
      });
    } else if (response.status == 401 || response.status == 403) {
      window.location.href = "/uber/admin/login";
    }
  } catch (e) {
    console.log(e);
  }
}

startDate.addEventListener("change", () => {
  let val = startDate.value;
  endDate.setAttribute("min", val);
});

customRangeFrom.addEventListener("submit", async (e) => {
  e.preventDefault();

  const rangeFormData = new FormData(customRangeFrom);

  let range = {};
  rangeFormData.forEach(function (value, key) {
    range[key] = value;
  });

  try {
    const response = await fetch(`/uber/api/admin/custom-revenue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        start_date: range.start_date,
        end_date: range.end_date,
      }),
    });

    let result = await response.json();
    if (response.status === 200) {
      customRangeChartLoader(range, result.data.customRevenue);
    } else if (response.status === 401 || (await response.status) === 403) {
      window.location.href = "/uber/admin/login";
    }
  } catch (e) {
    console.log(e);
  }
});

function setKeyMetrics(data) {
  // console.log(data);
  const activeDrivesDiv = document.getElementById("active-driver-count");
  const activeUsersDiv = document.getElementById("active-users-count");
  const activeRidessDiv = document.getElementById("active-rides-count");
  const RevenueDiv = document.getElementById("today-revenue-count");

  activeDrivesDiv.innerHTML = data.activeDriverList[0].activeDrivers;
  activeUsersDiv.innerHTML = data.toatalUsers[0].toatalUsers;
  activeRidessDiv.innerHTML = data.todaysRides[0].todaysRides;
  RevenueDiv.innerHTML = data.todaysRevenue[0].todaysRevenue
    ? data.todaysRevenue[0].todaysRevenue
    : 0;
}

function loadChart(labels, data, chartName) {
  const config = {
    labels: labels,
    datasets: [
      {
        label: "Revenue",
        data: data,
        fill: false,
        pointRadius: 5,
        pointBackgroundColor: "black",
        borderColor: "black",
        tension: 0.1,
      },
    ],
  };

  new Chart(`${chartName}`, {
    type: "line",
    data: config,
    options: {
      legend: { display: false },
      title: {
        display: true,
        text: "Revenue",
        fontSize: 16,
      },
      scales: {
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: "Amount ($)",
            },
          },
        ],
        xAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: "Date",
            },
          },
        ],
      },
    },
  });
}

function dateAmountMapping(data, datesArray) {
  const res1 = {};

  for (const obj of data) {
    res1[obj.date] = obj.amount;
  }

  const result = {};

  for (const date of datesArray) {
    if (res1[date]) {
      result[date] = res1[date];
    } else {
      result[date] = 0;
    }
  }

  let dates = [];
  let amount = [];

  for (let date in result) {
    dates.push(date);
    amount.push(result[date]);
  }

  return [dates, amount];
}

function prevWeekChartLoader(data) {
  let chartData = dateFormatter(data);

  let currWeekDates = getCurrentWeekDates();

  let chartFeed = dateAmountMapping(chartData, currWeekDates);

  document.getElementById("weekChart").style.display = "block";
  document.getElementById("monthChart").style.display = "none";
  document.getElementById("customChart").style.display = "none";

  loadChart(chartFeed[0], chartFeed[1], "weekChart");
}

function prevMonthChartLoader(data) {
  let prevMonthDates = getPreviousMonthDates();

  let chartData = dateFormatter(data);

  let chartFeed = dateAmountMapping(chartData, prevMonthDates);

  document.getElementById("monthChart").style.display = "block";
  document.getElementById("customChart").style.display = "none";
  document.getElementById("weekChart").style.display = "none";

  loadChart(chartFeed[0], chartFeed[1], "monthChart");
}

function customRangeChartLoader(range, data) {
  let rangeDates = getRangeDates(range.start_date, range.end_date);
  // console.log(rangeDates);
  // console.log(data);

  let chartData = dateFormatter(data);

  let chartFeed = dateAmountMapping(chartData, rangeDates);

  document.getElementById("monthChart").style.display = "none";
  document.getElementById("customChart").style.display = "block";
  document.getElementById("weekChart").style.display = "none";

  loadChart(chartFeed[0], chartFeed[1], "customChart");
}

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function getRangeDates(from, to){
  const cFrom = new Date(from);
  const cTo = new Date(to);

  // let daysArr = [];
  let daysArr = [
    ("0" + cFrom.getDate()).slice(-2) +
      "-" +
      `0${cFrom.getMonth() + 1}`.slice(-2) +
      "-" +
      cFrom.getFullYear(),
  ];
  // console.log(daysArr);

  let tempDate = cFrom;

  while (tempDate < cTo) {
    tempDate.setUTCDate(tempDate.getUTCDate() + 1);
    let d = new Date(tempDate);
    daysArr.push(
      ("0" + d.getDate()).slice(-2) +
        "-" +
        `0${d.getMonth() + 1}`.slice(-2) +
        "-" +
        d.getFullYear()
    );
  }

  return daysArr;
};

function dateFormatter(data) {
  let formattedDates = [];

  data.forEach((element) => {
    let d = new Date(element.date);
    formattedDates.push({
      date:
        ("0" + d.getDate()).slice(-2) +
        "-" +
        `0${d.getMonth() + 1}`.slice(-2) +
        "-" +
        d.getFullYear(),
      amount: parseInt(element.revenue),
    });
  });

  return formattedDates;
}

function getCurrentWeekDates() {
  let currWeekDates = Array.from(Array(7).keys()).map((idx) => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + idx - 7);

    return (
      ("0" + d.getDate()).slice(-2) +
      "-" +
      `0${d.getMonth() + 1}`.slice(-2) +
      "-" +
      d.getFullYear()
    );
  });

  return currWeekDates;
}

function getPreviousMonthDates() {
  let prevMonthDates = [];

  let currDate = new Date();
  let prevMonthNumber = currDate.getMonth();

  let prevMonthDays = getDaysInMonth(2025, prevMonthNumber);

  for (let i = 1; i <= prevMonthDays; i++) {
    d = new Date(currDate.getFullYear(), currDate.getMonth() - 1, i);

    prevMonthDates.push(
      ("0" + d.getDate()).slice(-2) +
        "-" +
        `0${d.getMonth() + 1}`.slice(-2) +
        "-" +
        d.getFullYear()
    );
  }

  return prevMonthDates;
}
