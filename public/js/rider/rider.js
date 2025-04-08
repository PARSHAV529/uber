function toggleDropdown() {
    const dropdown = document.getElementById("aboutDropdown");
    const toggleLink = document.querySelector('#About');
    dropdown.classList.toggle("show");
    toggleLink.setAttribute("aria-expanded", dropdown.classList.contains("show"));
  }

  window.onclick = function (event) {
    if (!event.target.matches('#About')) {
      const dropdowns = document.getElementsByClassName("dropdown");
      for (let i = 0; i < dropdowns.length; i++) {
        const openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
          const toggleLink = document.querySelector('#About');
          toggleLink.setAttribute("aria-expanded", "false");
        }
      }
    }
  }

  document.getElementById('submit').addEventListener('click', (e) => {
    e.preventDefault();
    let startLocation = document.getElementById('pickup').value;
    let destinationLocation = document.getElementById('dropoff').value
    console.log(startLocation, destinationLocation)

    window.location.href = `uber/rider/go?start=${startLocation}&dest=${destinationLocation}`
  })



  document.getElementById('profile').addEventListener('click', function () {
    window.location.href = '/uber/rider/profile'
  })

  document.addEventListener('DOMContentLoaded', async () => {
    let history_activity = document.getElementById("history-container");
    history_activity.innerHTML = "";

    try {
      const resp = await fetch("/uber/api/rider/history", {
        method: "GET",
      });
      const data = await resp.json();

      let historyData = data.data;
      if (resp.status === 201) {
        if (historyData.length > 0) {
          historyData.forEach((history) => {
            
            let activity_item = document.createElement("tr");
            activity_item.className = "activity-item";

            activity_item.innerHTML = `
        <td><i class="fas fa-history"></i></td>
        <td></td>
        <td></td>
    `;
          history_activity.appendChild(activity_item);
          });
        } else {
          history_activity.innerHTML = "<p>No pending requests are there</p>";
        }
      } else if (resp.status === 401 || (await resp.status) === 403) {
      }
    } catch (e) {
      console.log(e);
    }


  })