let waitingInterval = null;
        let progress = 0; 
        const progressBar = document.getElementById("progressBar");
        const maxWaitingProgress = 100;
        const increment = 5;
        const intervalTime = 1000;

        
        function startProgress() {
          if (progress >= maxWaitingProgress) return; 
          waitingInterval = setInterval(() => {
            if (progress < maxWaitingProgress) {
              progress += increment;
              progressBar.style.width = `${progress}%`;
            } else {
              clearInterval(waitingInterval);
            //   location.href='/uber/rider/accepted'
            }
          }, intervalTime);
        }

        
        function stopProgress() {
          if (waitingInterval) {
            clearInterval(waitingInterval);
            waitingInterval = null;
          }
        }

        window.addEventListener("load", async () => {
          try {
            const response = await fetch("/uber/api/rider/request/get-directions");
            if (response.status === 201) {
              let data = await response.json();
              // console.log("directions", data.data[0][0]);
              document.getElementById("pickup-location").innerText = data.data[0][0].pickup_location;
              document.getElementById("drop-location").innerText = data.data[0][0].drop_location;
              document.getElementById("fare-amount").innerText = data.data[0][0].fare_amount;
            } else {
            //   location.href = "/uber/rider/go";
            }
          } catch (error) {
            console.error("Error fetching directions:", error);
            // location.href = "/uber/rider/go";
          }

          
          startProgress();
        });

        const cancelRideBtn = document.getElementsByClassName("cancel-ride-btn")[0];
        const modal = document.getElementById("cancelRideModal");
        const closeModal = document.getElementById("closeModal");
        const reasonSelect = document.getElementById("cancelReason");
        const otherReasonTextarea = document.getElementById("otherReason");
        const cancelReasonForm = document.getElementById("cancelReasonForm");

        cancelRideBtn.addEventListener("click", () => {
          stopProgress(); 
          document.body.classList.add("blur-background");
          modal.style.display = "flex";
        });

        closeModal.addEventListener("click", () => {
          modal.style.display = "none";
          document.body.classList.remove("blur-background");
          startProgress(); 
        });

        reasonSelect.addEventListener("change", () => {
          otherReasonTextarea.style.display = reasonSelect.value === "other" ? "block" : "none";
        });

        cancelReasonForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          const reason = reasonSelect.value === "other" ? otherReasonTextarea.value : reasonSelect.value;
          if (!reason) {
            alert("Please provide a reason.");
            return;
          }
          try {
            const response = await fetch("/uber/api/rider/cancel-ride", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reason }),
            });
            if (response.status === 201) {
              location.href = "/uber/rider/go";
            } else {
              let data = await response.json();
              // console.log(data.message);
            }
          } catch (error) {
            console.error("Error canceling ride:", error);
          }
          modal.style.display = "none";
          document.body.classList.remove("blur-background");
         
        });

        let source = { lat: 28.6139, lng: 77.209 };
        const drivers = [
          { id: 1, lat: 28.6139, lng: 77.21 },
          { id: 2, lat: 28.62, lng: 77.22 },
          { id: 3, lat: 28.61, lng: 77.23 },
          { id: 4, lat: 28.65, lng: 77.25 },
        ];

        function getDistance(lat1, lon1, lat2, lon2) {
          const R = 6371;
          const dLat = ((lat2 - lat1) * Math.PI) / 180;
          const dLon = ((lon2 - lon1) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return R * c;
        }

        function initMap() {
          if (typeof MapmyIndia === "undefined") {
            console.error("MapmyIndia SDK not loaded");
            return;
          }
          const map = new MapmyIndia.Map("map", {
            center: [source.lat, source.lng],
            zoomControl: true,
            zoom: 12,
            hybrid: true,
          });

          new MapmyIndia.Marker({
            map: map,
            position: { lat: source.lat, lng: source.lng },
            draggable: true,
            title: "Rider",
          });

          new MapmyIndia.Circle({
            map: map,
            center: { lat: source.lat, lng: source.lng },
            radius: 3000,
            fillOpacity: 0.3,
            fillColor: "black",
            strokeColor: "red",
            strokeOpacity: 0.8,
            strokeWeight: 2,
          });

          const nearbyDrivers = drivers.filter(
            (driver) => getDistance(source.lat, source.lng, driver.lat, driver.lng) <= 3
          );

          nearbyDrivers.forEach((driver) => {
            new MapmyIndia.Marker({
              map: map,
              position: { lat: driver.lat, lng: driver.lng },
              title: `Driver ${driver.id}`,
            });
          });
        }