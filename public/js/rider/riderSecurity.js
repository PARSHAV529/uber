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

document.getElementById('password').addEventListener('click', function(){
  location.href = "/forgot-password"
})

window.addEventListener("load", async () => {
  console.log("get details");
  generateCard();
  
});

function createBreak() {
  return document.createElement("br");
}

function generateCard() {
  var form = document.getElementById("form");

  var password = document.createElement("input");
  var label = document.createElement("label");
  label.innerText = "New Password";
  password.setAttribute("class", "password");
  password.value = "";
  form.appendChild(label);
  form.appendChild(createBreak());
  form.appendChild(password);
  form.appendChild(createBreak());
  form.appendChild(createBreak());

  var confirmpwd = document.createElement("input");
  var label = document.createElement("label");
  label.innerText = "Confirm Password";
  confirmpwd.setAttribute("class", "confirmpwd");
  confirmpwd.value = "";
  form.appendChild(label);
  form.appendChild(createBreak());
  form.appendChild(confirmpwd);
  form.appendChild(createBreak());
  form.appendChild(createBreak());

}
