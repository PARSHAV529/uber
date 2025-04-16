const socket = io();
const accessToken = document.cookie.split("accessToken=")[1].split(";")[0];
  const decoded = JSON.parse(atob(accessToken.split(".")[1]));
const driverId = decoded.id.toString();
console.log(driverId);

socket.emit('register',`${driverId}_driver`);


const subBox = document.querySelector(".sub-box");
const availableRide = document.querySelector("#available-ride");
const upcomingRide = document.querySelector("#upcoming-ride");
const scheduledRide = document.querySelector("#scheduled-ride");
const lists = document.querySelectorAll(".lists");
const acceptBtn = document.querySelector(".accept")
const declineBtn = document.querySelector(".decline")

// acceptBtn.addEventListener("click",(e)=>{
//     // location.href= "/uber/driver/ride-accepted";
//     socket.emit('ride_response', driverId , data.riderId, true);
// })

lists.forEach((Element) => {
  Element.addEventListener("click", (e) => {
    if (!e.target.classList.contains("active")) {
      e.target.classList.add("active");
    }

    lists.forEach((Element) => {
      if (Element.classList.contains("active") && Element != e.target) {
        Element.classList.remove("active");
      }
    });
  });
});

let h3 = document.createElement("h3");
let allRides = document.createElement("div");
allRides.setAttribute("class", "rides");
 subBox.innerHTML = "";
  subBox.appendChild(h3);
  subBox.appendChild(allRides);
availableRide.addEventListener("click", async () => {
  // subBox.innerHTML = "";
  // subBox.appendChild(h3);
  // subBox.appendChild(allRides);

  // let response = await fetch("/uber/api/driver/get-ride-request", {
  //   method: "GET",
  // });

  // response = await response.json();

  // let rideRequest = response.data.rideRequest;
  // // console.log(rideRequest);

  // if (rideRequest.length <= 0) {
  //   allRides.innerHTML = "";
  //   allRides.innerHTML = `<h3 style="color : red">No rides available</h3>`;
  // } else {
  //   allRides.innerHTML = "";
  //   rideRequest.forEach((Element) => {
  //     createRideRequest(
  //       Element.pickup_location,
  //       Element.fare_amount,
  //       Element.distance,
  //       Element.id
  //     );
  //   });
  // }
});
socket.on('ride-request', (data) => {
  // // console.log(data);
  // alert(`New Reuest Comming form rider${data.riderId}`);
  let rideRequest = data.result;
  // let data= data.data
  // console.log(rideRequest);
  // console.log(data.data);

  if (rideRequest.length <= 0) {
    allRides.innerHTML = "";
    allRides.innerHTML = `<h3 style="color : red">No rides available</h3>`;
  } else {
    allRides.innerHTML = "";
    rideRequest.forEach((Element) => {
      createRideRequest(
        Element.pickup_location,
        Element.fare_amount,
        Element.distance,
        Element.id
      );
      acceptBtn.addEventListener("click",(e)=>{
       
        // const trip_request_id = document.cookie.split("trip_request_id=")[1]
        console.log("trip_request_id",data.tripRequestId);
        
    
        socket.emit('ride_response', driverId , data.riderId, true,data.tripRequestId,Element.fare_amount);
        location.href= "/uber/driver/ride-accepted";
    })

    declineBtn.addEventListener("click",(e)=>{
      // location.href= "/uber/driver/ride-accepted";
      // const trip_request_id = document.cookie.split("trip_request_id=")[1]
      console.log("trip_request_id",data.tripRequestId);
  
      socket.emit('ride_response', driverId , data.riderId, false,data.tripRequestId,Element.fare_amount);
  })
    });
  }

  // const btn = document.createElement("button");
  // btn.innerHTML = "Accept";
  // document.body.appendChild(btn);
  // btn.onclick = () => {
  //     // console.log("sending the respose");
  //     socket.emit('ride_response', driverId , data.riderId, true);
  // }
  // const btnRe = document.createElement("button");
  // btnRe.innerHTML = "reject";
  // document.body.appendChild(btnRe);
  // btnRe.onclick = () => {
  //     socket.emit('ride_response', driverId,data.riderId, false);
  // }

  // const autoResponse = setTimeout(() => {
  //     alert('Time out')
  //     socket.emit('ride_response', driverId, false);
  // }, 5000);
});
socket.on('ride_status', (data) => {
  console.log(data);
  
if (data.status === 'accepted') {
    // alert("You Accept the ride")
    Toastify({
      text: "You Accept the ride",
      duration: 3000,
      close: true,
      gravity: "top",
      position: "right",
      backgroundColor: "#e74c3c",
      stopOnFocus: true,
      className: "toastify",
    }).showToast();
} else {
    alert('no more driver available')
}
})
upcomingRide.addEventListener("click", async () => {
  subBox.innerHTML = "";
  subBox.innerHTML = `<h3>Upcoming rides</h3>`;
});

scheduledRide.addEventListener("click", async () => {
  subBox.innerHTML = "";
  subBox.innerHTML = `<h3>Scheduled ride</h3>`;
});

// setTimeout(async () => {
//   subBox.innerHTML = "";
//   subBox.appendChild(h3);
//   subBox.appendChild(allRides);

//   let response = await fetch("/uber/api/driver/get-ride-request", {
//     method: "GET",
//   });

//   response = await response.json();
//   let rideRequest = response.data.rideRequest;
//   // console.log(rideRequest);

//   if (rideRequest.length <= 0) {
//     allRides.innerHTML = "";
//     allRides.innerHTML = `<h3 style="color : red">No rides available</h3>`;
//   } else {
//     allRides.innerHTML = "";
//     rideRequest.forEach((Element) => {
//       createRideRequest(
//         Element.pickup_location,
//         Element.fare_amount,
//         Element.distance,
//         Element.id
//       );
//     });
//   }
// }, 0);

const passengerName = document.querySelector(".passenger-name");
const fromLocation = document.querySelector(".from");
const toLocation = document.querySelector(".to");
const reqRideDistance = document.querySelector(".req-ride-distance");
const fare = document.querySelector(".fare");

const createRideRequest = (pickup_location, fare_amount, distance, id) => {
  let ride = document.createElement("div");
  ride.setAttribute("class", "ride");
  ride.setAttribute("id", id);

  ride.addEventListener("click", async (e) => {
    e.stopPropagation();
    // console.log(e.currentTarget.id);
    await openPopUp(e.currentTarget.id);
  });

  let img1 = document.createElement("img");
  img1.setAttribute("src", "/source/ride.png");

  let availableRideDetails = document.createElement("div");
  availableRideDetails.setAttribute("class", "available-ride-details");

  let pickup = document.createElement("p");
  pickup.setAttribute("class", "pickup");
  pickup.innerHTML = `${pickup_location}`;

  let details = document.createElement("p");
  details.setAttribute("class", "details");

  let price = document.createElement("span");
  price.setAttribute("class", "price");
  price.innerHTML = `&#x20b9;${fare_amount}`;

  let distanceElement = document.createElement("span");
  distanceElement.setAttribute("class", "distance");
  distanceElement.innerHTML = `${distance} KM`;

  let time = document.createElement("span");
  time.setAttribute("class", "time");
  time.innerHTML = "Expexcted time to cover distance";

  let img2 = document.createElement("img");
  img2.setAttribute("src", "/source/right-arrow.png");

  ride.appendChild(img1);
  ride.appendChild(availableRideDetails);
  availableRideDetails.appendChild(pickup);
  availableRideDetails.appendChild(details);
  details.appendChild(price);
  details.appendChild(distanceElement);
  details.appendChild(time);
  ride.appendChild(img2);
  allRides.appendChild(ride);
};

const blurBackground = document.querySelector("#blur-background");
const popUpBox = document.querySelector("#pop-up-box");

const openPopUp = async (id) => {
  let response = await fetch(`/driver/ride-request/${id}`, {
    method: "GET",
  });

  response = await response.json();

  let rideRequestDetails = response.data.data[0];
  // console.log(rideRequestDetails)
  blurBackground.style.display = "block";
  popUpBox.style.display = "block";

  passengerName.innerHTML = `${rideRequestDetails.first_name} ${rideRequestDetails.last_name}`;
  fromLocation.innerHTML = `${rideRequestDetails.pickup_location}`;
  toLocation.innerHTML = `${rideRequestDetails.drop_location}`;
  reqRideDistance.innerHTML = `${rideRequestDetails.distance} KM`;
  fare.innerHTML = `&#8377;${rideRequestDetails.fare_amount}`;
};

const closeBtn = document.querySelector("#close-popup");

const closePopup = () => {
  blurBackground.style.display = "none";
  popUpBox.style.display = "none";
};

closeBtn.addEventListener("click", closePopup);

const profile = document.querySelector(".profile");
profile.style.cursor = "pointer"

profile.addEventListener("click", (e) => {
  // console.log(e.currentTarget);
  location.href = "/uber/driver/profile";
});
