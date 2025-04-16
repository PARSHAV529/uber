function toggleDropdown() {
    console.log("toggle");
    const dropdown = document.getElementById("aboutDropdown");
    const toggleLink = document.querySelector("#About");
    dropdown.classList.toggle("show");
    toggleLink.setAttribute(
      "aria-expanded",
      dropdown.classList.contains("show")
    );
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

  window.addEventListener("load", async () => {
    console.log("get details");
    const response = await fetch("/uber/api/rider/get-history");
    console.log(response);
    if (response.status === 201) {
      let data = await response.json();
      console.log(data);

      generateCards(data.data[0]);
    } else {
      let data = await response.json();
      console.log(data.message);
    }
  });

  function generateCards(data) {
    console.log(data);

    data.forEach((element) => {
      console.log("location", element.pickup_location);

      const pastCards = document.createElement("div");
      pastCards.className = "past-cards";

      const div = document.createElement("div");

      const image = document.createElement("img");
      image.height = "124";

      if (element.vehicle_preference === "auto") {
        image.src =
          "https://d1a3f4spazzrp4.cloudfront.net/car-types/haloProductImages/v1.1/TukTuk_Green_v1.png";
      } else if (element.vehicle_preference === "cab") {
        image.src =
          "https://d1a3f4spazzrp4.cloudfront.net/car-types/haloProductImages/package_UberComfort_new_2022.png";
      } else if (element.vehicle_preference === "moto") {
        image.src =
          "https://d1a3f4spazzrp4.cloudfront.net/car-types/haloProductImages/v1.1/Uber_Moto_India1.png";
      }

      div.appendChild(image);

      pastCards.appendChild(div);

      let pickup = element.pickup_location.split(',')[0]
      let drop = element.drop_location.split(',')[0]
      let date = new Date(element.created_at).toDateString()
      let time = new Date(element.created_at).toLocaleTimeString();
      console.log(time,"time");

      const rideInfo = document.createElement("div");
      
      rideInfo.addEventListener('click',()=>{
        location.href = `/uber/rider/go?start=${element.pickup_location}&dest=${element.drop_location}`
      })

      rideInfo.className = "ride-info-content";

      rideInfo.innerHTML = `<div style='display:flex;align-items:center;gap:5px;'><p>${pickup}</p>
                            <i class="fa-solid fa-arrow-right"></i><p>${drop}</p></div>
                          <p>${date} • ${time}</p>
                          <p>₹${element.fare_amount} • ${element.status}</p>`;

      pastCards.appendChild(rideInfo);
        console.log(pastCards);
      document
        .getElementsByClassName("past-content")[0]
        .appendChild(pastCards);
        console.log((document
        .getElementsByClassName("past-content")[0]
        .appendChild(pastCards)));
    });
  }