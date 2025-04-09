// document.querySelectorAll(".upload").forEach((uploadbtn) => {
//   uploadbtn.addEventListener("click", async () => {
//     console.log(uploadbtn.id);
//     const formData = new FormData();
//     formData.append(
//       "document",
//       document.getElementById(`${uploadbtn.id}_file`).files[0]
//     );
//     formData.append("document_id", uploadbtn.id);
//     const response = await fetch("/uploadDocument", {
//       method: "POST",
//       body: formData,
//     });
//     const data = await response.json();
//     console.log(data);

//     if (response.ok) {
//       uploadbtn.innerHTML = "inReview";
//       uploadbtn.disabled = true;
//       console.log(document.getElementById(`${uploadbtn.id}_file`));

//       document
//         .getElementById(`${uploadbtn.id}_file`)
//         ?.setAttribute("hidden", "true");
//     }
//   });
// });
console.log(document.getElementById("submit_btn"));

document.getElementById("submit_btn").addEventListener("click", async () => {
  // e.preventDefault();
  console.log("kkk");

  const formData = new FormData();
  formData.append("type", document.getElementById("type").value);
  formData.append("colour", document.getElementById("colour").value);
  formData.append(
    "Number_plate",
    document.getElementById("Number_plate").value
  );
  formData.append(
    "PUC_Exp_date",
    document.getElementById("PUC_Exp_date").value
  );
  formData.append(
    "insurance_Exp_date",
    document.getElementById("insurance_Exp_date").value
  );
  // formData.append('document_vehicle',[document.getElementById("popRc").files[0],document.getElementById("popPUC").files[0],document.getElementById("popInsurance").files[0]])
  // console.log(document.getElementById("popRc").files[0]);

  formData.append("RC_BOOK", document.getElementById("popRc").files[0]);
  formData.append("PUC", document.getElementById("popPUC").files[0]);
  formData.append(
    "Insurance",
    document.getElementById("popInsurance").files[0]
  );
console.log(document.getElementById("PUC_Exp_date").value);

  const res = await fetch("/postDriverSignupvehicleData", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (res.ok) {
    location.reload();
    // document.getElementById(
    //   "innerHTMLvehicleDocument"
    // ).innerHTML = `<h2>Document uploaded successfully</h2>
    //   <p>status : pending </p>`;

    //   if (data[0].vehicle_approved != "rejected") {
    //     // let innerHTMLDocument = "";
    //     data.forEach((Document) => {
    //       document.getElementById(
    //         "innerHTMLvehicleDocument"
    //       ).innerHTML += ` <div class="document_card">
    //        <p>vehicle Details Status : ${Document.vehicle_approved}</p>
    //      <i class="fa-solid fa-circle-right " id='openpopupvehicle'></i>

    //      </div>`;
    //     });

    //     // document.getElementById("innerHTMLDocumentvehicle").innerHTML =
    //     //   innerHTMLDocument;
    // document.getElementById('openpopupvehicle')?.addEventListener('click',()=>{
    //   document.getElementById('innerHTMLvehicleDocument')?.classList.remove('displaynone')
    //   document.getElementById('innerHTMLvehicleDocument').style.display = 'flex'
    //   document.getElementById("main").classList.add("blurEffect");
    // })
    //     const ip = document
    //       .getElementById("innerHTMLvehicleDocument")
    //       ?.getElementsByTagName("input");
    //     const filenames = ["RC_BOOk", "Insurance", "PUC"];
    //     document.querySelectorAll(".custom-file-upload").forEach((file, i) => {
    //       if (i == 0) {
    //         return;
    //       }
    //       const img = document.createElement("embed");

    //       const type = document.getElementById("type");
    //       const colour = document.getElementById("colour");
    //       const Number_plate = document.getElementById("Number_plate");
    //       const PUC_Exp_date = document.getElementById("PUC_Exp_date");
    //       const insurance_Exp_date =
    //         document.getElementById("insurance_Exp_date");
    //       type.value = data[0].type;
    //       colour.value = data[0].colour;
    //       Number_plate.value = data[0].number_plate;
    //       PUC_Exp_date.value = data[0].puc_exp_date;
    //       insurance_Exp_date.value = data[0].insurance_exp_date;

    //       img.src = data[0][filenames[i - 1]];
    //       img.width = 200;
    //       img.height = 200;

    //       file.replaceWith(img);
    //     });
    //     const select = document
    //       .getElementById("innerHTMLvehicleDocument")
    //       ?.getElementsByTagName("select");

    //     for (let j = 0; j < ip.length; j++) {
    //       ip[j].disabled = true;
    //     }
    //     for (let j = 0; j < select.length; j++) {
    //       select[j].disabled = true;
    //     }
    //     console.log(file);

    //     for (let j = 0; j < file.length; j++) {
    //       file[j].parentElement?.remove();
    //     }

    //     document.getElementById("submit_btn")?.remove();
    //   }
  }
});

fetch("/getDocumentPageData")
  .then((res) => res.json())
  .then(({ data }) => {
    console.log(data);
    let innerHTMLDocument = "";
    data.forEach((Document) => {
      innerHTMLDocument += ` <div class="document_card">
       <p>${Document.document_name}</p>
       ${
         Document.is_approved
           ? `<span class="document_view"><p>${Document.is_approved}</p><i id=${Document.id}_${Document.document_name}_view_${Document.document_url} class="fa-solid fa-eye openpopup"></i></span>`
           : `<i class="fa-solid fa-circle-right openpopup" id=${Document.id}_${Document.document_name}_upload></i>`
       }
       
       
     </div>`;
    });

    document.getElementById("innerHTMLDocument").innerHTML = innerHTMLDocument;

    document.querySelectorAll(".openpopup").forEach((btn) => {
      // console.log(btn);

      btn.addEventListener("click", () => {
        document.getElementById("popupbox-header").innerHTML = `${
          btn.id.split("_")[1]
        }`;
        console.log(btn.id.split("_")[2]);

        if (btn.id.split("_")[0] !== "vehicle") {
          const popupbox_btn_clone = ` <div class="popupbox-body">
          <label class="custom-file-upload">
            <input type="file" name="document" id="document" class="file" />
            <i class="fa-solid fa-paperclip"></i> attach
          </label>

          <button type="submit" class="btn btn-primary upload" id="upload">
            upload
          </button>
        </div>`;
          document.querySelector(".popupbox-body")?.remove();
          btn.id.split("_")[2] == "view"
            ? (document.getElementById(
                "image_preview"
              ).innerHTML = `<embed src="${btn.id.split("_")[3]}">`)
            : (document.getElementById("image_preview").innerHTML =
                '<img src="https://sgtbkhalsadu.ac.in/assets/front/images/dummy.jpg">');

          document.getElementById("pop").classList.remove("displaynone");
          document.getElementById("main").classList.add("blurEffect");
          btn.id.split("_")[2] !== "view"
            ? document.querySelectorAll(".popupbox-content").forEach((pop) => {
                pop.innerHTML += popupbox_btn_clone;
              })
            : null;
          btn.id.split("_")[0] == "vehicle" &&
            document.getElementById("upload")?.remove();
          const file = document.getElementById("document");
          file?.addEventListener("change", () => {
            document.getElementById(btn.id.split("_")[0]).innerHTML= `upload`

            document.getElementById("image_preview").innerHTML = "";
            // for (let i = 0; i < this.files.length; i++) {
            let url = URL.createObjectURL(file.files[0]);
            let img;
            if (file.files[0].type.includes("image")) {
              img = document.createElement("img");
            } else  {
              img = document.createElement("embed");
            }

            img.src = url;
            document.getElementById("image_preview")?.append(img);
            // you can even free these 10bits you occupy in memory if you don't need the url anymore
            img.onload = function () {
              URL.revokeObjectURL(img.src);
              //   }
              //   console.log(file.files[0].name);
            };
          });
          document
            .getElementById("upload")
            ?.setAttribute("id", btn.id.split("_")[0]);

          document
            .getElementById(btn.id.split("_")[0])
            ?.addEventListener("click", async () => {
              console.log(btn.id.split("_")[0]);
              document.getElementById(btn.id.split("_")[0]).innerHTML= `upload`

              const formData = new FormData();
              formData.append(
                "document",
                document.getElementById(`document`).files[0]
              );
              formData.append("document_id", btn.id.split("_")[0]);
              const response = await fetch("/uploadDocument", {
                method: "POST",
                body: formData,
              });
              document.getElementById(btn.id.split("_")[0]).innerHTML= `<span class="loader"></span>`
              document.getElementById("document")?.setAttribute('disabled', 'true');
              console.log(response);
              if (response.ok) {
                // console.log(btn.parentElement)
                location.reload();
                // btn.parentElement.innerHTML += `<p>pending</p>`
                const statusP = document.createElement("p");

                statusP.innerHTML = "pending";
                btn.replaceWith(statusP);

                // console.log(document.getElementById(`document`));
                document
                  .getElementById(`document`)
                  ?.setAttribute("hidden", "true");
                document.getElementById("pop").classList.add("displaynone");
                document.getElementById("main").classList.remove("blurEffect");
                document.getElementById("image_preview").innerHTML =
                  '<img src="https://sgtbkhalsadu.ac.in/assets/front/images/dummy.jpg">';
              }else{
                console.log(response);
                const data = await response.json();
                console.log("data");
                console.log(data);
                document.getElementById(btn.id.split("_")[0]).innerHTML=data.error
                document.getElementById("document")?.removeAttribute('disabled')
              }
            });
        } else {
          // document.querySelectorAll(".popupbox-content").forEach((pop) => {
          //   pop.innerHTML += " ";
          // })
          console.log("lll");
          document.getElementById("pop").classList.add("displaynone");
          document.getElementById("main").classList.add("blurEffect");
          if (btn.id.split("_")[1].includes("RC")) {
            // console.log(btn.id.split("_")[1]);

            const file = document.getElementById("popRc");
            document.getElementById("popupRC").classList.remove("displaynone");
            file?.addEventListener("change", () => {
              // document.getElementById("image_preview_rc").innerHTML = "";
              // for (let i = 0; i < this.files.length; i++) {
              console.log("click");

              let url = URL.createObjectURL(file.files[0]);
              let img;
              if (file.files[0].type.includes("image")) {
                img = document.createElement("img");
              } else if (file.files[0].type.includes("pdf")) {
                img = document.createElement("embed");
              }

              img.src = url;
              img?.setAttribute("id", "RC_BOOK");
              // console.log('llllllllllllll');

              document
                .getElementById("image_preview_rc")
                ?.replaceChild(img, document.getElementById("RC_BOOK"));
              // you can even free these 10bits you occupy in memory if you don't need the url anymore
              img.onload = function () {
                URL.revokeObjectURL(img.src);
                //   }
                //   console.log(file.files[0].name);
              };
            });
          } else if (btn.id.split("_")[1].toLowerCase().includes("puc")) {
            document.getElementById("popupPUC").classList.remove("displaynone");
            const file = document.getElementById("popPUC");

            file?.addEventListener("change", () => {
              // document.getElementById("image_preview_rc").innerHTML = "";
              // for (let i = 0; i < this.files.length; i++) {
              console.log("click");

              let url = URL.createObjectURL(file.files[0]);
              let img;
              if (file.files[0].type.includes("image")) {
                img = document.createElement("img");
              } else if (file.files[0].type.includes("pdf")) {
                img = document.createElement("embed");
              }

              img.src = url;
              img?.setAttribute("id", "PUC");
              // console.log('llllllllllllll');

              document
                .getElementById("image_preview_puc")
                ?.replaceChild(img, document.getElementById("PUC"));
              // you can even free these 10bits you occupy in memory if you don't need the url anymore
              img.onload = function () {
                URL.revokeObjectURL(img.src);
                //   }
                //   console.log(file.files[0].name);
              };
            });
          } else if (btn.id.split("_")[1].toLowerCase().includes("insurance")) {
            document
              .getElementById("popupInsurance")
              .classList.remove("displaynone");
            const file = document.getElementById("popInsurance");

            file?.addEventListener("change", () => {
              // document.getElementById("image_preview_rc").innerHTML = "";
              // for (let i = 0; i < this.files.length; i++) {
              console.log("click");

              let url = URL.createObjectURL(file.files[0]);
              let img;
              if (file.files[0].type.includes("image")) {
                img = document.createElement("img");
              } else if (file.files[0].type.includes("pdf")) {
                img = document.createElement("embed");
              }

              img.src = url;
              img?.setAttribute("id", "Insurance");
              // console.log('llllllllllllll');

              document
                .getElementById("image_preview_Insurance")
                ?.replaceChild(img, document.getElementById("Insurance"));
              // you can even free these 10bits you occupy in memory if you don't need the url anymore
              img.onload = function () {
                URL.revokeObjectURL(img.src);
                //   }
                //   console.log(file.files[0].name);
              };
            });
          }
        }

        // document.getElementById("image_preview").innerHTML =
        //   '<img src="https://sgtbkhalsadu.ac.in/assets/front/images/dummy.jpg">';
      });
    });
  });

fetch("/getvehicleDocumentData")
  .then((res) => res.json())
  .then(({ data }) => {
    console.log(data);
console.log(data[0]?.vehicle_approved);
console.log(data[0]?.vehicle_approved != "rejected" , data[0]?.vehicle_approved != "undefined");

    if (data[0]?.vehicle_approved != "rejected" && data[0]?.vehicle_approved != undefined) {
      console.log("data[0]?.vehicle_approved");

      let innerHTMLDocument = "";
      data.forEach((Document) => {
        innerHTMLDocument += ` <div class="document_card">
         <p>vehicle Details Status : ${Document.vehicle_approved}</p>
       <i class="fa-solid fa-circle-right " id='openpopupvehicle'></i>
         
   
       </div>`;
      });

      document.getElementById("innerHTMLDocumentvehicle").innerHTML =
        innerHTMLDocument;
      document
        .getElementById("openpopupvehicle")
        ?.addEventListener("click", () => {
          document
            .getElementById("innerHTMLvehicleDocument")
            ?.classList.remove("displaynone");
          document.getElementById("innerHTMLvehicleDocument").style.display =
            "flex";
          document.getElementById("main").classList.add("blurEffect");
        });
      const ip = document
        .getElementById("innerHTMLvehicleDocument")
        ?.getElementsByTagName("input");
      const filenames = ["rc_book", "insurance", "puc"];
      document.querySelectorAll(".custom-file-upload-vehicle").forEach((file, i) => {
        // if (i == 0) {
        //   return;
        // }

        const img = document.createElement("embed");
        const p = document.createElement("p");

        const type = document.getElementById("type_popup");
        const colour = document.getElementById("colour_popup");
        const Number_plate = document.getElementById("Number_plate_popup");
        const PUC_Exp_date = document.getElementById("PUC_Exp_date_popup");
        const insurance_Exp_date =
          document.getElementById("insurance_Exp_date_popup");
        type.value = data[0].type;
        colour.value = data[0].colour;
        Number_plate.value = data[0].number_plate;
        PUC_Exp_date.value = data[0].puc_exp_date;
        insurance_Exp_date.value = data[0].insurance_exp_date;
        
        // if (i < 4 ) {
          console.log(filenames[i ]);
          p.innerHTML = filenames[i ];
          p.style.marginTop = "1rem"
          p.style.fontSize = "20px";
          p.style.fontWeight = "bold";
          // p.style.margin = "10px 0";
          p.style.color = "black";
          
          img.src = data[0][filenames[i ]];
          // img.width = "20rem !important";
          // img.height = "13rem !important";
          p.append(img)

          file.replaceWith(p);
         
        // }
      });
      const select = document
        .getElementById("innerHTMLvehicleDocument")
        ?.getElementsByTagName("select");

      for (let j = 0; j < ip.length; j++) {
        ip[j].disabled = true;
      }
      for (let j = 0; j < select.length; j++) {
        select[j].disabled = true;
      }
      console.log(file);

      for (let j = 0; j < file.length; j++) {
        file[j].parentElement?.remove();
      }

      document.getElementById("submit_btn")?.remove();
    }
  });
console.log(document.getElementById("submit_btn"));

const file = document.getElementById("document");
file?.addEventListener("change", () => {
  document.getElementById("image_preview").innerHTML = "";
  // for (let i = 0; i < this.files.length; i++) {
  let url = URL.createObjectURL(file.files[0]);
  let img;
  if (file.files[0].type.includes("image")) {
    img = document.createElement("img");
  } else if (file.files[0].type.includes("pdf")) {
    img = document.createElement("embed");
  }

  img.src = url;
  document.getElementById("image_preview")?.append(img);
  // you can even free these 10bits you occupy in memory if you don't need the url anymore
  img.onload = function () {
    URL.revokeObjectURL(img.src);
    //   }
    //   console.log(file.files[0].name);
  };
});
