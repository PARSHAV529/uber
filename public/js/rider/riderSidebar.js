function toggleDropdown() {
    const dropdown = document.getElementById("aboutDropdown");
    const toggleLink = document.querySelector("#About");
    dropdown.classList.toggle("show");
    toggleLink.setAttribute("aria-expanded", dropdown.classList.contains("show"));
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
  document.getElementById("profile").addEventListener("click", function () {
    window.location.href = "/uber/rider/profile";
  });

  async function getpfp() {
    let pfp = document.getElementById("userpfp");
    let name = document.getElementById("username");
    
    try {
      const resp = await fetch("/uber/api/rider/get-profile", {
        method: "GET",
      });
      const data = await resp.json();
      console.log(data);
      console.log("pfp data:",data.data[0][0].id);
      console.log("pfp data:",data);
  
      name.innerText = data.data[0][0].first_name + " " + data.data[0][0].last_name;
      pfp.setAttribute("src",`${data.data[0][0].profile_photo}`)
    } catch (e) {
      // console.log(e);
    }
  }

  document.addEventListener("DOMContentLoaded", async function () {
    try {
      const resp = await fetch("/uber/api/rider/protected-route", {
        method: "GET",
        headers: {
        "X-Requested-With": "XMLHttpRequest", 
      },
      });
  
      const data = await resp.json();
      if (resp.status == 200) {
        getpfp();
      } else if (resp.status == 403) {
        window.location.href = "/";
      } else if (resp.status == 203) {
        document.querySelector(".profile").style.display = "none";
      }
    } catch (e) {
      // console.log(e);
    }
  })