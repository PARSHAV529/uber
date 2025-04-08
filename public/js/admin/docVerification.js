let puc = "";
let rc_book = "";
let insurance = "";

async function routeCheck() {
  try {
    const resp = await fetch("/uber/api/admin/protected-route", {
      method: "GET",
    });

    const data = await resp.json();
    if (resp.status === 200) {
      setDocuments();
    } else if (resp.status === 401 || (await resp.status) === 403) {
      window.location.href = "/uber/admin/login";
    }
  } catch (e) {
    console.log(e);
  }
}

function updateButtonVisibility(documentList, vehicleStatus) {
  const driverAcceptButton = document.querySelector(".driver-accept");

  const allDocumentsProcessed = documentList.every(
    (doc) => doc.is_approved === "approved" || doc.is_approved === "rejected"
  );

  const isVehicleProcessed =
    vehicleStatus === "approved" || vehicleStatus === "rejected";

  if (allDocumentsProcessed && isVehicleProcessed) {
    driverAcceptButton.style.display = "block";
  } else {
    driverAcceptButton.style.display = "none";
  }
}

async function setDocuments() {
  const driver_id = localStorage.getItem("driverId");
  // localStorage.removeItem("driverId");
  try {
    const resp = await fetch("/uber/api/admin/get-one-driver-request", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ driver_id: driver_id }),
    });
    const data = await resp.json();
    if (resp.status === 200) {
      // console.log(data.data);
      setDriverDocuments(data.data.documentList, data.data.driver_details);
      setVehicleDocuments(data.data.vehicalDetails, data.data.driver_details);

      updateButtonVisibility(
        data.data.documentList,
        data.data.driver_details[0].vehical_approved
      );

      document.getElementById("driver-accept").addEventListener("click", () => {
        acceptDriver(
          data.data.driver_details[0].driver_id,
          data.data.driver_details[0].email,
          data.data.driver_details[0].first_name
        );
      });
      localStorage.removeItem("driverId");
    } else if (resp.status === 401 || resp.status === 403) {
      window.location.href = "/uber/admin/login";
      localStorage.removeItem("driverId");
    }
  } catch (e) {
    console.log(e);
  }
}

function setDriverDocuments(documentList, driverDetails) {
  let document_list_container = document.getElementById(
    "document-list-container"
  );
  document_list_container.innerHTML = "";

  if (documentList.length > 0) {
    console.log(documentList);
    documentList.forEach((doc) => {
      let driver_doc_list = document.createElement("div");
      driver_doc_list.className = "driver-doc-list";
      driver_doc_list.innerHTML = `
            <div class="driver-info">
            <i class="fa-solid fa-file"></i>
            <img src="${driverDetails[0].profile_photo}">
            <span class="driver-name">${driverDetails[0].first_name}</span>
            </div>
            <span class="doc-type">${doc.document_name}</span>
            <span class="doc-status">${doc.is_approved}</span>
            <span class="submission-date">${getUserTime(doc.updated_at)}</span>
            <button onclick="viewDocument(
            '${doc.document_url}', 
            '${doc.document_name}', 
             ${doc.doc_id},
             ${doc.DID}
             )"
            class="view-doc">
              <i class="fa-solid fa-eye"></i>
            </button>
      `;

      document_list_container.appendChild(driver_doc_list);
    });
  }
}

function setVehicleDocuments(vehicalDetails, driverDetails) {
  let driver_avtar = document.querySelectorAll("#driver-avtar");
  driver_avtar.forEach((avatar) => {
    avatar.src = driverDetails[0].profile_photo;
  });

  let driver_name = document.querySelectorAll("#driver-name");
  driver_name.forEach((name) => {
    name.innerHTML = driverDetails[0].first_name;
  });

  let doc_status = document.querySelectorAll("#doc-status");
  doc_status.forEach((status) => {
    status.innerHTML = driverDetails[0].vehical_approved;
  });

  let submission_date = document.querySelectorAll("#submission-date");
  submission_date.forEach((date) => {
    date.innerHTML = vehicalDetails[0].updated_at || "2 hours ago";
  });

  puc = vehicalDetails[0].puc;
  rc_book = vehicalDetails[0].rc_book;
  insurance = vehicalDetails[0].insurance;

  document.getElementById("vehicle-accept").addEventListener("click", () => {
    acceptVehicle(vehicalDetails[0].DID);
  });

  // const rejectButton = document.getElementById("vehicle-reject");
  // const rejectionInput = document.getElementById("vehicle-reject-input");
  // rejectionInput.addEventListener("input", () => {
  //   rejectButton.disabled = rejectionInput.value === "";
  //   console.log(rejectionInput.value);
  // });

  document.getElementById("vehicle-reject").addEventListener("click", () => {
    rejectVehicle(vehicalDetails[0].DID);
  });
}

const getUserTime = (input) => {
  const date = input instanceof Date ? input : new Date(input);
  const formatter = new Intl.RelativeTimeFormat("en");
  const ranges = {
    years: 3600 * 24 * 365,
    months: 3600 * 24 * 30,
    weeks: 3600 * 24 * 7,
    days: 3600 * 24,
    hours: 3600,
    minutes: 60,
    seconds: 1,
  };
  const secondsElapsed = (date.getTime() - Date.now()) / 1000;
  for (let key in ranges) {
    if (ranges[key] < Math.abs(secondsElapsed)) {
      const delta = secondsElapsed / ranges[key];
      return formatter.format(Math.round(delta), key);
    }
  }
};

function viewDocument(image_url, documentName, id, driverID) {
  console.log("inside view document " + id);

  let modal_btns_div = document.getElementById("modal-btns-div");
  modal_btns_div.innerHTML = `<button id="modal-reject-btn" onclick="rejectDocument('${documentName}', ${driverID}, ${id})"  class="modal-reject-btn" disabled>Reject</button>
                              <button id="modal-accept-btn" onclick="acceptDocument('${documentName}', ${driverID}, ${id})" class="modal-accept-btn">Accept</button>
                              `;

  const rejectButton = document.getElementById("modal-reject-btn");

  const rejectionInput = document.getElementById("doc-reject-input");
  rejectionInput.addEventListener("input", () => {
    rejectButton.disabled = rejectionInput.value === "";
    console.log(rejectionInput.value);
  });

  document.getElementById("modalImage").src = image_url;
  document.getElementById("model-doc-name").innerHTML = documentName;

  // Display the modal
  document.getElementById("documentModal").style.display = "block";
  document.querySelector(".modal-reject-btn").style.display = "block";
  document.querySelector(".modal-accept-btn").style.display = "block";
}

document.getElementById("view-puc").addEventListener("click", () => {
  viewVehicleDocument(puc);
});

document.getElementById("view-rcbook").addEventListener("click", () => {
  viewVehicleDocument(rc_book);
});

document.getElementById("view-insurance").addEventListener("click", () => {
  viewVehicleDocument(insurance);
});

function viewVehicleDocument(image_url) {
  document.getElementById("modalImage").src = image_url;

  document.getElementById("documentModal").style.display = "block";
  document.getElementById("doc-reject-input").style.display = "none";
  // document.querySelector(".modal-reject-btn").style.display = "none";
  // document.querySelector(".modal-accept-btn").style.display = "none";
}

function closeModal() {
  document.getElementById("documentModal").style.display = "none";
}

async function acceptDocument(documentName, driverID, id) {
  try {
    const resp = await fetch("/uber/api/admin/approve-document", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        documentName: documentName,
        driver_id: driverID,
        id: id,
      }),
    });

    if (resp.status === 200) {
      const data = await resp.json();
      alert(data.message);
    }
    closeModal();
    window.location.reload();
  } catch (e) {
    console.log(e);
  }
}

async function rejectDocument(documentName, driverID, id) {
  let rejectionReason = document.getElementById("doc-reject-input").value;
  try {
    const resp = await fetch("/uber/api/admin/submit-rejection-document", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        documentName: documentName,
        remark: rejectionReason,
        driver_id: driverID,
        id: id,
      }),
    });
    if (resp.status === 200) {
      const data = await resp.json();
      alert(data.message);
      window.location.reload();
    }
    closeModal();
  } catch (e) {
    console.log(e);
  }
}

async function acceptVehicle(driver_id) {
  try {
    const resp = await fetch("/uber/api/admin/approve-vehical", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        driver_id: driver_id,
      }),
    });

    if (resp.status === 200) {
      const data = await resp.json();
      alert(data.message);
    }
    window.location.reload();
  } catch (e) {
    console.log(e);
  }
}

async function rejectVehicle(driver_id) {
  const rejectionInput = document.getElementById("vehicle-reject-input").value;
  if (rejectionInput.trim() === "") {
    return;
  }

  try {
    const resp = await fetch("/uber/api/admin/reject-vehical", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        driver_id: driver_id,
      }),
    });

    if (resp.status === 200) {
      const data = await resp.json();
      alert(data.message);
    }
    localStorage.setItem("vehicle-rejection-reason", rejectionInput);
    window.location.reload();
  } catch (e) {
    console.log(e);
  }
}

async function acceptDriver(driver_id, email, name) {
  let vehicle_rejection_reason =
    localStorage.getItem("vehicle-rejection-reason") || null;
  localStorage.removeItem("vehicle-rejection-reason");

  try {
    const resp = await fetch("/uber/api/admin/driver-request-final-submit", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        driver_id: driver_id,
        email: "riyajivani8@gmail.com",
        driver_name: name,
        remark: vehicle_rejection_reason,
      }),
    });

    if (resp.status === 200) {
      const data = await resp.json();
      alert(data.message);
    }
    // window.location.reload();
  } catch (e) {
    console.log(e);
  }
}
