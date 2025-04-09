// import { response } from "express";

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

document.getElementById("upload_widget").addEventListener(
  "click",
  function () {
    myWidget.open();
  },
  false
);

var myWidget = cloudinary.createUploadWidget(
  {
    cloudName: "dl0uptvec",
    uploadPreset: "pfp_upload",
    maxFiles: 1
  },
  (error, result) => {
    if (!error && result && result.event === "success") {
      console.log("Done! Here is the image info: ", result.info.secure_url);
      changePfp(result.info.secure_url);
    }
  }
);

async function changePfp(url) {
  const response = await fetch("/uber/api/rider/update-profile-picture", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      url: url
    }),
  });

  if (response.status === 201) {
    let data = await response.json();
    location.href = "profile"
  } else {
    let data = await response.json();
    console.log(data.message);
  }
}


window.addEventListener("load", async () => {
  console.log("get details");
  const response = await fetch("/uber/api/rider/get-profile");

  if (response.status === 201) {
    let data = await response.json();

    generateCard(data.data[0]);
  } else {
    let data = await response.json();
    console.log(data.message);
  }
});

function createBreak() {
  return document.createElement("br");
}

function generateCard(data) {
  var img = document.getElementById("profilepfp");
  img.setAttribute("src", data[0].profile_photo);

  var form = document.getElementById("form");

  var fname = document.createElement("input");
  var label = document.createElement("label");
  label.innerText = "First Name";
  fname.setAttribute("class", "fname");
  fname.value = data[0].first_name;
  form.appendChild(label);
  form.appendChild(createBreak());
  form.appendChild(fname);
  form.appendChild(createBreak());
  form.appendChild(createBreak());

  var lname = document.createElement("input");
  var label = document.createElement("label");
  label.innerText = "Last Name";
  lname.setAttribute("class", "lname");
  lname.value = data[0].last_name;
  form.appendChild(label);
  form.appendChild(createBreak());
  form.appendChild(lname);
  form.appendChild(createBreak());
  form.appendChild(createBreak());

  var ph = document.createElement("input");
  var label = document.createElement("label");
  label.innerText = "Phone Number";
  ph.setAttribute("class", "ph");
  ph.value = data[0].phone_number;
  form.appendChild(label);
  form.appendChild(createBreak());
  form.appendChild(ph);
  form.appendChild(createBreak());
  form.appendChild(createBreak());

  var dob = document.createElement("input");
  var label = document.createElement("label");
  label.innerText = "Date of Birth";
  dob.setAttribute("class", "dob");
  dob.value = data[0].DOB;
  form.appendChild(label);
  form.appendChild(createBreak());
  form.appendChild(dob);
  form.appendChild(createBreak());
  form.appendChild(createBreak());

  var btn = document.createElement("button");
  btn.innerText = "Save Changes";
  btn.setAttribute("type", "submit");
  form.appendChild(btn);

  btn.addEventListener("click", async function (event) {
    event.preventDefault();
    const response = await fetch("/uber/api/rider/update-profile", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        fname: fname.value,
        lname: lname.value,
        ph: ph.value,
        dob: dob.value,
      }),
    });
    let data = await response.json();
    console.log(data);
    
    if (response.status === 201) {
      
      alert('changes saved successfully')
      window.location.href = "profile";
    } else {
      
      alert(`${data.error}`)
      console.log(data.message);
    }
  });
}
