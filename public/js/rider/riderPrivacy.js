function toggleDropdown() {
    console.log("toggle");
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

  document.getElementById('summary').addEventListener('click', function(){
    location.href = "history"
  })

  document.getElementById('data').addEventListener('click', function(){
    location.href = "data"
  })