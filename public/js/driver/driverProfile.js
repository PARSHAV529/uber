const loader = document.querySelector(".loader")
const updateProfileBtn = document.querySelector("#update_profile")
const saveBtnText = document.querySelector("#saveBtnText")

fetch("/driver/profile-data")
  .then((response) => response.json())
  .then(({ data }) => {
    // console.log(data);
    document.getElementById("driver_pfp").src = data.document_url;
    document.getElementById(
      "full_name"
    ).value = `${data.profileData[0].first_name} ${data.profileData[0].last_name}`;
    document.getElementById("email").value = data.profileData[0].email;
    document.getElementById("phone_number").value =
      data.profileData[0].phone_number;
  })
  .catch((err) => console.log(err) );

document
  .getElementById("update_profile")
  ?.addEventListener("click", async () => {

    // updateProfileBtn.style.pointerEvents = "none"
    saveBtnText.style.display = "none"
    loader.style.display = "block"
    updateProfileBtn.style.pointerEvents = "none"
    updateProfileBtn.setAttribute("disabled",true)
    updateProfileBtn.style.backgroundColor = "grey"
    const formdata= new FormData()
    formdata.append('fname',  document.getElementById("full_name").value.split(" ")[0])
    formdata.append('lname',  document.getElementById("full_name").value.split(" ")[1])
    formdata.append('email',document.getElementById("email").value)
    formdata.append('phone_number',document.getElementById("phone_number").value)
    formdata.append('document',document.getElementById("edit_pfp").files[0]||null)
    const response = await fetch("/driver/profile-data", {
      method: "post",
      body:formdata,
    });
    saveBtnText.style.display = "inline"
    loader.style.display = "none"
    updateProfileBtn.style.pointerEvents = "auto"
    updateProfileBtn.setAttribute("disabled",false)
    updateProfileBtn.style.backgroundColor = "black"
  });

  const edit_pfp_file =  document.getElementById('edit_pfp')
  edit_pfp_file?.addEventListener('change', ()=>{
  
        let url = URL.createObjectURL(edit_pfp_file.files[0]);
        document.getElementById('driver_pfp').src =url
        // you can even free these 10bits you occupy in memory if you don't need the url anymore
        document.getElementById('driver_pfp').onload = function () {
          URL.revokeObjectURL(document.getElementById('driver_pfp').src);
          
        };
      
  })
  
const profile = document.querySelector(".profile");
profile.style.cursor = "pointer"
  profile.addEventListener("click",(e)=>{
    // console.log(e.currentTarget);
    location.href = '/uber/driver/profile'
  })
  
