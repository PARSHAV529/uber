const all = document.getElementById("all-rides");
const completed = document.getElementById("completed");
const canceled = document.getElementById("canceled");

all.addEventListener("click", () => {
  getRides("all");
  all.classList.add("active");
  completed.classList.remove("active");
  canceled.classList.remove("active");
});

completed.addEventListener("click", () => {
  getRides("completed");
  all.classList.remove("active");
  completed.classList.add("active");
  canceled.classList.remove("active");
});

canceled.addEventListener("click", () => {
  getRides("cancelled");
  all.classList.remove("active");
  completed.classList.remove("active");
  canceled.classList.add("active");
});

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
  renderRides(response.data);
}

function renderRides(rides) {
  const ridesList = document.getElementById("recent-rides");
  ridesList.innerHTML = "";

  const h2 = document.createElement("h2");
  h2.textContent = "Recent Rides";
  ridesList.appendChild(h2);
  rides.forEach((ride) => {
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

    const chevronIcon = document.createElement("i");
    chevronIcon.setAttribute("class", "fas fa-chevron-right");
    chevronIcon.addEventListener("click", () => {
      seeRideDetail(ride);
    });

    li.appendChild(dateDiv);
    li.appendChild(detailsDiv);
    li.appendChild(amountDiv);
    li.appendChild(statusDiv);
    li.appendChild(chevronIcon);
    ul.appendChild(li);

    ridesList.appendChild(ul);
  });
}

function seeRideDetail(data) {
  const content = `<div id='ride-card'>
  <p onclick='hideDiv()'>❌</p><br>
  <span><strong>Date : ${convertTime(data.date)}</strong></span><br>
  <span><strong>PickUp : ${data.pickup_location}</strong></span><br>
  <span><strong>Drop : ${data.drop_location}</strong></span><br>
  <span><strong>Amount : ₹  ${data.Fare_amount}</strong></span><br>
  <span><strong>Vehicle : ${data.vehicle_preference}</strong></span><br>
  <span><strong>Distance : ${data.distance}km</strong></span><br>
  <span><strong>Time : ${
    parseInt((new Date(data.drop_time) - new Date(data.pickup_time)) / 60000)
  } Minutes</strong></span><br>
  <span><strong>Status : ${data.status}</strong></span><br></div>`;

  const div = document.getElementById("ride-detail");
  div.innerHTML = content;
  div.style.display = "block";
}

function hideDiv(){
  const div = document.getElementById("ride-detail");
  div.style.display = "none";
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

getRides("all");
