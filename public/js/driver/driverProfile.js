fetch("/driver/profile-data")
  .then((response) => response.json())
  .then(({ data }) => {
    console.log(data);
    document.getElementById("driver_pfp").src = data.document_url;
    document.getElementById(
      "full_name"
    ).value = `${data.profileData[0].first_name} ${data.profileData[0].last_name}`;
    document.getElementById("email").value = data.profileData[0].email;
    document.getElementById("phone_number").value =
      data.profileData[0].phone_number;
  })
  .catch((err) => console.log(err));

document
  .getElementById("update_profile")
  ?.addEventListener("click", async () => {
    const formdata= new FormData()
    formdata.append('fname',  document.getElementById("full_name").value.split(" ")[0])
    formdata.append('lname',  document.getElementById("full_name").value.split(" ")[1])
    formdata.append('email',document.getElementById("email").value)
    formdata.append('phone_number',document.getElementById("phone_number").value)
    formdata.append('document',document.getElementById("edit_pfp").files[0]||null)
    // const data = {
    //   fname: document.getElementById("full_name").value.split(" ")[0],
    //   lname: document.getElementById("full_name").value.split(" ")[1],
    //   email: document.getElementById("email").value,
    //   phone_number: document.getElementById("phone_number").value,
    // };
    const response = await fetch("/driver/profile-data", {
      method: "post",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
      body:formdata,
    });
  });

  const edit_pfp_file =  document.getElementById('edit_pfp')
  edit_pfp_file?.addEventListener('change', ()=>{
  
     
        // for (let i = 0; i < this.files.length; i++) {
        let url = URL.createObjectURL(edit_pfp_file.files[0]);
        document.getElementById('driver_pfp').src =url
        // you can even free these 10bits you occupy in memory if you don't need the url anymore
        document.getElementById('driver_pfp').onload = function () {
          URL.revokeObjectURL(document.getElementById('driver_pfp').src);
          //   }
          //   console.log(file.files[0].name);
        };
      
  })
